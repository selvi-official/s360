import mysql.connector
import mysql.connector.pooling
import json , calendar
from datetime import *
from dateutil.relativedelta import *
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


def executeCursor(query):
    conn = conn_pool.get_connection()
    mycursor = conn.cursor()
    mycursor.execute(query)
    result = mycursor.fetchall()
    mycursor.close()
    conn.close()
    return result


def getIndex():
    return "<h1>Welcome to Service360 Dashboard</h1>"


def getSecuritySlaStatus(bu , project , from_date , to_date):
    # dct={'sla_missed':0,'sla_approaching':0,'in_sla':0}
    # dct1={'sla_missed':('Breached','Compliant','Past Duedate'),'in_sla':('On Track','Not Applicable')}
    # for i in dct1:
    #     dct1[i]=executeCursor("select distinct bu,count(sla) from SecurityBugs where sla in {} and start_date between '{}' and '{}' group by bu;")
    dct = {'sla_missed': {} ,
           'sla_approaching': {'CX': 0 , 'CRM': 0 , 'IT': 0 , 'Cloud engineering': 0 , 'Platform': 0 , 'Others': 0} ,
           'in_sla': {}}
    for i in [('Breached' , 'Compliant' , 'Past Duedate') , ('On Track' , 'Not Applicable')]:
        BuAndSla = {'CX': 0 , 'CRM': 0 , 'IT': 0 , 'Cloud engineering': 0 , 'Platform': 0 , 'Others': 0}
        result = executeCursor(
            "select distinct bu,count(sla) from SecurityBugs where sla in {} and start_date between '{}' and '{}' group by bu;".format(
                i , from_date , to_date))
        for j in result:
            BuAndSla[j[0]] = j[1]
        if 'Breached' in i:
            dct['sla_missed'] = BuAndSla
        if 'On Track' in i:
            dct['in_sla'] = BuAndSla
    return dct


def getSlaResult(bu , project , from_date , to_date , sla):
    if bu not in [None , 'All'] and project == 'All':
        result = executeCursor(
            "select priority,count(sla) from SecurityBugs where  sla='{}' and bu='{}' and start_date between '{}' and '{}' group by priority; ".format(
                sla , bu , from_date , to_date))
    elif project == 'All' and bu in [None , 'All']:
        result = executeCursor(
            "select priority,count(sla) from SecurityBugs where  sla='{}' and start_date between '{}' and '{}' group by priority; ".format(
                sla , from_date , to_date))
    else:
        result = executeCursor(
            "select priority,count(sla) from SecurityBugs where  sla='{}' and project='{}' and start_date between '{}' and '{}' group by priority; ".format(
                sla , project , from_date , to_date))
    # result = executeCursor("select priority,count(sla) from SecurityBugs where sla='Breached' where bu='{}' group by priority ;")
    dct = {'P0': 0 , 'P1': 0 , 'P2': 0 , 'P3': 0}
    total = 0;
    for i in result:
        dct[i[0]] = i[1]
        total += i[1]
    lst = []
    for i in dct:
        if total != 0:
            lst.append({'priority': i , 'count': dct[i] , 'percent': round((dct[i] / total) * 100 , 2)})
        else:
            lst.append({'priority': i , 'count': dct[i] , 'percent': (-100 * dct[i])})
    return lst


def getBuLevelData(bu , from_date , to_date):
    result = executeCursor(
        "select bu,count(bu) from SecurityBugs where  resolved='False' and  start_date between '{}' and '{}' group by bu;".format(
            from_date , to_date))
    dct = {}
    for i in result:
        dct[i[0]] = i[1]
    return dct


def getProjectWiseTicketCount(bu , project , from_date , to_date):
    if bu not in [None , 'All'] and project == 'All':
        result = executeCursor(
            "select project,count(project) from SecurityBugs where  resolved='False' and bu='{}' and  start_date between '{}' and '{}' group by project order by 2 desc; ".format(
                bu , from_date , to_date))
    elif project == 'All' and bu in [None , 'All']:
        result = executeCursor(
            "select project,count(project) from SecurityBugs where resolved='False' and start_date between '{}' and '{}' group by project order by 2 desc; ".format(
                from_date , to_date))
    else:
        result = executeCursor(
            "select project,count(project) from SecurityBugs where resolved='False' and project='{}' and start_date between '{}' and '{}' group by project order by 2 desc; ".format(
                project , from_date , to_date))
    # result = executeCursor("select project,count(project) from SecurityBugs group by project ;")
    dct = {}
    for i in result:
        dct[i[0]] = i[1]
    return dct


