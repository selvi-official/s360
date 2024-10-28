from flask import abort, jsonify
from mysql.connector import connection
import mysql.connector
import mysql.connector.pooling
from datetime import *
from dateutil.relativedelta import *
from math import *
import boto3
import csv
import pandas as pd
import io
import json
import os
import requests
from dotenv import load_dotenv
from general_api import *


# S3_BUCKET_NAME = "well-architected-freshworks"
S3_BUCKET_NAME = os.environ.get("s3_bucket_name")
load_dotenv()

dbconfig = {
    "host": os.environ.get("rds_db_host"),
    "port": os.environ.get("rds_db_port"),
    "database": os.environ.get("rds_db_name"),
    "user": os.environ.get("rds_db_user"),
    "password": os.environ.get("rds_db_pass"),
}
conn_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="wa_db_pool", pool_size=int(os.environ.get("pool_count")), **dbconfig
)


def populate_run_data(
    aws_account_id,
    environment,
    region,
    runid,
    pillar_results,
    control_results,
    evaluation_results,
):
    conn = None
    cursor = None
    try:
        conn = conn_pool.get_connection()
        cursor = conn.cursor()
        s3 = boto3.client("s3")

        s3_bucket_path = pillar_results
        file_name = s3_bucket_path.split("/")[-1]  # Extract file name from S3 bucket path
        temp_file_path = (
            f"/tmp/{file_name}"  # Assuming temporary directory for storing file
        )
        s3.download_file(S3_BUCKET_NAME, s3_bucket_path, temp_file_path)

        insert_query_sql = "INSERT INTO wa_benchmark_runs(run_id,aws_account_id,region,environment,pillar_results,control_results,eval_results) VALUES(%s,%s,%s,%s,%s,%s,%s)"

        # Start a transaction
        cursor.execute("START TRANSACTION")

        cursor.execute(
            insert_query_sql,
            (
                runid,
                aws_account_id,
                region,
                environment,
                pillar_results,
                control_results,
                evaluation_results,
            ),
        )

        with open(temp_file_path, "r") as file:
            csv_reader = csv.reader(file)
            next(csv_reader)  # Skip header row

            for row in csv_reader:
                insert_query_sql = "INSERT INTO wa_pillar_scores(run_id, aws_account_id, region, environment, pillar, score, weighted_score, weighted_total) VALUES(%s,%s,%s,%s,%s,%s, %s, %s) "
                cursor.execute(
                    insert_query_sql, (runid, row[1], row[3], row[2], row[4], row[5], row[6], row[7])
                )

       

        print(f"Data inserted successfully into database")

        print(f"inserting evaluation data...")
        insert_eval_data(evaluation_results, runid, aws_account_id, region)

        # Commit the transaction
        cursor.execute("COMMIT")


    except Exception as e:
        # Log the error for debugging purposes
        print(f"Error during data insertion: {e}")
        cursor.execute("ROLLBACK")
        return {"error": str(e)}, 500  # Return error response
    else:
        # print(f"Data inserted successfully into database")
        return None
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def insert_eval_data(s3_file_path, runid, aws_account_id, region):
    conn = None
    cursor = None

    s3 = boto3.client("s3")

    file_name = s3_file_path.split("/")[-1]  # Extract file name from S3 bucket path
    temp_file_path = (
        f"/tmp/{file_name}"  # Assuming temporary directory for storing file
    )
    s3.download_file(S3_BUCKET_NAME, s3_file_path, temp_file_path)

    try:
        conn = conn_pool.get_connection()
        cursor = conn.cursor()
        

        columns_to_insert = ['account_id', 'region', 'run_id', 'control_id', 'control_title', 'reason', 'resource', 'status', 'severity', 'pillar', 'service']

        # Start a transaction
        cursor.execute("START TRANSACTION")

        # Delete existing rows with the given account ID
        delete_query = f"DELETE FROM wa_eval_results WHERE account_id = %s and region = %s"
        cursor.execute(delete_query, (aws_account_id,region,))

        # Insert new data
        insert_query = f"INSERT INTO wa_eval_results ({', '.join(columns_to_insert)}) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"

        with open(temp_file_path, "r") as file:
            csv_reader = csv.reader(file)
            next(csv_reader)  # Skip header row

            for row in csv_reader:
                cursor.execute(
                    insert_query, (aws_account_id, region, runid, row[3], row[4], row[6], row[7], row[8], row[9], row[14], row[17])
                )

                
        # Commit the transaction
        cursor.execute("COMMIT")


    except Exception as e:
        # Rollback the transaction if an error occurs
        print(f"Error during evaluation data insertion: {e}")
        cursor.execute("ROLLBACK")
        raise e
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()



