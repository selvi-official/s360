import mysql.connector
import calendar
import pandas as pd
import json
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

def connect_to_mysql():
    try:
        conn = mysql.connector.connect(
            host= os.environ.get("rds_db_host"),
            port= os.environ.get("rds_db_port"),
            database= os.environ.get("rds_db3_name"),
            user= os.environ.get("rds_db_user"),
            password= os.environ.get("rds_db_pass")
            )
        return conn
    except mysql.connector.Error as err:
        print("Error:", err)

def getOkrMttd1(bu, product, quarter):
    # Assuming you have defined the connect_to_mysql function elsewhere
    conn = connect_to_mysql()
    mycursor = conn.cursor()
    final_result2={}
    if quarter!='YTD':
        quarter_str,year=quarter.split()
        year=int(year)
    if quarter == 'YTD':
        current_date = datetime.now()
        year = int(datetime.now().year)
        current_month = current_date.month
        current_quarter = (current_month - 1) // 3 + 1
        quarter_labels = {1: "Q1", 2: "Q2", 3: "Q3", 4: "Q4"}
        quarter1 = tuple(quarter_labels[q] for q in range(1, current_quarter + 1))
    elif quarter_str in ['Q1', 'Q2', 'Q3', 'Q4']:
        quarter1 = (quarter_str,)
        quarter_str = str(quarter1)
        last_comma_index = quarter_str.rindex(",")
        quarter1 = quarter_str[:last_comma_index] + quarter_str[last_comma_index + 1:]
    else:
        quarter1 = ()

    if bu not in [None, 'All'] and product == 'All':
        query = "select month, avg(time_to_detect_in_minutes) from incidents where year={} and quarter IN {} and ('{}' IN (affected_bu) or bu='{}') and (major_incident_type like '%P0%' OR major_incident_type like '%P1%') group by month;".format(year, quarter1, bu, bu)
    elif bu in [None, 'All'] and product == 'All':
        query = "select month, avg(time_to_detect_in_minutes) from incidents where year={} and quarter IN {} and (major_incident_type like '%P0%' OR major_incident_type like '%P1%') group by month;".format(year, quarter1)
    elif product != 'All':
        query = "select month, avg(time_to_detect_in_minutes) from incidents where year={} and quarter IN {} and (msf_products_affected like '%{}%' or module='{}') and (major_incident_type like '%P0%' OR major_incident_type like '%P1%') group by month;".format(year, quarter1, product, product)
    mycursor.execute(query)
    result = mycursor.fetchall()
    query2="select distinct(month) from incidents where quarter in {}".format(quarter1)
    mycursor.execute(query2)
    result2=mycursor.fetchall()
    months = [month[0] for month in result2]
    month_values = {}
    for month, value in result:
        if value is not None:
            month_values[month] = round(float(value), 2)
        else:
            month_values[month] = 0
    for month in months:
        if month not in month_values:
            month_values[month] = 0
    mttd_values=sort_by_month(month_values)
    final_result2['mttd_values']=mttd_values

    if bu not in [None, 'All'] and product == 'All':
        query = "select month, count(id) from incidents where year={} and quarter IN {} and ('{}' IN (affected_bu) or bu='{}') and (major_incident_type like '%P0%') group by month;".format(year, quarter1, bu, bu)
    elif bu in [None, 'All'] and product == 'All':
        query = "select month,count(id) from incidents where year={} and quarter IN {} and (major_incident_type like '%P0%') group by month;".format(year, quarter1)
    elif product != 'All':
        query = "select month, count(id) from incidents where year={} and quarter IN {} and (msf_products_affected like '%{}%' or module='{}') and (major_incident_type like '%P0%') group by month;".format(year, quarter1, product, product)
    mycursor.execute(query)
    result=mycursor.fetchall()
    month_values = {}
    for month, value in result:
        if value is not None:
            month_values[month] = round(float(value))
        else:
            month_values[month] = 0
    for month in months:
        if month not in month_values:
            month_values[month] = 0
    p0_count=sort_by_month(month_values)
    final_result2['p0_count']=p0_count


    if bu not in [None, 'All'] and product == 'All':
        query = "select month, count(id) from incidents where year={} and quarter IN {} and ('{}' IN (affected_bu) or bu='{}') and (major_incident_type like '%P1%') group by month;".format(year, quarter1, bu, bu)
    elif bu in [None, 'All'] and product == 'All':
        query = "select month,count(id) from incidents where year={} and quarter IN {} and (major_incident_type like '%P1%') group by month;".format(year, quarter1)
    elif product != 'All':
        query = "select month, count(id) from incidents where year={} and quarter IN {} and (msf_products_affected like '%{}%' or module='{}') and (major_incident_type like '%P1%') group by month;".format(year, quarter1, product, product)
    mycursor.execute(query)
    result=mycursor.fetchall()
    month_values = {}
    for month, value in result:
        if value is not None:
            month_values[month] = round(float(value))
        else:
            month_values[month] = 0
    for month in months:
        if month not in month_values:
            month_values[month] = 0
    p1_count=sort_by_month(month_values)
    final_result2['p1_count']=p1_count


    if bu not in [None, 'All'] and product == 'All':
        query = "select month, avg(time_to_recover_in_minutes) from incidents where year={} and quarter IN {} and ('{}' IN (affected_bu) or bu='{}') and (major_incident_type like '%P0%') group by month;".format(year, quarter1, bu, bu)
    elif bu in [None, 'All'] and product == 'All':
        query = "select month,avg(time_to_recover_in_minutes) from incidents where year={} and quarter IN {} and (major_incident_type like '%P0%') group by month;".format(year, quarter1)
    elif product != 'All':
        query = "select month,avg(time_to_recover_in_minutes) from incidents where year={} and quarter IN {} and (msf_products_affected like '%{}%' or module='{}') and (major_incident_type like '%P0%') group by month;".format(year, quarter1, product, product)
    mycursor.execute(query)
    result=mycursor.fetchall()
    month_values = {}
    for month, value in result:
        if value is not None:
            month_values[month] = round(float(value),2)
        else:
            month_values[month] = 0
    for month in months:
        if month not in month_values:
            month_values[month] = 0
    ttr_p0=sort_by_month(month_values)
    final_result2['ttr_p0']=ttr_p0


    if bu not in [None, 'All'] and product == 'All':
        query = "select month, avg(time_to_recover_in_minutes) from incidents where year={} and quarter IN {} and ('{}' IN (affected_bu) or bu='{}') and (major_incident_type like '%P1%') group by month;".format(year, quarter1, bu, bu)
    elif bu in [None, 'All'] and product == 'All':
        query = "select month,avg(time_to_recover_in_minutes) from incidents where year={} and quarter IN {} and (major_incident_type like '%P1%') group by month;".format(year, quarter1)
    elif product != 'All':
        query = "select month,avg(time_to_recover_in_minutes) from incidents where year={} and quarter IN {} and (msf_products_affected like '%{}%' or module='{}') and (major_incident_type like '%P1%') group by month;".format(year, quarter1, product, product)
    mycursor.execute(query)
    result=mycursor.fetchall()
    month_values = {}
    for month, value in result:
        if value is not None:
            month_values[month] = round(float(value),2)
        else:
            month_values[month] = 0
    for month in months:
        if month not in month_values:
            month_values[month] = 0
    ttr_p1=sort_by_month(month_values)
    final_result2['ttr_p1']=ttr_p1


    print(final_result2)
    output = []

    # Assuming the input_data contains the months in order
    months = list(final_result2['mttd_values'].keys())

    for month in months:
        entry = {
            "month": month,
            "MTTD": final_result2['mttd_values'].get(month, 0),
            "P0MTTR": final_result2['ttr_p0'].get(month, 0),
            "P1MTTR": final_result2['ttr_p1'].get(month, 0),
            "P0Count": final_result2['p0_count'].get(month, 0),
            "P1Count": final_result2['p1_count'].get(month, 0)
        }
        output.append(entry)
    print(output)
    return output



