from mysql.connector import connection
from flask import jsonify
import mysql.connector
import mysql.connector.pooling
import json , calendar
from datetime import *
import requests
from math import *
import os
from dotenv import load_dotenv

load_dotenv()
dbconfig = {
            "host": os.environ.get("rds_db_host"),
            "port": os.environ.get("rds_db_port"),
            "database": os.environ.get("rds_db_name"),
            "user": os.environ.get("rds_db_user"),
            "password": os.environ.get("rds_db_pass"),
        }
conn_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool" , pool_size=int(os.environ.get("pool_count")) , **dbconfig)

def get_BUs():
    try:
        # Connect to the database
        conn = conn_pool.get_connection()
        cursor = conn.cursor()

        # Query to get unique BUs
        query = "SELECT DISTINCT BU FROM BU_Product_Account_mapping"
        cursor.execute(query)

        # Fetch all unique BUs
        BUs = [row[0] for row in cursor.fetchall()]
        # print(BUs)

        # Close the connection
        cursor.close()
        conn.close()

        return jsonify({"BUs": BUs})
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_Products(bu):
    try:
        # Connect to the database
        conn = conn_pool.get_connection()
        cursor = conn.cursor()

        # Query to get unique products
        if (bu == 'All') :
            query = "SELECT DISTINCT Product FROM BU_Product_Account_mapping"
            cursor.execute(query)
        else:
            query = "SELECT DISTINCT Product FROM BU_Product_Account_mapping where BU = %s"
            cursor.execute(query,(bu,))

        # Fetch all unique products
        products = [row[0] for row in cursor.fetchall()]
        # print(products)

        # Close the connection
        cursor.close()
        conn.close()

        return jsonify({"products": products})
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def get_AWS_Accounts(bu,product):
    try:
        # Connect to the database
        conn = conn_pool.get_connection()
        cursor = conn.cursor()

        if (bu == 'All' and product == 'All') :
            query = "SELECT AWS_AccountName, AWS_AccountID, Environment FROM BU_Product_Account_mapping"
            cursor.execute(query)
        elif (bu != 'All' and product == 'All') :
            query = "SELECT AWS_AccountName, AWS_AccountID, Environment FROM BU_Product_Account_mapping where BU = %s"
            cursor.execute(query,(bu,))
        else:
            query = "SELECT AWS_AccountName, AWS_AccountID, Environment FROM BU_Product_Account_mapping where Product = %s"
            cursor.execute(query,(product,))

        # products = [row[0] for row in cursor.fetchall()]
        accounts = [{'account': row[0], 'accountid': row[1], 'environment': row[2]} for row in cursor.fetchall()]

        # Close the connection
        cursor.close()
        conn.close()

        return jsonify({"accounts": accounts})
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def createControlFRTicket(accountid, control_id, description, priority_id ):
    try:
         # Connect to the database
        conn = conn_pool.get_connection()
        cursor = conn.cursor()

        # Query to get unique BUs
        query = "SELECT FR_key FROM BU_Product_Account_mapping where AWS_AccountID = %s"
        cursor.execute(query,(accountid,))

        fr_key = cursor.fetchone()[0]

        # Close the connection
        cursor.close()
        conn.close()
        
        url = f"https://freshworks.freshrelease.com/{fr_key}/issues"
        # response = requests.post(url, json=parameters)

        headers = {
        'Authorization': f'Token {os.environ.get("fr_token")}' ,
        'Content-Type': 'application/json'
        }

        payload = json.dumps({
            "issue": {
                "description": "<p>{}</p>".format(description) ,
                "title": control_id ,
                "start_date": datetime.now().isoformat(),
                "issue_type_id": "14" ,
                "priority_id": priority_id or 6 ,
            }
        })
        response = requests.request("POST" , url , headers=headers , data=payload)

        return jsonify({
            "status_code": response.status_code,
            "response": response.json()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


    

def fetchFRTicket(accountid, control_id):
    try:
        # Connect to the database
        conn = conn_pool.get_connection()
        cursor = conn.cursor()

        # Query to get unique BUs
        query = "SELECT FR_key FROM BU_Product_Account_mapping where AWS_AccountID = %s"
        cursor.execute(query,(accountid,))

        fr_key = cursor.fetchone()[0]

        # Close the connection
        cursor.close()
        conn.close()


        url = f"https://freshworks.freshrelease.com/{fr_key}/issues?query_hash[0][condition]=title&query_hash[0][operator]=is&query_hash[0][value]={control_id}"
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

def getAccountdetails(accountId):
    conn = None
    cursor = None
    try:
        # Connect to the database
        conn = conn_pool.get_connection()
        cursor = conn.cursor()

        # Query to get unique BUs
        query = "SELECT BU,Product,AWS_AccountName,FR_key FROM BU_Product_Account_mapping where AWS_AccountID = %s"
        cursor.execute(query,(accountId,))

        data = cursor.fetchone()
        print(data)
        return data
        
    except Exception as e:
        print(f"An error occurred in fetching data from db: {e}")
        raise
    finally:
        # Close the connection
        cursor.close()
        conn.close()
        
        
    
def getFRTaskId(fr_key,title) :
    try:
        url = f"https://freshworks.freshrelease.com/{fr_key}/issues/?query_hash[0][condition]=title&query_hash[0][operator]=is&query_hash[0][value]={title}&query_hash[1][condition]=status_id&query_hash[1][operator]=is_not&query_hash[1][value]=20"
        headers = {
        'Authorization': f'Token {os.environ.get("fr_token")}' ,
        'Content-Type': 'application/json'
        }
        
        response = requests.request("GET" , url , headers=headers)
        tasks = response.json()['issues'] 

        if( len(tasks) > 0 ):
            return tasks[0]["id"]
        else:
            return 0

    except Exception as e:
        print(f"An error occurred in fetching data from api: {e}")
        raise 

        
def createFRTask(fr_key,title, description, priorityId):
    try:
        url = f"https://freshworks.freshrelease.com/{fr_key}/issues/"
        headers = {
        'Authorization': f'Token {os.environ.get("fr_token")}' ,
        'Content-Type': 'application/json'
        }
        
        payload = json.dumps({
            "issue": {
                "title": title ,
                "description": "<p>{}</p>".format(description.replace("\n", "<br/>")) ,
                "priority_id": priorityId or 6 ,
                "start_date": datetime.now().isoformat(),
                "issue_type_id": "14" ,
                "tags": ["well-architected", "automated"]
            }
        })
        
        response = requests.request("POST" , url , headers=headers, data=payload)
        task = response.json()['issue'] 
        
        return task["id"]

    except Exception as e:
        print(f"An error occurred in fetching data from api: {e}")
        raise
        
def createFRSubTask(fr_key,title, description, priorityId, parentTaskId):
    try:
        url = f"https://freshworks.freshrelease.com/{fr_key}/issues/"
        headers = {
        'Authorization': f'Token {os.environ.get("fr_token")}' ,
        'Content-Type': 'application/json'
        }
        
        payload = json.dumps({
            "issue": {
                "title": title ,
                "description": "<p>{}</p>".format(description.replace("\n", "<br/>")) ,
                "priority_id": priorityId or 6 ,
                "start_date": datetime.now().isoformat(),
                "issue_type_id": "15" ,
                "parent_id": parentTaskId,
                "tags": ["well-architected", "automated"]
            }
        })
        
        response = requests.request("POST" , url , headers=headers, data=payload)
        task = response.json()['issue'] 
        
        return task["id"]

    except Exception as e:
        print(f"An error occurred in fetching data from api: {e}")
        raise
        

def addCommentToTask(fr_key, taskId, comments) :
    try:
        url = f"https://freshworks.freshrelease.com/{fr_key}/issues/{taskId}/comments"
        headers = {
        'Authorization': f'Token {os.environ.get("fr_token")}' ,
        'Content-Type': 'application/json'
        }
        
        payload = json.dumps({
            "content" : comments
        })
        
        response = requests.request("POST" , url , headers=headers, data=payload)
        return response.json()

    except Exception as e:
        print(f"An error occurred in fetching data from api: {e}")
        raise
    
def updateTaskStatus(fr_key, taskId, statusId):
    try:
        url = f"https://freshworks.freshrelease.com/{fr_key}/issues/{taskId}"
        headers = {
        'Authorization': f'Token {os.environ.get("fr_token")}' ,
        'Content-Type': 'application/json'
        }
        
        payload = json.dumps({
            "issue" : {
                "status_id": statusId
            }
        })
        
        response = requests.request("PUT" , url , headers=headers, data=payload)
        task = response.json()['issue'] 
        
        return task["id"]
    
    except Exception as e:
        print(f"An error occurred in fetching data from api: {e}")
        raise
    
def closeParentTask(fr_key, taskId ):
    try:
        url = f"https://freshworks.freshrelease.com/{fr_key}/issues/{taskId}/issues"
        headers = {
        'Authorization': f'Token {os.environ.get("fr_token")}' ,
        'Content-Type': 'application/json'
        }
        
        response = requests.request("GET" , url , headers=headers )
        subTasks = response.json()['issues'] 
        
        IsAllSubTasksClosed = True
        
        for subTask in subTasks:
            if subTask.get("status_id") != 20:
                print("All subtasks are not closed")
                IsAllSubTasksClosed = False
                break
            
        if(IsAllSubTasksClosed):
            # close parent task
            print("closing parent task")
            updateTaskStatus(fr_key=fr_key, taskId=taskId, statusId=20)
        else:
            print("some Tasks are still in open state")
            
    except Exception as e:
        raise

def getFRTaskDetailsForControl(fr_key, title,region):
    try:
        if region =="" or region.lower() == "all" :
            url = f"https://freshworks.freshrelease.com/{fr_key}/issues?query_hash[0][condition]=title&query_hash[0][operator]=contains&query_hash[0][value]={title}&query_hash[1][condition]=status_id&query_hash[1][operator]=is_not&query_hash[1][value]=20&query_hash[2][condition]=issue_type_id&query_hash[2][operator]=is&query_hash[2][value]=14"
        else:
            url = f"https://freshworks.freshrelease.com/{fr_key}/issues?query_hash[0][condition]=title&query_hash[0][operator]=contains&query_hash[0][value]={title}_{region.replace('-','_')}&query_hash[1][condition]=status_id&query_hash[1][operator]=is_not&query_hash[1][value]=20"
        
        headers = {
        'Authorization': f'Token {os.environ.get("fr_token")}' ,
        'Content-Type': 'application/json'
        }
        
        response = requests.request("GET" , url , headers=headers)
        tasks = response.json()['issues'] 
        
        return tasks

    except Exception as e:
        print(f"An error occurred in fetching data from api: {e}")
        raise