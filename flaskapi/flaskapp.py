from flask import *
from flask_cors import CORS , cross_origin
# from apisupport import *
# from backend_scripts.flask_api import *
# from rel import *
from general_api import *
from reliabilitysupportapi import *
from securitysupportapi import *
from wa_supportapi import *
from s360v2 import *
from okrv2 import *
import os
from dotenv import load_dotenv
from flask_compress import Compress

load_dotenv()
app = Flask(__name__)
cors = CORS(app)
Compress(app)

app.config['COMPRESS_ALGORITHM'] = 'gzip'  # Compression algorithm: gzip (default) or brotli
app.config['COMPRESS_LEVEL'] = 6           # Compression level: 0 (no compression) to 9 (maximum compression)
app.config['COMPRESS_MIN_SIZE'] = 100      # Minimum response size in bytes to trigger compression

Compress(app)


@app.route('/app/')
def index():
    return "<h1>Welcome to Service360 Dashboard</h1>"

@app.route('/app/getBUs', methods=['GET'])
def getBUs():
    return get_BUs()

@app.route('/app/getProducts', methods=['GET'])
def getProducts():
    bu = request.args.get("bu")
    if not bu:
        return jsonify({"error": "Missing BU parameter"}), 400
    
    return get_Products(bu)

@app.route('/app/getAWSAccounts', methods=['GET'])
def getAWSAccounts():
    bu = request.args.get("bu")
    product = request.args.get("product")
    if (not bu or not product):
        return jsonify({"error": "Missing BU or Product parameter"}), 400
    
    return get_AWS_Accounts(bu,product)


@app.route('/app/security/bu_and_projects')
def sendBuAndProjects():
    bu = {'CRM': ['Freshmarketer' , 'Freshsales'] ,
          'CX': ['Freshbots' , 'Freshchat' , 'Freshdesk' , 'Freshcaller' , 'Mobile-CXBU' , 'Freddy AI for CX'] ,
          'IT': ['Freshservice'] ,
          'Platform': ['Central' , 'Channels' , 'Edge' , 'Email' , 'Hypertrail' , 'Fluffy' , 'Freddy Platform' ,
                       'FreshID' , 'FormServ' , 'Freshstatus' , 'Freshsuccess' , 'Freshsurvey' , 'Freshteam' ,
                       'Freshworks Analytics' , 'IRIS' , 'Kairos' , 'LEGO' , 'UCR' , 'Developer Platform' , 'RTS' ,
                       'Search'] ,
          'Cloud engineering': ['CloudSecurity' , 'Freshworks Cloud Platform' , 'Haystack' , 'CloudInfra' , 'NOC' ,
                                'Supreme One'] ,
          'Others': ['Customer Engineering' , 'Data Leaks' , 'Freshinbox' , 'FreshIQ' , 'Freshping' , 'FreshPipe' ,
                     'Freddy-Sales' , 'Security Engineering' , 'SOC']}
    return json.dumps(bu , default=str)


@app.route('/app/security/unResolvedVulnerabilities')
def slaBreachedData():
    bu = request.args.get("bu")
    project = request.args.get('project')
    from_date = request.args.get("from_date" , type=toDate)
    to_date = request.args.get("to_date" , type=toDate)
    if bu == 'All':
        return json.dumps({'SLA Breached': getSlaResult(bu , project , from_date , to_date , 'Past Duedate') ,
                           'Risk Accepted': getSlaResult(bu , project , from_date , to_date , 'Not Applicable') ,
                           'On Track': getSlaResult(bu , project , from_date , to_date , 'On Track') ,
                           'Ticket Summary': getBuLevelData(bu , from_date , to_date) ,
                           'By Priority': getbyPriority(bu , project , from_date , to_date) ,
                           'Top 5 Vulnerability': getTopVulnerability(bu , project , from_date , to_date) ,
                           'AllSlaCounts': getAllSlaCounts(bu , project , from_date , to_date) ,
                           'Vulnerability Source': getSourceCount(bu , project , from_date , to_date)} , default=str)
    else:
        return json.dumps({'SLA Breached': getSlaResult(bu , project , from_date , to_date , 'Past Duedate') ,
                           'Risk Accepted': getSlaResult(bu , project , from_date , to_date , 'Not Applicable') ,
                           'On Track': getSlaResult(bu , project , from_date , to_date , 'On Track') ,
                           'Ticket Summary': getProjectWiseTicketCount(bu , project , from_date , to_date) ,
                           'By Priority': getbyPriority(bu , project , from_date , to_date) ,
                           'Top 5 Vulnerability': getTopVulnerability(bu , project , from_date , to_date) ,
                           'AllSlaCounts': getAllSlaCounts(bu , project , from_date , to_date) ,
                           'Vulnerability Source': getSourceCount(bu , project , from_date , to_date)} , default=str)