def sort_by_month(data):
    # Custom key function to sort by month
    def month_index(month):
        return list(calendar.month_abbr).index(month)

    # Sort the dictionary by month
    sorted_data = dict(sorted(data.items(), key=lambda item: month_index(item[0])))
    return sorted_data

def getOkrCustCount(bu, product, quarter):
    # Assuming you have defined the connect_to_mysql function elsewhere
    conn = connect_to_mysql()
    mycursor = conn.cursor()
    final_result2={}
    if quarter!='YTD':
        quarter_str,year=quarter.split()
        year=int(year)
    if quarter == 'YTD':
        current_date = datetime.now()
        year = int(datetime.now().year)
        current_month = current_date.month
        current_quarter = (current_month - 1) // 3 + 1
        quarter_labels = {1: "Q1", 2: "Q2", 3: "Q3", 4: "Q4"}
        quarter1 = tuple(quarter_labels[q] for q in range(1, current_quarter + 1))
    elif quarter_str in ['Q1', 'Q2', 'Q3', 'Q4']:
        quarter1 = (quarter_str,)
        quarter_str = str(quarter1)
        last_comma_index = quarter_str.rindex(",")
        quarter1 = quarter_str[:last_comma_index] + quarter_str[last_comma_index + 1:]
    else:
        quarter1 = ()
    if bu not in [None, 'All'] and product == 'All':
        query = "select month,count(id) as incidents from incidents where year={} and quarter IN {} and ('{}' IN (affected_bu) or bu='{}') and (major_incident_type like '%P0%') and alert_generated_by = 'Customer' group by month;".format(year, quarter1, bu, bu)
    elif bu in [None, 'All'] and product == 'All':
        query = "select month,count(id) as incidents from incidents where year={} and quarter IN {} and (major_incident_type like '%P0%') and alert_generated_by = 'Customer' group by month;".format(year, quarter1)
    elif product != 'All':
        query = "select month,count(id) as incidents from incidents where year={} and quarter IN {} and (msf_products_affected like '%{}%' or module='{}') and (major_incident_type like '%P0%' )  and alert_generated_by = 'Customer' group by month;".format(year, quarter1, product, product)

    mycursor.execute(query)
    result = mycursor.fetchall()
    query2="select distinct(month) from incidents where quarter in {}".format(quarter1)
    mycursor.execute(query2)
    result2=mycursor.fetchall()
    months = [month[0] for month in result2]
    month_values = {}
    for month, value in result:
        if value is not None:
            month_values[month] = round(float(value), 2)
        else:
            month_values[month] = 0
    for month in months:
        if month not in month_values:
            month_values[month] = 0
    p0_cust_detected=sort_by_month(month_values)
    final_result2['P0 Customer Reported']=p0_cust_detected

    if bu not in [None, 'All'] and product == 'All':
        query = "select month,count(id) as incidents from incidents where year={} and quarter IN {} and ('{}' IN (affected_bu) or bu='{}') and (major_incident_type like '%P0%') and alert_generated_by != 'Customer' group by month;".format(year, quarter1, bu, bu)
    elif bu in [None, 'All'] and product == 'All':
        query = "select month,count(id) as incidents from incidents where year={} and quarter IN {} and (major_incident_type like '%P0%') and alert_generated_by != 'Customer' group by month;".format(year, quarter1)
    elif product != 'All':
        query = "select month,count(id) as incidents from incidents where year={} and quarter IN {} and (msf_products_affected like '%{}%' or module='{}') and (major_incident_type like '%P0%' )  and alert_generated_by != 'Customer' group by month;".format(year, quarter1, product, product)
    mycursor.execute(query)
    result=mycursor.fetchall()
    month_values = {}
    for month, value in result:
        if value is not None:
            month_values[month] = round(float(value))
        else:
            month_values[month] = 0
    for month in months:
        if month not in month_values:
            month_values[month] = 0
    p0_non_cust_detected=sort_by_month(month_values)
    final_result2['P0 Internally Detected']=p0_non_cust_detected


    if bu not in [None, 'All'] and product == 'All':
        query = "select month,count(id) as incidents from incidents where year={} and quarter IN {} and ('{}' IN (affected_bu) or bu='{}') and (major_incident_type like '%P1%') and alert_generated_by = 'Customer' group by month;".format(year, quarter1, bu, bu)
    elif bu in [None, 'All'] and product == 'All':
        query = "select month,count(id) as incidents from incidents where year={} and quarter IN {} and (major_incident_type like '%P1%') and alert_generated_by = 'Customer' group by month;".format(year, quarter1)
    elif product != 'All':
        query = "select month,count(id) as incidents from incidents where year={} and quarter IN {} and (msf_products_affected like '%{}%' or module='{}') and (major_incident_type like '%P1%' )  and alert_generated_by = 'Customer' group by month;".format(year, quarter1, product, product)
    mycursor.execute(query)
    result=mycursor.fetchall()
    month_values = {}
    for month, value in result:
        if value is not None:
            month_values[month] = round(float(value))
        else:
            month_values[month] = 0
    for month in months:
        if month not in month_values:
            month_values[month] = 0
    p1_cust_detected=sort_by_month(month_values)
    final_result2['P1 Customer Reported']=p1_cust_detected


    if bu not in [None, 'All'] and product == 'All':
        query = "select month,count(id) as incidents from incidents where year={} and quarter IN {} and ('{}' IN (affected_bu) or bu='{}') and (major_incident_type like '%P1%') and alert_generated_by != 'Customer' group by month;".format(year, quarter1, bu, bu)
    elif bu in [None, 'All'] and product == 'All':
        query = "select month,count(id) as incidents from incidents where year={} and quarter IN {} and (major_incident_type like '%P1%') and alert_generated_by != 'Customer' group by month;".format(year, quarter1)
    elif product != 'All':
        query = "select month,count(id) as incidents from incidents where year={} and quarter IN {} and (msf_products_affected like '%{}%' or module='{}') and (major_incident_type like '%P1%' )  and alert_generated_by != 'Customer' group by month;".format(year, quarter1, product, product)
    mycursor.execute(query)
    result=mycursor.fetchall()
    month_values = {}
    for month, value in result:
        if value is not None:
            month_values[month] = round(float(value),2)
        else:
            month_values[month] = 0
    for month in months:
        if month not in month_values:
            month_values[month] = 0
    p1_non_cust_detected=sort_by_month(month_values)
    final_result2['P1 Internally Detected']=p1_non_cust_detected

    output = []

    # Assuming the input_data contains the months in order
    months = list(final_result2['P1 Internally Detected'].keys())

    for month in months:
        entry = {
            "month": month,
            "P0 Customer Reported": int(final_result2['P0 Customer Reported'].get(month, 0)),
            "P0 Internally Detected":int(final_result2['P0 Internally Detected'].get(month, 0)),
            "P1 Customer Reported": int(final_result2['P1 Customer Reported'].get(month, 0)),
            "P1 Internally Detected":int(final_result2['P1 Internally Detected'].get(month, 0)),

        }
        output.append(entry)
    print(output)
    return output

