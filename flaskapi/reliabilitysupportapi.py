from mysql.connector import connection
import mysql.connector
import mysql.connector.pooling
import json , calendar
from datetime import *
from dateutil.relativedelta import *
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

dbconfig2 = {
            "host": os.environ.get("rds_db_host"),
            "port": os.environ.get("rds_db_port"),
            "database": os.environ.get("rds_db2_name"),
            "user": os.environ.get("rds_db_user"),
            "password": os.environ.get("rds_db_pass"),
}

conn_pool_cost = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool" , pool_size=int(os.environ.get("pool_count")) , **dbconfig2)

quarterMonths = {'Q1': ['January' , 'February' , 'March'] , 'Q2': ['April' , 'May' , 'June'] ,
                 'Q3': ['July' , 'August' , 'September'] , 'Q4': ['October' , 'November' , 'December']}


# incidents = []

def executeCursor(query):
    # print(query)
    conn = conn_pool.get_connection()
    mycursor = conn.cursor()
    mycursor.execute(query)
    result = mycursor.fetchall()
    mycursor.close()
    conn.close()
    return result


def executeCursor_cost(query):
    # print(query)
    conn = conn_pool_cost.get_connection()
    mycursor = conn.cursor()
    mycursor.execute(query)
    result = mycursor.fetchall()
    mycursor.close()
    conn.close()
    return result


def get_kpi_names(pillar):
    conn = conn_pool.get_connection()
    mycursor = conn.cursor()
    mycursor.execute("select distinct KPI_name from KPI_table1;")
    result = mycursor.fetchall()
    kpi = {'Reliability': [i[0] for i in result]}
    # print(product)
    mycursor.close()
    conn.close()
    return json.dumps(kpi[pillar] , default=str)


def get_kpi_table(bu , product , from_date , to_date):
    conn = conn_pool.get_connection()
    mycursor = conn.cursor()
    lst_of_dates = get_myrun_date(from_date , to_date)
    #print(lst_of_dates)
    if len(lst_of_dates) == 1:
        dates = "('" + str(lst_of_dates[0]) + "')"
    else:
        dates = tuple([str(i) for i in lst_of_dates])
    if bu not in [None , 'All'] and product == 'All':
        #print("SELECT KPI,sla_defined as SLA_defined,current_values_sum as Value,error_budget_remaining_percent,sla_status,actual_month,product,(select count(*) from Action_Items where product = KPI_calculated_daily.product and kpi_name = KPI_calculated_daily.KPI and status != 'Closed') as 'Action_Items' FROM KPI_calculated_daily WHERE product in (select Product from BU_table where BU='{}') and date in {}".format(bu , dates))
        mycursor.execute(
            "SELECT KPI,sla_defined as SLA_defined,current_values_sum as Value,error_budget_remaining_percent,sla_status,actual_month,product,(select count(*) from Action_Items where product = KPI_calculated_daily.product and kpi_name = KPI_calculated_daily.KPI and status != 'Closed') as 'Action_Items' FROM KPI_calculated_daily WHERE product in (select Product from BU_table where BU='{}') and date in {}".format(bu , dates))
    elif product == 'All' and bu in [None , 'All']:
        mycursor.execute(
            "SELECT KPI,sla_defined as SLA_defined,current_values_sum as Value,error_budget_remaining_percent,sla_status,actual_month,product,(select count(*) from Action_Items where product = KPI_calculated_daily.product and kpi_name = KPI_calculated_daily.KPI and status != 'Closed') as 'Action_Items' FROM KPI_calculated_daily WHERE date in {}".format(dates))
    else:
        mycursor.execute(
            "SELECT KPI,sla_defined as SLA_defined,current_values_sum as Value,error_budget_remaining_percent ,sla_status,actual_month,product,(select count(*) from Action_Items where product = KPI_calculated_daily.product and kpi_name = KPI_calculated_daily.KPI and status != 'Closed') as 'Action_Items'  FROM KPI_calculated_daily WHERE product = '{}' and date in {}".format(product , dates))
    result = mycursor.fetchall()
    row_headers = [x[0] for x in mycursor.description]
    json_data = []
    for i in result:
        json_data.append(dict(zip(row_headers , i)))
    mycursor.close()
    conn.close()
    return json.dumps(json_data , default=str)
    # result = include_header_with_records(mycursor)
    # return get_output_as_excel(result)


def get_inc_data(bu , product , from_date , to_date):
    conn = conn_pool.get_connection()
    mycursor = conn.cursor()

    def slaCount(incidents , priority):
        dct = {'SLA MISSED': 0 , 'IN SLA': 0}
        if len(incidents) == 0:
            return [priority , dct]
        slaQuery = "select sla_status,count(sla_status) from PreventiveActionItems where incident_no in {} and priority='{}' and status not in ('Done','Closed','Completed','Tech RCA Generated','Deployed','Deferred','Invalid') group by sla_status;".format(
            incidents , priority)
        mycursor.execute(slaQuery)
        for i in mycursor.fetchall():
            dct[i[0]] = i[1]
        return [priority , dct]

    if bu not in [None , 'All'] and product == 'All':
        mycursor.execute(
            "SELECT incident_no,priority,product,issue_category,region,ttd_in_min as TTD,ttr_in_min as TTR,product,products_affected,customers_impacted, is_recurring_incident, alert_source FROM Incidents where priority in ('P0','P1') and start_date between '{}' and '{}' and product in (select Product from BU_table where BU='{}'); ".format(
                from_date , to_date , bu))
    elif product == 'All' and bu in [None , 'All']:
        mycursor.execute(
            "SELECT incident_no,priority,product,issue_category,region,ttd_in_min as TTD,ttr_in_min as TTR,product,products_affected,customers_impacted, is_recurring_incident, alert_source FROM Incidents where priority in ('P0','P1') and start_date between '{}' and '{}'; ".format(
                from_date , to_date))
    else:
        mycursor.execute(
            "SELECT incident_no,priority,product,issue_category,region,ttd_in_min as TTD,ttr_in_min as TTR,product,products_affected,customers_impacted,is_recurring_incident,alert_source FROM Incidents where product = '{}'  and priority in ('P0','P1') and start_date between '{}' and '{}'; ".format(
                product , from_date , to_date))
    # print("Before inc calc",incidents)
    if mycursor.rowcount != 0:
        result = mycursor.fetchall()
        incidents = [i[0] for i in result]
        row_headers = [x[0] for x in mycursor.description]
        incident_data = []
        for i in result:
            incident_data.append(dict(zip(row_headers , i)))
    else:
        result = mycursor.fetchall()
        incidents = []
        incident_data = []
    if len(incidents) == 1:
        incidentTuple = '(\'' + incidents[0] + '\')'
    else:
        incidentTuple = tuple(incidents)
    preventiveactionitems = []
    dct = {}
    # dct[i[0]]=i[1]
    for j in ["Urgent" , "High" , "Medium" , 'Low']:
        count = slaCount(incidentTuple , j)
        dct[count[0]] = count[1]
    if len(incidents) != 0:
        query = "select incident_no,project,title,priority,start_date,end_date,status,sla_status from PreventiveActionItems where incident_no in {} and status not in ('Done','Closed','Completed','Tech RCA Generated','Deployed','Deferred','Invalid');".format(
            incidentTuple)
        # print(query)
        mycursor.execute(query)
        if mycursor.rowcount != 0:
            result = mycursor.fetchall()
            row_headers = [x[0] for x in mycursor.description]
            for i in result:
                preventiveactionitems.append(dict(zip(row_headers , i)))
        else:
            result = mycursor.fetchall()
    mycursor.close()
    conn.close()
    output = {"incidents": incident_data , "preventive_action_items": preventiveactionitems , "repair_items_chart": dct}
    # print("After inc calc",incidents)
    return json.dumps(output , default=str)


def get_products():
    conn = conn_pool.get_connection()
    mycursor = conn.cursor()
    mycursor.execute("select distinct product from KPI_table1;")
    result = mycursor.fetchall()
    product = {'Product': [i[0] for i in result]}
    # print(product)
    mycursor.close()
    conn.close()
    return json.dumps(product , default=str)


def get_reliabilty_status(bu , product , from_date , to_date):
    # global flag
    lst_of_dates = get_myrun_date(from_date , to_date)
    result = {"sla_missed": get_sla_status_count(bu , product , lst_of_dates , "SLA MISSED") ,
              "sla_approaching": get_sla_status_count(bu , product , lst_of_dates , "NEARING SLA") ,
              "in_sla": get_sla_status_count(bu , product , lst_of_dates , "IN SLA")}
    return json.dumps(result , default=str)


def get_defined_kpitable(bu , product):
    conn = conn_pool.get_connection()
    mycursor = conn.cursor()
    if bu in [None , 'All'] and product == 'All':
        mycursor.execute("select KPI_name 'KPI Name',SLA,description as Description,Product from KPI_table1;")
    elif bu not in [None , 'All'] and product == 'All':
        mycursor.execute(
            "select KPI_name 'KPI Name',SLA,description as Description,Product from KPI_table1 where product in (select Product from BU_table where BU='{}');".format(
                bu))
    else:
        mycursor.execute(
            "select KPI_name 'KPI Name',SLA,description as Description,Product from KPI_table1 where product = '{}';".format(
                product))
    result = mycursor.fetchall()
    row_headers = [x[0] for x in mycursor.description]
    json_data = []
    for i in result:
        json_data.append(dict(zip(row_headers , i)))
    mycursor.close()
    conn.close()
    return json.dumps(json_data , default=str)


def getUsers():
    url = "https://freshworks.freshrelease.com/S3/users?limit=200"
    payload = {}
    headers = {
        'Content-Type': 'application/json' ,
        'Authorization': f'Token {os.environ.get("fr_token")}' ,
    }
    response = requests.request("GET" , url , headers=headers , data=payload)
    if response.status_code == 200:
        user_dict = {}
        response_json = json.loads(response.text)
        # print(response_json)
        for x in response_json['users']:
            user_dict[x['name']] = x['id']
        return user_dict


def createTicket(title , start_date , due_by , product , kpi_name , assignee , description , priority):
    url = "https://freshworks.freshrelease.com/S3/issues"
    user_output = getUsers()
    if priority.lower() == "urgent":
        priority_id = 8
    elif priority.lower() == "high":
        priority_id = 7
    elif priority.lower() == "medium":
        priority_id = 6
    else:
        priority_id = 5
    if assignee in user_output.keys():
        assignee_id = user_output[assignee]
    else:
        assignee_id = "52258"
    payload = json.dumps({
        "issue": {
            "description": "<p>{}</p>".format(description) ,
            "title": title ,
            "start_date": start_date ,
            "due_by": due_by ,
            "custom_field": {
                "cf_product": product ,
                "cf_okr": kpi_name
            } ,
            "issue_type_id": "14" ,
            "owner_id": assignee_id ,
            "priority_id": priority_id ,
            "project_id": "25411"
        }
    })
    headers = {
        'Authorization': f'Token {os.environ.get("fr_token")}' ,
        'Content-Type': 'application/json'
    }
    response = requests.request("POST" , url , headers=headers , data=payload)
    if response.status_code == 200:
        response_json = json.loads(response.text)
        return 'Success {}'.format(response_json["issue"]["key"])


def get_sla_trends(bu , product , from_date , to_date):
    conn = conn_pool.get_connection()
    mycursor = conn.cursor()
    if bu not in [None , 'All'] and product == 'All':
        mycursor.execute(
            "select date,sla_status,count(sla_status) from KPI_calculated_daily where product in (select Product from BU_table where BU='{}') and date between '{}' and '{}' group by date,sla_status;".format(
                bu , from_date , to_date))
    elif product == 'All' and bu in [None , 'All']:
        mycursor.execute(
            "select date,sla_status,count(sla_status) from KPI_calculated_daily where date between '{}' and '{}' group by date,sla_status;".format(
                from_date , to_date))
    else:
        mycursor.execute(
            "select date,sla_status,count(sla_status) from KPI_calculated_daily where product = '{}' and date between '{}' and '{}' group by date,sla_status;".format(
                product , from_date , to_date))
    result = mycursor.fetchall()
    # dct1 = {"reliability":{"sla_missed":0,"sla_approaching":0,"in_sla":0}}
    lst = [list(i) for i in result]
    dct = get_format_for_graph(lst)
    mycursor.close()
    conn.close()
    return dct
    # print(json.dumps(dct,default = str))


