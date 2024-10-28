from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.schedulers.blocking import BlockingScheduler
from datetime import datetime, timedelta

from app import MyApp

def run_job():
    print('running job at: ', datetime.now())
    app = MyApp()
    app.inc_data_dump()
#myapp = MyApp()

scheduler = BlockingScheduler()
scheduler.add_job(run_job, 'cron', hour=4, minute=30)
# scheduler = BackgroundScheduler()
# scheduler.add_job(run_job, 'date')

# scheduler.add_job()
scheduler.start()