def getComparisonData_p0(bu, product, quarter):
    # Assuming you have defined the connect_to_mysql function elsewhere
    conn = connect_to_mysql()
    mycursor = conn.cursor()
    final_result = {}

    if quarter != 'YTD':
        quarter_str, year = quarter.split()
        year = int(year)
    if quarter == 'YTD':
        return {}
    elif quarter_str in ['Q1', 'Q2', 'Q3', 'Q4']:
        p0_count = {}
        quarters = ['Q1', 'Q2', 'Q3', 'Q4']
        quarter_str, year = quarter.split()
        year = int(year)

        # Find index of current quarter
        current_index = quarters.index(quarter_str)

        # Calculate previous quarter
        previous_index = (current_index - 1) % 4
        previous_quarter = quarters[previous_index]
        # Adjust year if previous quarter is Q4
        previous_year = year if previous_index != 3 else year - 1

        # Create tuple containing current and previous quarter
        quarters_tuple = (quarter_str + " " + str(year), previous_quarter + " " + str(previous_year))

        for quarter in quarters_tuple:
            quarter, year = quarter.split()
            quarter = str(quarter)
            year = int(year)

            # P0 Count
            if bu not in [None, 'All'] and product == 'All':
                query = "SELECT COUNT(id) AS incidents FROM incidents WHERE year={} AND quarter ='{}' AND ('{}' IN (affected_bu) OR bu='{}') AND (major_incident_type LIKE '%P0%')".format(year, quarter, bu, bu)
            elif bu in [None, 'All'] and product == 'All':
                query = "SELECT COUNT(id) AS incidents FROM incidents WHERE year={} AND quarter = '{}' AND (major_incident_type LIKE '%P0%')".format(year, quarter)
            elif product != 'All':
                query = "SELECT COUNT(id) AS incidents FROM incidents WHERE year={} AND quarter= '{}' AND (msf_products_affected LIKE '%{}%' OR module='{}') AND (major_incident_type LIKE '%P0%' )".format(year, quarter, product, product)
            mycursor.execute(query)
            result = mycursor.fetchall()  # Consume or clear the result set
            if result:
                p0_count[quarter] = result[0][0]
            else:
                p0_count[quarter] = 0
            final_result['p0_count'] = p0_count

        # Calculate percentage change in P0 counts
        prev_value = p0_count[previous_quarter]
        curr_value = p0_count[quarter_str]
        if prev_value != 0:
            outagesDrop = round(((curr_value - prev_value) / prev_value) * 100, 2)
        else:
            outagesDrop = curr_value*100

        # Construct output dictionary
        output = {
            'outagesDrop': outagesDrop,
            'prev_value': prev_value,
            'curr_value': curr_value
        }
        print(output)
        return output