def get_kpi_sla_trends(bu , product , from_date , to_date , kpi):
    conn = conn_pool.get_connection()
    mycursor = conn.cursor()
    if kpi == 'All' and product == 'All':
        if bu not in [None , 'All']:
            query = "select date,sla_status,count(sla_status) from KPI_calculated_daily where date between '{}' and '{}' and product in (select Product from BU_table where BU='{}') group by date,sla_status;".format(
                from_date , to_date , bu)
        else:
            query = "select date,sla_status,count(sla_status) from KPI_calculated_daily where date between '{}' and '{}' group by date,sla_status;".format(
                from_date , to_date)
    elif kpi == 'All' and product != 'All':
        query = "select date,sla_status,count(sla_status) from KPI_calculated_daily where product = '{}' and date between '{}' and '{}' group by date,sla_status;".format(
            product , from_date , to_date)
    elif product == 'All' and kpi != 'All':
        if bu not in [None , 'All']:
            query = "select date,sla_status,count(sla_status) from KPI_calculated_daily where date between '{}' and '{}' and KPI = '{}' and product in (select Product from BU_table where BU='{}') group by date,sla_status;".format(
                from_date , to_date , kpi , bu)
        else:
            query = "select date,sla_status,count(sla_status) from KPI_calculated_daily where date between '{}' and '{}' and KPI = '{}' group by date,sla_status;".format(
                from_date , to_date , kpi)
    else:
        query = "select date,sla_status,count(sla_status) from KPI_calculated_daily where product = '{}' and date between '{}' and '{}' and KPI = '{}' group by date,sla_status;".format(
            product , from_date , to_date , kpi)
    mycursor.execute(query)
    result = mycursor.fetchall()
    # dct1 = {"reliability":{"sla_missed":0,"sla_approaching":0,"in_sla":0}}
    lst = [list(i) for i in result]
    dct = get_format_for_graph(lst)
    mycursor.close()
    conn.close()
    return json.dumps({"kpi_sla_trends": dct})


def getActionItems(bu , product):
    conn = conn_pool.get_connection()
    mycursor = conn.cursor()
    if product == 'All':
        if bu not in [None , 'All']:
            query = "select action_id, kpi_name, title, BU, product, priority, start_date, end_date, status from Action_Items where status != 'Closed' and bu = '{}';".format(
                bu)
        else:
            query = "select action_id, kpi_name, title, BU, product, priority, start_date, end_date, status from Action_Items where status != 'Closed';"
    else:
        query = "select action_id, kpi_name, title, BU, product, priority, start_date, end_date, status from Action_Items where product='{}' and status != 'Closed';".format(
            product)
    mycursor.execute(query)
    if mycursor.rowcount != 0:
        result = mycursor.fetchall()
        row_headers = [x[0] for x in mycursor.description]
        json_data = []
        for i in result:
            json_data.append(dict(zip(row_headers , i)))
    else:
        result = mycursor.fetchall()
        json_data = []
    mycursor.close()
    conn.close()
    return json.dumps(json_data , default=str)


def getBUAndProducts():
    conn = conn_pool.get_connection()
    mycursor = conn.cursor()
    mycursor.execute("select BU,Product from BU_table;")
    result = mycursor.fetchall()
    row_headers = [x[0] for x in mycursor.description]
    json_data = []
    for i in result:
        json_data.append(dict(zip(row_headers , i)))
    mycursor.close()
    conn.close()
    bu_dict = {}
    for i in json_data:
        if i["BU"] not in bu_dict:
            bu_dict[i["BU"]] = [i["Product"]]
        else:
            bu_dict[i["BU"]].append(i["Product"])
    return json.dumps(bu_dict , default=str)


def getOkrMttd1(bu , product , quarter):
    conn = conn_pool.get_connection()
    mycursor = conn.cursor()
    year = datetime.now().year
    if quarter in quarterMonths:
        monthsUnderCQuarter = quarterMonths[quarter]
    elif quarter == 'YTD':
        todaysmonth = int(datetime.now().strftime('%m'))
        monthsUnderCQuarter = [calendar.month_name[i] for i in range(1 , todaysmonth + 1)]
    if bu not in [None , 'All'] and product == 'All':
        query = "select MONTHNAME(start_date),avg(ttd_in_min)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}')  and priority in ('P0','P1') group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter) , bu)
    elif bu in [None , 'All'] and product == 'All':
        query = "select MONTHNAME(start_date),avg(ttd_in_min)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and priority in ('P0','P1') group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter))
    elif product != 'All':
        query = "select MONTHNAME(start_date),avg(ttd_in_min)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product='{}' and priority in ('P0','P1') group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter) , product)
        # query = "select actual_month as month,sum(current_values_sum) as value from KPI_calculated_daily where KPI='Average TTD' and dwm='month' and product='{}' group by actual_month order by date desc limit 3;".format(product)
        # total_incidents="select actual_month,sum(current_values_sum) from KPI_calculated_daily where KPI in ('P0 count','P1 count') and dwm='month' and product='{}' group by actual_month order by date desc limit 3;".format(product)
    # (query)
    mycursor.execute(query)
    result = mycursor.fetchall()
    dctonary = {}
    for i in monthsUnderCQuarter:
        dctonary[i] = 0
    # print(dctonary)
    for i in result:
        dctonary[i[0]] = str(round(i[1] , 2))
    dctonary = sorted(dctonary.items() , key=lambda x: monthsUnderCQuarter.index(x[0]))
    lst = [{'month': i[0] , 'value': i[1]} for i in dctonary]
    mycursor.close()
    conn.close()
    # print(output_lst[::-1])
    return json.dumps(lst , default=str)


def getOkrCustomerOutagesv1(bu , product , quarter):
    conn = conn_pool.get_connection()
    mycursor = conn.cursor()
    output_lst = []
    year = datetime.now().year
    if quarter in quarterMonths:
        monthsUnderCQuarter = quarterMonths[quarter]
    elif quarter == 'YTD':
        todaysmonth = int(datetime.now().strftime('%m'))
        monthsUnderCQuarter = [calendar.month_name[i] for i in range(1 , todaysmonth + 1)]
    if bu not in [None , 'All'] and product == 'All':
        query = "select MONTHNAME(start_date),count(*) from Incidents where YEAR(start_date)='{}' and priority='P0' and alert_source='Customer' and product in (select Product from BU_table where BU='{}') and MONTHNAME(start_date) in {}  group by MONTHNAME(start_date);".format(
            year , bu , tuple(monthsUnderCQuarter))
        total_outages = "select MONTHNAME(start_date),count(*) from Incidents where YEAR(start_date)='{}' and priority='P0' and product in (select Product from BU_table where BU='{}') and MONTHNAME(start_date) in {}   group by MONTHNAME(start_date);".format(
            year , bu , tuple(monthsUnderCQuarter))
    elif bu in [None , 'All'] and product == 'All':
        query = "select MONTHNAME(start_date),count(*) from Incidents where YEAR(start_date)='{}' and priority='P0' and alert_source='Customer' and MONTHNAME(start_date) in {} group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter))
        total_outages = "select MONTHNAME(start_date),count(*) from Incidents where YEAR(start_date)='{}' and priority='P0' and MONTHNAME(start_date) in {} group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter))
    elif product != 'All':
        query = "select MONTHNAME(start_date),count(*) from Incidents where YEAR(start_date)='{}' and priority='P0' and alert_source='Customer' and product='{}' and MONTHNAME(start_date) in {} group by MONTHNAME(start_date);".format(
            year , product , tuple(monthsUnderCQuarter))
        total_outages = "select MONTHNAME(start_date),count(*) from Incidents where YEAR(start_date)='{}' and priority='P0' and product='{}' and MONTHNAME(start_date) in {}  group by MONTHNAME(start_date);".format(
            year , product , tuple(monthsUnderCQuarter))
    # print(query,total_outages)
    mycursor.execute(query)
    result = mycursor.fetchall()
    customer_outages = result
    mycursor.execute(total_outages)
    p0_outages = mycursor.fetchall()
    months = monthsUnderCQuarter
    # months = months[:months.index(curr_month)+1]

    # print(months, p0_outages, customer_outages)

    for i in range(len(months)):
        if months[i] not in [j[0] for j in customer_outages]:
            customer_outages.insert(i , [months[i] , 0])
        if months[i] not in [j[0] for j in p0_outages]:
            p0_outages.insert(i , [months[i] , 0])

    for i in range(len(customer_outages)):
        month_percent = {'month': customer_outages[i][0] , 'customer_reported': int(customer_outages[i][1]) ,
                         'others': p0_outages[i][1] - customer_outages[i][1]}
        output_lst.append(month_percent)
    mycursor.close()
    conn.close()
    return json.dumps(output_lst , default=str)


def getOkrOutages(bu , product , quarter):
    conn = conn_pool.get_connection()
    mycursor = conn.cursor()
    if quarter in quarterMonths:
        monthsUnderCQuarter = quarterMonths[quarter]
    elif quarter == 'YTD':
        todaysmonth = int(datetime.now().strftime('%m'))
        monthsUnderCQuarter = [calendar.month_name[i] for i in range(1 , todaysmonth + 1)]
    # prev_yr_outages_count = 84
    if bu not in [None , 'All'] and product == 'All':
        query1 = "select count(*) from Incidents where priority='P0' and YEAR(start_date)=YEAR(CURDATE())-1  and product in (select Product from BU_table where BU='{}');".format(
            bu)
        query2 = "select count(*) from Incidents where priority='P0' and YEAR(start_date)=YEAR(CURDATE())  and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}');".format(
            tuple(monthsUnderCQuarter) , bu)
    elif bu in [None , 'All'] and product == 'All':
        query1 = "select count(*) from Incidents where priority='P0' and YEAR(start_date)=YEAR(CURDATE())-1 ;"
        query2 = "select count(*) from Incidents where priority='P0' and YEAR(start_date)=YEAR(CURDATE()) and MONTHNAME(start_date) in {};".format(
            tuple(monthsUnderCQuarter))
    elif product != 'All':
        query1 = "select count(*) from Incidents where priority='P0' and YEAR(start_date)=YEAR(CURDATE())-1 and product='{}' ;".format(
            product)
        query2 = "select count(*) from Incidents where priority='P0' and YEAR(start_date)=YEAR(CURDATE())  and product='{}' and MONTHNAME(start_date) in {};".format(
            product , tuple(monthsUnderCQuarter))
    mycursor.execute(query1)
    # print(query1,query2)
    prev_yr_outages_count = mycursor.fetchall()[0][0]
    mycursor.execute(query2)
    # mycursor.execute("select count(*) from Incidents where priority='P0' and YEAR(start_date)=YEAR(start_date) and MONTHNAME(start_date) in {};".format(tuple(months)))
    current_yr_outages_count = mycursor.fetchall()[0][0]
    mycursor.close()
    conn.close()
    return json.dumps({'sla_outages': prev_yr_outages_count , 'current_value': current_yr_outages_count} , default=str)


def getOkrOutagesDrop(bu , product , quarter):
    Cyear = datetime.now().year
    if quarter in quarterMonths:
        conn = conn_pool.get_connection()
        mycursor = conn.cursor()
        if quarter == 'Q1':
            prevQuar = 'Q4';
            Pyear = datetime.now().year - 1
        else:
            prevQuar = quarter[0] + str(int(quarter[1]) - 1);
            Pyear = datetime.now().year
        monthsUnderPQuarter = quarterMonths[prevQuar]
        monthsUnderCQuarter = quarterMonths[quarter]
        # print(monthsUnderCQuarter, monthsUnderPQuarter)
        if bu not in [None , 'All'] and product == 'All':
            queryPQ = "select count(*)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}')  and priority='P0';".format(
                Pyear , tuple(monthsUnderPQuarter) , bu)
            queryCQ = "select count(*)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}')  and priority='P0';".format(
                Cyear , tuple(monthsUnderCQuarter) , bu)
        elif bu in [None , 'All'] and product == 'All':
            queryPQ = "select count(*) from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and priority='P0';".format(
                Pyear , tuple(monthsUnderPQuarter))
            queryCQ = "select count(*) from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and priority='P0';".format(
                Cyear , tuple(monthsUnderCQuarter))
        elif product != 'All':
            queryPQ = "select count(*) from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product='{}' and priority='P0';".format(
                Pyear , tuple(monthsUnderPQuarter) , product)
            queryCQ = "select count(*) from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product='{}' and priority='P0';".format(
                Cyear , tuple(monthsUnderCQuarter) , product)
        mycursor.execute(queryPQ)
        prevQuarter = mycursor.fetchall()[0][0]
        mycursor.execute(queryCQ);
        print()
        currQuarter = mycursor.fetchall()[0][0]
        # print(prevQuarter, currQuarter)
        mycursor.close()
        conn.close()
        if prevQuarter != 0:
            outagesDrop = round(((currQuarter - prevQuarter) / (prevQuarter)) * 100 , 2)
        else:
            if currQuarter == 0:
                outagesDrop = 0
            else:
                outagesDrop = 'NA'
        return json.dumps({'outagesDrop': outagesDrop , 'prev_value': prevQuarter , 'curr_value': currQuarter})
    else:
        return None