@app.route('/app/security/rv/projectSummary')
def rvProjectSummary():
    bu = request.args.get("bu")
    project = request.args.get('project')
    from_date = request.args.get("from_date" , type=toDate)
    to_date = request.args.get("to_date" , type=toDate)
    return json.dumps(projectSummary(bu , project , from_date , to_date) , default=str)


@app.route('/app/security_status')
def security_status():
    bu = request.args.get('bu')
    product = request.args.get('product')
    from_date = request.args.get("from_date" , type=toDate)
    to_date = request.args.get("to_date" , type=toDate)
    return json.dumps(get_security_status(bu , product , from_date , to_date) , default=str)


@app.route('/app/bu_based_sla')
def bubasedSla():
    pillar = request.args.get("pillar")
    bu = request.args.get("bu")
    product = request.args.get('product')
    from_date = request.args.get("from_date" , type=toDate)
    to_date = request.args.get("to_date" , type=toDate)
    if pillar == 'Reliability':
        return json.dumps(getBuBasedSla(bu , product , from_date , to_date) , default=str)
    elif pillar == 'Security':
        return json.dumps(getSecuritySlaStatus(bu , product , from_date , to_date) , default=str)


# @app.route('/app/bu_based_sla_security')
# def bubasedSlaSecurity():
#     bu = request.args.get("bu")
#     product = request.args.get("product")
#     from_date = request.args.get("from_date", type = toDate)
#     to_date = request.args.get("to_date", type = toDate)
#     return json.dumps(getSecuritySlaStatus(bu,product,from_date,to_date),default=str)

@app.route('/app/kpi_list')
def kpinames():
    pillar = request.args.get("pillar")
    return get_kpi_names(pillar)


@app.route('/app/reliability/kpi_data')
def kpi_table():
    bu = request.args.get("bu")
    product = request.args.get('product')
    from_date = request.args.get("from_date" , type=toDate)
    to_date = request.args.get("to_date" , type=toDate)
    return get_kpi_table(bu , product , from_date , to_date)


@app.route('/app/reliability/incident_data')
def inc_data():
    bu = request.args.get("bu")
    product = request.args.get('product')
    from_date = request.args.get("from_date" , type=toDate)
    to_date = request.args.get("to_date" , type=toDate)
    # return get_inc_data(bu, product, from_date, to_date)
    return getIncidents(bu , product , from_date , to_date)


@app.route('/app/products')
def products():
    return get_products()


@app.route('/app/reliability_status')
def reliabilty_status():
    bu = request.args.get('bu')
    product = request.args.get('product')
    from_date = request.args.get("from_date" , type=toDate)
    to_date = request.args.get("to_date" , type=toDate)
    return get_reliabilty_status(bu , product , from_date , to_date)


@app.route('/app/kpi_table')
def defined_kpitable():
    bu = request.args.get('bu')
    product = request.args.get('product')
    return get_defined_kpitable(bu , product)


@app.route('/app/users')
def users():
    return getUsers()


@app.route('/app/create_ticket')
def ticketCreation():
    title = request.args.get('title')
    start_date = request.args.get("start_date")
    due_by = request.args.get("due_by")
    product = request.args.get("product")
    kpi_name = request.args.get("kpi_name")
    assignee = request.args.get("assignee")
    description = request.args.get("description")
    priority = request.args.get("priority")
    return createTicket(title , start_date , due_by , product , kpi_name , assignee , description , priority)