def getComparisonData_p1(bu, product, quarter):
    conn = connect_to_mysql()
    mycursor = conn.cursor()
    final_result = {}

    if quarter != 'YTD':
        quarter_str, year = quarter.split()
        year = int(year)
    if quarter == 'YTD':
        return {}
    elif quarter_str in ['Q1', 'Q2', 'Q3', 'Q4']:
        p1_count = {}
        quarters = ['Q1', 'Q2', 'Q3', 'Q4']
        quarter_str, year = quarter.split()
        year = int(year)

        # Find index of current quarter
        current_index = quarters.index(quarter_str)

        # Calculate previous quarter
        previous_index = (current_index - 1) % 4
        previous_quarter = quarters[previous_index]
        # Adjust year if previous quarter is Q4
        previous_year = year if previous_index != 3 else year - 1

        # Create tuple containing current and previous quarter
        quarters_tuple = (quarter_str + " " + str(year), previous_quarter + " " + str(previous_year))

        for quarter in quarters_tuple:
            quarter, year = quarter.split()
            quarter = str(quarter)
            year = int(year)

            # P1 Count
            if bu not in [None, 'All'] and product == 'All':
                query = "SELECT COUNT(id) AS incidents FROM incidents WHERE year={} AND quarter ='{}' AND ('{}' IN (affected_bu) OR bu='{}') AND (major_incident_type LIKE '%P1%')".format(year, quarter, bu, bu)
            elif bu in [None, 'All'] and product == 'All':
                query = "SELECT COUNT(id) AS incidents FROM incidents WHERE year={} AND quarter = '{}' AND (major_incident_type LIKE '%P1%')".format(year, quarter)
            elif product != 'All':
                query = "SELECT COUNT(id) AS incidents FROM incidents WHERE year={} AND quarter= '{}' AND (msf_products_affected LIKE '%{}%' OR module='{}') AND (major_incident_type LIKE '%P1%' )".format(year, quarter, product, product)
            mycursor.execute(query)
            result = mycursor.fetchall()  # Consume or clear the result set
            if result:
                p1_count[quarter] = result[0][0]
            else:
                p1_count[quarter] = 0
            final_result['p1_count'] = p1_count

        # Calculate percentage change in P1 counts
        prev_value = p1_count[previous_quarter]
        curr_value = p1_count[quarter_str]
        if prev_value != 0:
            outagesDrop = round(((curr_value - prev_value) / prev_value) * 100, 2)
        else:
            outagesDrop = curr_value*100

        # Construct output dictionary
        output = {
            'pdDrop': outagesDrop,
            'prev_value': prev_value,
            'curr_value': curr_value
        }
        print(output)
        return output

def getComparisonData_mttd(bu, product, quarter):
    conn = connect_to_mysql()
    mycursor = conn.cursor()
    final_result = {}

    if quarter != 'YTD':
        quarter_str, year = quarter.split()
        year = int(year)
    if quarter == 'YTD':
        return {"percent": 0, "prev_value": 0, "curr_value": 0}
    print(quarter_str)
    # Find current and previous quarters
    quarters = ['Q1', 'Q2', 'Q3', 'Q4']
    current_index = quarters.index(quarter_str)
    prev_quarter_index = (current_index - 1) % 4
    current_quarter = quarter_str + " " + str(year)
    prev_quarter = quarters[prev_quarter_index] + " " + str(
        year if prev_quarter_index != 3 else year - 1)

    # Get MTTD for current quarter
    query = ""
    if bu not in [None, 'All'] and product == 'All':
        query = "SELECT AVG(time_to_detect_in_minutes) FROM incidents WHERE year={} AND quarter ='{}' AND ('{}' IN (affected_bu) OR bu='{}') AND (major_incident_type LIKE '%P1%' OR major_incident_type LIKE '%P0%')".format(
            year, quarter_str, bu, bu)
    elif bu in [None, 'All'] and product == 'All':
        query = "SELECT AVG(time_to_detect_in_minutes) FROM incidents WHERE year={} AND quarter = '{}' AND (major_incident_type LIKE '%P1%' OR major_incident_type LIKE '%P0%')".format(
            year, quarter_str)
    elif product != 'All':
        query = "SELECT AVG(time_to_detect_in_minutes) FROM incidents WHERE year={} AND quarter= '{}' AND (msf_products_affected LIKE '%{}%' OR module='{}') AND (major_incident_type LIKE '%P1%' OR major_incident_type LIKE '%P0%' )".format(
            year, quarter_str, product, product)
    print(query)
    mycursor.execute(query)
    result = mycursor.fetchall()
    current_mttd = result[0][0] if result else 0

    # Get MTTD for previous quarter
    query = ""
    if bu not in [None, 'All'] and product == 'All':
        query = "SELECT AVG(time_to_detect_in_minutes) FROM incidents WHERE year={} AND quarter ='{}' AND ('{}' IN (affected_bu) OR bu='{}') AND (major_incident_type LIKE '%P1%' OR major_incident_type LIKE '%P0%')".format(
            prev_quarter.split()[1], prev_quarter.split()[0], bu, bu)
    elif bu in [None, 'All'] and product == 'All':
        query = "SELECT AVG(time_to_detect_in_minutes) FROM incidents WHERE year={} AND quarter = '{}' AND (major_incident_type LIKE '%P1%' OR major_incident_type LIKE '%P0%')".format(
            prev_quarter.split()[1], prev_quarter.split()[0])
    elif product != 'All':
        query = "SELECT AVG(time_to_detect_in_minutes) FROM incidents WHERE year={} AND quarter= '{}' AND (msf_products_affected LIKE '%{}%' OR module='{}') AND (major_incident_type LIKE '%P1%' OR major_incident_type LIKE '%P0%' )".format(
            prev_quarter.split()[1], prev_quarter.split()[0], product, product)
    mycursor.execute(query)
    result = mycursor.fetchall()
    prev_mttd = result[0][0] if result else 0

    # Calculate percentage change in MTTD
    if prev_mttd != 0:
        percent_change = round(((current_mttd - prev_mttd) / prev_mttd) * 100, 2)
    else:
        percent_change = current_mttd*100
    print({"percent": round(float(percent_change),2), "prev_value": round(float(prev_mttd),2), "curr_value": round(float(current_mttd),2)})
    return {"percent": round(float(percent_change),2), "prev_value": round(float(prev_mttd),2), "curr_value": round(float(current_mttd),2)}


