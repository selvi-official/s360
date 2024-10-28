require 'net/http'
require 'json'

def lambda_handler(event:, context:)
    puts "Event: #{event.inspect}"
      puts "Context: #{context.inspect}"
      event["Records"].each do |event_array|
        if event_array["s3"]["configurationId"] == "scoring_report" # this is the event we want to listen when report is uploaded by Steampipe
          puts "Event Array: #{event_array.inspect}"

          @bucket_name = event_array["s3"]["bucket"]["name"]
          object_key = event_array["s3"]["object"]["key"]
          components = object_key.split("/")
          @aws_account_id = components[2]
          @environment = components[3]
          @region = components[4]
          @run_timestamp = components[5]
          puts "object_key: #{object_key}"
          puts "AWS Account ID: #{@aws_account_id}"
          puts "environment: #{@environment}"
          puts "region: #{@region}"
          puts "run_timestamp: #{@run_timestamp}"
          pillar_results = event_array["s3"]["object"]["key"]
          control_results = "well_architected/results/#{@aws_account_id}/#{@environment}/#{@region}/#{@run_timestamp}/control_results.csv"
          evaluation_results = "well_architected/evaluation/#{@aws_account_id}/#{@environment}/#{@region}/#{@run_timestamp}/evaluation_report.csv"
          puts "pillar_results: #{pillar_results}"
          puts "control_results: #{control_results}"
          puts "evaluation_results: #{evaluation_results}"

          url = URI.parse('https://s360.freshworkscorp.com/app/publish_wa_runs')
          http = Net::HTTP.new(url.host, url.port)
          http.use_ssl = (url.scheme == 'https')

          data = { aws_account_id: @aws_account_id, environment: @environment, region: @region, runid: @run_timestamp, pillar_results: pillar_results, control_results: control_results, evaluation_results: evaluation_results  }
          headers = { 'Content-Type' => 'application/json' }
          puts "Sending request...#{data}"
          request = Net::HTTP::Post.new(url.request_uri, headers)
          request.body = data.to_json

          response = http.request(request)
          puts "Response Code: #{response.code} and #{response.inspect}"
        end
      end
      { statusCode: 200, body: JSON.generate('Hello from Lambda!') }
end