def getOkrPdDrop(bu , product , quarter):
    Cyear = datetime.now().year
    if quarter in quarterMonths:
        conn = conn_pool.get_connection()
        mycursor = conn.cursor()
        if quarter == 'Q1':
            prevQuar = 'Q4';
            Pyear = datetime.now().year - 1
        else:
            prevQuar = quarter[0] + str(int(quarter[1]) - 1);
            Pyear = datetime.now().year
        monthsUnderPQuarter = quarterMonths[prevQuar]
        monthsUnderCQuarter = quarterMonths[quarter]
        # print(monthsUnderCQuarter, monthsUnderPQuarter)
        if bu not in [None , 'All'] and product == 'All':
            queryPQ = "select count(*)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}')  and priority='P1';".format(
                Pyear , tuple(monthsUnderPQuarter) , bu)
            queryCQ = "select count(*)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}')  and priority='P1';".format(
                Cyear , tuple(monthsUnderCQuarter) , bu)
        elif bu in [None , 'All'] and product == 'All':
            queryPQ = "select count(*) from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and priority='P1';".format(
                Pyear , tuple(monthsUnderPQuarter))
            queryCQ = "select count(*) from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and priority='P1';".format(
                Cyear , tuple(monthsUnderCQuarter))
        elif product != 'All':
            queryPQ = "select count(*) from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product='{}' and priority='P1';".format(
                Pyear , tuple(monthsUnderPQuarter) , product)
            queryCQ = "select count(*) from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product='{}' and priority='P1';".format(
                Cyear , tuple(monthsUnderCQuarter) , product)
        mycursor.execute(queryPQ)
        prevQuarter = mycursor.fetchall()[0][0]
        mycursor.execute(queryCQ);  # print()
        currQuarter = mycursor.fetchall()[0][0]
        # print(prevQuarter, currQuarter)
        mycursor.close()
        conn.close()
        if prevQuarter != 0:
            pdDrop = round(((currQuarter - prevQuarter) / (prevQuarter)) * 100 , 2)
        else:
            if currQuarter == 0:
                pdDrop = 0
            else:
                pdDrop = 'NA'
        return json.dumps({'pdDrop': pdDrop , 'prev_value': prevQuarter , 'curr_value': currQuarter})
    else:
        return None


def getOkrMttd(bu , product , quarter):
    def okrMttd(bu , product , months , year):
        conn = conn_pool.get_connection()
        mycursor = conn.cursor()
        if bu not in [None , 'All'] and product == 'All':
            sumttd = "select sum(ttd_in_min) from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}')  and priority in ('P0','P1') ".format(
                year , tuple(months) , bu)
            count = "select count(*) from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}')  and priority in ('P0','P1') ".format(
                year , tuple(months) , bu)
        elif bu in [None , 'All'] and product == 'All':
            # query = "select MONTHNAME(start_date),avg(ttd_in_min)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and priority in ('P0','P1') group by MONTHNAME(start_date);".format(year,tuple(months))
            sumttd = "select sum(ttd_in_min) from Incidents  where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and priority in ('P0','P1') ;".format(
                year , tuple(months))
            count = "select count(*) from Incidents  where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and priority in ('P0','P1') ;".format(
                year , tuple(months))
        elif product != 'All':
            # query = "select MONTHNAME(start_date),avg(ttd_in_min)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product='{}' and priority in ('P0','P1') group by MONTHNAME(start_date);".format(year,tuple(months),product)
            sumttd = "select sum(ttd_in_min) from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product='{}' and priority in ('P0','P1');".format(
                year , tuple(months) , product)
            count = "select count(*) from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product='{}' and priority in ('P0','P1');".format(
                year , tuple(months) , product)
        mycursor.execute(sumttd)
        sumTTDs = mycursor.fetchone()[0]
        mycursor.execute(count)
        countt = mycursor.fetchone()[0]
        # print(sumTTDs,countt)
        mycursor.close()
        conn.close()
        if countt == 0:
            avgmttd = 0
        else:
            avgmttd = round(sumTTDs / countt , 2)
        return avgmttd

    Cyear = datetime.now().year
    if quarter in quarterMonths:
        if quarter == 'Q1':
            prevQuar = 'Q4';
            Pyear = datetime.now().year - 1
        else:
            prevQuar = quarter[0] + str(int(quarter[1]) - 1);
            Pyear = datetime.now().year
        monthsUnderPQuarter = quarterMonths[prevQuar]
        monthsUnderCQuarter = quarterMonths[quarter]
        # print(monthsUnderCQuarter, monthsUnderPQuarter)
        prevQuarterMttd = okrMttd(bu , product , monthsUnderPQuarter , Pyear)
        currQuarterMttd = okrMttd(bu , product , monthsUnderCQuarter , Cyear)
        # print(prevQuarterMttd, currQuarterMttd)

        if prevQuarterMttd != 0:
            mttdPercent = round(((currQuarterMttd - prevQuarterMttd) / prevQuarterMttd) * 100 , 2)
        else:
            if currQuarterMttd == 0:
                mttdPercent = 0
            else:
                mttdPercent = 'NA'
        return json.dumps({'percent': mttdPercent , 'prev_value': prevQuarterMttd , 'curr_value': currQuarterMttd} ,
                          default=str)
    else:
        return None


def getOkrP1Mttr(bu , product , quarter):
    def okrMttrP1(bu , product , months , year):
        conn = conn_pool.get_connection()
        mycursor = conn.cursor()
        if bu not in [None , 'All'] and product == 'All':
            sumttr = "select sum(ttr_in_min) from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}')  and priority='P1'; ".format(
                year , tuple(months) , bu)
            count = "select count(*) from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}')  and priority='P1'; ".format(
                year , tuple(months) , bu)
        elif bu in [None , 'All'] and product == 'All':
            sumttr = "select sum(ttr_in_min) from Incidents  where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and priority='P1' ;".format(
                year , tuple(months))
            count = "select count(*) from Incidents  where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and priority='P1' ;".format(
                year , tuple(months))
        elif product != 'All':
            sumttr = "select sum(ttr_in_min) from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product='{}' and priority='P1';".format(
                year , tuple(months) , product)
            count = "select count(*) from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product='{}' and priority='P1';".format(
                year , tuple(months) , product)
        mycursor.execute(sumttr)
        sumTTRs = mycursor.fetchone()[0]
        mycursor.execute(count)
        countt = mycursor.fetchone()[0]
        # (sumTTRs,countt)
        mycursor.close()
        conn.close()
        if countt == 0:
            avgTTR = 0
        else:
            avgTTR = round(sumTTRs / countt , 2)
        return avgTTR

    Cyear = datetime.now().year
    if quarter in quarterMonths:
        if quarter == 'Q1':
            prevQuar = 'Q4';
            Pyear = datetime.now().year - 1
        else:
            prevQuar = quarter[0] + str(int(quarter[1]) - 1);
            Pyear = datetime.now().year
        monthsUnderPQuarter = quarterMonths[prevQuar]
        monthsUnderCQuarter = quarterMonths[quarter]
        # (monthsUnderCQuarter, monthsUnderPQuarter)
        prevQuarterMttr = okrMttrP1(bu , product , monthsUnderPQuarter , Pyear)
        currQuarterMttr = okrMttrP1(bu , product , monthsUnderCQuarter , Cyear)
        # print(output_lst[::-1])
        if prevQuarterMttr != 0:
            mttrPercent = round(((currQuarterMttr - prevQuarterMttr) / prevQuarterMttr) * 100 , 2)
        else:
            if currQuarterMttr == 0:
                mttrPercent = 0
            else:
                mttrPercent = 'NA'
        # print(output_lst[::-1])
        return json.dumps({'percent': mttrPercent , 'prev_value': prevQuarterMttr , 'curr_value': currQuarterMttr} ,
                          default=str)
    else:
        return None


def getOkrP0Mttr(bu , product , quarter):
    def okrMttrP0(bu , product , months , year):
        conn = conn_pool.get_connection()
        mycursor = conn.cursor()
        if bu not in [None , 'All'] and product == 'All':
            sumttr = "select sum(ttr_in_min) from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}')  and priority='P0'; ".format(
                year , tuple(months) , bu)
            count = "select count(*) from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}')  and priority='P0'; ".format(
                year , tuple(months) , bu)
        elif bu in [None , 'All'] and product == 'All':
            sumttr = "select sum(ttr_in_min) from Incidents  where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and priority='P0' ;".format(
                year , tuple(months))
            count = "select count(*) from Incidents  where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and priority='P0' ;".format(
                year , tuple(months))
        elif product != 'All':
            sumttr = "select sum(ttr_in_min) from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product='{}' and priority='P0';".format(
                year , tuple(months) , product)
            count = "select count(*) from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product='{}' and priority='P0';".format(
                year , tuple(months) , product)
        mycursor.execute(sumttr)
        sumTTRs = mycursor.fetchone()[0]
        mycursor.execute(count)
        countt = mycursor.fetchone()[0]
        mycursor.close()
        conn.close()
        # print(sumTTRs,countt)
        if countt == 0:
            avgTTR = 0
        else:
            avgTTR = round(sumTTRs / countt , 2)
        return avgTTR

    Cyear = datetime.now().year
    if quarter in quarterMonths:
        if quarter == 'Q1':
            prevQuar = 'Q4';
            Pyear = datetime.now().year - 1
        else:
            prevQuar = quarter[0] + str(int(quarter[1]) - 1);
            Pyear = datetime.now().year
        monthsUnderPQuarter = quarterMonths[prevQuar]
        monthsUnderCQuarter = quarterMonths[quarter]
        # print(monthsUnderCQuarter, monthsUnderPQuarter)
        prevQuarterMttr = okrMttrP0(bu , product , monthsUnderPQuarter , Pyear)
        currQuarterMttr = okrMttrP0(bu , product , monthsUnderCQuarter , Cyear)
        # print(output_lst[::-1])
        if prevQuarterMttr != 0:
            mttrPercent = round(((currQuarterMttr - prevQuarterMttr) / prevQuarterMttr) * 100 , 2)
        else:
            if currQuarterMttr == 0:
                mttrPercent = 0
            else:
                mttrPercent = 'NA'
        # print(output_lst[::-1])
        return json.dumps({'percent': mttrPercent , 'prev_value': prevQuarterMttr , 'curr_value': currQuarterMttr} ,
                          default=str)
    else:
        return None


def getOutagesCount(quarter):
    bu = executeCursor("select distinct BU from BU_table;")
    # print(bu)
    year = datetime.now().year
    if quarter in quarterMonths:
        months = quarterMonths[quarter]
    elif quarter == 'YTD':
        todaysmonth = int(datetime.now().strftime('%m'))
        months = [calendar.month_name[i] for i in range(1 , todaysmonth + 1)]
    result = []
    for i in bu:
        if i[0]!='Others':
            totalOutages = executeCursor(
            "select count(*) from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and priority in ('P0','P1') and product in (select Product from BU_table where BU='{}');".format(
                year , tuple(months) , i[0]))[0]
            customerOutages = executeCursor(
            "select count(*) from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and priority in ('P0','P1') and alert_source='Customer' and product in (select Product from BU_table where BU='{}');".format(
                year , tuple(months) , i[0]))[0]
            result.append({'bu': i[0] , 'reportedIncidents': totalOutages , 'customerReportedIncidents': customerOutages})
    return json.dumps(result)