def getComparisonData_mttr_p0(bu, product, quarter):
    conn = connect_to_mysql()
    mycursor = conn.cursor()

    # Initialize current and previous MTTR for P0
    current_mttr_p0 = 0
    prev_mttr_p0 = 0

    # Extract quarter and year from input
    quarter_str, year = quarter.split()
    year = int(year)

    # Calculate previous quarter
    quarters = ['Q1', 'Q2', 'Q3', 'Q4']
    current_index = quarters.index(quarter_str)
    prev_quarter_index = (current_index - 1) % 4
    previous_quarter = quarters[prev_quarter_index]
    previous_year = year if prev_quarter_index != 3 else year - 1

    # Get current quarter MTTR for P0
    query = ""
    if bu not in [None, 'All'] and product == 'All':
        query = "SELECT AVG(time_to_recover_in_minutes) FROM incidents WHERE year={} AND quarter ='{}' AND ('{}' IN (affected_bu) OR bu='{}') AND (major_incident_type LIKE '%P0%') AND issue_category NOT LIKE '%Third Party%'".format(
            year, quarter_str, bu, bu)
    elif bu in [None, 'All'] and product == 'All':
        query = "SELECT AVG(time_to_recover_in_minutes) FROM incidents WHERE year={} AND quarter = '{}' AND (major_incident_type LIKE '%P0%') AND issue_category NOT LIKE '%Third Party%'".format(
            year, quarter_str)
    elif product != 'All':
        query = "SELECT AVG(time_to_recover_in_minutes) FROM incidents WHERE year={} AND quarter= '{}' AND (msf_products_affected LIKE '%{}%' OR module='{}') AND (major_incident_type LIKE '%P0%') AND issue_category NOT LIKE '%Third Party%'".format(
            year, quarter_str, product, product)
    mycursor.execute(query)
    result = mycursor.fetchall()
    current_mttr_p0 = float(result[0][0]) if result and result[0][0] is not None else 0

    # Get previous quarter MTTR for P0
    query = ""
    if bu not in [None, 'All'] and product == 'All':
        query = "SELECT AVG(time_to_recover_in_minutes) FROM incidents WHERE year={} AND quarter ='{}' AND ('{}' IN (affected_bu) OR bu='{}') AND (major_incident_type LIKE '%P0%') AND issue_category NOT LIKE '%Third Party%'".format(
            previous_year, previous_quarter, bu, bu)
    elif bu in [None, 'All'] and product == 'All':
        query = "SELECT AVG(time_to_recover_in_minutes) FROM incidents WHERE year={} AND quarter = '{}' AND (major_incident_type LIKE '%P0%') AND issue_category NOT LIKE '%Third Party%'".format(
            previous_year, previous_quarter)
    elif product != 'All':
        query = "SELECT AVG(time_to_recover_in_minutes) FROM incidents WHERE year={} AND quarter= '{}' AND (msf_products_affected LIKE '%{}%' OR module='{}') AND (major_incident_type LIKE '%P0%') AND issue_category NOT LIKE '%Third Party%'".format(
            previous_year, previous_quarter, product, product)
    mycursor.execute(query)
    result = mycursor.fetchall()
    prev_mttr_p0 = float(result[0][0]) if result and result[0][0] is not None else 0

    # Calculate percentage change in MTTR for P0
    if prev_mttr_p0 != 0:
        percent_change = round(((current_mttr_p0 - prev_mttr_p0) / prev_mttr_p0) * 100, 2)
    else:
        percent_change = current_mttr_p0 * 100
    print({"percent": percent_change, "prev_value": prev_mttr_p0, "curr_value": current_mttr_p0})
    return {"percent": round(float(percent_change), 2), "prev_value": round(float(prev_mttr_p0), 2), "curr_value": round(float(current_mttr_p0), 2)}

