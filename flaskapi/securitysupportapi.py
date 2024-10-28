from mysql.connector import connection
import mysql.connector
import mysql.connector.pooling
import json,calendar
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
conn_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name = "mypool", pool_size = int(os.environ.get("pool_count")), **dbconfig)

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

def getSlaTrendsMain(bu,product,from_date,to_date):
    if bu=='All' and product=='All':
        result = executeCursor("select distinct DATE(b.start_date),(select count(sla) from SecurityBugs where sla in ('Compliant','On Track','Not Applicable') and DATE(start_date)=DATE(b.start_date)),0,(select count(sla) from SecurityBugs where sla in ('Breached','Past Duedate') and DATE(start_date)=DATE(b.start_date)) from SecurityBugs b where start_date>='{}' and start_date<'{}' group by 1 order by 1;".format(from_date,to_date))
    elif bu!='All'and product=='All':
        result = executeCursor("select distinct DATE(b.start_date),(select count(sla) from SecurityBugs where sla in ('Compliant','On Track','Not Applicable') and DATE(start_date)=DATE(b.start_date)),0,(select count(sla) from SecurityBugs where sla in ('Breached','Past Duedate') and DATE(start_date)=DATE(b.start_date)) from SecurityBugs b where bu='{}' and start_date>='{}' and start_date<'{}' group by 1 order by 1;".format(bu,from_date,to_date))
    elif product!='All':
        result = executeCursor("select distinct DATE(b.start_date),(select count(sla) from SecurityBugs where sla in ('Compliant','On Track','Not Applicable') and DATE(start_date)=DATE(b.start_date)),0,(select count(sla) from SecurityBugs where sla in ('Breached','Past Duedate') and DATE(start_date)=DATE(b.start_date)) from SecurityBugs b where productMapped='{}' and start_date>='{}' and start_date<'{}' group by 1 order by 1;".format(product,from_date,to_date))
    lst = [{'date':i[0],'in_sla':i[1],'sla_approaching':i[2],'sla_missed':i[3]} for i in result]
    return lst


def get_security_status(bu, product, from_date, to_date):
    result = {"in_sla":0,"sla_approaching":0,'sla_missed':0}
    for i in ['in_sla','sla_missed']:
        if i=='in_sla':
            sla=('Compliant','Not Applicable','On Track')
        elif i=='sla_missed':
            sla=('Breached','Past Duedate')
        if bu not in [None, 'All'] and product == 'All':
            print("select count(*) from SecurityBugs where bu='{}' and start_date between '{}' and '{}' and sla in {};".format(bu,from_date,to_date,sla))
            sla_count = executeCursor("select count(*) from SecurityBugs where bu='{}' and sla in {} and start_date between '{}' and '{}' ;".format(bu,sla,from_date,to_date))[0][0]
        elif bu in [None, 'All'] and product == "All":
            #print("select BU,(select count(sla_status) from KPI_calculated_daily where date in {} and sla_status='{}' and product in BU_table.BU) from BU_table group by 1 order by 2 desc;".format(dates,status)))
            sla_count = executeCursor("select count(*) from SecurityBugs where sla in {} and start_date between '{}' and '{}' ;".format(sla,from_date,to_date))[0][0]
        else:
            sla_count = executeCursor("select count(*) from SecurityBugs where productMapped = '{}' and sla in {} and start_date between '{}' and '{}' ;".format(product,sla,from_date,to_date))[0][0]
        result[i]=sla_count
    return result
    
    
def getSecuritySlaStatus(bu,project,from_date,to_date):
    # dct={'sla_missed':0,'sla_approaching':0,'in_sla':0}
    # dct1={'sla_missed':('Breached','Compliant','Past Duedate'),'in_sla':('On Track','Not Applicable')}
    # for i in dct1:
    #     dct1[i]=executeCursor("select distinct bu,count(sla) from SecurityBugs where sla in {} and start_date between '{}' and '{}' group by bu;")
    
    if bu=='All':
        dct = {'sla_missed':{},'sla_approaching':{'CX':0,'CRM':0,'IT':0,'Cloud engineering':0,'Platform':0,'Others':0},'in_sla':{}}
        for i in [('Breached','Past Duedate'),('Complaint','On Track','Not Applicable')]:
            BuAndSla = {'CX':0,'CRM':0,'IT':0,'Cloud engineering':0,'Platform':0,'Others':0}
            result = executeCursor("select distinct bu,count(sla) from SecurityBugs where sla in {} and start_date between '{}' and '{}' group by bu order by 2 desc;".format(i,from_date,to_date))
            for j in result:
                BuAndSla[j[0]]=j[1]
            if 'Breached' in i:
                dct['sla_missed']=BuAndSla 
            if 'On Track' in i:
                dct['in_sla']=BuAndSla
        return dct
    elif bu!='All':
        dct={'sla_missed':{},'sla_approaching':{},'in_sla':{}}
        for i in [('Breached','Past Duedate'),('Compliant','On Track','Not Applicable'),()]:
            Projects=executeCursor("select distinct project,0 from SecurityBugs where bu='{}';".format(bu))
            Projs={}
            for j in Projects:
                Projs[j[0]]=j[1]
            if i==():
                dct['sla_approaching']=Projs
                break
            print("select distinct project,count(sla) from SecurityBugs where sla in {} and bu='{}' and start_date between '{}' and '{}' group by project order by 2 desc;".format(i,bu,from_date,to_date))
            result = executeCursor("select distinct project,count(sla) from SecurityBugs where sla in {} and bu='{}' and start_date between '{}' and '{}' group by project order by 2 desc;".format(i,bu,from_date,to_date))
            for j in result:
                Projs[j[0]]=j[1]
            if 'Breached' in i:
                dct['sla_missed']=Projs
            if 'On Track' in i:
                dct['in_sla']=Projs
        return dct
        # executeCursor("select project,count(sla) from KPI_calculated_daily where sla_status='{}' and product in (select Product from BU_table where BU='{}') and date in {} group by 1;".format(i,bu,dates))
        # result = mycursor.fetchall()
        # for j in result:
        #     Products[j[0]]=j[1]
    

