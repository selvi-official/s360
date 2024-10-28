import configparser

from dao.DBPool import Database
import json
import requests
from datetime import date, datetime, timedelta
import re


class MyApp:

    def inc_data_dump(self):
        date_old = date(2023, 9, 24)
        date_new = date(2022,8,1)
        yesterday = date.today() - timedelta(1)
        # print(today)

        config = configparser.ConfigParser()
        config.read('app.conf')

        auth_token = config['fr_api']['Token']

        headers = {
            'Authorization': f'Token {auth_token}',
            'Content-Type': 'application/json'
        }

        # resp = requests.get('https://freshworks.freshrelease.com/INC/issues/INC-2152/', )
        # inc_json_response = requests.get(
        #     f'https://freshworks.freshrelease.com/INC/issues?per_page=250&'
        #     f'query_hash[0][condition]=created_at&query_hash[0][operator]=is_in_the_range&query_hash[0][value][0]={date_old}&query_hash[0][value][1]={date_new}&page=1',
        #     headers=headers)
        inc_json_response = requests.get(
            f'https://freshworks.freshrelease.com/INC/issues?'
            f'query_hash[0][condition]=updated_at&query_hash[0][operator]=is_after&query_hash[0][value]={yesterday}&per_page=250&page=1',
            headers=headers)
        inc_json = inc_json_response.json()['issues']
        print(inc_json_response.json()['meta'])

        inc_list = []
        for inc in inc_json:
            inc_list.append(inc['key'])
        print(inc_list)

        # regex_pattern = r'\((.*?)\)'

        db = Database()

        for inc_id in inc_list:
            print(inc_id)
            inc_detail_resp = requests.get(f'https://freshworks.freshrelease.com/INC/issues/{inc_id}', headers=headers)
            # print(inc_detail_resp.json())
            inc_detail = inc_detail_resp.json()

            start_date = inc_detail.get('issue').get('start_date')
            end_date = inc_detail.get('issue').get('due_by')
            updated_at = inc_detail.get('issue').get('updated_at')
            # print(updated_at)

            if start_date is not None:
                start_date = datetime.strptime(start_date, '%Y-%m-%dT%H:%M:%S.%fZ').strftime('%Y-%m-%d %H:%M:%S.%f')
            if end_date is not None:
                end_date = datetime.strptime(end_date, '%Y-%m-%dT%H:%M:%S.%fZ').strftime('%Y-%m-%d %H:%M:%S.%f')
            if updated_at is not None:
                updated_at = datetime.strptime(updated_at, '%Y-%m-%dT%H:%M:%S.%fZ').strftime('%Y-%m-%d %H:%M:%S.%f')

            region_list = json.loads(json.dumps(inc_detail.get('issue').get('custom_field').get('cf_affected_regions')))
            if region_list is not None:
                regions = region_list
            else:
                regions = []
            products_affected_list = json.loads(
                json.dumps(inc_detail.get('issue').get('custom_field').get('cf_team_s_impacted')))
            if products_affected_list is not None :
                products_list = products_affected_list
            else:
                products_list = []
            priority_given = inc_detail.get('issue').get('custom_field').get('cf_type_of_incident')
            priority = '' if priority_given is None or priority_given == 'Auto recovered Issues' else re.search(r'\((.*?)\)', priority_given).group(1)
            inc_type = '' if priority_given is None else re.sub(r'\(.*?\)', '', priority_given)
            isRecurringIncident = inc_detail.get('issue').get('custom_field').get('cf_recurring_incident')

            fields = {
                'incident_no': inc_detail.get('issue').get('key'),
                'start_date': start_date,
                'end_date': end_date,
                'priority': priority,
                'incident_type': inc_type,
                'product': inc_detail.get('issue').get('custom_field').get('cf_module'),
                'duration': inc_detail.get('issue').get('duration'),
                'region': ','.join(['{}'.format(item) for item in regions]),
                'issue_category': inc_detail.get('issue').get('custom_field').get('cf_issue_category'),
                'products_affected': ','.join(['{}'.format(item) for item in products_list]),
                'assignee': inc_detail.get('users')[0].get('name'),
                'assignee_manager': inc_detail.get('issue').get('custom_field').get('cf_assignee_manager'),
                'ttd_in_min': inc_detail.get('issue').get('custom_field').get('cf_time_to_detect'),
                'ttr_in_min': inc_detail.get('issue').get('custom_field').get('cf_time_to_recover'),
                'customers_impacted': inc_detail.get('issue').get('custom_field').get('cf_no_of_customers_impacted'),
                'alert_source': inc_detail.get('issue').get('custom_field').get('cf_alert_generated_by'),
                'updated_at': updated_at,
                'is_recurring_incident': isRecurringIncident
            }
            # print(fields)

            db.insert_data(fields)

        #     batch.append(fields)
        #     if len(batch) == batch_size:
        #         db.insert_data(batch)
        #         print('batch insert completed')
        #         batch = []
        # if len(batch) > 0:
        #     db.insert_data(batch)
        #     print('partial insert completed')

        # my_string = ','.join(["'{}'".format(item) for item in my_list])