def getComparisonData_mttr_p1(bu, product, quarter):
    conn = connect_to_mysql()
    mycursor = conn.cursor()
    final_result = {}

    if quarter != 'YTD':
        quarter_str, year = quarter.split()
        year = int(year)
    if quarter == 'YTD':
        return {"percent": 0, "prev_value": 0, "curr_value": 0}

    # Find current and previous quarters
    quarters = ['Q1', 'Q2', 'Q3', 'Q4']
    current_index = quarters.index(quarter_str)
    prev_quarter_index = (current_index - 1) % 4
    current_quarter = quarter_str + " " + str(year)
    prev_quarter = quarters[prev_quarter_index] + " " + str(
        year if prev_quarter_index != 3 else year - 1)

    # Get MTTR for P1 for current quarter
    query = ""
    if bu not in [None, 'All'] and product == 'All':
        query = "SELECT AVG(time_to_recover_in_minutes) FROM incidents WHERE year={} AND quarter ='{}' AND ('{}' IN (affected_bu) OR bu='{}') AND (major_incident_type LIKE '%P1%') AND issue_category NOT LIKE '%Third Party%'".format(
            year, quarter_str, bu, bu)
    elif bu in [None, 'All'] and product == 'All':
        query = "SELECT AVG(time_to_recover_in_minutes) FROM incidents WHERE year={} AND quarter = '{}' AND (major_incident_type LIKE '%P1%') AND issue_category NOT LIKE '%Third Party%'".format(
            year, quarter_str)
    elif product != 'All':
        query = "SELECT AVG(time_to_recover_in_minutes) FROM incidents WHERE year={} AND quarter= '{}' AND (msf_products_affected LIKE '%{}%' OR module='{}') AND (major_incident_type LIKE '%P1%') AND issue_category NOT LIKE '%Third Party%'".format(
            year, quarter_str, product, product)
    mycursor.execute(query)
    result = mycursor.fetchall()
    current_mttr_p1 = result[0][0] if result else 0

    # Get MTTR for P1 for previous quarter
    query = ""
    if bu not in [None, 'All'] and product == 'All':
        query = "SELECT AVG(time_to_recover_in_minutes) FROM incidents WHERE year={} AND quarter ='{}' AND ('{}' IN (affected_bu) OR bu='{}') AND (major_incident_type LIKE '%P1%') AND issue_category NOT LIKE '%Third Party%'".format(
            prev_quarter.split()[1], prev_quarter.split()[0], bu, bu)
    elif bu in [None, 'All'] and product == 'All':
        query = "SELECT AVG(time_to_recover_in_minutes) FROM incidents WHERE year={} AND quarter = '{}' AND (major_incident_type LIKE '%P1%') AND issue_category NOT LIKE '%Third Party%'".format(
            prev_quarter.split()[1], prev_quarter.split()[0])
    elif product != 'All':
        query = "SELECT AVG(time_to_recover_in_minutes) FROM incidents WHERE year={} AND quarter= '{}' AND (msf_products_affected LIKE '%{}%' OR module='{}') AND (major_incident_type LIKE '%P1%') AND issue_category NOT LIKE '%Third Party%'".format(
            prev_quarter.split()[1], prev_quarter.split()[0], product, product)
    mycursor.execute(query)
    result = mycursor.fetchall()
    prev_mttr_p1 = result[0][0] if result else 0

    # Calculate percentage change in MTTR for P1
    if prev_mttr_p1 != 0:
        percent_change = round(((current_mttr_p1 - prev_mttr_p1) / prev_mttr_p1) * 100, 2)
    else:
        percent_change = current_mttr_p1*100
    print({"percent": percent_change, "prev_value": prev_mttr_p1, "curr_value": current_mttr_p1})
    return {"percent": round(float(percent_change),2), "prev_value": round(float(prev_mttr_p1),2), "curr_value": round(float(current_mttr_p1),2)}