def getSlaResult(bu,project,from_date,to_date,sla):
    if bu not in [None, 'All'] and project == 'All':
        result = executeCursor("select priority,count(sla) from SecurityBugs where  sla='{}' and bu='{}' and start_date between '{}' and '{}' group by priority; ".format(sla,bu,from_date,to_date))
    elif project == 'All' and bu in [None, 'All']:
        result = executeCursor("select priority,count(sla) from SecurityBugs where  sla='{}' and start_date between '{}' and '{}' group by priority; ".format(sla,from_date,to_date))
    else:
        result = executeCursor("select priority,count(sla) from SecurityBugs where  sla='{}' and project='{}' and start_date between '{}' and '{}' group by priority; ".format(sla,project,from_date,to_date))
    #result = executeCursor("select priority,count(sla) from SecurityBugs where sla='Breached' where bu='{}' group by priority ;")
    dct={'P0':0, 'P1':0, 'P2':0, 'P3':0}
    total=0;
    for i in result:
        dct[i[0]]=i[1]
        total+=i[1]
    lst=[]
    for i in dct:
        if total!=0:
            lst.append({'priority':i,'count':dct[i],'percent':round((dct[i]/total)*100,2)})
        else:
            lst.append({'priority':i,'count':dct[i],'percent':(-100*dct[i])})
    return lst

def getBuLevelData(bu,from_date,to_date):
    result = executeCursor("select bu,count(bu) from SecurityBugs where  resolved='False' and  start_date between '{}' and '{}' group by bu order by 2 desc;".format(from_date,to_date))
    dct={}
    for i in result:
        dct[i[0]]=i[1]
    return dct
    

def getProjectWiseTicketCount(bu,project,from_date,to_date):
    if bu not in [None, 'All'] and project == 'All':
        result = executeCursor("select project,count(project) from SecurityBugs where  resolved='False' and bu='{}' and  start_date between '{}' and '{}' group by project order by 2 desc; ".format(bu,from_date,to_date))
    elif project == 'All' and bu in [None, 'All']:
        result = executeCursor("select project,count(project) from SecurityBugs where resolved='False' and start_date between '{}' and '{}' group by project order by 2 desc; ".format(from_date,to_date))
    else:
        result = executeCursor("select project,count(project) from SecurityBugs where resolved='False' and project='{}' and start_date between '{}' and '{}' group by project order by 2 desc; ".format(project,from_date,to_date))
    #result = executeCursor("select project,count(project) from SecurityBugs group by project ;")
    dct={}
    for i in result:
        dct[i[0]]=i[1]
    return dct

def getbyPriority(bu,project,from_date,to_date):
    if bu not in [None, 'All'] and project == 'All':
        result = executeCursor("select priority,count(sla) from SecurityBugs where  resolved='False' and bu='{}' and  start_date between '{}' and '{}' group by priority; ".format(bu,from_date,to_date))
    elif project == 'All' and bu in [None, 'All']:
        result = executeCursor("select priority,count(sla) from SecurityBugs where resolved='False' and start_date between '{}' and '{}' group by priority; ".format(from_date,to_date))
    else:
        result = executeCursor("select priority,count(sla) from SecurityBugs where resolved='False' and project='{}' and start_date between '{}' and '{}' group by priority; ".format(project,from_date,to_date))
    # result = executeCursor("select priority,count(priority) from SecurityBugs group by priority ;")
    dct={'P0':0, 'P1':0, 'P2':0, 'P3':0}
    for i in result:
        print(i)
        if i[0]=="" :
            dct["Unknown"]=i[1]
        else:
            dct[i[0]]=i[1]
    lst=[{'priority':i,'count':dct[i]} for i in dct]
    return lst

