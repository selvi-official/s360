from flask import *
from flask_cors import CORS, cross_origin
#from apisupport import *
#from backend_scripts.flask_api import *
from rel import *
# from reliabilitysupportapi import *
from securitysupportapi import *


app = Flask(__name__)
cors = CORS(app)


@app.route('/app/')
def index():
    return "<h1>Welcome to Service360 Dashboard</h1>"

@app.route('/app/security/bu_and_projects')
def sendBuAndProjects():
    bu = {'CRM':['Freshmarketer','Freshsales'],'CX':['Freshbots','Freshchat','Freshdesk','Freshcaller','Mobile-CXBU','Freddy AI for CX'],'IT':['Freshservice'],'Platform':['Central','Channels','Edge','Email','Hypertrail','Fluffy','Freddy Platform','FreshID','FormServ','Freshstatus','Freshsuccess','Freshsurvey','Freshteam','Freshworks Analytics','IRIS','Kairos','LEGO','UCR','Developer Platform','RTS','Search'],'Cloud engineering':['CloudSecurity','Freshworks Cloud Platform','Haystack','CloudInfra','NOC','Supreme One'],'Others':['Customer Engineering','Data Leaks','Freshinbox','FreshIQ','Freshping','FreshPipe','Freddy-Sales','Security Engineering','SOC']}
    return json.dumps(bu,default=str)

@app.route('/app/security/unResolvedVulnerabilities')
def slaBreachedData():
    bu = request.args.get("bu")
    project = request.args.get('project')
    from_date = request.args.get("from_date", type = toDate)
    to_date = request.args.get("to_date", type = toDate)
    if bu=='All':
        return json.dumps({'SLA Breached':getSlaResult(bu,project,from_date,to_date,'Past Duedate'),'Risk Accepted':getSlaResult(bu,project,from_date,to_date,'Not Applicable'),'On Track':getSlaResult(bu,project,from_date,to_date,'On Track'),'Ticket Summary':getBuLevelData(bu,from_date,to_date),'By Priority':getbyPriority(bu,project,from_date,to_date) ,'Top 5 Vulnerability':getTopVulnerability(bu,project,from_date,to_date),'AllSlaCounts':getAllSlaCounts(bu,project,from_date,to_date),'Vulnerability Source':getSourceCount(bu,project,from_date,to_date)},default=str)
    else:
        return json.dumps({'SLA Breached':getSlaResult(bu,project,from_date,to_date,'Past Duedate'),'Risk Accepted':getSlaResult(bu,project,from_date,to_date,'Not Applicable'),'On Track':getSlaResult(bu,project,from_date,to_date,'On Track'),'Ticket Summary':getProjectWiseTicketCount(bu,project,from_date,to_date),'By Priority':getbyPriority(bu,project,from_date,to_date) ,'Top 5 Vulnerability':getTopVulnerability(bu,project,from_date,to_date),'AllSlaCounts':getAllSlaCounts(bu,project,from_date,to_date),'Vulnerability Source':getSourceCount(bu,project,from_date,to_date)},default=str)
    
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
    from_date = request.args.get("from_date", type = toDate)
    to_date = request.args.get("to_date", type = toDate)
    return json.dumps(get_security_status(bu, product, from_date, to_date), default=str)
    
@app.route('/app/bu_based_sla')
def bubasedSla():
    pillar = request.args.get("pillar")
    bu = request.args.get("bu")
    product = request.args.get('product')
    from_date = request.args.get("from_date", type = toDate)
    to_date = request.args.get("to_date", type = toDate)
    if pillar=='Reliability':
        return json.dumps(getBuBasedSla(bu,product,from_date,to_date),default=str)
    elif pillar=='Security': 
        return json.dumps(getSecuritySlaStatus(bu,product,from_date,to_date),default=str)

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
    from_date = request.args.get("from_date", type = toDate)
    to_date = request.args.get("to_date", type = toDate)
    return get_kpi_table(bu, product, from_date, to_date)

@app.route('/app/reliability/incident_data')
def inc_data():
    bu = request.args.get("bu")
    product = request.args.get('product')
    from_date = request.args.get("from_date", type = toDate)
    to_date = request.args.get("to_date", type = toDate)
    #return get_inc_data(bu, product, from_date, to_date)
    return getIncidents(bu, product, from_date, to_date)

@app.route('/app/products')
def products():
    return get_products()

@app.route('/app/reliability_status')
def reliabilty_status():
    bu = request.args.get('bu')
    product = request.args.get('product')
    from_date = request.args.get("from_date", type = toDate)
    to_date = request.args.get("to_date", type = toDate)
    return get_reliabilty_status(bu, product, from_date, to_date)