def buincidentstrend(bu, product, quarter):
    # Assuming you have defined the connect_to_mysql function elsewhere
    conn = connect_to_mysql()
    mycursor = conn.cursor()
    final_result2={}

    if quarter!='YTD':
        quarter_str,year=quarter.split()
        year=int(year)
    if quarter == 'YTD':
        current_date = datetime.now()
        year = int(datetime.now().year)
        current_month = current_date.month
        current_quarter = (current_month - 1) // 3 + 1
        quarter_labels = {1: "Q1", 2: "Q2", 3: "Q3", 4: "Q4"}
        quarter1 = tuple(quarter_labels[q] for q in range(1, current_quarter + 1))
        #P0 COUNT

        if quarter1:
            query = "select bu,count(id) as incidents from incidents where year={} and quarter IN {} and (major_incident_type like '%P0%' or major_incident_type like '%P1%') and alert_generated_by = 'Customer' group by bu;".format(year, quarter1)
        mycursor.execute(query)
        result = mycursor.fetchall()
        p0_cust_count={}
        if result==[]:
            p0_cust_count={}
        else:
            for bu,value in result:
                if bu is not None:
                    if value is not None:
                        p0_cust_count[bu]=value
                    else:
                        p0_cust_count[bu]=0
        final_result2['p0_cust_count']=p0_cust_count

        #P1 COUNT
        if quarter1:
            query = "select bu,count(id) as incidents from incidents where year={} and quarter IN {} and (major_incident_type like '%P0%' or major_incident_type like '%P1%') group by bu;".format(year, quarter1)
        mycursor.execute(query)
        result = mycursor.fetchall()
        p0_non_cust_count={}
        if result==[]:
            p0_non_cust_count={}
        else:
            for bu,value in result:
                if bu is not None:
                    if value is not None :
                        p0_non_cust_count[bu]=value
                    else:
                        p0_non_cust_count[bu]=0
        final_result2['p0_non_cust_count']=p0_non_cust_count
        allowed_cust_incidents = {}
        for bu, count in final_result2['p0_non_cust_count'].items():
            allowed_count = round(0.2 * count)
            allowed_cust_incidents[bu] = allowed_count

        final_result2['allowed_cust_incidents'] = allowed_cust_incidents

        # Add zero values for BUs present in p0_non_cust_count but not in p0_cust_count
        for bu in final_result2['p0_non_cust_count']:
            if bu not in final_result2['p0_cust_count']:
                final_result2['p0_cust_count'][bu] = 0

        # Check if p0_cust_count <= allowed_cust_incidents for each business unit and set status accordingly
        status = {}
        for bu, count in final_result2['p0_cust_count'].items():
            if count <= final_result2['allowed_cust_incidents'][bu]:
                status[bu] = 'yes'
            else:
                status[bu] = 'no'

        final_result2['status'] = status
        sorted_final_result2 = {
            'p0_cust_count': {bu: final_result2['p0_cust_count'][bu] for bu in sorted(final_result2['p0_cust_count'])},
            'p0_non_cust_count': {bu: final_result2['p0_non_cust_count'][bu] for bu in sorted(final_result2['p0_non_cust_count'])},
            'allowed_cust_incidents': {bu: final_result2['allowed_cust_incidents'][bu] for bu in sorted(final_result2['allowed_cust_incidents'])},
            'status': {bu: final_result2['status'][bu] for bu in sorted(final_result2['status'])}
        }
        print(sorted_final_result2)
        return sorted_final_result2
    elif quarter_str in ['Q1', 'Q2', 'Q3', 'Q4']:
        if quarter_str:
            query = "select bu,count(id) as incidents from incidents where year={} and quarter='{}' and (major_incident_type like '%P0%' or major_incident_type like '%P1%') and alert_generated_by = 'Customer' group by bu;".format(year, quarter_str)
        mycursor.execute(query)
        result = mycursor.fetchall()
        p0_cust_count={}
        if result==[]:
            p0_cust_count={}
        else:
            for bu,value in result:
                if bu is not None:
                    if value is not None:
                        p0_cust_count[bu]=value
                    else:
                        p0_cust_count[bu]=0
        final_result2['p0_cust_count']=p0_cust_count

        #P1 COUNT
        if quarter_str:
            query = "select bu,count(id) as incidents from incidents where year={} and quarter='{}' and (major_incident_type like '%P0%' or major_incident_type like '%P1%') group by bu;".format(year, quarter_str)
        mycursor.execute(query)
        result = mycursor.fetchall()
        p0_non_cust_count={}
        if result==[]:
            p0_non_cust_count={}
        else:
            for bu,value in result:
                if bu is not None:
                    if value is not None :
                        p0_non_cust_count[bu]=value
                    else:
                        p0_non_cust_count[bu]=0
        final_result2['p0_non_cust_count']=p0_non_cust_count
        allowed_cust_incidents = {}
        for bu, count in final_result2['p0_non_cust_count'].items():
            allowed_count = round(0.2 * count)
            allowed_cust_incidents[bu] = allowed_count

        final_result2['allowed_cust_incidents'] = allowed_cust_incidents

        # Add zero values for BUs present in p0_non_cust_count but not in p0_cust_count
        for bu in final_result2['p0_non_cust_count']:
            if bu not in final_result2['p0_cust_count']:
                final_result2['p0_cust_count'][bu] = 0

        # Check if p0_cust_count <= allowed_cust_incidents for each business unit and set status accordingly
        status = {}
        for bu, count in final_result2['p0_cust_count'].items():
            if count <= final_result2['allowed_cust_incidents'][bu]:
                status[bu] = 'yes'
            else:
                status[bu] = 'no'

        final_result2['status'] = status
        sorted_final_result2 = {
            'p0_cust_count': {bu: final_result2['p0_cust_count'][bu] for bu in sorted(final_result2['p0_cust_count'])},
            'p0_non_cust_count': {bu: final_result2['p0_non_cust_count'][bu] for bu in sorted(final_result2['p0_non_cust_count'])},
            'allowed_cust_incidents': {bu: final_result2['allowed_cust_incidents'][bu] for bu in sorted(final_result2['allowed_cust_incidents'])},
            'status': {bu: final_result2['status'][bu] for bu in sorted(final_result2['status'])}
        }
        print(sorted_final_result2)
        return sorted_final_result2

def yoyincidents(bu, product, quarter):
    current_date = datetime.now()
    conn = connect_to_mysql()
    mycursor = conn.cursor()
    year = int(datetime.now().year)
    prev_year = year - 1

    # Calculate total incidents for the previous year
    if prev_year == 2023:
        total_incidents_last_year = 56
    else:
        total_incidents_last_year_query = "SELECT COUNT(id) AS incidents FROM incidents WHERE year = {} AND major_incident_type LIKE '%P0%' GROUP BY year;".format(prev_year)
        mycursor.execute(total_incidents_last_year_query)
        total_incidents_last_year_result = mycursor.fetchone()
        total_incidents_last_year = total_incidents_last_year_result[0] if total_incidents_last_year_result else 0

    # Calculate total incidents for the current year
    total_incidents_this_year_query = "SELECT COUNT(id) AS incidents FROM incidents WHERE year = {} AND major_incident_type LIKE '%P0%' GROUP BY year;".format(year)
    mycursor.execute(total_incidents_this_year_query)
    total_incidents_this_year_result = mycursor.fetchone()
    total_incidents_this_year = total_incidents_this_year_result[0] if total_incidents_this_year_result else 0

    # Calculate target
    target = 0 if total_incidents_last_year == 0 else total_incidents_last_year * 0.5

    # Output dictionary
    output = {
        "sla_outages": total_incidents_last_year,
        "current_value": 0,
        "curr_yr_outages_count": total_incidents_this_year,
        "curr_yr_p1_count": 0,
        "prev_yr_outages_count": target,
        "prev_yr_p1_count": 0
    }

    print(output)
    return output

