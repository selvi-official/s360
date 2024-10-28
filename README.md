# service360

## backend deployment

1) checkout the code and go to flaskapp folder
    ```bash
        cd flaskapi
2) add .env file with the following configurations needed for backend api
    ```bash
    rds_db_host=service360.cnnuygjl0vgg.us-east-1.rds.amazonaws.com
    rds_db_port=3306
    rds_db_name=s360
    rds_db2_name=cost
    rds_db3_name=s360_v2
    rds_db_user=admin
    rds_db_pass=xxxxxx
    pool_count=32
    fr_token=xxxxxxx
    s3_bucket_name=well-architected-freshworks
3) create virtual python env and install dependencies
    ```bash
    python3.8 -m venv ./venv
    source venv/bin/activate
    pip install -r requirements.txt
4) start the api server redirecting log to log folder
    ```bash
    nohup python /root/service360/flaskapi/flaskapp.py  >> /var/log/backend.log-$(date +%Y-%m-%d) 2>&1 &

## Frontend Dashboard deployment

### docker deployment:
1) push the latest image to ecr repo if not done using the following runway job
    ```
    https://deploy.runwayci.com/job/services360-dashboard-docker-build/
2) pull the latest docker image 
    ```bash
    aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 822009091411.dkr.ecr.us-east-1.amazonaws.com
    docker pull 822009091411.dkr.ecr.us-east-1.amazonaws.com/service360-dashboard:xxxx
3) start the docker container
    ```
    docker run -d  -p 5000:5000 --name s360-ui 822009091411.dkr.ecr.us-east-1.amazonaws.com/service360-dashboard:xxx

### local deployment

1) checkout the code and go to admin dashboard folder
    ```bash
        cd s360-admin-dashboard/
2) add .env file with the following configurations
    ```bash
    REACT_APP_BACKEND_API_URL="https://s360.freshworkscorp.com/app"
    REACT_APP_CLIENT_ID="4f17b5f9-c17a-4ca6-a8ba-e60adbff76b7"
3) install dependencies
    ```bash
    npm install
4) start the server
    ```bash
    npm start