@app.route('/app/sla_trends_main')
def sla_trends():
    pillar = request.args.get("pillar")
    bu = request.args.get("bu")
    product = request.args.get('product')
    from_date = request.args.get("from_date" , type=toDate)
    to_date = request.args.get("to_date" , type=toDate)
    if pillar == 'Reliability':
        return json.dumps(get_sla_trends(bu , product , from_date , to_date) , default=str)
    elif pillar == 'Security':
        return json.dumps(getSlaTrendsMain(bu , product , from_date , to_date) , default=str)
    # return json.dumps({"reliability":get_sla_trends(bu, product, from_date, to_date)})


@app.route('/app/reliability/kpi_sla_trends')
def kpi_sla_trends():
    bu = request.args.get('bu')
    product = request.args.get('product')
    from_date = request.args.get("from_date" , type=toDate)
    to_date = request.args.get("to_date" , type=toDate)
    kpi = request.args.get('kpi')
    return get_kpi_sla_trends(bu , product , from_date , to_date , kpi)


@app.route('/app/reliability/action_items')
def actionItems():
    bu = request.args.get('bu')
    product = request.args.get('product')
    return getActionItems(bu , product)


@app.route('/app/bu_and_products')
def bUAndProducts():
    return getBUAndProducts()


@app.route('/app/okr/mttdv2')
def okrMttd1():
    bu = request.args.get('bu')
    product = request.args.get('product')
    quarter = request.args.get('quarter')
    return getOkrMttd1(bu , product , quarter)


@app.route('/app/okr/customer_outagesv2')
def okrCustomerOutagesv1():
    bu = request.args.get('bu')
    product = request.args.get('product')
    quarter = request.args.get('quarter')
    return getOkrCustomerOutagesv2(bu , product , quarter)


@app.route('/app/okr/outagesv2')
def okrOutages():
    bu = request.args.get('bu')
    product = request.args.get('product')
    quarter = request.args.get('quarter')
    return getOkrOutagesv1(bu , product , quarter)


@app.route('/app/okr/outagesdropv2')
def okrOutagesDrop():
    bu = request.args.get('bu')
    product = request.args.get('product')
    quarter = request.args.get('quarter')
    return getOkrOutagesDrop(bu , product , quarter)


@app.route('/app/okr/p1Dropv2')
def okrPdDrop():
    bu = request.args.get('bu')
    product = request.args.get('product')
    quarter = request.args.get('quarter')
    return getOkrPdDrop(bu , product , quarter)


@app.route('/app/okr/quarterMTTDv2')
def okrMttd():
    quarter = request.args.get('quarter')
    bu = request.args.get('bu')
    product = request.args.get('product')
    return getOkrMttd(bu , product , quarter)


@app.route('/app/okr/p1Mttrv2')
def okrP1Mttr():
    quarter = request.args.get('quarter')
    bu = request.args.get('bu')
    product = request.args.get('product')
    return getOkrP1Mttr(bu , product , quarter)


@app.route('/app/okr/p0Mttrv2')
def okrP0Mttr():
    quarter = request.args.get('quarter')
    bu = request.args.get('bu')
    product = request.args.get('product')
    return getOkrP0Mttr(bu , product , quarter)


@app.route('/app/okr/bu_and_outagesv2')
def outagesCount():
    quarter = request.args.get('quarter')
    return getOutagesCount(quarter)


@app.route('/app/okr/mttd_mttr_outages')
def okrMttdMttrOutages():
    bu = request.args.get('bu')
    product = request.args.get('product')
    quarter = request.args.get('quarter')
    return getOkrMttdMttrOutages(bu , product , quarter)

@app.route('/app/okr/mttd_mttr_outages_90percentile')
def okrMttdMttr90Outages():
    bu = request.args.get('bu')
    product = request.args.get('product')
    quarter = request.args.get('quarter')
    return getOkrMttdMttrOutages90Percentile(bu, product, quarter)

