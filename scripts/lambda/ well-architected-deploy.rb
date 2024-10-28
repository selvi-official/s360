require 'json'
require 'csv'
require 'date'
require 'aws-sdk-eventbridge'

def lambda_handler(event:, context:)
    # TODO implement
    data = CSV.open("accounts_list.csv", "r").read
    puts "Data: #{data.inspect}"
    deploy_cron_schedule(cron_type="now",data)
    { statusCode: 200, body: JSON.generate('Hello from Lambda!') }
end

def deploy_cron_schedule(cron_type="weekly",account_list=[])
  puts "TASK_DEFINITION_URL: #{ENV['TASK_DEFINITION_URL']}"
  puts "TASK_DEFINITION_VERSION: #{ENV['TASK_DEFINITION_VERSION']}"
  client = Aws::EventBridge::Client.new(region: "us-east-1")

  if cron_type == "weekly"
    today = Time.now.utc.to_date
    days_until_friday = (5 - today.wday) % 7
    days_until_friday = 7 if days_until_friday == 0
    upcoming_friday = today + days_until_friday
    base_time = Time.new(upcoming_friday.strftime("%Y"),upcoming_friday.strftime("%m"),upcoming_friday.strftime("%d")).utc
    day_of_week = "6"
  elsif cron_type == "now"
    base_time = (Time.now.utc + 60)
    day_of_week = "*"
  end
  @minute = base_time.strftime("%M").to_i
  @hour = base_time.strftime("%H").to_i
  account_list.each do |account_array|

      puts "Processing Schedule update for Account: #{account_array.inspect}"
      puts "Account is enabled: #{account_array[0]}"

      aws_account_id = account_array[1]
      aws_account_name = account_array[0]
      environment = account_array[2]
      if environment == "staging"
        @aws_region_list = ["us-east-1"]
      else
        @aws_region_list = ["us-east-1", "eu-central-1", "ap-south-1", "ap-southeast-2"]
      end

      @aws_region_list.each do |region|
        aws_name = aws_account_name.downcase.gsub("-","_")
        region_name = region.downcase.gsub("-","_")
        environment_name = environment.downcase.gsub("-","_")[0..3]

        day_of_month = "?"
        month = "*"

        year = "*"

        schedule_expression = "cron(#{@minute} #{@hour} #{day_of_month} #{month} #{day_of_week} #{year})"
        rule_name = "#{aws_name}_#{region_name}_#{environment_name}"

        puts "Rule: #{rule_name}"
        puts "Schedule: #{schedule_expression}"

        if account_array[3] == "true"
          resp = client.put_rule({
            name: rule_name,
            schedule_expression: schedule_expression,
            state: 'ENABLED'
          })
        else
          resp = client.put_rule({
            name: rule_name,
            schedule_expression: schedule_expression,
            state: 'DISABLED'
          })
        end

        task_definition_arn = "#{ENV['TASK_DEFINITION_URL']}:#{ENV['TASK_DEFINITION_VERSION']}"

        container_overrides_arr = {
          "containerOverrides" => [
            {
              "name"=>"well-architected",
              "environment"=>[
                {"name"=>"AWS_PROFILE", "value"=> rule_name},
                {"name"=>"ENVIRONMENT", "value"=> environment},
                {"name"=>"AWS_REGION", "value"=> region}
              ]
            }
          ]
        }

        target = {
          id: rule_name,
          arn: "arn:aws:ecs:us-east-1:822009091411:cluster/well-architected",
          role_arn: "arn:aws:iam::822009091411:role/ecsEventsRole",
          input: container_overrides_arr.to_json,
          ecs_parameters: {
            task_definition_arn: task_definition_arn,
            task_count: 1,
            launch_type: 'FARGATE',
            network_configuration: {
              awsvpc_configuration: {
                subnets: ['subnet-0c201e9fbbcef2429'],
                assign_public_ip: 'DISABLED',
                security_groups: ['sg-09250a14c061ecc1c']
              }
            },
            platform_version: 'LATEST',
            group: 'well-architected',
            tags: [
              {
                key: 'Name',
                value: rule_name
              },
              {
                key: 'svc:name',
                value: "well-architected"
              }
            ]
          }
        }

        puts "Target: #{target.inspect}"

        client.put_targets({
          rule: rule_name,
          targets: [target]
        })

        @minute += 3
        if @minute >= 60
          @hour += 1
          @hour = @hour % 24
        end
        @minute = @minute % 60
      end
  end
end