def buincidentstrend_v2(bu, product, quarter):
    # Assuming you have defined the connect_to_mysql function elsewhere
    conn = connect_to_mysql()
    mycursor = conn.cursor()
    final_result2={}

    if quarter!='YTD':
        quarter_str,year=quarter.split()
        year=int(year)
    if quarter == 'YTD':
        current_date = datetime.now()
        year = int(datetime.now().year)
        current_month = current_date.month
        current_quarter = (current_month - 1) // 3 + 1
        quarter_labels = {1: "Q1", 2: "Q2", 3: "Q3", 4: "Q4"}
        quarter1 = tuple(quarter_labels[q] for q in range(1, current_quarter + 1))
        #P0 COUNT

        if quarter1:
            query = "select bu,count(id) as incidents from incidents where year={} and quarter IN {} and (major_incident_type like '%P0%' or major_incident_type like '%P1%') and alert_generated_by = 'Customer' group by bu;".format(year, quarter1)
        mycursor.execute(query)
        result = mycursor.fetchall()
        p0_cust_count={}
        if result==[]:
            p0_cust_count={}
        else:
            for bu,value in result:
                if bu is not None:
                    if value is not None:
                        p0_cust_count[bu]=value
                    else:
                        p0_cust_count[bu]=0
        final_result2['p0_cust_count']=p0_cust_count

        #P1 COUNT
        if quarter1:
            query = "select bu,count(id) as incidents from incidents where year={} and quarter IN {} and (major_incident_type like '%P0%' or major_incident_type like '%P1%') group by bu;".format(year, quarter1)
        mycursor.execute(query)
        result = mycursor.fetchall()
        p0_non_cust_count={}
        if result==[]:
            p0_non_cust_count={}
        else:
            for bu,value in result:
                if bu is not None:
                    if value is not None :
                        p0_non_cust_count[bu]=value
                    else:
                        p0_non_cust_count[bu]=0
        final_result2['p0_non_cust_count']=p0_non_cust_count
        allowed_cust_incidents = {}
        for bu, count in final_result2['p0_non_cust_count'].items():
            allowed_count = round(0.2 * count)
            allowed_cust_incidents[bu] = allowed_count

        final_result2['allowed_cust_incidents'] = allowed_cust_incidents

        # Add zero values for BUs present in p0_non_cust_count but not in p0_cust_count
        for bu in final_result2['p0_non_cust_count']:
            if bu not in final_result2['p0_cust_count']:
                final_result2['p0_cust_count'][bu] = 0

        # Check if p0_cust_count <= allowed_cust_incidents for each business unit and set status accordingly
        status = {}
        for bu, count in final_result2['p0_cust_count'].items():
            if count <= final_result2['allowed_cust_incidents'][bu]:
                status[bu] = 'yes'
            else:
                status[bu] = 'no'

        final_result2['status'] = status
        sorted_final_result2 = []

        for bu in list(final_result2['p0_cust_count'].keys()):
            sorted_final_result2.append({'bu':bu,'p0_cust_count':final_result2['p0_cust_count'][bu],'p0_non_cust_count':final_result2['p0_non_cust_count'][bu],
        'allowed_cust_incidents': final_result2['allowed_cust_incidents'][bu], 'status': final_result2['status'][bu] })

        print(sorted_final_result2)
        return sorted_final_result2
    elif quarter_str in ['Q1', 'Q2', 'Q3', 'Q4']:
        if quarter_str:
            query = "select bu,count(id) as incidents from incidents where year={} and quarter='{}' and (major_incident_type like '%P0%' or major_incident_type like '%P1%') and alert_generated_by = 'Customer' group by bu;".format(year, quarter_str)
        mycursor.execute(query)
        result = mycursor.fetchall()
        p0_cust_count={}
        if result==[]:
            p0_cust_count={}
        else:
            for bu,value in result:
                if bu is not None:
                    if value is not None:
                        p0_cust_count[bu]=value
                    else:
                        p0_cust_count[bu]=0
        final_result2['p0_cust_count']=p0_cust_count

        #P1 COUNT
        if quarter_str:
            query = "select bu,count(id) as incidents from incidents where year={} and quarter='{}' and (major_incident_type like '%P0%' or major_incident_type like '%P1%') group by bu;".format(year, quarter_str)
        mycursor.execute(query)
        result = mycursor.fetchall()
        p0_non_cust_count={}
        if result==[]:
            p0_non_cust_count={}
        else:
            for bu,value in result:
                if bu is not None:
                    if value is not None :
                        p0_non_cust_count[bu]=value
                    else:
                        p0_non_cust_count[bu]=0
        final_result2['p0_non_cust_count']=p0_non_cust_count
        allowed_cust_incidents = {}
        for bu, count in final_result2['p0_non_cust_count'].items():
            allowed_count = round(0.2 * count)
            allowed_cust_incidents[bu] = allowed_count

        final_result2['allowed_cust_incidents'] = allowed_cust_incidents

        # Add zero values for BUs present in p0_non_cust_count but not in p0_cust_count
        for bu in final_result2['p0_non_cust_count']:
            if bu not in final_result2['p0_cust_count']:
                final_result2['p0_cust_count'][bu] = 0

        # Check if p0_cust_count <= allowed_cust_incidents for each business unit and set status accordingly
        status = {}
        for bu, count in final_result2['p0_cust_count'].items():
            if count <= final_result2['allowed_cust_incidents'][bu]:
                status[bu] = 'yes'
            else:
                status[bu] = 'no'

        final_result2['status'] = status

        sorted_final_result2 = []

        for bu in list(final_result2['p0_cust_count'].keys()):
            sorted_final_result2.append({'bu':bu,'p0_cust_count':final_result2['p0_cust_count'][bu],'p0_non_cust_count':final_result2['p0_non_cust_count'][bu],
        'allowed_cust_incidents': final_result2['allowed_cust_incidents'][bu], 'status': final_result2['status'][bu] })

        print(sorted_final_result2)
        return sorted_final_result2

#buincidentstrend_v2('CX','All','Q2 2024')