def getOkrMttdMttrOutages(bu , product , quarter):
    def getDict(months , inc):
        dct = {}
        for i in months:
            dct[i] = 0
        for i in inc:
            if i[1] is None:
                dct[i[0]] = 0
            else:
                dct[i[0]] = i[1]
        return dct

    conn = conn_pool.get_connection()
    mycursor = conn.cursor()
    year = datetime.now().year
    if quarter in quarterMonths:
        monthsUnderCQuarter = quarterMonths[quarter]
    elif quarter == 'YTD':
        todaysmonth = int(datetime.now().strftime('%m'))
        monthsUnderCQuarter = [calendar.month_name[i] for i in range(1 , todaysmonth + 1)]
    if bu not in [None , 'All'] and product == 'All':
        query = "select MONTHNAME(start_date),sum(ttd_in_min)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}')  and priority in ('P0','P1') group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter) , bu)
        p0p1Count = "select MONTHNAME(start_date),count(priority)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}')  and priority in ('P0','P1') group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter) , bu)
        queryP0Ttr = "select MONTHNAME(start_date),sum(ttr_in_min)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}')  and priority='P0' group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter) , bu)
        queryP1Ttr = "select MONTHNAME(start_date),sum(ttr_in_min)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}')  and priority='P1' group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter) , bu)
        queryP0Count = "select MONTHNAME(start_date),count(priority)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}')  and priority='P0' group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter) , bu)
        queryP1Count = "select MONTHNAME(start_date),count(priority)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}')  and priority='P1' group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter) , bu)
    elif bu in [None , 'All'] and product == 'All':
        query = "select MONTHNAME(start_date),sum(ttd_in_min)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and priority in ('P0','P1') group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter))
        p0p1Count = "select MONTHNAME(start_date),count(priority)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and priority in ('P0','P1') group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter))
        queryP0Ttr = "select MONTHNAME(start_date),sum(ttr_in_min)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and priority='P0' group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter))
        queryP1Ttr = "select MONTHNAME(start_date),sum(ttr_in_min)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and priority='P1' group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter))
        queryP1Count = "select MONTHNAME(start_date),count(priority)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and priority='P1' group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter))
        queryP0Count = "select MONTHNAME(start_date),count(priority)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and priority='P0' group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter))
    elif product != 'All':
        query = "select MONTHNAME(start_date),sum(ttd_in_min)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product='{}' and priority in ('P0','P1') group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter) , product)
        p0p1Count = "select MONTHNAME(start_date),count(priority)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product='{}'  and priority in ('P0','P1') group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter) , product)
        queryP1Count = "select MONTHNAME(start_date),count(priority)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product='{}'  and priority='P1' group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter) , product)
        queryP0Ttr = "select MONTHNAME(start_date),sum(ttr_in_min)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product='{}'  and priority='P0' group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter) , product)
        queryP1Ttr = "select MONTHNAME(start_date),sum(ttr_in_min)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product='{}'  and priority='P1' group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter) , product)
        queryP0Count = "select MONTHNAME(start_date),count(priority)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product='{}'  and priority='P0' group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter) , product)
    # print(query)
    # print(queryP0Ttr)
    mycursor.execute(query)
    result = mycursor.fetchall()
    mycursor.execute(queryP0Ttr)
    result1 = mycursor.fetchall()
    mycursor.execute(queryP1Ttr)
    result2 = mycursor.fetchall()
    mycursor.execute(queryP0Count)
    result3 = mycursor.fetchall()
    mycursor.execute(queryP1Count)
    result4 = mycursor.fetchall()
    mycursor.execute(p0p1Count)
    result5 = mycursor.fetchall()  # query/p0p1Count, p0ttr/p0count, p1ttr/p0count, p0 count
    # print(result);print()
    # print(result1);print()
    # print(result2);print()
    # print(result3);print()
    mttd = getDict(monthsUnderCQuarter , result);
    p0mttr = getDict(monthsUnderCQuarter , result1);
    p1mttr = getDict(monthsUnderCQuarter , result2);
    p0count = getDict(monthsUnderCQuarter , result3)
    p0p1count = getDict(monthsUnderCQuarter , result5);
    p1count = getDict(monthsUnderCQuarter , result4)
    lst = []

    for i in monthsUnderCQuarter:
        mttd_to_send = 0
        p0mttr_to_send = 0
        p1mttr_to_send = 0
        if p0p1count[i] != 0:
            mttd_to_send = round(mttd[i] / p0p1count[i] , 2)
        if p0count[i] != 0:
            p0mttr_to_send = round(p0mttr[i] / p0count[i] , 2)
        if p1count[i] != 0:
            p1mttr_to_send = round(p1mttr[i] / p1count[i] , 2)
        # P0Count, P1Count, P0MTTR, P1MTTR and MTTD
        lst.append({'month': i , 'MTTD': mttd_to_send , 'P0MTTR': p0mttr_to_send , 'P1MTTR': p1mttr_to_send ,
                    'P0Count': p0count[i] , 'P1Count': p1count[i]})
    # print(lst)
    mycursor.close()
    conn.close()
    # print(output_lst[::-1])
    return json.dumps(lst , default=str)

def getOkrMttdMttrOutages90Percentile(bu, product, quarter):
    def getDict(months,inc):
        dct={}
        for i in months:
            dct[i]=0
        for i in inc:
            if i[1] is None:
                dct[i[0]]=0
            else:
                if int(i[1]) > 0 and round(0.9*int(i[1])) < 1:
                    dct[i[0]] = 1
                else:
                    dct[i[0]]=round(0.9*int(i[1]))
        return dct
    
    def getDict2(months,inc):
        dct={}
        for i in months:
            dct[i]=0
        for i in inc:
            if i[1] is None:
                dct[i[0]]=0
            else:
                dct[i[0]]=int(i[1])
        return dct
    
    
    conn = conn_pool.get_connection()
    mycursor = conn.cursor()
    year = datetime.now().year
    if quarter in quarterMonths:
        monthsUnderCQuarter = quarterMonths[quarter]
    elif quarter=='YTD':
        todaysmonth = int(datetime.now().strftime('%m'))
        monthsUnderCQuarter = [calendar.month_name[i] for i in range(1,todaysmonth+1)]
    if bu not in [None, 'All'] and product == 'All':
        queryP0Count = "select MONTHNAME(start_date),count(priority)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}')  and priority='P0' group by MONTHNAME(start_date);".format(year,tuple(monthsUnderCQuarter),bu)
        mycursor.execute(queryP0Count)
        result3 = mycursor.fetchall()
        p0count=getDict(monthsUnderCQuarter,result3)

        
        queryP1Count = "select MONTHNAME(start_date),count(priority)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}')  and priority='P1' group by MONTHNAME(start_date);".format(year,tuple(monthsUnderCQuarter),bu)
        mycursor.execute(queryP1Count)
        result4 = mycursor.fetchall()
        p1count=getDict(monthsUnderCQuarter,result4)
        
        result5 = {}  
        for i in monthsUnderCQuarter:
            result5[i]=0
        for i in result4+result3:
            if i[1] is None:
                result5[i[0]]=0
            else:
                result5[i[0]]+=int(i[1])
                
        print(result5)
        
        p0p1count = {}
        for j in result5:
            p0p1count[j] = round(0.9*result5[j])
        
        query = "select start_date,ttd_in_min  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}')  and priority in ('P0','P1') order by 2,1 asc;".format(year,tuple(monthsUnderCQuarter),bu)
        mycursor.execute(query)
        result = mycursor.fetchall()
        print(result)
        op = {}
        for j in monthsUnderCQuarter:
            op[j] = []
        for j in result:
            print(calendar.month_name[j[0].month])
            if len(op[calendar.month_name[j[0].month]]) <= p0p1count[calendar.month_name[j[0].month]] :
                if j[1] is not None:
                    op[calendar.month_name[j[0].month]].append(int(j[1]))
                else:
                    op[calendar.month_name[j[0].month]].append(0)
                    
        print(op)
        
        
        queryP0Ttr = "select start_date,ttr_in_min  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}')  and priority in ('P0') order by 2,1 asc;".format(year,tuple(monthsUnderCQuarter),bu)
        mycursor.execute(queryP0Ttr)
        result1 = mycursor.fetchall()
        ttrop = {}
        for j in monthsUnderCQuarter:
            ttrop[j] = []
        for j in result1:
            if len(ttrop[calendar.month_name[j[0].month]]) <= p0count[calendar.month_name[j[0].month]]:
                if j[1] is not None:
                    ttrop[calendar.month_name[j[0].month]].append(int(j[1]))
                else:
                    ttrop[calendar.month_name[j[0].month]].append(0)
        print(ttrop)
        
        queryP1Ttr = "select start_date,ttr_in_min  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}')  and priority in ('P1') order by 2,1 asc;".format(year,tuple(monthsUnderCQuarter),bu)
        mycursor.execute(queryP1Ttr)
        result2 = mycursor.fetchall()
        ttrp1op = {}
        for j in monthsUnderCQuarter:
            ttrp1op[j] = []
        for j in result2:
            if len(ttrp1op[calendar.month_name[j[0].month]]) <= p1count[calendar.month_name[j[0].month]]:
                if j[1] is not None:
                    ttrp1op[calendar.month_name[j[0].month]].append(int(j[1]))
                else:
                    ttrp1op[calendar.month_name[j[0].month]].append(0)
        print(ttrp1op)
        
    elif bu in [None, 'All'] and product == 'All':
        queryP0Count = "select MONTHNAME(start_date),count(priority)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and priority='P0' group by MONTHNAME(start_date);".format(year,tuple(monthsUnderCQuarter))
        mycursor.execute(queryP0Count)
        result3 = mycursor.fetchall()
        p0count=getDict(monthsUnderCQuarter,result3)
        #11
        
        queryP1Count = "select MONTHNAME(start_date),count(priority)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {}  and priority='P1' group by MONTHNAME(start_date);".format(year,tuple(monthsUnderCQuarter))
        mycursor.execute(queryP1Count)
        result4 = mycursor.fetchall()
        p1count=getDict(monthsUnderCQuarter,result4)
        
        
        
        result5 = {}  
        for i in monthsUnderCQuarter:
            result5[i]=0
        for i in result4+result3:
            if i[1] is None:
                result5[i[0]]=0
            else:
                result5[i[0]]+=int(i[1])
                
        print(result5)
        
        p0p1count = {}
        for j in result5:
            p0p1count[j] = round(0.9*result5[j])
            
            
        query = "select start_date,ttd_in_min  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and priority in ('P0','P1') order by 2,1 asc;".format(year,tuple(monthsUnderCQuarter))
        mycursor.execute(query)
        result = mycursor.fetchall()
        print(result)
        op = {}
        for j in monthsUnderCQuarter:
            op[j] = []
        for j in result:
            print(calendar.month_name[j[0].month])
            if len(op[calendar.month_name[j[0].month]]) <= p0p1count[calendar.month_name[j[0].month]] :
                if j[1] is not None:
                    op[calendar.month_name[j[0].month]].append(int(j[1]))
                else:
                    op[calendar.month_name[j[0].month]].append(0)
        print(op)
        
        
        queryP0Ttr = "select start_date,ttr_in_min  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {}  and priority in ('P0') order by 2,1 asc;".format(year,tuple(monthsUnderCQuarter))
        mycursor.execute(queryP0Ttr)
        result1 = mycursor.fetchall()
        print("Dhiraj list")
        print(result1)
        ttrop = {}
        for j in monthsUnderCQuarter:
            ttrop[j] = []
        for j in result1:
            if len(ttrop[calendar.month_name[j[0].month]]) <= p0count[calendar.month_name[j[0].month]]:
                if j[1] is not None:
                    ttrop[calendar.month_name[j[0].month]].append(int(j[1]))
                else:
                    ttrop[calendar.month_name[j[0].month]].append(0)
        print("Key and value(list of ttrs)")           
        print(ttrop)
        
        queryP1Ttr = "select start_date,ttr_in_min  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {}  and priority in ('P1') order by 2,1 asc;".format(year,tuple(monthsUnderCQuarter))
        mycursor.execute(queryP1Ttr)
        result2 = mycursor.fetchall()
        ttrp1op = {}
        for j in monthsUnderCQuarter:
            ttrp1op[j] = []
        for j in result2:
            if len(ttrp1op[calendar.month_name[j[0].month]]) <= p1count[calendar.month_name[j[0].month]]:
                if j[1] is not None :
                    ttrp1op[calendar.month_name[j[0].month]].append(int(j[1]))
                else:
                    ttrp1op[calendar.month_name[j[0].month]].append(0)
                    
        print(ttrp1op)
        
    elif product!='All':
        queryP0Count = "select MONTHNAME(start_date),count(priority)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product='{}'  and priority='P0' group by MONTHNAME(start_date);".format(year,tuple(monthsUnderCQuarter),product)
        mycursor.execute(queryP0Count)
        result3 = mycursor.fetchall()
        p0count=getDict(monthsUnderCQuarter,result3)
        
        queryP1Count = "select MONTHNAME(start_date),count(priority)  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product='{}' and priority='P1' group by MONTHNAME(start_date);".format(year,tuple(monthsUnderCQuarter),product)
        mycursor.execute(queryP1Count)
        result4 = mycursor.fetchall()
        p1count=getDict(monthsUnderCQuarter,result4)
        
        result5 = {}  
        for i in monthsUnderCQuarter:
            result5[i]=0
        for i in result4+result3:
            if i[1] is None:
                result5[i[0]]=0
            else:
                result5[i[0]]+=int(i[1])
        
        #print("--"*20)
        
        p0p1count = {}
        for j in result5:
            p0p1count[j] = round(0.9*result5[j])
        
        query = "select start_date,ttd_in_min  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product='{}'  and priority in ('P0','P1') order by 2,1 asc;".format(year,tuple(monthsUnderCQuarter),product)
        mycursor.execute(query)
        result = mycursor.fetchall()
        op = {}
        for j in monthsUnderCQuarter:
            op[j] = []
        for j in result:
            #print(calendar.month_name[j[0].month],op)
            if len(op[calendar.month_name[j[0].month]]) <= p0p1count[calendar.month_name[j[0].month]] :
                if j[1] is not None:
                    op[calendar.month_name[j[0].month]].append(int(j[1]))
                else:
                    op[calendar.month_name[j[0].month]].append(0)
                    
        #print("--"*20)
                

        
        
        queryP0Ttr = "select start_date,ttr_in_min  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product='{}'  and priority in ('P0') order by 2,1 asc;".format(year,tuple(monthsUnderCQuarter),product)
        mycursor.execute(queryP0Ttr)
        result1 = mycursor.fetchall()
        ttrop = {}
        for j in monthsUnderCQuarter:
            ttrop[j] = []
        for j in result1:
            if len(ttrop[calendar.month_name[j[0].month]]) <= p0count[calendar.month_name[j[0].month]]:
                if j[1] is not None:
                    ttrop[calendar.month_name[j[0].month]].append(int(j[1]))
                else:
                    ttrop[calendar.month_name[j[0].month]].append(0)
                    
        #print(ttrop)
        
        queryP1Ttr = "select start_date,ttr_in_min  from Incidents where YEAR(start_date)='{}' and MONTHNAME(start_date) in {} and product='{}'  and priority in ('P1') order by 2,1 asc;".format(year,tuple(monthsUnderCQuarter),product)
        mycursor.execute(queryP1Ttr)
        result2 = mycursor.fetchall()
        ttrp1op = {}
        for j in monthsUnderCQuarter:
            ttrp1op[j] = []
        for j in result2:
            if len(ttrp1op[calendar.month_name[j[0].month]]) <= p1count[calendar.month_name[j[0].month]]:
                if j[1] is not None:
                    ttrp1op[calendar.month_name[j[0].month]].append(int(j[1]))
                else:
                    ttrp1op[calendar.month_name[j[0].month]].append(0)
                    
        #print(ttrp1op)
    
    
    #print(query)
    #print(queryP0Ttr)
    #query/p0p1Count, p0ttr/p0count, p1ttr/p0count, p0 count
    # print(result);print()
    # print(result1);print()
    # print(result2);print()
    # print(result3);print()
    lst = []
    #print(op,p0p1count)
    
    for i in monthsUnderCQuarter:
        mttd_to_send = 0
        p0mttr_to_send = 0
        p1mttr_to_send = 0
        if p0p1count[i] != 0:
            mttd_to_send = round(sum(op[i][:p0p1count[i]])/p0p1count[i])
        if p0count[i] != 0:
            p0mttr_to_send=round(sum(ttrop[i][:p0count[i]])/p0count[i])
            print(i,p0count[i], ttrop[i],p0mttr_to_send)
        if p1count[i] !=0:
            p1mttr_to_send=round(sum(ttrp1op[i][:p1count[i]])/p1count[i])
        #P0Count, P1Count, P0MTTR, P1MTTR and MTTD
        lst.append({'month':i, 'MTTD':mttd_to_send, 'P0MTTR':p0mttr_to_send, 'P1MTTR':p1mttr_to_send, 'P0Count': p0count[i], 'P1Count': p1count[i]})
    #print(lst)
    mycursor.close()
    conn.close()
    #print(output_lst[::-1])
    return json.dumps(lst,default = str)
    

