require 'json'
require 'csv'
require 'aws-sdk-s3'

WEIGHTS_MAPPING = {
  'low' => 1,
  'medium' => 2,
  'high' => 3,
  'critical' => 4
}


def lambda_handler(event:, context:)
  puts "Event: #{event.inspect}"
  puts "Context: #{context.inspect}"
  event["Records"].each do |event_array|
    if event_array["s3"]["configurationId"] == "evaluation_report" # this is the event we want to listen when report is uploaded by Steampipe
      puts "Event Array: #{event_array.inspect}"
      @aws_account_id = nil
      @bucket_name = event_array["s3"]["bucket"]["name"]
      object_key = event_array["s3"]["object"]["key"]
      components = object_key.split("/")
      @product_id = components[2]
      @environment = components[3]
      @region = components[4]
      @run_timestamp = components[5]
      @s3_client = Aws::S3::Client.new(region: "us-east-1")
      response = @s3_client.get_object(bucket: @bucket_name, key: object_key)
      @object_data = response.body.read
      pillar_score, control_score = assign_scores(@object_data)
      generate_pillar_csv(pillar_score)
      generate_control_csv(control_score)
    end
  end
  { statusCode: 200, body: JSON.generate('Hello from Lambda!') }
end


def assign_scores(object_data)
  pillar_score = {
    'SECURITY' => {
      'scored' => 0,
      'total' => 0,
      'percent' => 0
    },
    'RELIABILITY' => {
      'scored' => 0,
      'total' => 0,
      'percent' => 0
    },
    'PERFORMANCE EFFICIENCY' => {
      'scored' => 0,
      'total' => 0,
      'percent' => 0
    },
    'OPERATIONAL EXCELLENCE' => {
      'scored' => 0,
      'total' => 0,
      'percent' => 0
    },
    'COST' => {
      'scored' => 0,
      'total' => 0,
      'percent' => 0
    }
  }

  control_score = {
    'SECURITY' => {

    },
    'RELIABILITY' => {

    },
    'PERFORMANCE EFFICIENCY' => {

    },
    'OPERATIONAL EXCELLENCE' => {

    },
    'COST' => {

    }
  }

  evaluation_results = CSV.parse(object_data, :headers => true)
  evaluation_results.each do |row|
    @aws_account_id ||= row['account_id']
    puts "row['pillar']: #{row['pillar']}"
    if pillar_score[row['pillar']] && row['severity']
      control_score[row['pillar']] ||= {}
      control_score[row['pillar']][row['control_id']] ||= {'scored' => 0,'total' => 0,'percent' => 0}
      puts "Pillar: #{pillar_score.inspect}"
      puts "Total: #{row['pillar'].inspect}"
      puts "WEIGHTS_MAPPING: #{WEIGHTS_MAPPING.inspect}"
      puts "Row Sev: #{row['severity'].inspect}"
      pillar_score[row['pillar']]['total'] += WEIGHTS_MAPPING[row['severity']] if row['status'] != "skip"
      control_score[row['pillar']][row['control_id']]['total'] += WEIGHTS_MAPPING[row['severity']] if row['status'] != "skip"
      if row['status'] == "ok" # passed # alarm - failed
        pillar_score[row['pillar']]['scored'] += WEIGHTS_MAPPING[row['severity']]
        control_score[row['pillar']][row['control_id']]['scored'] += WEIGHTS_MAPPING[row['severity']]
      end
    end
  end

  pillar_score.each do |pill, data|
    if data['total'] > 0
      pillar_score[pill]["scored"] = data['scored']
      pillar_score[pill]["total"] = data['total']
      pillar_score[pill]["percent"] = ((data['scored'].to_f / data['total'].to_f) * 100).round(2)
    end
  end

  control_score.each do |pill, control_data|
    control_data.each do |control_id, data|
      control_score[pill][control_id]["scored"] = data['scored']
      control_score[pill][control_id]["total"] = data['total']
      control_score[pill][control_id]["percent"] = (data['scored'].to_f / data['total'].to_f) * 100
    end
  end
  return pillar_score, control_score
end


def generate_pillar_csv(pillar_score)
  csv_string = CSV.generate do |csv|
    csv << ["product_id", "aws_account_id", "environment", "region", "pillar", "score", "weighted_score", "weighted_total"]
    pillar_score.each do |pillar, score_map|
      csv << [@product_id, @aws_account_id, @environment, @region, pillar, score_map["percent"], score_map["scored"], score_map["total"] ]
    end
  end
  object_key = "well_architected/results/#{@product_id}/#{@environment}/#{@region}/#{@run_timestamp}/pillar_results.csv"
  upload_s3_file(object_key, csv_string)
end

def generate_control_csv(control_score)
  csv_string = CSV.generate do |csv|
    csv << ["product_id", "aws_account_id", "environment", "region", "pillar", "control", "score", "weighted_score", "weighted_total"]
    control_score.each do |pillar, control_map|
      control_map.each do |control_id, score_map|
        csv << [@product_id, @aws_account_id, @environment, @region, pillar, control_id, score_map["percent"], score_map["scored"], score_map["total"] ]
      end
    end
  end
  object_key = "well_architected/results/#{@product_id}/#{@environment}/#{@region}/#{@run_timestamp}/control_results.csv"
  puts "CSV STRING: #{csv_string}"
  upload_s3_file(object_key, csv_string)
end

def upload_s3_file(object_key, object_data)
  @s3_client.put_object(bucket: @bucket_name, key: object_key, body: object_data)
end