@app.route('/app/okr/repairItems')
def buBasedRepairItems():
    bu = request.args.get('bu')
    return getBuBasedRepairItems(bu)


@app.route('/app/cost/getAwsAccount')
def AwsAccount():
    bu = request.args.get('bu')
    product = request.args.get('product')
    return getAwsAccount(bu , product)


@app.route('/app/cost/getCostByBuProduct')
def CostByAccount():
    bu = request.args.get('bu')
    product = request.args.get('product')
    from_date = request.args.get("from_date" , type=toDate)
    to_date = request.args.get("to_date" , type=toDate)
    account_no = request.args.get('account')
    return getCostByAccount(bu , product , from_date , to_date , account_no)

# gets cost of all resources for past 6 months
@app.route('/app/cost/getTotalCost')
def TotalCost():
    bu = request.args.get('bu')
    product = request.args.get('product')
    from_date = request.args.get("from_date" , type=toDate)
    to_date = request.args.get("to_date" , type=toDate)
    account_no = request.args.get('account')
    return getTotalCost(bu , product , from_date , to_date , account_no)


@app.route('/app/cost/getCostByAccountResourceCount')
def CostByAccountResourceCount():
    bu = request.args.get('bu')
    product = request.args.get('product')
    from_date = request.args.get("from_date" , type=toDate)
    to_date = request.args.get("to_date" , type=toDate)
    account_no = request.args.get('account')
    return getCostByAccountResourceCount(bu , product , from_date , to_date , account_no)


@app.route('/app/cost/getResourceType')
def ResourceType():
    return getResourceType()


@app.route('/app/cost/getCostByResource')
def CostByResource():
    bu = request.args.get('bu')
    product = request.args.get('product')
    from_date = request.args.get("from_date" , type=toDate)
    to_date = request.args.get("to_date" , type=toDate)
    account_no = request.args.get('account')
    resource_name = request.args.get('resource')
    return getCostByResource(bu , product , from_date , to_date , account_no , resource_name)


@app.route('/app/cost/getKpiData')
def KPIData():
    bu = request.args.get('bu')
    product = request.args.get('product')
    from_date = request.args.get("from_date" , type=toDate)
    to_date = request.args.get("to_date" , type=toDate)
    return getKPIData(bu , product , from_date , to_date)


@app.route('/app/cost/cost_status')
def DashboardStatus():
    bu = request.args.get('bu')
    product = request.args.get('product')
    from_date = request.args.get("from_date" , type=toDate)
    to_date = request.args.get("to_date" , type=toDate)
    return getDashboardStatus(bu , product , from_date , to_date)

@app.route('/app/publish_wa_runs', methods=['POST'])
def publish_wa_runs():
    try:
        # Get data from request
        data = request.json
        aws_account_id = data['aws_account_id']
        environment = data['environment']
        region = data['region']
        runid = data['runid']
        pillar_results = data['pillar_results']
        control_results = data['control_results']
        evaluation_results = data['evaluation_results']

        result =  populate_run_data(aws_account_id,environment,region,runid,pillar_results,control_results,evaluation_results)

        if result is None:
            print("Data inserted successfully!")
            return jsonify("Data inserted succesfully")

        else:
            print(json.dumps(result))
            return jsonify(result), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/app/wa/getPillarScores')
def PillarScores():
    accountId = request.args.get('accountId')
    region = request.args.get('region')
    return getPillarScores(accountId,region)

@app.route('/app/wa/pillarControlStats')
def pillarControlStats():
    bu = request.args.get('bu')
    product = request.args.get('product')
    account_id = request.args.get('accountId')
    region = request.args.get('region')
    env = request.args.get('env')
    return getPillarControlStats(bu, product, account_id, region, env)
    
@app.route('/app/wa/severityControlStats')
def severityControlStats():
    bu = request.args.get('bu')
    product = request.args.get('product')
    accountId = request.args.get('accountId')
    region = request.args.get('region')
    pillar = request.args.get('pillar')
    env = request.args.get('env')
    return getSeverityControlStats(bu, product, accountId, region, pillar, env)