@app.route('/app/kpi_table')
def defined_kpitable():
    bu = request.args.get('bu')
    product = request.args.get('product')
    return get_defined_kpitable(bu, product)

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
    return createTicket(title, start_date, due_by, product, kpi_name, assignee, description, priority)

@app.route('/app/sla_trends_main')
def sla_trends():
    pillar = request.args.get("pillar")
    bu = request.args.get("bu")
    product = request.args.get('product')
    from_date = request.args.get("from_date", type = toDate)
    to_date = request.args.get("to_date", type = toDate)
    if pillar=='Reliability':
        return json.dumps(get_sla_trends(bu, product, from_date, to_date),default=str)
    elif pillar=='Security':
        return json.dumps(getSlaTrendsMain(bu,product,from_date,to_date),default=str)
    #return json.dumps({"reliability":get_sla_trends(bu, product, from_date, to_date)})

@app.route('/app/reliability/kpi_sla_trends')
def kpi_sla_trends():
    bu = request.args.get('bu')
    product = request.args.get('product')
    from_date = request.args.get("from_date", type = toDate)
    to_date = request.args.get("to_date", type = toDate)
    kpi = request.args.get('kpi')
    return get_kpi_sla_trends(bu, product, from_date, to_date, kpi)

@app.route('/app/reliability/action_items')
def actionItems():
    bu = request.args.get('bu')
    product = request.args.get('product')
    return getActionItems(bu,product)
    
@app.route('/app/bu_and_products')
def bUAndProducts():
    return getBUAndProducts()

@app.route('/app/okr/mttdv2')
def okrMttd1():
    bu = request.args.get('bu')
    product = request.args.get('product')
    quarter = request.args.get('quarter')
    return getOkrMttd1(bu, product, quarter)

@app.route('/app/okr/customer_outagesv2')
def okrCustomerOutagesv1():
    bu = request.args.get('bu')
    product = request.args.get('product')
    quarter = request.args.get('quarter')
    return getOkrCustomerOutagesv2(bu, product, quarter)
    
@app.route('/app/okr/outagesv2')
def okrOutages():
    bu = request.args.get('bu')
    product = request.args.get('product')
    quarter = request.args.get('quarter')
    return getOkrOutagesv1(bu, product, quarter)

@app.route('/app/okr/outagesdropv2')
def okrOutagesDrop():
    bu = request.args.get('bu')
    product = request.args.get('product')
    quarter = request.args.get('quarter')
    return getOkrOutagesDrop(bu, product, quarter)

@app.route('/app/okr/p1Dropv2')
def okrPdDrop():
    bu = request.args.get('bu')
    product = request.args.get('product')
    quarter = request.args.get('quarter')
    return getOkrPdDrop(bu, product, quarter)

@app.route('/app/okr/quarterMTTDv2')
def okrMttd():
    quarter = request.args.get('quarter')
    bu = request.args.get('bu')
    product = request.args.get('product')
    return getOkrMttd(bu, product, quarter)

@app.route('/app/okr/p1Mttrv2')
def okrP1Mttr():
    quarter = request.args.get('quarter')
    bu = request.args.get('bu')
    product = request.args.get('product')
    return getOkrP1Mttr(bu, product, quarter)

@app.route('/app/okr/p0Mttrv2')
def okrP0Mttr():
    quarter = request.args.get('quarter')
    bu = request.args.get('bu')
    product = request.args.get('product')
    return getOkrP0Mttr(bu, product, quarter)

@app.route('/app/okr/bu_and_outagesv2')
def outagesCount():
    quarter = request.args.get('quarter')
    return getOutagesCount(quarter)

@app.route('/app/okr/mttd_mttr_outages')
def okrMttdMttrOutages():
    bu = request.args.get('bu')
    product = request.args.get('product')
    quarter = request.args.get('quarter')
    return getOkrMttdMttrOutages(bu, product, quarter)
    
@app.route('/app/okr/repairItems')
def buBasedRepairItems():
    bu = request.args.get('bu')
    return getBuBasedRepairItems(bu)

# @app.route('/app/incidents')
# def inc_data():
#     bu = request.args.get("bu")
#     product = request.args.get('product')
#     from_date = request.args.get("from_date", type = toDate)
#     to_date = request.args.get("to_date", type = toDate)
#     return getIncidents(bu, product, from_date, to_date)

if __name__ == "__main__":
    app.run(port = 8001)