def getbyPriority(bu , project , from_date , to_date):
    if bu not in [None , 'All'] and project == 'All':
        result = executeCursor(
            "select priority,count(sla) from SecurityBugs where  resolved='False' and bu='{}' and  start_date between '{}' and '{}' group by priority; ".format(
                bu , from_date , to_date))
    elif project == 'All' and bu in [None , 'All']:
        result = executeCursor(
            "select priority,count(sla) from SecurityBugs where resolved='False' and start_date between '{}' and '{}' group by priority; ".format(
                from_date , to_date))
    else:
        result = executeCursor(
            "select priority,count(sla) from SecurityBugs where resolved='False' and project='{}' and start_date between '{}' and '{}' group by priority; ".format(
                project , from_date , to_date))
    # result = executeCursor("select priority,count(priority) from SecurityBugs group by priority ;")
    dct = {'P0': 0 , 'P1': 0 , 'P2': 0 , 'P3': 0}
    for i in result:
        dct[i[0]] = i[1]
    lst = [{'priority': i , 'count': dct[i]} for i in dct]
    return lst


def getSourceCount(bu , project , from_date , to_date):
    if bu not in [None , 'All'] and project == 'All':
        result = executeCursor(
            "select source,count(source) from SecurityBugs where resolved='False' and bu='{}' and start_date between '{}' and '{}' group by source; ".format(
                bu , from_date , to_date))
    elif project == 'All' and bu in [None , 'All']:
        result = executeCursor(
            "select source,count(source) from SecurityBugs where resolved='False' and start_date between '{}' and '{}' group by source; ".format(
                from_date , to_date))
    else:
        result = executeCursor(
            "select source,count(source) from SecurityBugs where resolved='False' and project='{}' and start_date between '{}' and '{}' group by source; ".format(
                project , from_date , to_date))
    # result = executeCursor("select priority,count(sla) from SecurityBugs where sla='Breached' where bu='{}' group by priority ;")
    dct = {'Vulnerable Dependency': 0 , 'Pen-Testing': 0 , 'Other Automation': 0 , 'SAST (Coverity)': 0 ,
           'DockerInspect': 0}
    total = 0;
    for i in result:
        dct[i[0]] = i[1]
        total += i[1]
    lst = []
    for i in dct:
        if total != 0:
            lst.append({'source': i , 'count': dct[i] , 'percent': round((dct[i] / total) * 100 , 2)})
        else:
            lst.append({'source': i , 'count': dct[i] , 'percent': (-100 * dct[i])})
    return lst


def getTopVulnerability(bu , project , from_date , to_date):
    dct = {'P0': [] , 'P1': [] , 'P2': [] , 'P3': []}
    for i in dct:
        if bu not in [None , 'All'] and project == 'All':
            result = executeCursor(
                "select vulnerabilityType,count(vulnerabilityType)  from SecurityBugs where  resolved='False' and bu='{}' and  start_date between '{}' and '{}' and vulnerabilityType not in ('None','','Others') and priority='{}' group by vulnerabilityType order by 2 desc limit 5; ".format(
                    bu , from_date , to_date , i))
        elif project == 'All' and bu in [None , 'All']:
            result = executeCursor(
                "select vulnerabilityType,count(vulnerabilityType)  from SecurityBugs where resolved='False' and start_date between '{}' and '{}' and vulnerabilityType not in ('None','','Others') and priority='{}' group by vulnerabilityType order by 2 desc limit 5;".format(
                    from_date , to_date , i))
        else:
            result = executeCursor(
                "select vulnerabilityType,count(vulnerabilityType)  from SecurityBugs where resolved='False' and project='{}' and start_date between '{}' and '{}' and vulnerabilityType not in ('None','','Others') and priority='{}' group by vulnerabilityType order by 2 desc limit 5; ".format(
                    project , from_date , to_date , i))

        # result = executeCursor("select vulnerabilityType,count(*) from SecurityBugs where vulnerabilityType not in ('None','','Others') and priority='{}' group by vulnerabilityType order by 2 desc limit 5;".format(i))
        dct[i] = [{j[0]: j[1]} for j in result]
    return dct


def getAllSlaCounts(bu , project , from_date , to_date):
    def getCount(sla , bu , project , from_date , to_date):
        if bu not in [None , 'All'] and project == 'All':
            result = executeCursor(
                "select count(sla) from SecurityBugs where sla='{}' and bu='{}' and start_date between '{}' and '{}' ".format(
                    sla , bu , from_date , to_date))
        elif project == 'All' and bu in [None , 'All']:
            result = executeCursor(
                "select count(sla) from SecurityBugs where sla='{}' and start_date between '{}' and '{}';".format(sla ,
                                                                                                                  from_date ,
                                                                                                                  to_date))
        else:
            result = executeCursor(
                "select count(sla) from SecurityBugs where  sla='{}' and project='{}' and start_date between '{}' and '{}';".format(
                    sla , project , from_date , to_date))
        if result is not None:
            return result[0][0]
        else:
            return 0

    def getUnResolved(bu , project , from_date , to_date):
        if bu not in [None , 'All'] and project == 'All':
            result = executeCursor(
                "select count(resolved) from SecurityBugs where resolved='False' and bu='{}' and start_date between '{}' and '{}' ".format(
                    bu , from_date , to_date))
        elif project == 'All' and bu in [None , 'All']:
            result = executeCursor(
                "select count(resolved) from SecurityBugs where resolved='False' and start_date between '{}' and '{}';".format(
                    from_date , to_date))
        else:
            result = executeCursor(
                "select count(resolved) from SecurityBugs where resolved='False' and project='{}' and start_date between '{}' and '{}';".format(
                    project , from_date , to_date))
        if result is not None:
            return result[0][0]
        else:
            return 0

    return {'Unresolved': getUnResolved(bu , project , from_date , to_date) ,
            'On Track': getCount('On Track' , bu , project , from_date , to_date) ,
            "Past Duedate": getCount('Past Duedate' , bu , project , from_date , to_date) ,
            "Unknown": getCount('Unknown' , bu , project , from_date , to_date) ,
            "Risk Accepted": getCount('Not Applicable' , bu , project , from_date , to_date)}