@app.route('/app/wa/controlResources')
def controlResources():
    bu = request.args.get('bu')
    product = request.args.get('product')
    accountId = request.args.get('accountId')
    region = request.args.get('region')
    controlId = request.args.get('controlID')
    env = request.args.get('env')
    print(bu, product, accountId, region, controlId, env)
    return getControlResources(bu, product, accountId, region, controlId, env)

"""
args expected:
    Mandatorily one of:
        - BU
        - Product        --> takes precedence over BU
        - AWS Account ID --> takes precedence over BU and Product
    Optional:
       - Region
       - Environment
returns:
list [
    {
       "pillar": "PILLAR NAME",
         "score": 79.1, 
    }
]
"""
@app.route('/app/wa/v2/getPillarScores')
def PillarScoresV2():
    bu = request.args.get('bu')
    bu = bu if bu else "" # nil params is not considered as "all". we leave it as empty string
    
    product = request.args.get('product')
    product = product if product else ""
    
    accountId = request.args.get('accountId')
    accountId = accountId if accountId else ""
    
    region = request.args.get('region')
    region = region if region else ""
    
    env = request.args.get('env')
    env = env if env else ""
    
    return getPillarScoresV2(bu, product, accountId, region, env)


@app.route('/app/wa/getResourceDetails')
def ResourceDetails():
    accountId = request.args.get('accountId')
    region = request.args.get('region')

    return getResourceDetails(accountId,region)

@app.route('/app/wa/v2/getResourceDetails')
def ResourceDetailsV2():
    bu = request.args.get('bu', 'all')
    product = request.args.get('product', 'all')
    accountId = request.args.get('accountId', 'all')
    region = request.args.get('region', 'all')
    env = request.args.get('env', 'all')
    return getResourceDetailsV2(bu, product, accountId, region, env)

@app.route('/app/wa/getHistoricalPillarScores')
def HistoricalPillarScores():
    accountId = request.args.get('accountId')
    region = request.args.get('region')
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    env = request.args.get('env')
    return getHistoricalPillarScores(accountId,region,from_date,to_date, env)

@app.route('/app/wa/v2/getHistoricalPillarScores')
def HistoricalPillarScoresV2():
    bu = request.args.get('bu')
    bu = bu if bu else "" # nil params is not considered as "all". we leave it as empty string
    
    product = request.args.get('product')
    product = product if product else ""
    
    accountId = request.args.get('accountId')
    accountId = accountId if accountId else ""
    
    region = request.args.get('region')
    region = region if region else ""
    
    env = request.args.get('env')
    env = env if env else ""
    
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    
    if from_date == None or to_date == None:
        return jsonify({'error': 'Invalid input format, expected from_date and to_date in body'}), 400
    
    return getHistoricalPillarScoresV2(bu, product, accountId, region, from_date, to_date, env)

@app.route('/app/wa/getWAControlsList')
def WAControlsList():
    return getControlsList()

@app.route('/app/wa/getTechStackDetails')
def TechStackDetails():
    return getTechStackDetails()

@app.route('/app/wa/getFRTicket')
def getFRTicket():
    accountId = request.args.get("account_id")
    controlId = request.args.get("control_id")
    if  not accountId or not controlId :
         return jsonify({'error': 'Invalid input format, expected account_id and control_id in body'})
    
    return fetchFRTicket(accountId, controlId)

@app.route('/app/wa/createFRTicket', methods=['POST'])
def createFRTicket():
    data = request.json

    if 'control_id' not in data or 'account_id' not in data :
         return jsonify({'error': 'Invalid input format, expected account_id and control_id in body'})

    accountId =  data["account_id"]
    controlId = data["control_id"]
    description = data["description"] 
    priorityId = data["priority_id"]
    

    return createControlFRTicket(accountId,controlId, description, priorityId)