def getOkrCustomerOutagesv2(bu , product , quarter):
    conn = conn_pool.get_connection()
    mycursor = conn.cursor()
    output_lst = []
    year = datetime.now().year
    if quarter in quarterMonths:
        monthsUnderCQuarter = quarterMonths[quarter]
    elif quarter == 'YTD':
        todaysmonth = int(datetime.now().strftime('%m'))
        if todaysmonth % 3 != 0:
            todaysmonth = 3 * ((todaysmonth // 3) + 1)
        monthsUnderCQuarter = [calendar.month_name[i] for i in range(1 , todaysmonth + 1)]
    if bu not in [None , 'All'] and product == 'All':
        query = "select MONTHNAME(start_date),count(*) from Incidents where YEAR(start_date)='{}' and priority='P0' and alert_source='Customer' and product in (select Product from BU_table where BU='{}') and MONTHNAME(start_date) in {}  group by MONTHNAME(start_date);".format(
            year , bu , tuple(monthsUnderCQuarter))
        total_outages = "select MONTHNAME(start_date),count(*) from Incidents where YEAR(start_date)='{}' and priority='P0' and alert_source!='Customer' and product in (select Product from BU_table where BU='{}') and MONTHNAME(start_date) in {}   group by MONTHNAME(start_date);".format(
            year , bu , tuple(monthsUnderCQuarter))
        queryP1 = "select MONTHNAME(start_date),count(*) from Incidents where YEAR(start_date)='{}' and priority='P1' and alert_source='Customer' and product in (select Product from BU_table where BU='{}') and MONTHNAME(start_date) in {}  group by MONTHNAME(start_date);".format(
            year , bu , tuple(monthsUnderCQuarter))
        total_p1 = "select MONTHNAME(start_date),count(*) from Incidents where YEAR(start_date)='{}' and priority='P1' and alert_source!='Customer' and product in (select Product from BU_table where BU='{}') and MONTHNAME(start_date) in {}   group by MONTHNAME(start_date);".format(
            year , bu , tuple(monthsUnderCQuarter))
    elif bu in [None , 'All'] and product == 'All':
        query = "select MONTHNAME(start_date),count(*) from Incidents where YEAR(start_date)='{}' and priority='P0' and alert_source='Customer' and MONTHNAME(start_date) in {} group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter))
        total_outages = "select MONTHNAME(start_date),count(*) from Incidents where YEAR(start_date)='{}' and priority='P0' and alert_source!='Customer' and MONTHNAME(start_date) in {} group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter))
        queryP1 = "select MONTHNAME(start_date),count(*) from Incidents where YEAR(start_date)='{}' and priority='P1' and alert_source='Customer' and MONTHNAME(start_date) in {} group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter))
        total_p1 = "select MONTHNAME(start_date),count(*) from Incidents where YEAR(start_date)='{}' and priority='P1' and alert_source!='Customer' and MONTHNAME(start_date) in {} group by MONTHNAME(start_date);".format(
            year , tuple(monthsUnderCQuarter))
    elif product != 'All':
        query = "select MONTHNAME(start_date),count(*) from Incidents where YEAR(start_date)='{}' and priority='P0' and alert_source='Customer' and product='{}' and MONTHNAME(start_date) in {} group by MONTHNAME(start_date);".format(
            year , product , tuple(monthsUnderCQuarter))
        total_outages = "select MONTHNAME(start_date),count(*) from Incidents where YEAR(start_date)='{}' and priority='P0' and alert_source!='Customer' and product='{}' and MONTHNAME(start_date) in {}  group by MONTHNAME(start_date);".format(
            year , product , tuple(monthsUnderCQuarter))
        queryP1 = "select MONTHNAME(start_date),count(*) from Incidents where YEAR(start_date)='{}' and priority='P1' and alert_source='Customer' and product='{}' and MONTHNAME(start_date) in {} group by MONTHNAME(start_date);".format(
            year , product , tuple(monthsUnderCQuarter))
        total_p1 = "select MONTHNAME(start_date),count(*) from Incidents where YEAR(start_date)='{}' and priority='P1' and alert_source!='Customer' and product='{}' and MONTHNAME(start_date) in {}  group by MONTHNAME(start_date);".format(
            year , product , tuple(monthsUnderCQuarter))
    # print(query,total_outages)
    mycursor.execute(query)
    result = mycursor.fetchall()
    customer_outages = result
    mycursor.execute(total_outages)
    p0_outages = mycursor.fetchall()
    mycursor.execute(queryP1)
    p1_incidents = mycursor.fetchall()
    mycursor.execute(total_p1)
    totalp1 = mycursor.fetchall()
    months = monthsUnderCQuarter
    # months = months[:months.index(curr_month)+1]
    # print(months)
    # print(months, p0_outages, customer_outages)

    for i in range(len(months)):
        if months[i] not in [j[0] for j in customer_outages]:
            customer_outages.insert(i , [months[i] , 0])
        if months[i] not in [j[0] for j in p0_outages]:
            p0_outages.insert(i , [months[i] , 0])
        if months[i] not in [j[0] for j in p1_incidents]:
            p1_incidents.insert(i , [months[i] , 0])
        if months[i] not in [j[0] for j in totalp1]:
            totalp1.insert(i , [months[i] , 0])

    # for i in range(len(customer_outages)):
    #     month_percent = {'month':customer_outages[i][0],'P0 Customer Reported':int(customer_outages[i][1]),'P0 Internally Detected':p0_outages[i][1],'P1 Customer Reported':p1_incidents[i][1],'P1 Internally Detected':totalp1[i][1]}
    #     output_lst.append(month_percent)
    if quarter == 'YTD':
        quarter = {0: 'Q1' , 1: 'Q2' , 2: 'Q3' , 3: 'Q4'}
        j = 0
        for i in range(0 , len(customer_outages) , 3):
            month_percent = {'quarter': quarter[j] , 'P0 Customer Reported': int(customer_outages[i][1]) + int(
                customer_outages[i + 1][1]) + int(customer_outages[i + 2][1]) ,
                             'P0 Internally Detected': p0_outages[i][1] + p0_outages[i + 1][1] + p0_outages[i + 2][1] ,
                             'P1 Customer Reported': p1_incidents[i][1] + p1_incidents[i + 1][1] + p1_incidents[i + 2][
                                 1] , 'P1 Internally Detected': totalp1[i][1] + totalp1[i + 1][1] + totalp1[i + 2][1]}
            j += 1
            output_lst.append(month_percent)
    else:
        for i in range(len(customer_outages)):
            month_percent = {'month': customer_outages[i][0] , 'P0 Customer Reported': int(customer_outages[i][1]) ,
                             'P0 Internally Detected': p0_outages[i][1] , 'P1 Customer Reported': p1_incidents[i][1] ,
                             'P1 Internally Detected': totalp1[i][1]}
            output_lst.append(month_percent)

    mycursor.close()
    conn.close()
    return json.dumps(output_lst , default=str)


def getOkrOutagesv1(bu , product , quarter):
    if quarter in quarterMonths:
        monthsUnderCQuarter = quarterMonths[quarter]
    elif quarter == 'YTD':
        todaysmonth = int(datetime.now().strftime('%m'))
        monthsUnderCQuarter = [calendar.month_name[i] for i in range(1 , todaysmonth + 1)]
    # prev_yr_outages_count = 84
    if bu not in [None , 'All'] and product == 'All':
        query1 = "select count(*) from Incidents where priority='P0' and YEAR(start_date)=YEAR(CURDATE())-1  and product in (select Product from BU_table where BU='{}');".format(
            bu)
        query2 = "select count(*) from Incidents where priority='P0' and YEAR(start_date)=YEAR(CURDATE())  and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}');".format(
            tuple(monthsUnderCQuarter) , bu)
        query3 = "select count(*) from Incidents where priority='P1' and YEAR(start_date)=YEAR(CURDATE())-1  and product in (select Product from BU_table where BU='{}');".format(
            bu)
        query4 = "select count(*) from Incidents where priority='P1' and YEAR(start_date)=YEAR(CURDATE())  and MONTHNAME(start_date) in {} and product in (select Product from BU_table where BU='{}');".format(
            tuple(monthsUnderCQuarter) , bu)
    elif bu in [None , 'All'] and product == 'All':
        query1 = "select count(*) from Incidents where priority='P0' and YEAR(start_date)=YEAR(CURDATE())-1 ;"
        query2 = "select count(*) from Incidents where priority='P0' and YEAR(start_date)=YEAR(CURDATE()) and MONTHNAME(start_date) in {};".format(
            tuple(monthsUnderCQuarter))
        query3 = "select count(*) from Incidents where priority='P1' and YEAR(start_date)=YEAR(CURDATE())-1 ;"
        query4 = "select count(*) from Incidents where priority='P1' and YEAR(start_date)=YEAR(CURDATE()) and MONTHNAME(start_date) in {};".format(
            tuple(monthsUnderCQuarter))
    elif product != 'All':
        query1 = "select count(*) from Incidents where priority='P0' and YEAR(start_date)=YEAR(CURDATE())-1 and product='{}' ;".format(
            product)
        query2 = "select count(*) from Incidents where priority='P0' and YEAR(start_date)=YEAR(CURDATE())  and product='{}' and MONTHNAME(start_date) in {};".format(
            product , tuple(monthsUnderCQuarter))
        query3 = "select count(*) from Incidents where priority='P1' and YEAR(start_date)=YEAR(CURDATE())-1 and product='{}' ;".format(
            product)
        query4 = "select count(*) from Incidents where priority='P1' and YEAR(start_date)=YEAR(CURDATE())  and product='{}' and MONTHNAME(start_date) in {};".format(
            product , tuple(monthsUnderCQuarter))
    prev_yr_outages_count = executeCursor(query1)[0][0]
    # mycursor.execute("select count(*) from Incidents where priority='P0' and YEAR(start_date)=YEAR(start_date) and MONTHNAME(start_date) in {};".format(tuple(months)))
    current_yr_outages_count = executeCursor(query2)[0][0]
    # print(query1,query2)
    prev_yr_incident_count = executeCursor(query3)[0][0]
    # print(query1,query2)
    current_yr_incident_count = executeCursor(query4)[0][0]
    return json.dumps({'sla_outages': prev_yr_outages_count + prev_yr_incident_count ,
                       'current_value': current_yr_outages_count + current_yr_incident_count ,
                       'curr_yr_outages_count': current_yr_outages_count ,
                       'curr_yr_p1_count': current_yr_incident_count , 'prev_yr_outages_count': prev_yr_outages_count ,
                       'prev_yr_p1_count': prev_yr_incident_count} , default=str)


def getBuBasedRepairItems(bu):
    conn = conn_pool.get_connection()
    mycursor = conn.cursor()
    if bu == 'All':
        query = "select distinct BU,(select count(*) from PreventiveActionItems2 where status not in ('Done','Completed','Closed','Available to all customers','Invalid','Duplicate','Duplicate item','Released To Production','Deployed') and product in (select Product from BU_table b where a.BU=b.BU) ) as pending from BU_table a group by BU order by 2 desc;"
    else:
        query = "select distinct Product,(select count(*) from PreventiveActionItems2 where status not in ('Done','Completed','Closed','Available to all customers','Invalid','Duplicate','Duplicate item','Released To Production','Deployed') and product=a.Product) as pending from BU_table a where BU='{}' group by 1 order by 2 desc;".format(
            bu)
    mycursor.execute(query)
    result = mycursor.fetchall()
    mycursor.close()
    conn.close()
    return json.dumps({i[0]: i[1] for i in result})


def getIncidents(bu , product , from_date , to_date):
    def slaCount(priority):
        dct = {'SLA MISSED': 0 , 'IN SLA': 0}
        if bu not in [None , 'All'] and product == 'All':
            result = executeCursor(
                "select sla_status,count(sla_status) from PreventiveActionItems2 where priority='{}' and status not in ('Done','Closed','Completed','Tech RCA Generated','Deployed','Deferred','Invalid') and created_date>='{}' and product in (select Product from BU_table where BU='{}') group by sla_status;".format(
                    priority , from_date , bu))
        elif product == 'All' and bu in [None , 'All']:
            result = executeCursor(
                "select sla_status,count(sla_status) from PreventiveActionItems2 where priority='{}' and status not in ('Done','Closed','Completed','Tech RCA Generated','Deployed','Deferred','Invalid') and created_date>='{}'  group by sla_status;".format(
                    priority , from_date))
        else:
            result = executeCursor(
                "select sla_status,count(sla_status) from PreventiveActionItems2 where priority='{}' and status not in ('Done','Closed','Completed','Tech RCA Generated','Deployed','Deferred','Invalid') and created_date>='{}' and product = '{}' group by sla_status;".format(
                    priority , from_date , product))
        # mycursor.execute(slaQuery)
        for i in result:
            dct[i[0]] = i[1]
        return [priority , dct]

    if bu not in [None , 'All'] and product == 'All':
        result = executeCursor(
            "SELECT incident_no,priority,product,issue_category,region,ttd_in_min as TTD,ttr_in_min as TTR,product,products_affected,customers_impacted, is_recurring_incident, alert_source FROM Incidents where priority in ('P0','P1') and start_date between '{}' and '{}' and product in (select Product from BU_table where BU='{}'); ".format(
                from_date , to_date , bu))
    elif product == 'All' and bu in [None , 'All']:
        result = executeCursor(
            "SELECT incident_no,priority,product,issue_category,region,ttd_in_min as TTD,ttr_in_min as TTR,product,products_affected,customers_impacted, is_recurring_incident, alert_source FROM Incidents where priority in ('P0','P1') and start_date between '{}' and '{}'; ".format(
                from_date , to_date))
    else:
        result = executeCursor(
            "SELECT incident_no,priority,product,issue_category,region,ttd_in_min as TTD,ttr_in_min as TTR,product,products_affected,customers_impacted,is_recurring_incident,alert_source FROM Incidents where product = '{}'  and priority in ('P0','P1') and start_date between '{}' and '{}'; ".format(
                product , from_date , to_date))
    # print("Before inc calc",incidents)
    if len(result) != 0:
        row_headers = ["incident_no" , "priority" , "product" , "issue_category" , "region" , "TTD" , "TTR" ,
                       "product" , "products_affected" , "customers_impacted" , "is_recurring_incident" ,
                       "alert_source"]
        incident_data = []
        for i in result:
            incident_data.append(dict(zip(row_headers , i)))
    else:
        incident_data = []

    preventiveactionitems = []
    if bu not in [None , 'All'] and product == 'All':
        result = executeCursor(
            "select project,incident_no,title,priority,start_date,end_date,status,sla_status from PreventiveActionItems2 where status not in ('Done','Closed','Completed','Tech RCA Generated','Deployed','Deferred','Invalid') and created_date>='{}' and product in (select Product from BU_table where BU='{}') ;".format(
                from_date , bu))
    elif product == 'All' and bu in [None , 'All']:
        result = executeCursor(
            "select project,incident_no,title,priority,start_date,end_date,status,sla_status from PreventiveActionItems2 where status not in ('Done','Closed','Completed','Tech RCA Generated','Deployed','Deferred','Invalid') and created_date>='{}' ;".format(
                from_date))
    else:
        result = executeCursor(
            "select project,incident_no,title,priority,start_date,end_date,status,sla_status from PreventiveActionItems2 where status not in ('Done','Closed','Completed','Tech RCA Generated','Deployed','Deferred','Invalid') and created_date>='{}' and product = '{}';".format(
                from_date , product))
    # print(result)
    if len(result) != 0:
        row_headers = ["project" , "incident_no" , "title" , "priority" , "start_date" , "end_date" , "status" ,
                       "sla_status"]
        for i in result:
            preventiveactionitems.append(dict(zip(row_headers , i)))

    dct = {}
    # dct[i[0]]=i[1]
    for j in ["Urgent" , "High" , "Medium" , 'Low']:
        # count = slaCount(incidentTuple,j)
        count = slaCount(j)
        dct[count[0]] = count[1]

    output = {"incidents": incident_data , "preventive_action_items": preventiveactionitems , "repair_items_chart": dct}
    # print("After inc calc",incidents)
    return json.dumps(output , default=str)


def get_last_date_from_db(date):
    conn = conn_pool.get_connection()
    mycursor = conn.cursor()
    # month = calendar.monthrange(date.year(), date.month())[1]
    month = calendar.month_name[date.month]
    query = "select date from KPI_calculated_daily where actual_month = '{}';".format(month)
    mycursor.execute(query)
    if date in mycursor.fetchall():
        return date
    else:
        query = "select max(date) from KPI_calculated_daily where actual_month = '{}' group by actual_month;".format(
            month)
        mycursor.execute(query)
        # print(mycursor.fetchone())
        last_date = mycursor.fetchone()
        mycursor.close()
        conn.close()
        if last_date is None:
            return None
        else:
            return last_date[0]


def get_myrun_date(from_date , to_date):
    all_run_dates = []
    while to_date > from_date:
        if get_last_date_from_db(from_date) is None:
            break
        else:
            last_date = get_last_date_from_db(from_date)
        all_run_dates.append(last_date)
        # print(all_run_dates)
        from_date += relativedelta(months=1)
    # print(all_run_dates)
    if db_contains_date(to_date) and to_date not in all_run_dates and to_date is not None:
        last_date = get_last_date_from_db(to_date)
        if last_date in all_run_dates: all_run_dates.remove(last_date)
        all_run_dates.append(to_date)
    else:
        last_date = get_last_date_from_db(to_date)
        if last_date not in all_run_dates and last_date is not None: all_run_dates.append(last_date)
    return all_run_dates


def db_contains_date(to_date):
    conn = conn_pool.get_connection()
    mycursor = conn.cursor()
    query = "select date from KPI_calculated_daily where date='{}';".format(to_date)
    mycursor.execute(query)
    result = mycursor.fetchall()
    # print(result)
    mycursor.close()
    conn.close()
    if result != []:
        return True
    else:
        return False


def getBuBasedSla(bu , product , from_date , to_date):
    conn = conn_pool.get_connection()
    mycursor = conn.cursor()
    dct = {'sla_missed': {} , 'sla_approaching': {} , 'in_sla': {}}
    lst_of_dates = get_myrun_date(from_date , to_date)
    if len(lst_of_dates) == 1:
        dates = "('" + str(lst_of_dates[0]) + "')"
    else:
        dates = tuple([str(i) for i in lst_of_dates])
    for i in ['SLA MISSED' , 'IN SLA' , 'NEARING SLA']:
        BuAndSla = {'CX': 0 , 'CRM': 0 , 'IT': 0 , 'Cloud engineering': 0 , 'Platform': 0 , 'Others': 0}
        if bu == 'All':
            mycursor.execute(
                "select BU,(select count(sla_status) from KPI_calculated_daily where sla_status='{}' and product in (select Product from BU_table a where a.BU=BU_table.BU) and date in {}) as count from BU_table group by 1;".format(
                    i , dates))
            result = mycursor.fetchall()
            for j in result:
                BuAndSla[j[0]] = j[1]
        elif bu != 'All':
            mycursor.execute(
                "select distinct product,0 from KPI_calculated_daily where product in (select Product from BU_table where BU='{}');".format(
                    bu))
            ProductsandSla = mycursor.fetchall()
            Products = {}
            for j in ProductsandSla:
                Products[j[0]] = j[1]
            mycursor.execute(
                "select distinct product,count(sla_status) from KPI_calculated_daily where sla_status='{}' and product in (select Product from BU_table where BU='{}') and date in {} group by 1;".format(
                    i , bu , dates))
            result = mycursor.fetchall()
            for j in result:
                Products[j[0]] = j[1]
        if i == 'SLA MISSED':
            if bu == 'All':
                dct['sla_missed'] = BuAndSla
            else:
                dct['sla_missed'] = Products
        if i == 'IN SLA':
            if bu == 'All':
                dct['in_sla'] = BuAndSla
            else:
                dct['in_sla'] = Products
        if i == 'NEARING SLA':
            if bu == 'All':
                dct['sla_approaching'] = BuAndSla
            else:
                dct['sla_approaching'] = Products
    mycursor.close()
    conn.close()
    return dct


def get_sla_status_count(bu , product , lst_of_dates , status):
    conn = conn_pool.get_connection()
    mycursor = conn.cursor()
    if len(lst_of_dates) == 1:
        dates = "('" + str(lst_of_dates[0]) + "')"
    else:
        dates = tuple([str(i) for i in lst_of_dates])
    if bu not in [None , 'All'] and product == 'All':
        mycursor.execute(
            "select count(*) from KPI_calculated_daily where product in (select Product from BU_table where BU='{}') and date in {} and sla_status = '{}';".format(
                bu , dates , status));
    elif bu in [None , 'All'] and product == "All":
        # print("select BU,(select count(sla_status) from KPI_calculated_daily where date in {} and sla_status='{}' and product in BU_table.BU) from BU_table group by 1 order by 2 desc;".format(dates,status)))
        mycursor.execute(
            "select count(*) from KPI_calculated_daily where date in {} and sla_status = '{}';".format(dates , status));
    else:
        mycursor.execute(
            "select count(*) from KPI_calculated_daily where product = '{}' and date in {} and sla_status = '{}';".format(
                product , dates , status));
    sla_count = mycursor.fetchone()[0]
    mycursor.close()
    conn.close()
    return sla_count


def toDate(dateString):
    return datetime.strptime(dateString , "%Y-%m-%dT%H:%M:%S")


def split_sla_count(string):
    sla_status , count = string.split(":")
    if sla_status.strip() == 'IN SLA':
        sla = "in_sla"
    elif sla_status.strip() == 'NEARING SLA':
        sla = 'sla_approaching'
    elif sla_status.strip() == 'SLA MISSED':
        sla = 'sla_missed'
    return sla , int(count)


def get_format_for_graph(lst):
    dct = {}
    for i in range(len(lst)):
        if lst[i][0] not in dct:
            dct[lst[i][0]] = [lst[i][1] + ":" + str(lst[i][2])]
        else:
            dct[lst[i][0]].extend([lst[i][1] + ":" + str(lst[i][2])])
    dcty = []
    for i in dct:
        d = [{"date": i.strftime("%Y-%m-%d %H:%M:%S") , "in_sla": 0 , "sla_approaching": 0 , "sla_missed": 0}]
        for j in dct[i]:
            sla_status , count = split_sla_count(j)
            for x in range(len(d)):
                d[x][sla_status] = count
            # print(d)
        dcty.extend(d)
    return dcty


def getAwsAccount(bu , product):
    conn = conn_pool_cost.get_connection()
    mycursor = conn.cursor()
    if bu not in [None , 'All'] and product == 'All':
        mycursor.execute(
            "select Account_Name,Account_ID from aws_accounts_imp where BU='{}';".format(
                bu))
    elif product == 'All' and bu in [None , 'All']:
        mycursor.execute(
            "select Account_Name, Account_ID from aws_accounts_imp;")
    else:
        mycursor.execute(
            "select Account_Name, Account_ID from aws_accounts_imp where Product='{}';".format(
                product))
    result = mycursor.fetchall()
    #accounts = {'accounts': [i[0] for i in result]}
    accounts = [{'account': row[0], 'accountid': row[1]} for row in result]
    mycursor.close()
    conn.close()
    return json.dumps(accounts , default=str)


def getCostByAccount(bu , product , from_date , to_date , account_no):
    class DateEncoder(json.JSONEncoder):
        def default(self , obj):
            if isinstance(obj , date):
                return obj.isoformat()
            return super().default(obj)

    from_date = from_date.strftime("%Y-%m-%d")
    to_date = to_date.strftime("%Y-%m-%d")
    conn = conn_pool_cost.get_connection()
    mycursor = conn.cursor()
    if bu not in [None , 'All'] and product == 'All':
        mycursor.execute(
            "SELECT ai.Account_ID, ai.Account_Name, ai.Account_Mapping_key, ai.Product, ai.BU, m.`bill/BillingPeriodStartDate`, m.`bill/BillingPeriodEndDate`, m.`lineItem/UsageAccountId`, SUM(m.`lineItem/UsageAmount`) AS TotalUsageAmount FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp  AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND ai.BU='{}' AND `bill/BillingPeriodStartDate` BETWEEN '{}' AND '{}' GROUP BY ai.Account_Name;".format(
                bu , from_date , to_date))
    elif product == 'All' and bu in [None , 'All'] and account_no not in [None]:
        mycursor.execute(
            "SELECT ai.Account_ID, ai.Account_Name, ai.Account_Mapping_key, ai.Product, ai.BU, m.`bill/BillingPeriodStartDate`, m.`bill/BillingPeriodEndDate`, m.`lineItem/UsageAccountId`, SUM(m.`lineItem/UsageAmount`) AS TotalUsageAmount FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp  AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND ai.Account_Name={} AND `bill/BillingPeriodStartDate` BETWEEN '{}' AND '{}' GROUP BY ai.Account_Name;".format(
                account_no , from_date , to_date))
    elif product == 'All' and bu in [None , 'All']:
        mycursor.execute(
            "SELECT ai.Account_ID, ai.Account_Name, ai.Account_Mapping_key, ai.Product, ai.BU, m.`bill/BillingPeriodStartDate`, m.`bill/BillingPeriodEndDate`, m.`lineItem/UsageAccountId`, SUM(m.`lineItem/UsageAmount`) AS TotalUsageAmount FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp  AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND `bill/BillingPeriodStartDate` BETWEEN '{}' AND '{}' GROUP BY ai.Account_Name;".format(
                from_date , to_date))
    else:
        mycursor.execute(
            "SELECT ai.Account_ID, ai.Account_Name, ai.Account_Mapping_key, ai.Product, ai.BU, m.`bill/BillingPeriodStartDate`, m.`bill/BillingPeriodEndDate`, m.`lineItem/UsageAccountId`, SUM(m.`lineItem/UsageAmount`) AS TotalUsageAmount FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp  AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND `bill/BillingPeriodStartDate` AND ai.Product={} BETWEEN '{}' AND '{}' GROUP BY ai.Account_Name;".format(
                product , from_date , to_date))
    result = mycursor.fetchall()
    column_names = [
        "Account_ID" ,
        "Account_Name" ,
        "Account_Mapping_key" ,
        "Product" ,
        "BU" ,
        "bill/BillingPeriodStartDate" ,
        "bill/BillingPeriodEndDate" ,
        "lineItem/UsageAccountId" ,
        "TotalUsageAmount"
    ]

    # Convert the result to a list of dictionaries
    result_json = [dict(zip(column_names , row)) for row in result]

    # Convert the list of dictionaries to JSON
    json_output = json.dumps(result_json , indent=4 , cls=DateEncoder)

    # Print or return the JSON
    mycursor.close()
    conn.close()
    return json_output


def getTotalCost(bu , product , from_date , to_date , account_no):
    class DateEncoder(json.JSONEncoder):
        def default(self , obj):
            if isinstance(obj , date):
                return obj.isoformat()
            return super().default(obj)

    conn = conn_pool_cost.get_connection()
    mycursor = conn.cursor()
    if bu not in [None , 'All'] and product == 'All':
        mycursor.execute(
            "SELECT m.`bill/BillingPeriodStartDate` AS Start_Date, ROUND(SUM(m.`lineItem/UsageAmount`),2) AS Total_Usage_Amount FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp  AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND ai.BU='{}' AND `bill/BillingPeriodStartDate` BETWEEN '{}' AND '{}'  group by Start_date LIMIT 6;".format(
                bu , from_date , to_date))
    elif bu in [None , 'All'] and product not in ['All'] and account_no not in ['All']:
        mycursor.execute(
            "SELECT m.`bill/BillingPeriodStartDate` AS Start_Date, ROUND(SUM(m.`lineItem/UsageAmount`),2) AS Total_Usage_Amount FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp  AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND ai.Account_Name='{}' AND ai.Product='{}' AND `bill/BillingPeriodStartDate` BETWEEN '{}' AND '{}'  group by Start_date LIMIT 6;"
            .format(account_no , product , from_date , to_date))
    elif product == 'All' and bu in [None , 'All'] and (account_no != '' and account_no != 'All'):
        mycursor.execute(
            "SELECT m.`bill/BillingPeriodStartDate` AS Start_Date, ROUND(SUM(m.`lineItem/UsageAmount`),2) AS Total_Usage_Amount FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp  AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND ai.Account_Name='{}' AND `bill/BillingPeriodStartDate` BETWEEN '{}' AND '{}'  group by Start_date LIMIT 6;".format(
                account_no , from_date , to_date))
    elif bu not in [None , 'All'] and product not in ['All'] and (account_no != '' and account_no != 'All'):
        mycursor.execute(
            "SELECT m.`bill/BillingPeriodStartDate` AS Start_Date, ROUND(SUM(m.`lineItem/UsageAmount`),2) AS Total_Usage_Amount FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp  AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND ai.Account_Name='{}' AND `bill/BillingPeriodStartDate` BETWEEN '{}' AND '{}' AND ai.Product='{}' AND ai.BU='{}' group by Start_date LIMIT 6;".format(
                account_no , from_date , to_date , product , bu))
    elif product == 'All' and bu in [None , 'All'] and account_no == 'All':
        mycursor.execute(
            "SELECT m.`bill/BillingPeriodStartDate` AS Start_Date, ROUND(SUM(m.`lineItem/UsageAmount`),2) AS Total_Usage_Amount FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp  AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND `bill/BillingPeriodStartDate` BETWEEN '{}' AND '{}'  group by Start_date LIMIT 6;".format(
                from_date , to_date))
    else:
        mycursor.execute(
            "SELECT m.`bill/BillingPeriodStartDate` AS Start_Date, ROUND(SUM(m.`lineItem/UsageAmount`),2) AS Total_Usage_Amount FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp  AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND ai.Product='{}' AND `bill/BillingPeriodStartDate` BETWEEN '{}' AND '{}' group by Start_date LIMIT 6;".format(
                product , from_date , to_date))
    result = mycursor.fetchall()
    column_names = [
        "Start_Date" ,
        "Total_Usage_Amount"]

    # Convert the result to a list of dictionaries
    result_json = [dict(zip(column_names , row)) for row in result]

    # Convert the list of dictionaries to JSON
    json_output = json.dumps(result_json , indent=4 , cls=DateEncoder)
    mycursor.close()
    conn.close()
    return json_output


def getCostByAccountResourceCount(bu , product , from_date , to_date , account_no):
    class DateEncoder(json.JSONEncoder):
        def default(self , obj):
            if isinstance(obj , date):
                return obj.isoformat()
            return super().default(obj)

    from_date = from_date.strftime("%Y-%m-%d")
    to_date = to_date.strftime("%Y-%m-%d")
    conn = conn_pool_cost.get_connection()
    mycursor = conn.cursor()
    if bu not in [None , 'All'] and product == 'All':
        mycursor.execute(
            "SELECT `lineItem/UsageAccountId` as Account_ID, ai.Account_Name, ai.Product, ai.BU, m.`bill/BillingPeriodStartDate` as Start_Date, ROUND(SUM(m.`lineItem/UsageAmount`), 2) AS Total_usage_amount, count(distinct(`lineItem/ResourceId`)) AS Resource_Count FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp  AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND ai.BU='{}' AND `bill/BillingPeriodStartDate` BETWEEN '{}' AND '{}' group by `lineItem/UsageAccountId`, m.`bill/BillingPeriodStartDate` ORDER BY Total_usage_amount desc;".format(
                bu , from_date , to_date))
    elif product == 'All' and bu in [None , 'All'] and (account_no != '' and account_no != 'All'):
        mycursor.execute(
            "SELECT `lineItem/UsageAccountId` as Account_ID, ai.Account_Name, ai.Product, ai.BU, m.`bill/BillingPeriodStartDate` as Start_Date, ROUND(SUM(m.`lineItem/UsageAmount`),2) AS Total_usage_amount, count(distinct(`lineItem/ResourceId`)) AS Resource_Count FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp  AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND ai.Account_Name='{}' AND `bill/BillingPeriodStartDate` BETWEEN '{}' AND '{}' group by `lineItem/UsageAccountId`, m.`bill/BillingPeriodStartDate` ORDER BY Total_usage_amount desc;".format(
                account_no , from_date , to_date))
    elif bu not in [None , 'All'] and product not in ['All'] and (account_no != '' and account_no != 'All'):
        mycursor.execute(
            "SELECT `lineItem/UsageAccountId` as Account_ID, ai.Account_Name, ai.Product, ai.BU, m.`bill/BillingPeriodStartDate` as Start_Date, ROUND(SUM(m.`lineItem/UsageAmount`),2) AS Total_usage_amount, count(distinct(`lineItem/ResourceId`)) AS Resource_Count FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp  AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND ai.Account_Name='{}' AND `bill/BillingPeriodStartDate` BETWEEN '{}' AND '{}'  AND ai.BU='{}' AND ai.Product='{}' group by `lineItem/UsageAccountId`, m.`bill/BillingPeriodStartDate` ORDER BY Total_usage_amount desc;".format(
                account_no , from_date , to_date , bu , product))
    elif product == 'All' and bu in [None , 'All'] and account_no == 'All':
        mycursor.execute(
            "SELECT `lineItem/UsageAccountId` as Account_ID, ai.Account_Name, ai.Product, ai.BU, m.`bill/BillingPeriodStartDate` as Start_Date, ROUND(SUM(m.`lineItem/UsageAmount`),2) AS Total_usage_amount, count(distinct(`lineItem/ResourceId`)) AS Resource_Count FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp  AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND `bill/BillingPeriodStartDate` BETWEEN '{}' AND '{}' group by `lineItem/UsageAccountId`, m.`bill/BillingPeriodStartDate` ORDER BY Total_usage_amount desc;".format(
                from_date , to_date))
    else:
        mycursor.execute(
            "SELECT `lineItem/UsageAccountId` as Account_ID, ai.Account_Name, ai.Product, ai.BU, m.`bill/BillingPeriodStartDate` as Start_Date, ROUND(SUM(m.`lineItem/UsageAmount`),2) AS Total_usage_amount, count(distinct(`lineItem/ResourceId`)) AS Resource_Count FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp  AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND ai.Product='{}' AND `bill/BillingPeriodStartDate` BETWEEN '{}' AND '{}' group by `lineItem/UsageAccountId`, m.`bill/BillingPeriodStartDate` ORDER BY Total_usage_amount desc;".format(
                product , from_date , to_date))
    result = mycursor.fetchall()
    column_names = ["Account_ID" , "Account_Name" , "Product" , "BU" , "Start_Date" , "Total_usage_amount" ,
                    "Resource_Count"]
    # Convert the result to a list of dictionaries
    result_json = [dict(zip(column_names , row)) for row in result]

    # Convert the list of dictionaries to JSON
    json_output = json.dumps(result_json , indent=4 , cls=DateEncoder)

    # Print or return the JSON
    mycursor.close()
    conn.close()
    return json_output


def getResourceType():
    conn = conn_pool_cost.get_connection()
    mycursor = conn.cursor()
    mycursor.execute("select distinct saving_category  from saving_category_imp;")
    result = mycursor.fetchall()
    saving_category = {'saving_category': [i[0] for i in result]}
    mycursor.close()
    conn.close()
    return json.dumps(saving_category , default=str)


def getCostByResource(bu , product , from_date , to_date , account_no , resource_name):
    class DateEncoder(json.JSONEncoder):
        def default(self , obj):
            if isinstance(obj , date):
                return obj.isoformat()
            return super().default(obj)

    from_date = from_date.strftime("%Y-%m-%d")
    to_date = to_date.strftime("%Y-%m-%d")
    conn = conn_pool_cost.get_connection()
    mycursor = conn.cursor()
    if bu not in [None , 'All'] and product == 'All':
        if resource_name != '' and resource_name != 'All':
            mycursor.execute(
                "SELECT DISTINCT `lineItem/UsageAccountId` AS Account_ID, ai.Account_Name, ai.Product, ai.BU, `lineItem/AvailabilityZone` AS Availabilty_Zone, `lineItem/ResourceId` AS Resource_ID, `resource_details/Custom` AS Saving_Category, m.`bill/BillingPeriodStartDate` AS Start_Date, ROUND(SUM(m.`lineItem/UsageAmount`), 2) AS Total_usage_amount FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND ai.BU='{}' AND `bill/BillingPeriodStartDate` between '{}' and '{}' AND `resource_details/Custom` like '%{}%' GROUP BY `lineItem/ResourceId` HAVING Total_usage_amount > 5 ORDER BY Total_usage_amount DESC;".format(
                    bu , from_date , to_date , resource_name))
        else:
            mycursor.execute(
                "SELECT DISTINCT `lineItem/UsageAccountId` AS Account_ID, ai.Account_Name, ai.Product, ai.BU, `lineItem/AvailabilityZone` AS Availabilty_Zone, `lineItem/ResourceId` AS Resource_ID, `resource_details/Custom` AS Saving_Category, m.`bill/BillingPeriodStartDate` AS Start_Date, ROUND(SUM(m.`lineItem/UsageAmount`), 2) AS Total_usage_amount FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND ai.BU='{}' AND `bill/BillingPeriodStartDate` between '{}' and '{}'  GROUP BY `lineItem/ResourceId` HAVING Total_usage_amount > 5 ORDER BY Total_usage_amount DESC;".format(
                    bu , from_date , to_date))
    elif product == 'All' and bu in [None , 'All'] and (account_no != '' and account_no != 'All'):
        if resource_name != '' and resource_name != 'All':
            mycursor.execute(
                "SELECT DISTINCT `lineItem/UsageAccountId` AS Account_ID, ai.Account_Name, ai.Product, ai.BU, `lineItem/AvailabilityZone` AS Availabilty_Zone, `lineItem/ResourceId` AS Resource_ID, `resource_details/Custom` AS Saving_Category, m.`bill/BillingPeriodStartDate` AS Start_Date, ROUND(SUM(m.`lineItem/UsageAmount`), 2) AS Total_usage_amount FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND ai.Account_Name='{}' AND `bill/BillingPeriodStartDate` between '{}' and '{}' AND `resource_details/Custom` like '%{}%' GROUP BY `lineItem/ResourceId` HAVING Total_usage_amount > 5 ORDER BY Total_usage_amount DESC;"
                .format(account_no , from_date , to_date , resource_name))
        else:
            mycursor.execute(
                "SELECT DISTINCT `lineItem/UsageAccountId` AS Account_ID, ai.Account_Name, ai.Product, ai.BU, `lineItem/AvailabilityZone` AS Availabilty_Zone, `lineItem/ResourceId` AS Resource_ID, `resource_details/Custom` AS Saving_Category, m.`bill/BillingPeriodStartDate` AS Start_Date, ROUND(SUM(m.`lineItem/UsageAmount`), 2) AS Total_usage_amount FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND ai.Account_Name='{}' AND `bill/BillingPeriodStartDate` between '{}' and '{}'  GROUP BY `lineItem/ResourceId` HAVING Total_usage_amount > 5 ORDER BY Total_usage_amount DESC;".format(
                    account_no , from_date , to_date))
    elif product not in ['All'] and bu not in [None , 'All'] and (account_no != '' and account_no != 'All'):
        if resource_name != '' and resource_name != 'All':
            mycursor.execute(
                "SELECT DISTINCT `lineItem/UsageAccountId` AS Account_ID, ai.Account_Name, ai.Product, ai.BU, `lineItem/AvailabilityZone` AS Availabilty_Zone, `lineItem/ResourceId` AS Resource_ID, `resource_details/Custom` AS Saving_Category, m.`bill/BillingPeriodStartDate` AS Start_Date, ROUND(SUM(m.`lineItem/UsageAmount`), 2) AS Total_usage_amount FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND ai.Account_Name='{}' AND `bill/BillingPeriodStartDate` between '{}' and '{}' AND ai.BU='{}' AND ai.Product='{}'  AND `resource_details/Custom` like '%{}%' GROUP BY `lineItem/ResourceId` HAVING Total_usage_amount > 5 ORDER BY Total_usage_amount DESC;"
                .format(account_no , from_date , to_date , resource_name , bu , product))
        else:
            mycursor.execute(
                "SELECT DISTINCT `lineItem/UsageAccountId` AS Account_ID, ai.Account_Name, ai.Product, ai.BU, `lineItem/AvailabilityZone` AS Availabilty_Zone, `lineItem/ResourceId` AS Resource_ID, `resource_details/Custom` AS Saving_Category, m.`bill/BillingPeriodStartDate` AS Start_Date, ROUND(SUM(m.`lineItem/UsageAmount`), 2) AS Total_usage_amount FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND ai.Account_Name='{}' AND `bill/BillingPeriodStartDate` between '{}' and '{}' AND ai.BU='{}' AND ai.Product='{}'  GROUP BY `lineItem/ResourceId` HAVING Total_usage_amount > 5 ORDER BY Total_usage_amount DESC;".format(
                    account_no , from_date , to_date , bu , product))
    elif product == 'All' and bu in [None , 'All'] and account_no == 'All' and resource_name == 'All':
        mycursor.execute(
            "SELECT DISTINCT `lineItem/UsageAccountId` AS Account_ID, ai.Account_Name, ai.Product, ai.BU, `lineItem/AvailabilityZone` AS Availabilty_Zone, `lineItem/ResourceId` AS Resource_ID, `resource_details/Custom` AS Saving_Category, m.`bill/BillingPeriodStartDate` AS Start_Date, ROUND(SUM(m.`lineItem/UsageAmount`), 2) AS Total_usage_amount FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND `bill/BillingPeriodStartDate` between '{}' and '{}'  GROUP BY `lineItem/ResourceId` HAVING Total_usage_amount > 5 ORDER BY Total_usage_amount DESC;".format(
                from_date , to_date))
    else:
        if resource_name != '' and resource_name != 'All':
            mycursor.execute(
                "SELECT DISTINCT `lineItem/UsageAccountId` AS Account_ID, ai.Account_Name, ai.Product, ai.BU, `lineItem/AvailabilityZone` AS Availabilty_Zone, `lineItem/ResourceId` AS Resource_ID, `resource_details/Custom` AS Saving_Category, m.`bill/BillingPeriodStartDate` AS Start_Date, ROUND(SUM(m.`lineItem/UsageAmount`), 2) AS Total_usage_amount FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND ai.Product='{}' AND `bill/BillingPeriodStartDate` between '{}' and '{}' AND `resource_details/Custom` like '%{}%' GROUP BY `lineItem/ResourceId` HAVING Total_usage_amount > 5 ORDER BY Total_usage_amount DESC;"
                .format(product , from_date , to_date , resource_name))
        else:
            mycursor.execute(
                "SELECT DISTINCT `lineItem/UsageAccountId` AS Account_ID, ai.Account_Name, ai.Product, ai.BU, `lineItem/AvailabilityZone` AS Availabilty_Zone, `lineItem/ResourceId` AS Resource_ID, `resource_details/Custom` AS Saving_Category, m.`bill/BillingPeriodStartDate` AS Start_Date, ROUND(SUM(m.`lineItem/UsageAmount`), 2) AS Total_usage_amount FROM aws_accounts_imp AS ai INNER JOIN aws_curr_db_imp AS m ON m.`lineItem/UsageAccountId` = ai.Account_ID WHERE m.`product/ProductName` != 'AmazonCloudWatch' AND ai.Product='{}' AND `bill/BillingPeriodStartDate` between '{}' and '{}'  GROUP BY `lineItem/ResourceId` HAVING Total_usage_amount > 5 ORDER BY Total_usage_amount DESC;".format(
                    product , from_date , to_date))
    result = mycursor.fetchall()
    column_names = ["Account_ID" , "Account_Name" , "Product" , "BU" , "Availability Zone" , "Resource ID" ,
                    "Saving Category" , "Start_Date" , "Usage_amount"]
    # Convert the result to a list of dictionaries
    result_json = [dict(zip(column_names , row)) for row in result]
    json_output = json.dumps(result_json , indent=4 , cls=DateEncoder)
    mycursor.close()
    conn.close()
    return json_output


def getKPIData(bu , product , from_date , to_date):
    class DateEncoder(json.JSONEncoder):
        def default(self , obj):
            if isinstance(obj , date):
                return obj.isoformat()
            return super().default(obj)

    from_date = from_date.strftime("%Y-%m-%d")
    to_date = to_date.strftime("%Y-%m-%d")
    conn = conn_pool_cost.get_connection()
    mycursor = conn.cursor()
    if bu not in [None , 'All'] and product == 'All':
        mycursor.execute(
            "select kpi_name,sla_status,product,bu,value as current_value,sla_defined,budget_overshoot,resource_name from kpi_definations_imp where bu='{}' and start_date BETWEEN '{}' AND '{}' group by kpi_name,product order by budget_overshoot asc;".format(
                bu , from_date , to_date))
    elif product == 'All' and bu in [None , 'All']:
        mycursor.execute(
            "select kpi_name,sla_status,product,bu,value as current_value,sla_defined,budget_overshoot,resource_name from kpi_definations_imp where  start_date BETWEEN '{}' AND '{}' group by kpi_name,product order by budget_overshoot asc;".format(
                from_date , to_date))
    else:
        mycursor.execute(
            "select kpi_name,sla_status,product,bu,value as current_value,sla_defined,budget_overshoot,resource_name from kpi_definations_imp where product='{}' and start_date BETWEEN '{}' AND '{}' group by kpi_name,product order by budget_overshoot asc;".format(
                product , from_date , to_date))
    result = mycursor.fetchall()
    column_names = ["kpi_name" , "sla_status" , "Product" , "BU" , "saving" , "sla_defined" ,
                    "budget_overshoot" , "resource_name"]
    # Convert the result to a list of dictionaries
    result_json = [dict(zip(column_names , row)) for row in result]

    # Convert the list of dictionaries to JSON
    json_output = json.dumps(result_json , indent=4 , cls=DateEncoder)

    # Print or return the JSON
    mycursor.close()
    conn.close()
    return json_output


def getDashboardStatus(bu , product , from_date , to_date):
    conn = conn_pool_cost.get_connection()
    mycursor = conn.cursor()

    # Initialize an empty dictionary to store the counts for each sla_status
    sla_counts = {
        "in_sla": 0 ,
        "sla_approaching": 0 ,
        "sla_missed": 0
    }

    query_params = []  # Store query parameters

    # Construct the base SQL query based on the provided conditions
    if bu not in [None , 'All'] and product == 'All':
        base_query = (
            "SELECT DISTINCT sla_status, COUNT(sla_status) AS count "
            "FROM kpi_definations_imp "
            "WHERE start_date BETWEEN %s AND %s AND bu = %s "
            "GROUP BY sla_status"
        )
        query_params.extend([from_date , to_date , bu])
    elif product == 'All' and bu in [None , 'All']:
        base_query = (
            "SELECT DISTINCT sla_status, COUNT(sla_status) AS count "
            "FROM kpi_definations_imp "
            "WHERE start_date BETWEEN %s AND %s "
            "GROUP BY sla_status"
        )
        query_params.extend([from_date , to_date])
    else:
        base_query = (
            "SELECT DISTINCT sla_status, COUNT(sla_status) AS count "
            "FROM kpi_definations_imp "
            "WHERE start_date BETWEEN %s AND %s AND product = %s "
            "GROUP BY sla_status"
        )
        query_params.extend([from_date , to_date , product])

    mycursor.execute(base_query , tuple(query_params))

    result = mycursor.fetchall()

    # Process the query result and update sla_counts dictionary
    for row in result:
        sla_status = row[0].strip().lower()  # Convert to lowercase
        count = row[1]

        # Map variations to the expected status values
        if sla_status == "in sla":
            sla_status = "in_sla"
        elif sla_status == "out of sla":
            sla_status = "sla_missed"

        # Update counts based on lowercase and mapped status
        if sla_status in sla_counts:
            sla_counts[sla_status] += count

    # Ensure that "sla_approaching" is always included in the result with a count of 0
    if "sla_approaching" not in sla_counts:
        sla_counts["sla_approaching"] = 0

    mycursor.close()
    conn.close()

    return json.dumps(sla_counts)

def peAvailabilitySample(bu, product):
    return json.dumps({'Freshdesk':[100,100,100,100],'Freshcaller':[100,99,98,100],'Freshchat':[99,100,100,97]}, default=str)