def getPillarScores(accountId, region):
    conn = None
    cursor = None
    try:
        conn = conn_pool.get_connection()
        cursor = conn.cursor()

        # get_accountid_sql = "SELECT aws_account_id FROM wa_tenant_map WHERE aws_account_name = %s "

        # cursor.execute(get_accountid_sql,(accountName,))
        # accountId = cursor.fetchone()[0]

        get_scores_sql = "SELECT pillar, score FROM wa_pillar_scores WHERE aws_account_id = %s and  region = %s and run_id = (SELECT run_id FROM wa_pillar_scores WHERE aws_account_id = %s and region = %s ORDER BY id DESC LIMIT 1)"

        cursor.execute(get_scores_sql, (accountId, region, accountId, region))
        data = cursor.fetchall()

        columns = [x[0] for x in cursor.description]

        scores = []
        for row in data:
            scores.append(dict(zip(columns, row)))

        return jsonify(scores)
    except Exception as e:
        print(f"Error during fetching pillar scores: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
"""
args expected:
    Mandatorily one of:
        - BU
        - Product        --> takes precedence over BU
        - AWS Account ID --> takes precedence over BU and Product
    Optional:
       - Region
returns:
list [
    {
       "pillar": "PILLAR NAME",
         "score": 79.1, 
    }
]"""
def getPillarScoresV2(bu:str, product:str, accountID:str, region:str, env:str):
    # initialize connection and cursor
    conn = None
    cursor = None
    try:
        conn = conn_pool.get_connection()
        cursor = conn.cursor()
        
        region_condition = f"AND latest_scores.region = %s" if region != "" and region.lower() != "all" else ""
        env_condition = f"AND BU_Product_Account_mapping.Environment = %s" if env != "" and env.lower() != "all" else ""
        
        # Base query structure
        base_query = f"""
            WITH latest_scores AS (
                SELECT aws_account_id, region, pillar, run_id, weighted_score, weighted_total
                FROM wa_pillar_scores
                WHERE (aws_account_id, region, created_at) IN (
                    SELECT aws_account_id, region, MAX(created_at)
                    FROM wa_pillar_scores
                    WHERE weighted_total IS NOT NULL
                    GROUP BY aws_account_id, region
                )
            )
            SELECT latest_scores.pillar, SUM(latest_scores.weighted_score)/SUM(latest_scores.weighted_total) * 100 as score
            FROM latest_scores
            INNER JOIN BU_Product_Account_mapping
            ON latest_scores.aws_account_id = BU_Product_Account_mapping.AWS_AccountID
            WHERE {{condition}}
            {region_condition}
            {env_condition}
            GROUP BY latest_scores.pillar;
        """

        # CASE 1: Query by Account ID
        query_by_account_id = base_query.format(condition="latest_scores.aws_account_id = %s")

        # CASE 2: Query by Product
        query_by_product = base_query.format(condition="BU_Product_Account_mapping.Product = %s")

        # CASE 3: Query by BU
        query_by_bu = base_query.format(condition="BU_Product_Account_mapping.BU = %s")

        # CASE 4: Query by All
        query_by_all = base_query.format(condition="1=1")

        query_param = ""
        # query and param is set based on precedence 
        # accountID > product > bu
        if accountID != "" and not accountID.lower() == "all":
            query = query_by_account_id
            query_param = accountID
        elif product != "" and not product.lower() == "all":
            query = query_by_product
            query_param = product
        elif bu != "" and not bu.lower() == "all":
            query = query_by_bu
            query_param = bu
        else:
            query = query_by_all

        params = [query_param] if query_param else []
        if region != "" and not region.lower() == "all":
            params.append(region)
        if env != "" and not env.lower() == "all":
            params.append(env)
        print(query, tuple(params))
        cursor.execute(query, tuple(params))

        data = cursor.fetchall()

        columns = [x[0] for x in cursor.description]
        scores = []
        for row in data:
            scores.append(dict(zip(columns, row)))
        return jsonify(scores)

    except Exception as e:
        print(f"Error during fetching pillar scores: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        
def getHistoricalPillarScoresV2(
        bu:str, product:str, accountID:str, region:str, 
        from_date:str,
        to_date:str,
        env:str):
    conn = conn_pool.get_connection()
    cursor = conn.cursor()
    try:    
        query_param = ""
        filter_query = "BU_Product_Account_mapping.{aggregateBy} = %s"
        if accountID != "" and not accountID.lower() == "all":
            query_param = accountID
            filter_query = filter_query.format(aggregateBy = "AWS_AccountID")
        elif product != "" and not product.lower() == "all":
            query_param = product
            filter_query = filter_query.format(aggregateBy = "Product")
        elif bu != "" and not bu.lower() == "all":
            query_param = bu
            filter_query = filter_query.format(aggregateBy= "BU")
        else:
            query_param = "1"
            filter_query = "1=%s" # matches all
            
        region_condition = f"AND historical_scores.region = %s" if region != "" and region.lower() != "all" else ""
        env_condition = f"AND BU_Product_Account_mapping.Environment = %s" if env and env.lower() != "all" else ""
        
        historical_score_query = f"""
        WITH historical_scores AS (
            SELECT aws_account_id, region, pillar, run_id, weighted_score, weighted_total, DATE(created_at) as created_at_date
            FROM s360.wa_pillar_scores
            WHERE created_at between %s and %s
                AND weighted_total > 0
        )
        SELECT historical_scores.pillar, historical_scores.created_at_date, 
                SUM(historical_scores.weighted_score) as weighted_score,
                SUM(historical_scores.weighted_total) as weighted_total
        FROM historical_scores
        INNER JOIN BU_Product_Account_mapping
            ON historical_scores.aws_account_id = BU_Product_Account_mapping.AWS_AccountID
        WHERE {filter_query}
        {region_condition}
        {env_condition}
        GROUP BY historical_scores.pillar, historical_scores.created_at_date
        ORDER BY historical_scores.run_id DESC;"""
        
        params = [from_date, to_date, query_param]
        if region != "" and region.lower() != "all":
            params.append(region)
        if env and env.lower() != "all":
            params.append(env)
        
        cursor.execute(historical_score_query, tuple(params))

        data = cursor.fetchall()
        scores = []  
        for row in data:
           scores.append({
                "pillar": row[0],
                "run_id": f"{row[1]}"+"-00-00",
                "score": round(row[2]*100/row[3], 2) # percentage of (weighted_score/weighted_total)
            })
        return jsonify(scores)

    except Exception as e:
        print(f"Error during fetching pillar scores: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def getResourceDetailsV2(bu:str, product:str, accountID:str, region:str, env:str):
    conn = None
    cursor = None
    try:
        conn = conn_pool.get_connection()
        cursor = conn.cursor()
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return {"error": "Database connection error"}, 500
    
    try:
        # Build the base query
        base_query = """
        SELECT wer.*
        FROM wa_eval_results wer
        INNER JOIN BU_Product_Account_mapping bpam ON wer.account_id = bpam.AWS_AccountID
        WHERE 1=1
        """
        
        # Initialize parameters list
        params = []
        
        # Add conditions based on input
        if bu and bu.lower() != 'all':
            base_query += " AND bpam.BU = %s"
            params.append(bu)
        
        if product and product.lower() != 'all':
            base_query += " AND bpam.Product = %s"
            params.append(product)
        
        if accountID and accountID.lower() != 'all':
            base_query += " AND wer.account_id = %s"
            params.append(accountID)
        
        if region and region.lower() != 'all':
            base_query += " AND wer.region = %s"
            params.append(region)
        
        # Add condition for environment
        if env and env.lower() != 'all':
            base_query += " AND bpam.Environment = %s"
            params.append(env)
        
        # Execute the query
        cursor.execute(base_query, tuple(params))
        # Fetch all results
        results = cursor.fetchall()
        # Get column names
        column_names = [desc[0] for desc in cursor.description]
        
        # Convert results to list of dictionaries
        json_results = []
        for row in results:
            json_results.append(dict(zip(column_names, row)))
        return jsonify(json_results)
    except Exception as e:
        print(f"Error in getResourceDetailsV2: {e}")
        return {"error": "An error occurred while processing the request"}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
    return

def getPillarControlStats(bu:str, product: str, accountID:str, region:str, env:str):
    conn = None
    cursor = None
    try:
        conn = conn_pool.get_connection()
        cursor = conn.cursor()
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return {"error": "Database connection error"}, 500
    
    try:
        bu_condition = ""
        product_condition = ""
        accountID_condition = ""
        region_condition = ""
        env_condition = ""
        if bu and bu.lower() != 'all':
            bu_condition = f"AND bpam.BU = '{bu}'"
        if product and product.lower() != 'all':
            product_condition = f"AND bpam.Product = '{product}'"
        if accountID and accountID.lower() != 'all':
            accountID_condition = f"AND wer.account_id = '{accountID}'"
        if region and region.lower() != 'all':
            region_condition = f"AND wer.region = '{region}'"
        if env and env.lower() != 'all':
            env_condition = f"AND bpam.Environment = '{env}'"
        
        base_query = f"""
            WITH counters AS (
                WITH total_count AS (
                    SELECT COUNT(*) as count, wer.pillar,  wer.control_id
                    FROM wa_eval_results wer
                    INNER JOIN BU_Product_Account_mapping bpam
                    ON wer.account_id = bpam.AWS_AccountID
                    WHERE status != 'error'
                    {bu_condition}
                    {product_condition}
                    {accountID_condition}
                    {region_condition}
                    {env_condition}
                    GROUP BY  wer.pillar, wer.control_id
                ), failed_count AS (
                    SELECT COUNT(*) as count, wer.pillar,  wer.control_id
                    FROM wa_eval_results wer
                    INNER JOIN BU_Product_Account_mapping bpam
                    ON wer.account_id = bpam.AWS_AccountID
                    WHERE status = 'alarm'
                    {bu_condition}
                    {product_condition}
                    {accountID_condition}
                    {region_condition}
                    {env_condition}
                    GROUP BY  wer.pillar, wer.control_id
                ) 
                SELECT COALESCE(f.pillar, t.pillar) AS pillar,
                    COALESCE(f.control_id, t.control_id) AS control_id,
                    f.count AS failed_count,
                    t.count AS total_count
                FROM failed_count f
                LEFT JOIN total_count t ON f.control_id = t.control_id AND f.pillar = t.pillar
                UNION
                SELECT COALESCE(f.pillar, t.pillar) AS pillar,
                    COALESCE(f.control_id, t.control_id) AS control_id,
                    f.count AS failed_count,
                    t.count AS total_count
                FROM failed_count f
                RIGHT JOIN total_count t ON f.control_id = t.control_id AND f.pillar = t.pillar
                WHERE f.control_id IS NULL
            ) SELECT failed_count, total_count, pillar, control_id FROM counters;
        """
        # Execute the query
        cursor.execute(base_query)
        # Fetch all results
        results = cursor.fetchall()
        
        pillar_control_stats = {}
        for failed_count, total_count, pillar, control_id in results:
            if pillar not in pillar_control_stats:
                pillar_control_stats[pillar] = {"failed": 0, "total": 0}
            if failed_count is None:
                failed_count = 0
            if total_count is None:
                total_count = 0
            pillar_control_stats[pillar]["total"] += 1
            if failed_count > 0:
                pillar_control_stats[pillar]["failed"] += 1

                
        return jsonify(pillar_control_stats)

    except Exception as e:
        print(f"Error in pillarControlStats: {e}")
        return {"error": "An error occurred while processing the request"}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        

def getControlResources(bu:str, product:str, accountID:str, region:str, controllD:str, env:str):
    conn = None
    cursor = None
    try:
        conn = conn_pool.get_connection()
        cursor = conn.cursor()
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return {"error": "Database connection error"}, 500
    
    try:
        base_query = """
        SELECT wer.resource, wer.pillar, wer.service, wer.reason, wer.status
        FROM wa_eval_results wer
        INNER JOIN BU_Product_Account_mapping bpam ON wer.account_id = bpam.AWS_AccountID
        WHERE wer.control_id = %s
        """
        params = [controllD]
        if bu and bu.lower() != 'all':
            base_query += " AND bpam.BU = %s"
            params.append(bu)
        
        if product and product.lower() != 'all':
            base_query += " AND bpam.Product = %s"
            params.append(product)
    
        if accountID and accountID.lower() != 'all':
            base_query += " AND wer.account_id = %s"
            params.append(accountID)
        
        if region and region.lower() != 'all':
            base_query += " AND wer.region = %s"
            params.append(region)
        
        if env and env.lower() != 'all':
            base_query += " AND bpam.Environment = %s"
            params.append(env)
        
        cursor.execute(base_query, tuple(params))
        results = cursor.fetchall()
        
        # Get column names
        column_names = [desc[0] for desc in cursor.description]
        
        # Convert results to list of dictionaries
        json_results = []
        for row in results:
            json_results.append(dict(zip(column_names, row)))
        
        return jsonify(json_results)
    except Exception as e:
        print(f"Error in getControlResources: {e}")
        return {"error": "An error occurred while processing the request"}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def getSeverityControlStats(bu:str, product:str, accountID:str, region:str, pillar:str, env:str):
    conn = None
    cursor = None
    try:
        conn = conn_pool.get_connection()
        cursor = conn.cursor()
        
    except Exception as e:
        print(f"Error in getSeverityControlStats: {e}")
        return {"error": "An error occurred while processing the request"}, 500

    try:
        base_query = """
        SELECT DISTINCT wer.control_id, wer.control_title, wer.status, wer.severity AS severity 
        FROM wa_eval_results wer 
        INNER JOIN BU_Product_Account_mapping bpam ON wer.account_id = bpam.AWS_AccountID 
        WHERE status NOT IN ('error')
        """
        
        params = []
        
        if bu and bu.lower() != 'all':
            base_query += " AND bpam.BU = %s"
            params.append(bu)
        
        if product and product.lower() != 'all':
            base_query += " AND bpam.Product = %s"
            params.append(product)
        
        if accountID and accountID.lower() != 'all':
            base_query += " AND wer.account_id = %s"
            params.append(accountID)
        
        if region and region.lower() != 'all':
            base_query += " AND wer.region = %s"
            params.append(region)
        
        if pillar and pillar.lower() != 'all':
            base_query += " AND wer.pillar = %s"
            params.append(pillar)
        else:
            # pillar is mandatory, return error
            return {"error": "Pillar is mandatory"}, 400
        
        # Add environment filter
        if env and env.lower() != 'all':
            base_query += " AND bpam.Environment = %s"
            params.append(env)
        
        base_query += """ GROUP BY wer.control_id, wer.control_title, wer.status, wer.severity
        ORDER BY wer.status
        """
        cursor.execute(base_query, tuple(params))
        results = cursor.fetchall()
        
        severity_stats = {}
        controls_failed = set()
        controls_total = set()
        severity_controls = {}
        
        for control_id, control_title,  status, severity in results:
            """Failed controls appear first (Query order).
            if they're already accounted for, then no need to process passed ones"""
            if control_id in controls_total:
                continue # already accounted for, skip
            if severity not in severity_stats:
                severity_stats[severity] = {"failed": 0, "total": 0, "controlList": []}
            
            if severity not in severity_controls : severity_controls[severity] = set()
            severity_controls[severity].add(control_id)
            controls_total.add(control_id)
            if status.lower() == 'alarm':
                controls_failed.add(control_id)
            control_info = {
                "control_id": control_id,
                "control_title": control_title,
                "status": "fail" if status.lower() == 'alarm' else "pass"
            }
            severity_stats[severity]["controlList"].append(control_info)
        
        for severity in severity_stats:
            total = len(severity_controls[severity])
            failed = len(controls_failed.intersection(severity_controls[severity]))
            severity_stats[severity]["total"] = total
            severity_stats[severity]["failed"] = failed
        return jsonify(severity_stats)

    except Exception as e:
        print(f"Error in getSeverityControlStats: {e}")
        return {"error": "An error occurred while processing the request"}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def getResourceDetails(accountId, region):
    conn = None
    cursor = None
    try:
        conn = conn_pool.get_connection()
        cursor = conn.cursor()
        s3 = boto3.client("s3")

        # get_accountid_sql = "SELECT aws_account_id FROM wa_tenant_map WHERE aws_account_name = %s "

        # cursor.execute(get_accountid_sql,(accountName,))
        # accountId = cursor.fetchone()[0]

        get_resources_path_sql = "SELECT eval_results FROM wa_benchmark_runs WHERE aws_account_id = %s and region = %s and run_id = (SELECT run_id FROM wa_pillar_scores WHERE aws_account_id = %s and region = %s ORDER BY id DESC LIMIT 1)"

        cursor.execute(get_resources_path_sql, (accountId, region, accountId, region))
        s3_resources_path = cursor.fetchone()[0]

        obj = s3.get_object(Bucket=S3_BUCKET_NAME, Key=s3_resources_path)

        # Load the CSV data into a DataFrame
        df = pd.read_csv(io.BytesIO(obj["Body"].read()))

        # Convert the DataFrame to a JSON list of dictionaries
        json_data = df.to_json(orient="records")

        return jsonify(json_data)  # Send the JSON as a response

    except Exception as e:
        print(f"Error during fetching resources from s3: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def getHistoricalPillarScores(accountId, region, from_date, to_date):
    conn = None
    cursor = None
    try:
        conn = conn_pool.get_connection()
        cursor = conn.cursor()

        # get_accountid_sql = "SELECT aws_account_id FROM wa_tenant_map WHERE aws_account_name = %s "

        # cursor.execute(get_accountid_sql,(accountName,))
        # accountId = cursor.fetchone()[0]

        get_scores_sql = """SELECT DISTINCT ps.run_id, ps.pillar, ps.score 
                            FROM wa_pillar_scores ps
                            INNER JOIN (
                                SELECT run_id 
                                FROM wa_pillar_scores 
                                WHERE aws_account_id = %s 
                                AND region = %s 
                                AND created_at >= %s
                                AND created_at <= %s
                            ) AS subquery ON ps.run_id = subquery.run_id
                            WHERE ps.aws_account_id = %s 
                            AND ps.region = %s
                            """
        cursor.execute(get_scores_sql, (accountId, region, from_date, to_date, accountId, region))
        data = cursor.fetchall()

        columns = [x[0] for x in cursor.description]

        scores = []
        for row in data:
            scores.append(dict(zip(columns, row)))

        return jsonify(scores)
    except Exception as e:
        print(f"Error during fetching pillar scores: {e}")
        return {"error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def getControlsList():   
    try:    
        s3 = boto3.client("s3")   
        s3_resources_path = "well_architected/controls_list.json"

        obj = s3.get_object(Bucket=S3_BUCKET_NAME, Key=s3_resources_path)

        file_content = obj['Body'].read().decode('utf-8')
        json_data = json.loads(file_content)
        return json_data.get("rows")

    except Exception as e:
        print(f"Error during fetching resources from s3: {e}")
        return {"error": str(e)}, 500
    

def getTechStackDetails(): 
    try:        
        s3 = boto3.client("s3")
        s3_resources_path = "well_architected/external_csv/wiz/technology_eol.json"

        obj = s3.get_object(Bucket=S3_BUCKET_NAME, Key=s3_resources_path)

        file_content = obj['Body'].read().decode('utf-8')
        json_data = json.loads(file_content)
        return json_data

    except Exception as e:
        print(f"Error during fetching resources from s3: {e}")
        return {"error": str(e)}, 500



def createControlFRTicket(accountId, controlId, description, priorityId ):
    conn = None
    cursor = None
    try:
         # Connect to the database
        conn = conn_pool.get_connection()
        cursor = conn.cursor()

        # Query to get unique BUs
        query = "SELECT FR_key FROM BU_Product_Account_mapping where AWS_AccountID = %s"
        cursor.execute(query,(accountId,))

        fr_key = cursor.fetchone()[0]

        url = f"https://freshworks.freshrelease.com/{fr_key}/issues"
        # response = requests.post(url, json=parameters)

        headers = {
        'Authorization': f'Token {os.environ.get("fr_token")}' ,
        'Content-Type': 'application/json'
        }

        payload = json.dumps({
            "issue": {
                "description": "<p>{}</p>".format(description.replace("\n", "<br/>")) ,
                "title": controlId ,
                "start_date": datetime.now().isoformat(),
                "issue_type_id": "14" ,
                "priority_id": priorityId or 6 ,
                "tags": ["well-architected", "automated"]
            }
        })
        response = requests.request("POST" , url , headers=headers , data=payload)

        return jsonify({
            "status_code": response.status_code,
            "response": response.json()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Close the connection
        cursor.close()
        conn.close()
    


    

def fetchFRTicket(accountId, controlId):
    conn = None
    cursor = None
    try:
        # Connect to the database
        conn = conn_pool.get_connection()
        cursor = conn.cursor()

        # Query to get unique BUs
        query = "SELECT FR_key FROM BU_Product_Account_mapping where AWS_AccountID = %s"
        cursor.execute(query,(accountId,))

        fr_key = cursor.fetchone()[0]


        url = f"https://freshworks.freshrelease.com/{fr_key}/issues?query_hash[0][condition]=title&query_hash[0][operator]=is&query_hash[0][value]={controlId}"
        # response = requests.post(url, json=parameters)

        headers = {
        'Authorization': f'Token {os.environ.get("fr_token")}' ,
        'Content-Type': 'application/json'
        }

        response = requests.request("GET" , url , headers=headers)
        # issues = response.json()["issues"]

        return jsonify({
            "status_code": response.status_code,
            "response": response.json()
        })

        # return response.json()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Close the connection
        cursor.close()
        conn.close()
    

def addResourcesToTkt(tktId, accountId, failedResources) :
    conn = None
    cursor = None
    try:
        # Connect to the database
        conn = conn_pool.get_connection()
        cursor = conn.cursor()

        # Query to get unique BUs
        query = "SELECT FR_key FROM BU_Product_Account_mapping where AWS_AccountID = %s"
        cursor.execute(query,(accountId,))

        fr_key = cursor.fetchone()[0]
        
        url = f"https://freshworks.freshrelease.com/{fr_key}/issues/{tktId}/comments"
        headers = {
        'Authorization': f'Token {os.environ.get("fr_token")}' ,
        'Content-Type': 'application/json'
        }

        payload = json.dumps({
             "content": "latest list of failed resources: <br/><br/>" + failedResources
         })
        
        response = requests.request("POST" , url , headers=headers, data=payload)
        # issues = response.json()["issues"]

        return jsonify({
            "status_code": response.status_code,
            "response": response.json()
        })

    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        # Close the connection
        cursor.close()
        conn.close()

def closeControlFRTicket(accountId, tktId):
    conn = None
    cursor = None
    try:
        # Connect to the database
        conn = conn_pool.get_connection()
        cursor = conn.cursor()

        # Query to get unique BUs
        query = "SELECT FR_key FROM BU_Product_Account_mapping where AWS_AccountID = %s"
        cursor.execute(query,(accountId,))

        fr_key = cursor.fetchone()[0]
        
        url = f"https://freshworks.freshrelease.com/{fr_key}/issues/{tktId}"
        headers = {
        'Authorization': f'Token {os.environ.get("fr_token")}' ,
        'Content-Type': 'application/json'
        }
        payload = json.dumps({
            "issue": {
                "status_id": 20                
            }
        })

        print(fr_key)
        print(payload)


        response = requests.request("PUT" , url , headers=headers, data=payload)

        return jsonify({
            "status_code": response.status_code,
            "response": response.json()
        })
   
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    finally:
        # Close the connection
        cursor.close()
        conn.close()

    

def deleteControlFRTicket(accountId, tktId):
    conn = None
    cursor = None
    try:
        # Connect to the database
        conn = conn_pool.get_connection()
        cursor = conn.cursor()

        # Query to get unique BUs
        query = "SELECT FR_key FROM BU_Product_Account_mapping where AWS_AccountID = %s"
        cursor.execute(query,(accountId,))

        fr_key = cursor.fetchone()[0]
        
        url = f"https://freshworks.freshrelease.com/{fr_key}/issues/{tktId}"
        headers = {
        'Authorization': f'Token {os.environ.get("fr_token")}' ,
        'Content-Type': 'application/json'
        }
        
        response = requests.request("DELETE" , url , headers=headers)

        return jsonify({
            "status_code": response.status_code,
            "response": "ticket deleted successfully"
        })
   
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    finally:
        # Close the connection
        cursor.close()
        conn.close()
        
        
def failedControlTkt(accountId, region, controlId, priorityId, description, failedResources) :
    
   
    try:
        BU,Product,AWS_AccountName,FR_key = getAccountdetails(accountId)
        if (FR_key == None) :
            abort(500, description="No FR project mapped to the account")
            
        # print(FR_key)
        # print(AWS_AccountName)
            
#    check if subtask exists
        subTaskId = getFRTaskId(fr_key=FR_key, title=AWS_AccountName+"_"+controlId+"_"+region)
        
        if (subTaskId == 0) :
            print("no subtask exists for the control_region ")
            # check if parent task exists
            parentTaskId = getFRTaskId(fr_key=FR_key, title=AWS_AccountName+"_"+controlId)
            
            if(parentTaskId == 0 ):
                print("no parent task exists for the control ")
                # create parent task
                parentTaskId = createFRTask(fr_key=FR_key, title=AWS_AccountName+"_"+controlId, description=description, priorityId=priorityId)
                
            subTaskId = createFRSubTask(fr_key=FR_key, title=AWS_AccountName+"_"+controlId+"_"+region, description=description, priorityId=priorityId, parentTaskId=parentTaskId)
        
        comment =  "List of failed resources: <br/><br/>" + '<br/>'.join(failedResources)
         
        response = addCommentToTask(fr_key=FR_key, taskId=subTaskId, comments=comment)
        
        
        return jsonify({
            "response": "ticket created/updated successfully"
        })
     
        
    except Exception as e:
        abort(500, description=str(e))


def passedControlTkt(accountId, region, controlId) :
    try:
        BU,Product,AWS_AccountName,FR_key = getAccountdetails(accountId)
        if (FR_key == None) :
            abort(500, description="No FR project mapped to the account")
        
        #    check if subtask exists
        subTaskId = getFRTaskId(fr_key=FR_key, title=AWS_AccountName+"_"+controlId+"_"+region)
        parentTaskId = getFRTaskId(fr_key=FR_key, title=AWS_AccountName+"_"+controlId)
        
        if (subTaskId == 0) :
            print("no subtask exists for the control_region ")
            if (parentTaskId != 0) :
                closeParentTask(fr_key=FR_key, taskId=parentTaskId)
                
            return jsonify({
                "response": "No ticket exists for the control to close "
            })
        # add comment to ticket before closing
        addCommentToTask(fr_key=FR_key, taskId=subTaskId, comments="The control is passed for all the resources.. <br/> closing the ticket now")
        
        # close the subtask
        updateTaskStatus(fr_key=FR_key, taskId=subTaskId, statusId=20)
        
        
        if (parentTaskId != 0) :
            closeParentTask(fr_key=FR_key, taskId=parentTaskId)
        
        return jsonify({
            "response": "ticket closed successfully"
        })
        
    except Exception as e:
        abort(500, description=str(e))

def getFRKeyByProduct(product):
    conn = None
    cursor = None
    try:
        conn = conn_pool.get_connection()
        cursor = conn.cursor()

        query = "SELECT DISTINCT FR_key FROM BU_Product_Account_mapping where Product = %s"
        cursor.execute(query,(product,))
        
        FR_key = cursor.fetchone()[0]
        return FR_key
    except Exception as e:
        print(f"Error during fetching FR key: {e}")
        return None
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def FRTicketsForControlForAccount(controlID, account, region):
    try:
        Task = ""
        if account != "" and account.lower() != "all":
            BU,Product,AWS_AccountName,FR_key = getAccountdetails(account)
            
            Task = getFRTaskDetailsForControl(fr_key=FR_key, title=AWS_AccountName+"_"+controlID, region=region)
            
        return Task
        
    except Exception as e:
        abort(500, description=str(e))


def FRTicketsForControlForProduct(controlID, product, region):
    try:
        TaskList = []
        if product != "" and product.lower() != "all":

            FR_key = getFRKeyByProduct(product)

            TaskList = getFRTaskDetailsForControl(fr_key=FR_key, title=controlID, region=region)

        return TaskList
        
    except Exception as e:
        abort(500, description=str(e))