@app.route('/app/wa/addResourcesComment', methods=['POST'])
def addResourcesComment():
    data = request.json
    
    if 'ticket_id' not in data or 'account_id' not in data:
         return jsonify({'error': 'Invalid input format, expected account_id and ticket_id in body'})

    if not isinstance(data, dict) or 'failedResources' not in data or not isinstance(data['failedResources'], list):
            return jsonify({'error': 'Invalid input format, expected a JSON with a key "failedResources" containing a list of failedResources'}), 400
        
    ticketId = data["ticket_id"]
    accountId =  data["account_id"]
    # Join the list into a single string with newline characters
    failedResources = '<br/>'.join(data['failedResources'])

    return addResourcesToTkt(ticketId, accountId, failedResources)

@app.route('/app/wa/closeFRTicket', methods=['POST'])
def closeFRTicket():
    data = request.json

    if 'ticket_id' not in data or 'account_id' not in data:
         return jsonify({'error': 'Invalid input format, expected account_id and ticket_id in body'})
        
    ticketId = data["ticket_id"]
    accountId =  data["account_id"]

    return closeControlFRTicket(accountId, ticketId)

@app.route('/app/wa/deleteFRTicket', methods=['POST'])
def deleteFRTicket():
    data = request.json

    if 'ticket_id' not in data or 'account_id' not in data:
         return jsonify({'error': 'Invalid input format, expected account_id and ticket_id in body'})
        
    ticketId = data["ticket_id"]
    accountId =  data["account_id"]

    return deleteControlFRTicket(accountId, ticketId)

@app.route('/app/wa/handleFRTaskFailedControl', methods=['POST'])
def FRTaskForFailedControl():
    data = request.json
    
    accountId = data["account_id"]
    region = data["region"]
    controlId = data["control_id"]
    priorityId = data["priority_id"]
    description = data["description"]
    failedResources = data["failedResources"]
    
    return failedControlTkt(accountId, region, controlId, priorityId, description, failedResources)

@app.route('/app/wa/handleFRTaskPassedControl', methods=['POST'])
def FRTaskForPassedControl():
    data = request.json
    
    accountId = int(data["account_id"])
    region = data["region"]
    controlId = data["control_id"]

    
    return passedControlTkt(accountId, region, controlId)

@app.route('/app/wa/getFRTicketsForControlForAccount')
def getFRTicketsForControlForAccount():
    accountId = request.args.get("account_id")
    controlId = request.args.get("control_id")
    region = request.args.get("region")
    return FRTicketsForControlForAccount(controlId, accountId, region)

@app.route('/app/wa/getFRTicketsForControlForProduct')
def getFRTicketsForControlForProduct():
    product = request.args.get("product")
    controlId = request.args.get("control_id")
    region = request.args.get("region")
    return FRTicketsForControlForProduct(controlId, product, region)

# end of well architected endpoints

@app.route('/app/pe/getproductsAvailability')
def productAvailability():
    bu = request.args.get('bu')
    product = request.args.get('product')
    quarter = request.args.get('quarter')

    return peAvailabilitySample(bu,product)

@app.route('/app/v2/getBu')
def getbu():
    return fetch_unique_bu()

@app.route('/app/v2/getQuarter')
def getquarter():
    return fetch_unique_quarters()

@app.route('/app/v2/getBuView1')
def getbuview1():
    bu = request.args.get('bu')
    quarter = request.args.get('quarter')
    if bu!='Platform':
        return fetch_incident_counts(bu,quarter)
    else:
        return fetch_incident_counts_platform(bu,quarter)
@app.route('/app/v2/getCustDetectedView1')
def getcustdetectedview1():
    bu = request.args.get('bu')
    quarter = request.args.get('quarter')
    return fetch_incident_counts_customer(bu,quarter)

#View2
@app.route('/app/v2/getCustDetectedView2n4')
def getcustdetectedview2n4():
    bu = request.args.get('bu')
    quarter = request.args.get('quarter')
    return get_last_12_months_counts_json(bu,quarter)

#View2
@app.route('/app/v2/getCustDetectedView1n3')
def getcustdetectedview1n3():
    bu = request.args.get('bu')
    quarter = request.args.get('quarter')
    return get_last_12_months_counts_json_view2(bu,quarter)
#View3
@app.route('/app/v2/getCustDetectedView3P0')
def getcustdetectedview3():
    bu = request.args.get('bu')
    quarter = request.args.get('quarter')
    results, results2 = get_last_12_months_counts_json_view3(bu, quarter)
    return jsonify({"results": results, "results2": results2})