def projectSummary(bu , project , from_date , to_date):
    result = []
    if project == 'All' and bu in [None , 'All']:
        result.append(executeCursor(
            "select priority,count(*) from SecurityBugs where defined_status='Resolved' and priority!='' and start_date between '{}' and '{}' and date_diff_end_res > 0 and  date_diff_end_res < 21 group by priority order by priority;".format(
                from_date , to_date)))
        result.append(executeCursor(
            "select priority,count(*) from SecurityBugs where defined_status='Resolved' and priority!='' and start_date between '{}' and '{}' and date_diff_end_res > 20 and  date_diff_end_res < 61 group by priority  order by priority;".format(
                from_date , to_date)))
        result.append(executeCursor(
            "select priority,count(*) from SecurityBugs where defined_status='Resolved' and priority!='' and start_date between '{}' and '{}' and date_diff_end_res > 60 and  date_diff_end_res < 101 group by priority  order by priority;".format(
                from_date , to_date)))
        result.append(executeCursor(
            "select priority,count(*) from SecurityBugs where defined_status='Resolved' and priority!='' and start_date between '{}' and '{}' and date_diff_end_res > 100 group by priority  order by priority;".format(
                from_date , to_date)))
    elif bu not in [None , 'All'] and project == 'All':
        result.append(executeCursor(
            "select priority,count(*) from SecurityBugs where defined_status='Resolved' and bu='{}' and priority!='' and start_date between '{}' and '{}' and date_diff_end_res > 0 and  date_diff_end_res < 21 group by priority order by priority;".format(
                bu , from_date , to_date)))
        result.append(executeCursor(
            "select priority,count(*) from SecurityBugs where defined_status='Resolved'  and bu='{}' and priority!='' and start_date between '{}' and '{}' and date_diff_end_res > 20 and  date_diff_end_res < 61 group by priority  order by priority;".format(
                bu , from_date , to_date)))
        result.append(executeCursor(
            "select priority,count(*) from SecurityBugs where defined_status='Resolved'  and bu='{}' and priority!='' and start_date between '{}' and '{}' and date_diff_end_res > 60 and  date_diff_end_res < 101 group by priority  order by priority;".format(
                bu , from_date , to_date)))
        result.append(executeCursor(
            "select priority,count(*) from SecurityBugs where defined_status='Resolved'  and bu='{}' and priority!='' and start_date between '{}' and '{}' and date_diff_end_res > 100 group by priority  order by priority;".format(
                bu , from_date , to_date)))
    else:
        result.append(executeCursor(
            "select priority,count(*) from SecurityBugs where defined_status='Resolved' and project='{}' and priority!='' and start_date between '{}' and '{}' and  date_diff_end_res > 0 and  date_diff_end_res < 21 group by priority order by priority;".format(
                project , from_date , to_date)))
        result.append(executeCursor(
            "select priority,count(*) from SecurityBugs where defined_status='Resolved'  and project='{}' and priority!='' and start_date between '{}' and '{}' and date_diff_end_res > 20 and  date_diff_end_res < 61 group by priority  order by priority;".format(
                project , from_date , to_date)))
        result.append(executeCursor(
            "select priority,count(*) from SecurityBugs where defined_status='Resolved'  and project='{}' and priority!='' and start_date between '{}' and '{}' and date_diff_end_res > 60 and  date_diff_end_res < 101 group by priority  order by priority;".format(
                project , from_date , to_date)))
        result.append(executeCursor(
            "select priority,count(*) from SecurityBugs where defined_status='Resolved'  and project='{}' and priority!='' and start_date between '{}' and '{}' and date_diff_end_res > 100 group by priority  order by priority;".format(
                project , from_date , to_date)))
    dictionary = {}
    # Iterate over each nested list
    keys = [21 , 60 , 100 , 101]
    dictionary = {}
    for i in range(len(result)):
        inner_dict = dict(result[i])
        dictionary[keys[i]] = {
            'P0': inner_dict.get('P0' , 0) ,
            'P1': inner_dict.get('P1' , 0) ,
            'P2': inner_dict.get('P2' , 0) ,
            'P3': inner_dict.get('P3' , 0)
        }
    return dictionary