def getSourceCount(bu,project,from_date,to_date):
    if bu not in [None, 'All'] and project == 'All':
        result = executeCursor("select source,count(source) from SecurityBugs where resolved='False' and bu='{}' and start_date between '{}' and '{}' group by source; ".format(bu,from_date,to_date))
    elif project == 'All' and bu in [None, 'All']:
        result = executeCursor("select source,count(source) from SecurityBugs where resolved='False' and start_date between '{}' and '{}' group by source; ".format(from_date,to_date))
    else:
        result = executeCursor("select source,count(source) from SecurityBugs where resolved='False' and project='{}' and start_date between '{}' and '{}' group by source; ".format(project,from_date,to_date))
    #result = executeCursor("select priority,count(sla) from SecurityBugs where sla='Breached' where bu='{}' group by priority ;")
    dct={'Vulnerable Dependency':0, 'Pen-Testing':0, 'Other Automation':0, 'SAST (Coverity)':0, 'DockerInspect':0}
    total=0;
    for i in result:
        dct[i[0]]=i[1]
        total+=i[1]
    lst=[]
    for i in dct:
        if total!=0:
            lst.append({'source':i,'count':dct[i],'percent':round((dct[i]/total)*100,2)})
        else:
            lst.append({'source':i,'count':dct[i],'percent':(-100*dct[i])})
    return lst

def getTopVulnerability(bu,project,from_date,to_date):
    dct={'P0':[], 'P1':[], 'P2':[], 'P3':[]}
    for i in dct:
        if bu not in [None, 'All'] and project == 'All':
            result = executeCursor("select vulnerabilityType,count(vulnerabilityType)  from SecurityBugs where  resolved='False' and bu='{}' and  start_date between '{}' and '{}' and vulnerabilityType not in ('None','','Others') and priority='{}' group by vulnerabilityType order by 2 desc limit 5; ".format(bu,from_date,to_date,i))
        elif project == 'All' and bu in [None, 'All']:
            result = executeCursor("select vulnerabilityType,count(vulnerabilityType)  from SecurityBugs where resolved='False' and start_date between '{}' and '{}' and vulnerabilityType not in ('None','','Others') and priority='{}' group by vulnerabilityType order by 2 desc limit 5;".format(from_date,to_date,i))
        else:
            result = executeCursor("select vulnerabilityType,count(vulnerabilityType)  from SecurityBugs where resolved='False' and project='{}' and start_date between '{}' and '{}' and vulnerabilityType not in ('None','','Others') and priority='{}' group by vulnerabilityType order by 2 desc limit 5; ".format(project,from_date,to_date,i))
    
        # result = executeCursor("select vulnerabilityType,count(*) from SecurityBugs where vulnerabilityType not in ('None','','Others') and priority='{}' group by vulnerabilityType order by 2 desc limit 5;".format(i))
        dct[i]=[{j[0]:j[1]} for j in result]
    return dct

def getAllSlaCounts(bu,project,from_date,to_date):
    def getCount(sla,bu,project,from_date,to_date):
        if bu not in [None, 'All'] and project == 'All':
            result = executeCursor("select count(sla) from SecurityBugs where sla='{}' and bu='{}' and start_date between '{}' and '{}' ".format(sla,bu,from_date,to_date))
        elif project == 'All' and bu in [None, 'All']:
            result = executeCursor("select count(sla) from SecurityBugs where sla='{}' and start_date between '{}' and '{}';".format(sla,from_date,to_date))
        else:
            result = executeCursor("select count(sla) from SecurityBugs where  sla='{}' and project='{}' and start_date between '{}' and '{}';".format(sla,project,from_date,to_date))
        if result is not None:return result[0][0]
        else:return 0
    def getUnResolved(bu,project,from_date,to_date):
        if bu not in [None, 'All'] and project == 'All':
            result = executeCursor("select count(resolved) from SecurityBugs where resolved='False' and bu='{}' and start_date between '{}' and '{}' ".format(bu,from_date,to_date))
        elif project == 'All' and bu in [None, 'All']:
            result = executeCursor("select count(resolved) from SecurityBugs where resolved='False' and start_date between '{}' and '{}';".format(from_date,to_date))
        else:
            result = executeCursor("select count(resolved) from SecurityBugs where resolved='False' and project='{}' and start_date between '{}' and '{}';".format(project,from_date,to_date))
        if result is not None:return result[0][0]
        else:return 0
    return {'Unresolved':getUnResolved(bu,project,from_date,to_date),'On Track':getCount('On Track',bu,project,from_date,to_date),"Past Duedate":getCount('Past Duedate',bu,project,from_date,to_date),"Unknown":getCount('Unknown',bu,project,from_date,to_date),"Risk Accepted":getCount('Not Applicable',bu,project,from_date,to_date)}
        
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