@app.route('/app/v2/getCustDetectedView3P1')
def getcustdetectedview3P1():
    bu = request.args.get('bu')
    quarter = request.args.get('quarter')
    results, results2 = get_last_12_months_counts_json_view3_p1(bu, quarter)
    return jsonify({"results": results, "results2": results2})

@app.route('/app/v2/getMonthlyP1Mttr')
def getmonthlyP1Mttr():
    bu = request.args.get('bu')
    quarter = request.args.get('quarter')
    results, results2 = get_p1_mttr_monthly(bu, quarter)
    return jsonify({"results": results, "results2": results2})

@app.route('/app/v2/getMonthlyP0Mttr')
def getmonthlyP0Mttr():
    bu = request.args.get('bu')
    quarter = request.args.get('quarter')
    results, results2 = get_p0_mttr_monthly(bu, quarter)
    return jsonify({"results": results, "results2": results2})

@app.route('/app/v2/kpis')
def getmonthlyKpis():
    bu = request.args.get('bu')
    quarter = request.args.get('quarter')
    return calculate_kpis(bu,quarter)
@app.route('/app/v2/availability')
def getquarterlyAvailability():
    quarter = request.args.get('quarter')
    return calculate_availability_percentage(quarter)
@app.route('/app/v2/availabilitymonthly')
def getmonthlyAvailability():
    month = request.args.get('month')
    year=request.args.get('year')
    return calculate_availability_percentage_monthly(month,year)
@app.route('/app/v2/getmonths')
def getMonthList():
    return get_month_list()
@app.route('/app/v2/getyears')
def getLastTwoYears():
    return get_last_two_years()
@app.route('/app/v2/getmttddataquarter')
def getmttddataquarter():
    quarter = request.args.get('quarter')
    bu = request.args.get('bu')
    results,results2= getMttdDataQuarter(bu,quarter)
    return jsonify({"results": results, "results2": results2})
@app.route('/app/v2/getmttrdataquarterp0')
def getmttrdataquarterp0():
    quarter = request.args.get('quarter')
    bu = request.args.get('bu')
    results,results2= getMttrDataQuarterP0(bu,quarter)
    return jsonify({"results": results, "results2": results2})
@app.route('/app/v2/getmttrdataquarterp1')
def getmttrdataquarterp1():
    quarter = request.args.get('quarter')
    bu = request.args.get('bu')
    results,results2=getMttrDataQuarterP1(bu,quarter)
    return jsonify({"results": results, "results2": results2})
@app.route('/app/v2/getincidentdetails')
def getincidentdetails():
    bu = request.args.get('bu')
    quarter = request.args.get('quarter')
    return getIncidentDetails(bu,quarter)
@app.route('/app/v2/getallincidentdetails')
def getallincidentdetails():
    return getAllIncidentDetails()
@app.route('/app/v2/okrgetokrmttd1')
def okrgetokrmttd1():
    quarter = request.args.get('quarter')
    bu = request.args.get('bu')
    product=request.args.get('product')
    if product and product.startswith("'") and product.endswith("'"):
        product = product[1:-1]
    if bu and bu.startswith("'") and bu.endswith("'"):
        bu = bu[1:-1]
    return getOkrMttd1(bu,product,quarter)
@app.route('/app/v2/okrgetokrcustcount')
def okrgetokrcustcount():
    quarter = request.args.get('quarter')
    bu = request.args.get('bu')
    product=request.args.get('product')
    if product and product.startswith("'") and product.endswith("'"):
        product = product[1:-1]
    if bu and bu.startswith("'") and bu.endswith("'"):
        bu = bu[1:-1]
    return getOkrCustCount(bu,product,quarter)
@app.route('/app/v2/okrgetcomparisondata')
def okrgetcomparisondata():
    quarter = request.args.get('quarter')
    bu = request.args.get('bu')
    product=request.args.get('product')
    if product and product.startswith("'") and product.endswith("'"):
        product = product[1:-1]
    if bu and bu.startswith("'") and bu.endswith("'"):
        bu = bu[1:-1]
    return getComparisonData(bu,product,quarter)
@app.route('/app/v2/okrbuincidentstrend')
def okrbuincidentstrend():
    quarter = request.args.get('quarter')
    bu = request.args.get('bu')
    product=request.args.get('product')
    if product and product.startswith("'") and product.endswith("'"):
        product = product[1:-1]
    if bu and bu.startswith("'") and bu.endswith("'"):
        bu = bu[1:-1]
    return buincidentstrend(bu,product,quarter)
@app.route('/app/v2/okryoyincidents')
def yoyincidentstrend():
    quarter = request.args.get('quarter')
    bu = request.args.get('bu')
    product=request.args.get('product')
    if bu and bu.startswith("'") and bu.endswith("'"):
        bu = bu[1:-1]
    if product and product.startswith("'") and product.endswith("'"):
        product = product[1:-1]
    return yoyincidents(bu,product,quarter)
@app.route('/app/v2/okrgetcomparisondatap0')
def okrgetcomparisondatap0():
    quarter = request.args.get('quarter')
    bu = request.args.get('bu')
    product=request.args.get('product')
    if product and product.startswith("'") and product.endswith("'"):
        product = product[1:-1]
    if bu and bu.startswith("'") and bu.endswith("'"):
        bu = bu[1:-1]
    return getComparisonData_p0(bu,product,quarter)

@app.route('/app/v2/okrgetcomparisondatap1')
def okrgetcomparisondatap1():
    quarter = request.args.get('quarter')
    bu = request.args.get('bu')
    product=request.args.get('product')
    if product and product.startswith("'") and product.endswith("'"):
        product = product[1:-1]
    if bu and bu.startswith("'") and bu.endswith("'"):
        bu = bu[1:-1]
    return getComparisonData_p1(bu,product,quarter)

@app.route('/app/v2/okrgetcomparisondatamttd')
def okrgetcomparisondatamttd():
    quarter = request.args.get('quarter')
    bu = request.args.get('bu')
    product=request.args.get('product')
    if product and product.startswith("'") and product.endswith("'"):
        product = product[1:-1]
    if bu and bu.startswith("'") and bu.endswith("'"):
        bu = bu[1:-1]
    return getComparisonData_mttd(bu,product,quarter)

@app.route('/app/v2/okrgetcomparisondatamttrp0')
def okrgetcomparisondatamttrp0():
    quarter = request.args.get('quarter')
    bu = request.args.get('bu')
    product=request.args.get('product')
    if product and product.startswith("'") and product.endswith("'"):
        product = product[1:-1]
    if bu and bu.startswith("'") and bu.endswith("'"):
        bu = bu[1:-1]
    return getComparisonData_mttr_p0(bu,product,quarter)
@app.route('/app/v2/okrgetcomparisondatamttrp1')
def okrgetcomparisondatamttrp1():
    quarter = request.args.get('quarter')
    bu = request.args.get('bu')
    product=request.args.get('product')
    if product and product.startswith("'") and product.endswith("'"):
        product = product[1:-1]
    if bu and bu.startswith("'") and bu.endswith("'"):
        bu = bu[1:-1]
    return getComparisonData_mttr_p1(bu,product,quarter)

@app.route('/app/v2/okrbuincidentstrendv2')
def okrbuincidentstrendv2():
    quarter = request.args.get('quarter')
    bu = request.args.get('bu')
    product=request.args.get('product')
    if product and product.startswith("'") and product.endswith("'"):
        product = product[1:-1]
    if bu and bu.startswith("'") and bu.endswith("'"):
        bu = bu[1:-1]
    return buincidentstrend_v2(bu,product,quarter)

# @app.route('/app/incidents')
# def inc_data():
#     bu = request.args.get("bu")
#     product = request.args.get('product')
#     from_date = request.args.get("from_date", type = toDate)
#     to_date = request.args.get("to_date", type = toDate)
#     return getIncidents(bu, product, from_date, to_date)

if __name__ == "__main__":
    app.run(port=3000)