import mysql.connector
import calendar
import pandas as pd
import json
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

# Function to establish a connection to MySQL database
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

# Function to fetch unique business units from the database
def fetch_unique_bu():
    conn = connect_to_mysql()
    if conn:
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT DISTINCT BU FROM BU_table")
            result = cursor.fetchall()
            unique_bu = [row[0] for row in result]  # Extracting BU values from the result
            return unique_bu
        except mysql.connector.Error as err:
            print("Error fetching unique BU from database:", err)
            return None
def fetch_unique_quarters():
    conn = connect_to_mysql()
    if conn:
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT DISTINCT CONCAT(quarter, ' ', year) AS quarter_year FROM incidents")
            result = cursor.fetchall()
            unique_quarters = [row[0] for row in result]  # Extracting quarter-year combinations
            return unique_quarters
        except mysql.connector.Error as err:
            print("Error fetching unique quarters from database:", err)
            return None




def fetch_incident_counts(bu, quarter):
    try:
        conn = connect_to_mysql()
        if conn:
            cursor = conn.cursor()

            quarters = [(quarter,)]

            # Extract quarter and year from input
            quarter_str, year_str = quarter.split()
            year = int(year_str)
            quarter_num = int(quarter_str[1])

            # Calculate past three quarters
            for i in range(1, 4):
                prev_quarter_num = quarter_num - i
                prev_year = year
                if prev_quarter_num <= 0:
                    prev_quarter_num += 4
                    prev_year -= 1
                prev_quarter_str = 'Q' + str(prev_quarter_num) + ' ' + str(prev_year)
                quarters.append((prev_quarter_str,))

            results = []

            for quarter_tuple in quarters:
                current_quarter = quarter_tuple[0]
                quarter_str, year_str = current_quarter.split()
                year = int(year_str)
                quarter = quarter_str

                # SQL statements
                sql_total_outages = """
                    SELECT COUNT(*) FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu LIKE '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND (major_incident_type LIKE '%P0%' OR major_incident_type LIKE '%P1%')
                    AND status_page_updated='Yes'
                """.format(bu.replace("'", ""), bu.replace("'", ""), quarter, year)

                sql_total_outages_p0 = """
                    SELECT COUNT(*) FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu LIKE '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND (major_incident_type LIKE '%P0%')
                    AND status_page_updated='Yes'
                """.format(bu.replace("'", ""), bu.replace("'", ""), quarter, year)

                sql_total_outages_p1 = """
                    SELECT COUNT(*) FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu LIKE '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND (major_incident_type LIKE '%P1%')
                    AND status_page_updated='Yes'
                """.format(bu.replace("'", ""), bu.replace("'", ""), quarter, year)

                sql_induced_by_other_bu_p0 = """
                    SELECT COUNT(*) FROM incidents
                    WHERE (affected_bu LIKE '%{}%' AND bu NOT LIKE '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND issue_category NOT LIKE '%Third Party%'
                    AND major_incident_type LIKE '%P0%'
                    AND status_page_updated='Yes'
                """.format(bu.replace("'", ""), bu.replace("'", ""), quarter, year)

                sql_induced_by_other_bu_p1 = """
                    SELECT COUNT(*) FROM incidents
                    WHERE (affected_bu LIKE '%{}%' AND bu NOT LIKE '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND issue_category NOT LIKE '%Third Party%'
                    AND major_incident_type LIKE '%P1%'
                    AND status_page_updated='Yes'
                """.format(bu.replace("'", ""), bu.replace("'", ""), quarter, year)

                sql_induced_by_own_bu_p0 = """
                    SELECT COUNT(*) FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu LIKE '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND bu = '{}'
                    AND issue_category NOT LIKE '%Third Party%'
                    AND major_incident_type LIKE '%P0%'
                    AND status_page_updated='Yes'
                """.format(bu.replace("'", ""), bu.replace("'", ""), quarter, year, bu)

                sql_induced_by_own_bu_p1 = """
                    SELECT COUNT(*) FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu LIKE '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND bu = '{}'
                    AND issue_category NOT LIKE '%Third Party%'
                    AND major_incident_type LIKE '%P1%'
                    AND status_page_updated='Yes'
                """.format(bu.replace("'", ""), bu.replace("'", ""), quarter, year, bu)

                sql_induced_by_third_party_p0 = """
                    SELECT COUNT(*) FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu LIKE '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND issue_category LIKE '%Third Party%'
                    AND major_incident_type LIKE '%P0%'
                    AND status_page_updated='Yes'
                """.format(bu.replace("'", ""), bu.replace("'", ""), quarter, year)

                sql_induced_by_third_party_p1 = """
                    SELECT COUNT(*) FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu LIKE '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND issue_category LIKE '%Third Party%'
                    AND major_incident_type LIKE '%P1%'
                    AND status_page_updated='Yes'
                """.format(bu.replace("'", ""), bu.replace("'", ""), quarter, year)

                # Execute SQL queries
                print(sql_total_outages)
                cursor.execute(sql_total_outages)
                total_outages_row = cursor.fetchone()
                total_outages = total_outages_row[0] if total_outages_row else 0

                print(sql_total_outages_p0)
                cursor.execute(sql_total_outages_p0)
                total_outages_p0_row = cursor.fetchone()
                total_outages_p0 = total_outages_p0_row[0] if total_outages_p0_row else 0

                print(sql_total_outages_p1)
                cursor.execute(sql_total_outages_p1)
                total_outages_p1_row = cursor.fetchone()
                total_outages_p1 = total_outages_p1_row[0] if total_outages_p1_row else 0

                print(sql_induced_by_other_bu_p0)
                cursor.execute(sql_induced_by_other_bu_p0)
                induced_by_other_bu_p0_row = cursor.fetchone()
                induced_by_other_bu_p0 = induced_by_other_bu_p0_row[0] if induced_by_other_bu_p0_row else 0

                print(sql_induced_by_other_bu_p1)
                cursor.execute(sql_induced_by_other_bu_p1)
                induced_by_other_bu_p1_row = cursor.fetchone()
                induced_by_other_bu_p1 = induced_by_other_bu_p1_row[0] if induced_by_other_bu_p1_row else 0

                print(sql_induced_by_own_bu_p0)
                cursor.execute(sql_induced_by_own_bu_p0)
                induced_by_own_bu_p0_row = cursor.fetchone()
                induced_by_own_bu_p0 = induced_by_own_bu_p0_row[0] if induced_by_own_bu_p0_row else 0

                print(sql_induced_by_own_bu_p1)
                cursor.execute(sql_induced_by_own_bu_p1)
                induced_by_own_bu_p1_row = cursor.fetchone()
                induced_by_own_bu_p1 = induced_by_own_bu_p1_row[0] if induced_by_own_bu_p1_row else 0

                print(sql_induced_by_third_party_p0)
                cursor.execute(sql_induced_by_third_party_p0)
                induced_by_third_party_p0_row = cursor.fetchone()
                induced_by_third_party_p0 = induced_by_third_party_p0_row[0] if induced_by_third_party_p0_row else 0

                print(sql_induced_by_third_party_p1)
                cursor.execute(sql_induced_by_third_party_p1)
                induced_by_third_party_p1_row = cursor.fetchone()
                induced_by_third_party_p1 = induced_by_third_party_p1_row[0] if induced_by_third_party_p1_row else 0

                results.append((current_quarter, total_outages, total_outages_p0, total_outages_p1,induced_by_own_bu_p0, induced_by_own_bu_p1, induced_by_other_bu_p0, induced_by_other_bu_p1,induced_by_third_party_p0, induced_by_third_party_p1))

            print(results)
            return results

    except mysql.connector.Error as err:
        print("Error:", err)
        return err

def fetch_incident_counts_platform(bu, quarter):
    try:
        conn = connect_to_mysql()
        if conn:
            cursor = conn.cursor()

            quarters = [(quarter,)]

            # Extract quarter and year from input
            quarter_str, year_str = quarter.split()
            year = int(year_str)
            quarter_num = int(quarter_str[1])

            # Calculate past three quarters
            for i in range(1, 4):
                prev_quarter_num = quarter_num - i
                prev_year = year
                if prev_quarter_num <= 0:
                    prev_quarter_num += 4
                    prev_year -= 1
                prev_quarter_str = 'Q' + str(prev_quarter_num) + ' ' + str(prev_year)
                quarters.append((prev_quarter_str,))

            results = []

            for quarter_tuple in quarters:
                current_quarter = quarter_tuple[0]
                quarter_str, year_str = current_quarter.split()
                year = int(year_str)
                quarter = quarter_str
# SQL statements
                sql_total_outages_platforms = """
                    SELECT COUNT(*)
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu like '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND (major_incident_type LIKE '%P0%' OR major_incident_type LIKE '%P1%')
                    AND status_page_updated='Yes'
                """

                sql_total_outages_platforms_p0 = """
                    SELECT COUNT(*)
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu like '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND (major_incident_type LIKE '%P0%')
                    AND status_page_updated='Yes'
                """

                sql_total_outages_platforms_p1 = """
                    SELECT COUNT(*)
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu like '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND (major_incident_type LIKE '%P1%')
                    AND status_page_updated='Yes'
                """
                sql_induced_by_third_party_platforms_p0 = """
                    SELECT COUNT(*)
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu like '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND issue_category LIKE '%Third Party%'
                    AND major_incident_type LIKE '%P0%'
                    AND status_page_updated='Yes'
                """
                sql_induced_by_third_party_platforms_p1 = """
                    SELECT COUNT(*)
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu like '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND issue_category LIKE '%Third Party%'
                    AND major_incident_type LIKE '%P1%'
                    AND status_page_updated='Yes'
                """
                # Execute SQL queries
                cursor.execute(sql_total_outages_platforms.format(bu.replace("'", ""),bu.replace("'", ""), quarter, year))
                total_outages_row = cursor.fetchone()
                total_outages = total_outages_row[0] if total_outages_row else 0

                cursor.execute(sql_total_outages_platforms_p0.format(bu.replace("'", ""),bu.replace("'", ""), quarter, year))
                total_outages_row = cursor.fetchone()
                total_outages_p0 = total_outages_row[0] if total_outages_row else 0

                cursor.execute(sql_total_outages_platforms_p1.format(bu.replace("'", ""),bu.replace("'", ""), quarter, year))
                total_outages_row = cursor.fetchone()
                total_outages_p1 = total_outages_row[0] if total_outages_row else 0

                cursor.execute(sql_induced_by_third_party_platforms_p0.format(bu.replace("'", ""),bu.replace("'", ""),quarter, year))
                induced_by_third_party_row = cursor.fetchone()
                sql_induced_by_third_party_platforms_p0 = induced_by_third_party_row[0] if induced_by_third_party_row else 0

                cursor.execute(sql_induced_by_third_party_platforms_p1.format(bu.replace("'", ""),bu.replace("'", ""),quarter, year))
                induced_by_third_party_row = cursor.fetchone()
                sql_induced_by_third_party_platforms_p1 = induced_by_third_party_row[0] if induced_by_third_party_row else 0

                results.append((current_quarter, total_outages,total_outages_p0,total_outages_p1, sql_induced_by_third_party_platforms_p0,sql_induced_by_third_party_platforms_p1))
            print(results)
            return results

    except mysql.connector.Error as err:
        print("Error:", err)
        return []


def fetch_incident_counts_customer(bu, quarter):
    try:
        conn = connect_to_mysql()
        if conn:
            cursor = conn.cursor()

            quarters = [(quarter,)]

            # Extract quarter and year from input
            quarter_str, year_str = quarter.split()
            year = int(year_str)
            quarter_num = int(quarter_str[1])

            # Calculate past three quarters
            for i in range(1, 4):
                prev_quarter_num = quarter_num - i
                prev_year = year
                if prev_quarter_num <= 0:
                    prev_quarter_num += 4
                    prev_year -= 1
                prev_quarter_str = 'Q' + str(prev_quarter_num) + ' ' + str(prev_year)
                quarters.append((prev_quarter_str,))

            results = []

            for quarter_tuple in quarters:
                current_quarter = quarter_tuple[0]
                quarter_str, year_str = current_quarter.split()
                year = int(year_str)
                quarter = quarter_str
# SQL statements
                sql_total_outages = """
                    SELECT COUNT(*)
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu like '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND ( major_incident_type LIKE '%P0%' OR major_incident_type LIKE '%P1%')
                    AND status_page_updated='Yes'
                """

                sql_total_outages_p0 = """
                    SELECT COUNT(*)
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu like '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND ( major_incident_type LIKE '%P0%')
                    AND status_page_updated='Yes'
                """

                sql_total_outages_p1 = """
                    SELECT COUNT(*)
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu like '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND ( major_incident_type LIKE '%P1%')
                    AND status_page_updated='Yes'
                """
                sql_induced_by_system_p0 = """
                    SELECT COUNT(*)
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu like '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND (major_incident_type LIKE '%P0%')
                    AND alert_generated_by != 'Customer'
                    AND status_page_updated='Yes'
                """

                sql_induced_by_system_p1 = """
                    SELECT COUNT(*)
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu like '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND (major_incident_type LIKE '%P1%')
                    AND alert_generated_by != 'Customer'
                    AND status_page_updated='Yes'
                """
                sql_induced_by_customer_p0 = """
                    SELECT COUNT(*)
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu like '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND (major_incident_type LIKE '%P0%')
                    AND alert_generated_by='Customer'
                    AND status_page_updated='Yes'
                """
                sql_induced_by_customer_p1 = """
                    SELECT COUNT(*)
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu like '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND (major_incident_type LIKE '%P1%')
                    AND alert_generated_by='Customer'
                    AND status_page_updated='Yes'
                """
                # Execute SQL queries
                cursor.execute(sql_total_outages.format(bu.replace("'", ""),bu.replace("'", ""), quarter, year))
                total_outages_row = cursor.fetchone()
                total_outages = total_outages_row[0] if total_outages_row else 0

                cursor.execute(sql_total_outages_p0.format(bu.replace("'", ""),bu.replace("'", ""), quarter, year))
                total_outages_row = cursor.fetchone()
                total_outages_p0 = total_outages_row[0] if total_outages_row else 0

                cursor.execute(sql_total_outages_p1.format(bu.replace("'", ""),bu.replace("'", ""), quarter, year))
                total_outages_row = cursor.fetchone()
                total_outages_p1 = total_outages_row[0] if total_outages_row else 0

                cursor.execute(sql_induced_by_system_p0.format(bu.replace("'", ""),bu.replace("'", ""),quarter, year))
                induced_by_system_row = cursor.fetchone()
                induced_by_system_p0 = induced_by_system_row[0] if induced_by_system_row else 0

                cursor.execute(sql_induced_by_system_p1.format(bu.replace("'", ""),bu.replace("'", ""),quarter, year))
                induced_by_system_row = cursor.fetchone()
                induced_by_system_p1 = induced_by_system_row[0] if induced_by_system_row else 0

                cursor.execute(sql_induced_by_customer_p0.format(bu.replace("'", ""),bu.replace("'", ""), quarter, year))
                induced_by_customer_row = cursor.fetchone()
                induced_by_customer_p0 = induced_by_customer_row[0] if induced_by_customer_row else 0

                cursor.execute(sql_induced_by_customer_p1.format(bu.replace("'", ""),bu.replace("'", ""), quarter, year))
                induced_by_customer_row = cursor.fetchone()
                induced_by_customer_p1 = induced_by_customer_row[0] if induced_by_customer_row else 0

                results.append((current_quarter, total_outages,total_outages_p0,total_outages_p1, induced_by_system_p0,induced_by_system_p1,induced_by_customer_p0,induced_by_customer_p1))
            print(results)
            return results

    except mysql.connector.Error as err:
        print("Error:", err)
        return
#corresponds to B. Component: Outages Representation Graphical View1 i.e Customer & System Reported
def get_last_12_months_counts_json(bu, quarter):
    try:
        conn = connect_to_mysql()
        if conn:
            cursor = conn.cursor()

            quarters = []
            monthly_results = []
            quarterly_results = {}

            # Extract quarter and year from input
            quarter_str, year_str = quarter.split()  # Split the input into quarter and year
            year = int(year_str)
            quarter_num = int(quarter_str[1])

            # Add the input quarter and year
            quarters.append((quarter,))

            # Calculate past four quarters
            for i in range(1, 4):
                prev_quarter_num = quarter_num - i
                prev_year = year
                if prev_quarter_num <= 0:
                    prev_quarter_num += 4
                    prev_year -= 1
                prev_quarter_str = 'Q' + str(prev_quarter_num) + ' ' + str(prev_year)
                quarters.append((prev_quarter_str,))

            # Fetch quarterly data
            for quarter_tuple in quarters:
                quarter_str, year_str = quarter_tuple[0].split()
                current_year = int(year_str)
                current_quarter = quarter_str

                # Check if the current year exists in quarterly_results dictionary
                if current_year not in quarterly_results:
                    # If not, initialize counts for all quarters of the current year
                    quarterly_results[current_year] = {
                        "Q1": {"Total_Outages": 0, "Customer_Reported": 0, "System_Reported": 0},
                        "Q2": {"Total_Outages": 0, "Customer_Reported": 0, "System_Reported": 0},
                        "Q3": {"Total_Outages": 0, "Customer_Reported": 0, "System_Reported": 0},
                        "Q4": {"Total_Outages": 0, "Customer_Reported": 0, "System_Reported": 0}
                    }

                # SQL statements
                sql_total_outages = """
                    SELECT COUNT(*)
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu like '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND (major_incident_type LIKE '%P0%' OR major_incident_type LIKE '%P1%')
                    AND status_page_updated='Yes'
                """.format(bu.replace("'", ""),bu.replace("'", ""),current_quarter, current_year)

                sql_customer_reported = """
                    SELECT COUNT(*)
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu like '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND alert_generated_by = 'Customer'
                    AND (major_incident_type LIKE '%P0%' OR major_incident_type LIKE '%P1%')
                    AND status_page_updated='Yes'
                """.format(bu.replace("'", ""),bu.replace("'", ""),current_quarter, current_year)

                sql_system_reported = """
                    SELECT COUNT(*)
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu like '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND alert_generated_by != 'Customer'
                    AND (major_incident_type LIKE '%P0%' OR major_incident_type LIKE '%P1%')
                    AND status_page_updated='Yes'
                """.format(bu.replace("'", ""),bu.replace("'", ""),current_quarter, current_year)

                # Execute SQL queries for quarterly data
                cursor.execute(sql_total_outages)
                total_outages_row = cursor.fetchone()
                total_outages = total_outages_row[0] if total_outages_row else 0

                cursor.execute(sql_customer_reported)
                customer_reported_row = cursor.fetchone()
                customer_reported = customer_reported_row[0] if customer_reported_row else 0

                cursor.execute(sql_system_reported)
                system_reported_row = cursor.fetchone()
                system_reported = system_reported_row[0] if system_reported_row else 0

                # Update quarterly results
                quarterly_results[current_year][current_quarter]["Total_Outages"] = total_outages
                quarterly_results[current_year][current_quarter]["Customer_Reported"] = customer_reported
                quarterly_results[current_year][current_quarter]["System_Reported"] = system_reported

            # Calculate past twelve months
            current_month = int(quarter[1]) * 3 + 1
            print(current_month)
            current_month_year = int(year)
            for i in range(12):
                current_month -= 1
                if current_month == 0:
                    current_month = 12
                    current_month_year -= 1
                month_str = calendar.month_abbr[current_month]
                print(month_str)
                monthly_results.append({
                    "Month": month_str,
                    "Year": current_month_year,
                    "Counts": fetch_monthly_data(bu, current_month, current_month_year)
                })

            # Sort quarterly and monthly results
            sorted_quarterly_results = {year: quarterly_results[year] for year in sorted(quarterly_results.keys(), reverse=True)}
            sorted_monthly_results = sorted(monthly_results, key=lambda x: (x["Year"], list(calendar.month_abbr).index(x["Month"])))

            return {"quarterly": sorted_quarterly_results, "monthly": sorted_monthly_results}

    except mysql.connector.Error as err:
        print("Error:", err)
        return []

def fetch_monthly_data(bu, month, year):
    try:
        conn = connect_to_mysql()
        if conn:
            cursor = conn.cursor()

            # Get the first three letters of the month's name
            month_abbr = calendar.month_abbr[month]

            sql_total_outages = """
                SELECT COUNT(*)
                FROM incidents
                WHERE (affected_bu LIKE '%{}%' OR bu like '%{}%')
                AND month = '{}'
                AND year = {}
                AND (major_incident_type LIKE '%P0%' OR major_incident_type LIKE '%P1%')
                AND status_page_updated='Yes'
            """.format(bu.replace("'", ""),bu.replace("'", ""), month_abbr, year)

            sql_customer_reported = """
                SELECT COUNT(*)
                FROM incidents
                WHERE (affected_bu LIKE '%{}%' OR bu like '%{}%')
                AND month = '{}'
                AND year = {}
                AND alert_generated_by = 'Customer'
                AND (major_incident_type LIKE '%P0%' OR major_incident_type LIKE '%P1%')
                AND status_page_updated='Yes'
            """.format(bu.replace("'", ""),bu.replace("'", ""), month_abbr, year)

            sql_system_reported = """
                SELECT COUNT(*)
                FROM incidents
                WHERE (affected_bu LIKE '%{}%' OR bu like '%{}%')
                AND month = '{}'
                AND year = {}
                AND alert_generated_by != 'Customer'
                AND (major_incident_type LIKE '%P0%' OR major_incident_type LIKE '%P1%')
                AND status_page_updated='Yes'
            """.format(bu.replace("'", ""),bu.replace("'", ""),month_abbr, year)

            # Execute SQL queries for monthly data
            cursor.execute(sql_total_outages)
            total_outages_row = cursor.fetchone()
            total_outages = total_outages_row[0] if total_outages_row else 0

            cursor.execute(sql_customer_reported)
            customer_reported_row = cursor.fetchone()
            customer_reported = customer_reported_row[0] if customer_reported_row else 0

            cursor.execute(sql_system_reported)
            system_reported_row = cursor.fetchone()
            system_reported = system_reported_row[0] if system_reported_row else 0

            return {
                "Total_Outages": total_outages,
                "Customer_Reported": customer_reported,
                "System_Reported": system_reported
            }

    except mysql.connector.Error as err:
        print("Error:", err)
        return {"Total_Outages": 0, "Customer_Reported": 0, "System_Reported": 0}

#corresponds to B. Component: Outages Representation Graphical View1 i.e Other and Same BU
def get_last_12_months_counts_json_view2(bu, quarter):
    try:
        conn = connect_to_mysql()
        if conn:
            cursor = conn.cursor()

            quarters = []
            monthly_results = []
            quarterly_results = {}

            # Extract quarter and year from input
            quarter_str, year_str = quarter.split()  # Split the input into quarter and year
            quarter = quarter_str
            year = int(year_str)

            # Add the input quarter and year
            quarters.append((quarter, year))

            # Calculate past four quarters
            for i in range(1, 5):
                prev_quarter_num = int(quarter[1]) - i
                prev_year = year
                if prev_quarter_num <= 0:
                    prev_quarter_num += 4
                    prev_year -= 1
                prev_quarter_str = 'Q' + str(prev_quarter_num)
                quarters.append((prev_quarter_str, prev_year))

            # Fetch quarterly data
            for quarter_tuple in quarters:
                current_quarter, current_year = quarter_tuple

                # Initialize dictionary for the current year if it does not exist
                if current_year not in quarterly_results:
                    quarterly_results[current_year] = {
                        "Q1": {"Total_Outages": 0, "Same_BU_Reported": 0, "Other_BU_Reported": 0, "Third_party_reported": 0},
                        "Q2": {"Total_Outages": 0, "Same_BU_Reported": 0, "Other_BU_Reported": 0, "Third_party_reported": 0},
                        "Q3": {"Total_Outages": 0, "Same_BU_Reported": 0, "Other_BU_Reported": 0, "Third_party_reported": 0},
                        "Q4": {"Total_Outages": 0, "Same_BU_Reported": 0, "Other_BU_Reported": 0, "Third_party_reported": 0}
                    }

                # SQL statements for quarterly data
                sql_total_outages = """
                    SELECT COUNT(*)
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu LIKE '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND (major_incident_type LIKE '%P0%' OR major_incident_type LIKE '%P1%')
                    AND status_page_updated='Yes'
                """.format(bu.replace("'", ""), bu.replace("'", ""), current_quarter, current_year)

                sql_samebu_reported = """
                    SELECT COUNT(*)
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu LIKE '%{}%')
                    AND bu = '{}'
                    AND quarter = '{}'
                    AND year = {}
                    AND issue_category NOT LIKE '%Third Party%'
                    AND (major_incident_type LIKE '%P0%' OR major_incident_type LIKE '%P1%')
                    AND status_page_updated='Yes'
                """.format(bu.replace("'", ""), bu.replace("'", ""), bu.replace("'", ""), current_quarter, current_year)

                sql_otherbu_reported = """
                    SELECT COUNT(*)
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' AND bu NOT LIKE '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND issue_category NOT LIKE '%Third Party%'
                    AND (major_incident_type LIKE '%P0%' OR major_incident_type LIKE '%P1%')
                    AND status_page_updated='Yes'
                """.format(bu.replace("'", ""), bu.replace("'", ""), current_quarter, current_year)

                sql_induced_by_third_party = """
                    SELECT COUNT(*)
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu LIKE '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND issue_category LIKE '%Third Party%'
                    AND (major_incident_type LIKE '%P0%' OR major_incident_type LIKE '%P1%')
                    AND status_page_updated='Yes'
                """.format(bu.replace("'", ""), bu.replace("'", ""), current_quarter, current_year)

                # Execute SQL queries for quarterly data
                cursor.execute(sql_total_outages)
                total_outages_row = cursor.fetchone()
                total_outages = total_outages_row[0] if total_outages_row else 0

                cursor.execute(sql_samebu_reported)
                samebu_reported_row = cursor.fetchone()
                samebu_reported = samebu_reported_row[0] if samebu_reported_row else 0

                cursor.execute(sql_otherbu_reported)
                otherbu_reported_row = cursor.fetchone()
                otherbu_reported = otherbu_reported_row[0] if otherbu_reported_row else 0

                cursor.execute(sql_induced_by_third_party)
                induced_by_third_party_row = cursor.fetchone()
                induced_by_third_party = induced_by_third_party_row[0] if induced_by_third_party_row else 0

                # Update quarterly results only if there is data
                if total_outages > 0 or samebu_reported > 0 or otherbu_reported > 0 or induced_by_third_party > 0:
                    quarterly_results[current_year][current_quarter]["Total_Outages"] = total_outages
                    quarterly_results[current_year][current_quarter]["Same_BU_Reported"] = samebu_reported
                    quarterly_results[current_year][current_quarter]["Other_BU_Reported"] = otherbu_reported
                    quarterly_results[current_year][current_quarter]["Third_party_reported"] = induced_by_third_party

            # Calculate past twelve months
            current_month = int(quarter[1]) * 3 + 1
            current_month_year = int(year)
            for i in range(12):
                current_month -= 1
                if current_month == 0:
                    current_month = 12
                    current_month_year -= 1
                month_str = calendar.month_abbr[current_month]
                monthly_results.append({
                    "Month": month_str,
                    "Year": current_month_year,
                    "Counts": fetch_monthly_data_view2(bu, current_month, current_month_year)
                })

            # Sort quarterly and monthly results
            sorted_quarterly_results = {year: quarterly_results[year] for year in sorted(quarterly_results.keys(), reverse=True)}
            sorted_monthly_results = sorted(monthly_results, key=lambda x: (x["Year"], list(calendar.month_abbr).index(x["Month"])))

            return {"quarterly": sorted_quarterly_results, "monthly": sorted_monthly_results}

    except mysql.connector.Error as err:
        print("Error:", err)
        return []

def fetch_monthly_data_view2(bu, month, year):
    try:
        conn = connect_to_mysql()
        if conn:
            cursor = conn.cursor()

            # Get the first three letters of the month's name
            month_abbr = calendar.month_abbr[month]

            # SQL statements for monthly data
            sql_total_outages = """
                SELECT COUNT(*)
                FROM incidents
                WHERE (affected_bu LIKE '%{}%' OR bu LIKE '%{}%')
                AND month = '{}'
                AND year = {}
                AND (major_incident_type LIKE '%P0%' OR major_incident_type LIKE '%P1%')
                AND status_page_updated='Yes'
            """.format(bu.replace("'", ""), bu.replace("'", ""), month_abbr, year)

            sql_samebu_reported = """
                SELECT COUNT(*)
                FROM incidents
                WHERE (affected_bu LIKE '%{}%' OR bu LIKE '%{}%')
                AND bu = '{}'
                AND month = '{}'
                AND year = {}
                AND issue_category NOT LIKE '%Third Party%'
                AND (major_incident_type LIKE '%P0%' OR major_incident_type LIKE '%P1%')
                AND status_page_updated='Yes'
            """.format(bu.replace("'", ""), bu.replace("'", ""), bu.replace("'", ""), month_abbr, year)

            sql_otherbu_reported = """
                SELECT COUNT(*)
                FROM incidents
                WHERE (affected_bu LIKE '%{}%' AND bu NOT LIKE '%{}%')
                AND month = '{}'
                AND year = {}
                AND issue_category NOT LIKE '%Third Party%'
                AND (major_incident_type LIKE '%P0%' OR major_incident_type LIKE '%P1%')
                AND status_page_updated='Yes'
            """.format(bu.replace("'", ""), bu.replace("'", ""), month_abbr, year)

            sql_induced_by_third_party = """
                SELECT COUNT(*) FROM incidents
                WHERE (affected_bu LIKE '%{}%' OR bu LIKE '%{}%')
                AND month = '{}'
                AND year = {}
                AND issue_category LIKE '%Third Party%'
                AND (major_incident_type LIKE '%P0%' OR major_incident_type LIKE '%P1%')
                AND status_page_updated='Yes'
            """.format(bu.replace("'", ""), bu.replace("'", ""), month_abbr, year)

            # Execute SQL queries for monthly data
            cursor.execute(sql_total_outages)
            total_outages_row = cursor.fetchone()
            total_outages = total_outages_row[0] if total_outages_row else 0

            cursor.execute(sql_samebu_reported)
            samebu_reported_row = cursor.fetchone()
            samebu_reported = samebu_reported_row[0] if samebu_reported_row else 0

            cursor.execute(sql_otherbu_reported)
            otherbu_reported_row = cursor.fetchone()
            otherbu_reported = otherbu_reported_row[0] if otherbu_reported_row else 0

            cursor.execute(sql_induced_by_third_party)
            induced_by_third_party_row = cursor.fetchone()
            induced_by_third_party = induced_by_third_party_row[0] if induced_by_third_party_row else 0

            return {
                "Total_Outages": total_outages,
                "Same_BU_Reported": samebu_reported,
                "Other_BU_Reported": otherbu_reported,
                "Third_party_reported": induced_by_third_party
            }

    except mysql.connector.Error as err:
        print("Error:", err)
        return {"Total_Outages": 0, "Same_BU_Reported": 0, "Other_BU_Reported": 0, "Third_party_reported": 0}

#View3 Corresponds to MTTD w/o Platforms & with platforms P0
def get_last_12_months_counts_json_view3(bu, quarter):
    try:
        conn = connect_to_mysql()
        if conn:
            cursor = conn.cursor()

            quarters = []
            # Extract quarter and year from input
            quarter_str, year_str = quarter.split()  # Split the input into quarter and year
            quarter = quarter_str
            year = int(year_str)

            # Add the input quarter and year
            quarters.append((quarter, year))

            # Calculate past four quarters
            for i in range(1, 5):
                prev_quarter_num = int(quarter[1]) - i
                prev_year = year
                if prev_quarter_num <= 0:
                    prev_quarter_num += 4
                    prev_year -= 1
                prev_quarter_str = 'Q' + str(prev_quarter_num)
                quarters.append((prev_quarter_str, prev_year))

            results = []
            results2 = []

            # Calculate past twelve months
            current_month = int(quarter[1]) * 3 + 1
            current_month_year = int(year)
            for i in range(12):
                current_month -= 1
                if current_month == 0:
                    current_month = 12
                    current_month_year -= 1
                month_str = calendar.month_abbr[current_month]
                nonplatform_ttd = fetch_monthly_data_view3(bu, current_month, current_month_year)["nonplatformttd"]
                withplatform_ttd = fetch_monthly_data_view3_with_platforms(bu, current_month, current_month_year)["withplatformttd"]

                results.append({
                    "Month": month_str,
                    "Year": current_month_year,
                    "Non_Platform_TTD": nonplatform_ttd
                })
                results2.append({
                    "Month": month_str,
                    "Year": current_month_year,
                    "With_Platform_TTD": withplatform_ttd
                })

            # Sort the results
            results.sort(key=lambda x: (x["Year"], list(calendar.month_abbr).index(x["Month"])))
            results2.sort(key=lambda x: (x["Year"], list(calendar.month_abbr).index(x["Month"])))
            return results, results2

    except mysql.connector.Error as err:
        print("Error:", err)
        return [], []

## MTTD calculations for monthly for quarter it is at the end.
def fetch_monthly_data_view3(bu, month, year):
    try:
        conn = connect_to_mysql()
        if conn:
            cursor = conn.cursor()

            # Get the first three letters of the month's name
            month_abbr = calendar.month_abbr[month]

            sql_nonplatform_ttd = """
                SELECT CEIL(AVG(time_to_detect_in_minutes))
                FROM incidents
                WHERE (affected_bu LIKE '%{}%' OR  bu LIKE '%{}%')
                AND bu = {}
                AND month='{}'
                AND year = {}
                AND (major_incident_type LIKE '%P0%' OR major_incident_type LIKE '%P1%')
                AND issue_category NOT LIKE '%Third Party%'
                AND status_page_updated='Yes'
            """.format(bu.replace("'", ""),bu.replace("'", ""),bu,month_abbr, year)

            print(sql_nonplatform_ttd)
            # Execute SQL queries for monthly data
            cursor.execute(sql_nonplatform_ttd)
            total_outages_row = cursor.fetchone()
            total_outages=total_outages_row[0] if total_outages_row and total_outages_row[0] is not None else 0
            return {
                "nonplatformttd": total_outages
            }

    except mysql.connector.Error as err:
        print("Error:", err)
        return {"nonplatformttd": 0}

def fetch_monthly_data_view3_with_platforms(bu, month, year):
    try:
        conn = connect_to_mysql()
        if conn:
            cursor = conn.cursor()

            # Get the first three letters of the month's name
            month_abbr = calendar.month_abbr[month]

            sql_platform_ttd = """
                SELECT CEIL(AVG(time_to_detect_in_minutes))
                FROM incidents
                WHERE (affected_bu LIKE '%{}%' AND  bu not like '%{}%')
                AND month='{}'
                AND year = {}
                AND (major_incident_type LIKE '%P0%' OR major_incident_type LIKE '%P1%')
                AND issue_category NOT LIKE '%Third Party%'
                AND status_page_updated='Yes'
            """.format(bu.replace("'", ""),bu.replace("'", ""),month_abbr, year)

            # Print SQL queries
            print(sql_platform_ttd)
            # Execute SQL queries for monthly data
            cursor.execute(sql_platform_ttd)
            total_outages_row = cursor.fetchone()
            total_outages = total_outages_row[0] if total_outages_row and total_outages_row[0] is not None else 0
            return {
                "withplatformttd": total_outages
            }

    except mysql.connector.Error as err:
        print("Error:", err)
        return {"withplatformttd": 0}




## P0 MTTR with and without platforms monthly trend

def get_p0_mttr_monthly(bu, quarter):
    try:
        conn = connect_to_mysql()
        if conn:
            cursor = conn.cursor()

            results = []
            results2 = []

            quarters = []

            # Extract quarter and year from input
            quarter_str, year_str = quarter.split()  # Split the input into quarter and year
            quarter_num = int(quarter_str[1])
            year = int(year_str)

            # Add the input quarter and year
            quarters.append((quarter_num, year))

            # Calculate past four quarters
            for i in range(1, 5):
                prev_quarter_num = quarter_num - i
                prev_year = year
                if prev_quarter_num <= 0:
                    prev_quarter_num += 4
                    prev_year -= 1
                quarters.append((prev_quarter_num, prev_year))

            for i in range(12):
                # Calculate the month and year for the current iteration
                current_month = quarter_num * 3 - i
                current_year = year
                if current_month <= 0:
                    current_month += 12
                    current_year -= 1

                # Get the first three letters of the month's name
                month_abbr = calendar.month_abbr[current_month]

                # Fetch monthly data for non-platform and platform incidents
                nonplatform_ttr = get_p0_mttr_monthly_without_platforms(bu, current_month, current_year)["nonplatformttr"]
                withplatform_ttr = get_p0_mttr_monthly_with_platforms(bu, current_month, current_year)["withplatformttr"]

                results.append({
                    "Month": month_abbr,
                    "Year": current_year,
                    "Non_Platform_TTR": nonplatform_ttr
                })
                results2.append({
                    "Month": month_abbr,
                    "Year": current_year,
                    "With_Platform_TTR": withplatform_ttr
                })

            return results, results2

    except mysql.connector.Error as err:
        print("Error:", err)
        return [], []

def get_p0_mttr_monthly_without_platforms(bu, month, year):
    try:
        conn = connect_to_mysql()
        if conn:
            cursor = conn.cursor()

            # Get the first three letters of the month's name
            month_abbr = calendar.month_abbr[month]

            sql_nonplatform_ttr = """
                SELECT time_to_recover_in_minutes
                FROM incidents
                WHERE (affected_bu LIKE '%{}%' OR  bu LIKE '%{}%')
                AND bu = {}
                AND month='{}'
                AND year = {}
                AND major_incident_type LIKE '%P0%'
                AND issue_category NOT LIKE '%Third Party%'
                AND status_page_updated='Yes'
            """.format(bu.replace("'", ""), bu.replace("'", ""),bu,month_abbr, year)

            # Execute SQL queries for monthly data
            cursor.execute(sql_nonplatform_ttr)
            ttr_rows = cursor.fetchall()

            # If no rows are returned, return a dictionary with the default value
            if not ttr_rows:
                return {"nonplatformttr": 0}

            # Filter out None values
            ttr_rows = [row for row in ttr_rows if row[0] is not None]

            # Calculate count of incidents and number of incidents to remove
            total_incidents = len(ttr_rows)
            #incidents_to_remove = int(total_incidents * 0.10)

            # Sort incidents based on TTR in descending order
            ttr_rows.sort(key=lambda x: x[0], reverse=True)

            # Remove top N incidents
            #ttr_rows = ttr_rows[incidents_to_remove:]

            # Calculate average TTR for the remaining incidents
            total_ttr = sum(row[0] for row in ttr_rows)
            avg_ttr = total_ttr / len(ttr_rows) if ttr_rows else 0

            return {"nonplatformttr": round(avg_ttr, 2)}  # Return TTR rounded to 2 decimal places

    except mysql.connector.Error as err:
        print("Error:", err)
        return {"nonplatformttr": 0}  # Return default value in case of error


def get_p0_mttr_monthly_with_platforms(bu, month, year):
    try:
        conn = connect_to_mysql()
        if conn:
            cursor = conn.cursor()

            # Get the first three letters of the month's name
            month_abbr = calendar.month_abbr[month]

            sql_platform_ttr = """
                SELECT time_to_recover_in_minutes
                FROM incidents
                WHERE (affected_bu LIKE '%{}%' AND bu not like '%{}%')
                AND month='{}'
                AND year = {}
                AND major_incident_type LIKE '%P0%'
                AND issue_category NOT LIKE '%Third Party%'
                AND status_page_updated='Yes'
            """.format(bu.replace("'", ""), bu.replace("'", ""),month_abbr, year)

            # Execute SQL queries for monthly data
            cursor.execute(sql_platform_ttr)
            ttr_rows = cursor.fetchall()

            # If no rows are returned, return a dictionary with the default value
            if not ttr_rows:
                return {"withplatformttr": 0}

            # Filter out None values
            ttr_rows = [row for row in ttr_rows if row[0] is not None]

            # Calculate count of incidents and number of incidents to remove
            total_incidents = len(ttr_rows)
            #incidents_to_remove = int(total_incidents * 0.10)

            # Sort incidents based on TTR in descending order
            ttr_rows.sort(key=lambda x: x[0], reverse=True)

            # Remove top N incidents
            #ttr_rows = ttr_rows[incidents_to_remove:]

            # Calculate average TTR for the remaining incidents
            total_ttr = sum(row[0] for row in ttr_rows)
            avg_ttr = total_ttr / len(ttr_rows) if ttr_rows else 0

            return {"withplatformttr": round(avg_ttr, 2)}

    except mysql.connector.Error as err:
        print("Error:", err)
        return {"withplatformttr": 0}

## P1 MTTR with and without platforms monthly trend

def get_p1_mttr_monthly(bu, quarter):
    try:
        conn = connect_to_mysql()
        if conn:
            cursor = conn.cursor()

            results = []
            results2 = []

            quarters = []

            # Extract quarter and year from input
            quarter_str, year_str = quarter.split()  # Split the input into quarter and year
            quarter_num = int(quarter_str[1])
            year = int(year_str)

            # Add the input quarter and year
            quarters.append((quarter_num, year))

            # Calculate past four quarters
            for i in range(1, 5):
                prev_quarter_num = quarter_num - i
                prev_year = year
                if prev_quarter_num <= 0:
                    prev_quarter_num += 4
                    prev_year -= 1
                quarters.append((prev_quarter_num, prev_year))

            for i in range(12):
                # Calculate the month and year for the current iteration
                current_month = quarter_num * 3 - i
                current_year = year
                if current_month <= 0:
                    current_month += 12
                    current_year -= 1

                # Get the first three letters of the month's name
                month_abbr = calendar.month_abbr[current_month]

                # Fetch monthly data for non-platform and platform incidents
                nonplatform_ttr = get_p1_mttr_monthly_without_platforms(bu, current_month, current_year)["nonplatformttr"]
                withplatform_ttr = get_p1_mttr_monthly_with_platforms(bu, current_month, current_year)["withplatformttr"]

                results.append({
                    "Month": month_abbr,
                    "Year": current_year,
                    "Non_Platform_TTR": nonplatform_ttr
                })
                results2.append({
                    "Month": month_abbr,
                    "Year": current_year,
                    "With_Platform_TTR": withplatform_ttr
                })

            return results, results2

    except mysql.connector.Error as err:
        print("Error:", err)
        return [], []

def get_p1_mttr_monthly_with_platforms(bu, month, year):
    try:
        conn = connect_to_mysql()
        if conn:
            cursor = conn.cursor()

            # Get the first three letters of the month's name
            month_abbr = calendar.month_abbr[month]

            sql_platform_ttr = """
                SELECT time_to_recover_in_minutes
                FROM incidents
                WHERE (affected_bu LIKE '%{}%' AND bu  not like '%{}%')
                AND month='{}'
                AND year = {}
                AND major_incident_type LIKE '%P1%'
                AND issue_category NOT LIKE '%Third Party%'
                AND status_page_updated='Yes'
            """.format(bu.replace("'", ""),bu.replace("'", ""), month_abbr, year)

            # Execute SQL queries for monthly data
            cursor.execute(sql_platform_ttr)
            ttr_rows = cursor.fetchall()

            # If no rows are returned, return a dictionary with the default value
            if not ttr_rows:
                return {"withplatformttr": 0}

            # Filter out None values
            ttr_rows = [row for row in ttr_rows if row[0] is not None]

            # Calculate count of incidents and number of incidents to remove
            total_incidents = len(ttr_rows)
            #incidents_to_remove = int(total_incidents * 0.10)

            # Sort incidents based on TTR in descending order
            ttr_rows.sort(key=lambda x: x[0], reverse=True)

            # Remove top N incidents
            #ttr_rows = ttr_rows[incidents_to_remove:]

            # Calculate average TTR for the remaining incidents
            total_ttr = sum(row[0] for row in ttr_rows)
            avg_ttr = total_ttr / len(ttr_rows) if ttr_rows else 0

            return {"withplatformttr": round(avg_ttr,2)}  # Return TTR as part of a dictionary

    except mysql.connector.Error as err:
        print("Error:", err)
        return {"withplatformttr": 0}  # Return default value in case of error

def get_p1_mttr_monthly_without_platforms(bu, month, year):
    try:
        conn = connect_to_mysql()
        if conn:
            cursor = conn.cursor()

            # Get the first three letters of the month's name
            month_abbr = calendar.month_abbr[month]

            sql_nonplatform_ttr = """
                SELECT time_to_recover_in_minutes
                FROM incidents
                WHERE (affected_bu LIKE '%{}%' OR bu like '%{}%')
                AND bu = {}
                AND month='{}'
                AND year = {}
                AND major_incident_type LIKE '%P1%'
                AND issue_category NOT LIKE '%Third Party%'
                AND status_page_updated='Yes'
            """.format(bu.replace("'", ""),bu.replace("'", ""),bu, month_abbr, year)

            # Execute SQL queries for monthly data
            cursor.execute(sql_nonplatform_ttr)
            ttr_rows = cursor.fetchall()

            # If no rows are returned, return a dictionary with the default value
            if not ttr_rows:
                return {"nonplatformttr": 0}

            # Filter out None values
            ttr_rows = [row for row in ttr_rows if row[0] is not None]

            # Calculate count of incidents and number of incidents to remove
            total_incidents = len(ttr_rows)
            #incidents_to_remove = int(total_incidents * 0.10)

            # Sort incidents based on TTR in descending order
            ttr_rows.sort(key=lambda x: x[0], reverse=True)

            # Remove top N incidents
            #ttr_rows = ttr_rows[incidents_to_remove:]

            # Calculate average TTR for the remaining incidents
            total_ttr = sum(row[0] for row in ttr_rows)
            avg_ttr = total_ttr / len(ttr_rows) if ttr_rows else 0

            return {"nonplatformttr": round(avg_ttr,2)}  # Return TTR as part of a dictionary

    except mysql.connector.Error as err:
        print("Error:", err)
        return {"nonplatformttr": 0}  # Return default value in case of error

##Get KPI

def calculate_kpis(bu, quarter):
    try:
        conn = connect_to_mysql()
        if conn:
            cursor = conn.cursor()
            # Split quarter into quarter and year
            quarter_str, year_str = quarter.split()  # Split the input into quarter and year
            quarter_num = int(quarter_str[1:])  # Extract the quarter number
            year = int(year_str)

            prev_quarter_num = quarter_num - 1 if quarter_num > 1 else 4
            prev_year = year - 1 if prev_quarter_num == 4 else year

            # Format quarter for SQL query
            formatted_quarter = f"Q{quarter_num}"
            prev_quarter = f"Q{prev_quarter_num}"

            # SQL query to get incidents for the given quarter and business unit
            sql = """
                SELECT major_incident_type, time_to_detect_in_minutes, time_to_recover_in_minutes, alert_generated_by
                FROM incidents
                WHERE major_incident_type IN ('Partial Outage (P0)', 'Performance Degradation (P1)', 'Full Outage (P0)')
                AND (affected_bu LIKE '%{}%' OR bu like '%{}%') AND quarter = '{}' AND year = {}  AND  issue_category NOT LIKE '%Third Party%'
            """.format(bu.replace("'", ""), bu.replace("'", ""), formatted_quarter, year)
            cursor.execute(sql)
            incidents = cursor.fetchall()

            sql2 = """
                SELECT major_incident_type, time_to_detect_in_minutes, time_to_recover_in_minutes, alert_generated_by
                FROM incidents
                WHERE major_incident_type IN ('Partial Outage (P0)', 'Performance Degradation (P1)', 'Full Outage (P0)')
                AND (affected_bu LIKE '%{}%' OR bu like '%{}%') AND quarter = '{}' AND year = {} AND  issue_category NOT LIKE '%Third Party%'
            """.format(bu.replace("'", ""), bu.replace("'", ""), prev_quarter, prev_year)
            print(sql2)
            cursor.execute(sql2)
            incidents2 = cursor.fetchall()

            # Baselines
            baseline_mttd = 15
            baseline_mttr_p0 = 60
            baseline_mttr_p1 = 120
            baseline_count_p0_p1 = round(0.5 * len(incidents2))  # 50% of incidents from the previous quarter

            # Variables for KPIs
            mttd = 0
            mttr_p0 = 0
            mttr_p1 = 0
            count_p0_p1 = 0
            total_incidents_detected_by_system = 0

            # Calculate KPIs
            if incidents:
                p0_incidents = [incident for incident in incidents if 'P0' in incident[0]]
                p1_incidents = [incident for incident in incidents if incident[0] == 'Performance Degradation (P1)']

                # Calculate MTTD for P0 and P1 incidents
                mttd_p0_list = [incident[1] for incident in p0_incidents if incident[1] is not None]
                mttd_p1_list = [incident[1] for incident in p1_incidents if incident[1] is not None]

                mttd_p0 = sum(mttd_p0_list) / len(mttd_p0_list) if mttd_p0_list else 0
                mttd_p1 = sum(mttd_p1_list) / len(mttd_p1_list)  if mttd_p1_list else 0

                mttd = (mttd_p0 + mttd_p1) / 2

                # Calculate MTTR for P0 incidents
                mttr_p0_list = [incident[2] for incident in p0_incidents if incident[2] is not None]
                mttr_p1_list = [incident[2] for incident in p1_incidents if incident[2] is not None]

                mttr_p0 = sum(mttr_p0_list) / len(mttr_p0_list) if mttr_p0_list else 0

                # Calculate MTTR for P1 incidents
                mttr_p1 = sum(mttr_p1_list) / len(mttr_p1_list) if mttr_p1_list else 0

                # Count of incidents
                count_p0_p1 = len(p0_incidents) + len(p1_incidents)

                # Count of total incidents detected by system (excluding 'Customer' alerts)
                total_incidents_detected_by_system = sum(1 for incident in incidents if 'Customer' not in incident[3])

            # Prepare dictionary with all KPIs and their baselines
            kpis = {
                "mttd": {
                    "value": round(mttd,2),
                    "baseline": baseline_mttd
                },
                "mttr_p0": {
                    "value": round(mttr_p0,2),
                    "baseline": baseline_mttr_p0
                },
                "mttr_p1": {
                    "value": round(mttr_p1,2),
                    "baseline": baseline_mttr_p1
                },
                "count_p0_p1": {
                    "value": count_p0_p1,
                    "baseline": baseline_count_p0_p1
                },
                "total_incidents_detected_by_system": {
                    "value": total_incidents_detected_by_system,
                    "baseline": round(0.8*len(incidents))
                }
            }
            print(kpis)
            return kpis

    except mysql.connector.Error as e:
        print("Error executing MySQL query:", e)
        return None



def calculate_availability_percentage(quarter):
    # Define the input quarter and year
    conn = connect_to_mysql()
    quarter, year = quarter.split()
    year = int(year)
    # Map quarter names to their corresponding numbers
    quarter_mapping = {"Q1": 1, "Q2": 2, "Q3": 3, "Q4": 4}

    # Get the quarter number
    quarter_num = quarter_mapping[quarter]

    # Define the SQL query to fetch the required data for the specified quarter and year
    query = f"""
    SELECT msf_products_affected, msf_affected_regions, time_to_recover_in_minutes
    FROM incidents
    WHERE major_incident_type IN ('Full Outage (P0)', 'Partial Outage (P0)')
        AND quarter = '{quarter}' AND year = {year}
    """

    # Fetch data from MySQL
    df = pd.read_sql(query, conn)

    # Close the database connection
    conn.close()

    # Initialize a dictionary to store availability data
    availability_data = {}

    # Iterate over each row in the DataFrame
    for _, row in df.iterrows():
        products = row['msf_products_affected'].split(',')  # Split comma-separated products
        regions = row['msf_affected_regions'].split(',')  # Split comma-separated regions
        ttr_minutes = row['time_to_recover_in_minutes']

        # Handle NaN values
        if pd.isna(ttr_minutes):
            ttr_minutes = 0
            availability_percentage = 100.0
        else:
            # Calculate availability percentage
            total_minutes_per_quarter = 13 * 7 * 24 * 60  # 13 weeks * 7 days * 24 hours * 60 minutes
            availability_percentage = round(((total_minutes_per_quarter - ttr_minutes) / total_minutes_per_quarter) * 100, 2)

        # Update availability data for each product and region
        for product in products:
            for region in regions:
                if product not in availability_data:
                    availability_data[product] = {}
                if region not in availability_data[product]:
                    availability_data[product][region] = []

                # Append the availability percentage and downtime to the list
                availability_data[product][region].append({
                    'availability_percentage': availability_percentage,
                    'ttr_minutes': ttr_minutes
                })

    # Ensure all products have entries for all regions
    for product in availability_data:
        for region in ['US', 'EU', 'IN', 'AU']:
            if region not in availability_data[product]:
                availability_data[product][region] = [{
                    'availability_percentage': 100.0,
                    'ttr_minutes': 0
                }]

    # Calculate availability percentage considering multiple entries for the same product and region
    for product in availability_data:
        for region in availability_data[product]:
            total_ttr_minutes = sum(entry['ttr_minutes'] for entry in availability_data[product][region])
            total_availability_percentage = round(((total_minutes_per_quarter - total_ttr_minutes) / total_minutes_per_quarter) * 100, 2)
            availability_data[product][region] = [{
                'availability_percentage': total_availability_percentage,
                'ttr_minutes': total_ttr_minutes
            }]

    # Sort regions alphabetically
    for product in availability_data:
        for region in availability_data[product]:
            availability_data[product][region] = sorted(availability_data[product][region], key=lambda x: x['availability_percentage'], reverse=True)

    return availability_data


def getMttdDataQuarter(bu, quarter):
    try:
        conn = connect_to_mysql()
        if conn:
            cursor = conn.cursor()

            quarters = []

            # Extract quarter and year from input
            quarter_str, year_str = quarter.split()  # Split the input into quarter and year
            year = int(year_str)

            # Add the input quarter and year
            quarters.append((quarter_str, year))

            # Calculate past four quarters
            quarter_num = int(quarter_str[1])
            for i in range(1, 5):
                prev_quarter_num = quarter_num - i
                prev_year = year
                if prev_quarter_num <= 0:
                    prev_quarter_num += 4
                    prev_year -= 1
                prev_quarter_str = 'Q' + str(prev_quarter_num)
                quarters.append((prev_quarter_str, prev_year))

            results = []
            results2=[]

            # Fetch quarterly data
            for quarter_tuple in quarters:
                current_quarter, current_year = quarter_tuple

                # Fetch non-platform TTD for the quarter
                sql_nonplatform_ttd = """
                    SELECT CEIL(AVG(time_to_detect_in_minutes))
                    FROM incidents
                    WHERE (affected_bu like '%{}%' OR bu like '%{}%')
                    AND bu = {}
                    AND quarter = '{}'
                    AND year = {}
                    AND (major_incident_type LIKE '%P0%' OR major_incident_type LIKE '%P1%')
                    AND issue_category NOT LIKE '%Third Party%' AND status_page_updated='Yes'
                """.format(bu.replace("'", ""), bu.replace("'", ""),bu,current_quarter, current_year)

                # Fetch with-platform TTD for the quarter
                sql_platform_ttd = """
                    SELECT CEIL(AVG(time_to_detect_in_minutes))
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' AND bu not like '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND (major_incident_type LIKE '%P0%' OR major_incident_type LIKE '%P1%')
                    AND issue_category NOT LIKE '%Third Party%' AND status_page_updated='Yes'
                """.format(bu.replace("'", ""), bu.replace("'", ""), current_quarter, current_year)

                # Execute SQL queries for quarterly data
                cursor.execute(sql_nonplatform_ttd)
                nonplatform_ttd_row = cursor.fetchone()
                nonplatform_ttd = nonplatform_ttd_row[0] if nonplatform_ttd_row else None

                cursor.execute(sql_platform_ttd)
                platform_ttd_row = cursor.fetchone()
                platform_ttd = platform_ttd_row[0] if platform_ttd_row else None

                # Add data to results only if it's not None
                if nonplatform_ttd is not None or platform_ttd is not None:
                    results.append({
                        "Quarter": current_quarter + ' ' + str(current_year),
                        "BU": bu,
                        "With_Platform_TTD": platform_ttd or 0
                    })
                    results2.append({
                        "Quarter": current_quarter + ' ' + str(current_year),
                        "BU": bu,
                        "Non_Platform_TTD": nonplatform_ttd or 0
                    })
                else:
                    results.append({
                        "Quarter": current_quarter + ' ' + str(current_year),
                        "BU": bu,
                        "With_Platform_TTD": 0
                    })
                    results2.append({
                        "Quarter": current_quarter + ' ' + str(current_year),
                        "BU": bu,
                        "Non_Platform_TTD": 0
                    })


            return results,results2

    except mysql.connector.Error as err:
        print("Error:", err)
        return []

def getMttrDataQuarterP0(bu, quarter):
    try:
        conn = connect_to_mysql()
        if conn:
            cursor = conn.cursor()

            quarters = []

            # Extract quarter and year from input
            quarter_str, year_str = quarter.split()  # Split the input into quarter and year
            year = int(year_str)

            # Add the input quarter and year
            quarters.append((quarter_str, year))

            # Calculate past four quarters
            quarter_num = int(quarter_str[1])
            for i in range(1, 5):
                prev_quarter_num = quarter_num - i
                prev_year = year
                if prev_quarter_num <= 0:
                    prev_quarter_num += 4
                    prev_year -= 1
                prev_quarter_str = 'Q' + str(prev_quarter_num)
                quarters.append((prev_quarter_str, prev_year))

            results = []
            results2=[]

            # Fetch quarterly data
            for quarter_tuple in quarters:
                current_quarter, current_year = quarter_tuple

                # Fetch non-platform TTD for the quarter
                sql_nonplatform_ttr = """
                    SELECT CEIL(AVG(time_to_recover_in_minutes))
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu like '%{}%')
                    AND bu = {}
                    AND quarter = '{}'
                    AND year = {}
                    AND (major_incident_type LIKE '%P0%')
                    AND issue_category NOT LIKE '%Third Party%' AND status_page_updated='Yes'
                """.format(bu.replace("'", ""),bu.replace("'", ""),bu, current_quarter, current_year)

                # Fetch with-platform TTD for the quarter
                sql_platform_ttr = """
                    SELECT CEIL(AVG(time_to_recover_in_minutes))
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' AND  bu not like '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND (major_incident_type LIKE '%P0%')
                    AND issue_category NOT LIKE '%Third Party%' AND status_page_updated='Yes'
                """.format(bu.replace("'", ""), bu.replace("'", ""), current_quarter, current_year)

                # Execute SQL queries for quarterly data
                cursor.execute(sql_nonplatform_ttr)
                nonplatform_ttr_row = cursor.fetchone()
                nonplatform_ttr = nonplatform_ttr_row[0] if nonplatform_ttr_row else None

                cursor.execute(sql_platform_ttr)
                platform_ttr_row = cursor.fetchone()
                platform_ttr = platform_ttr_row[0] if platform_ttr_row else None

                # Add data to results only if it's not None
                if nonplatform_ttr is not None or platform_ttr is not None:
                    results.append({
                        "Quarter": current_quarter + ' ' + str(current_year),
                        "BU": bu,
                        "With_Platform_TTR": platform_ttr or 0
                    })
                    results2.append({
                        "Quarter": current_quarter + ' ' + str(current_year),
                        "BU": bu,
                        "Non_Platform_TTR": nonplatform_ttr or 0
                    })
                else:
                    results.append({
                        "Quarter": current_quarter + ' ' + str(current_year),
                        "BU": bu,
                        "With_Platform_TTR": 0
                    })
                    results2.append({
                        "Quarter": current_quarter + ' ' + str(current_year),
                        "BU": bu,
                        "Non_Platform_TTR": 0
                    })


            return results,results2

    except mysql.connector.Error as err:
        print("Error:", err)
        return []
def getMttrDataQuarterP1(bu, quarter):
    try:
        conn = connect_to_mysql()
        if conn:
            cursor = conn.cursor()

            quarters = []

            # Extract quarter and year from input
            quarter_str, year_str = quarter.split()  # Split the input into quarter and year
            year = int(year_str)

            # Add the input quarter and year
            quarters.append((quarter_str, year))

            # Calculate past four quarters
            quarter_num = int(quarter_str[1])
            for i in range(1, 5):
                prev_quarter_num = quarter_num - i
                prev_year = year
                if prev_quarter_num <= 0:
                    prev_quarter_num += 4
                    prev_year -= 1
                prev_quarter_str = 'Q' + str(prev_quarter_num)
                quarters.append((prev_quarter_str, prev_year))

            results = []
            results2=[]

            # Fetch quarterly data
            for quarter_tuple in quarters:
                current_quarter, current_year = quarter_tuple

                # Fetch non-platform TTD for the quarter
                sql_nonplatform_ttr = """
                    SELECT CEIL(AVG(time_to_recover_in_minutes))
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' OR bu like '%{}%')
                    AND bu = {}
                    AND quarter = '{}'
                    AND year = {}
                    AND (major_incident_type LIKE '%P1%')
                    AND issue_category NOT LIKE '%Third Party%' AND status_page_updated='Yes'
                """.format(bu.replace("'", ""), bu.replace("'", ""),bu,current_quarter, current_year)

                # Fetch with-platform TTD for the quarter
                sql_platform_ttr = """
                    SELECT CEIL(AVG(time_to_recover_in_minutes))
                    FROM incidents
                    WHERE (affected_bu LIKE '%{}%' AND bu not like '%{}%')
                    AND quarter = '{}'
                    AND year = {}
                    AND (major_incident_type LIKE '%P1%')
                    AND issue_category NOT LIKE '%Third Party%' AND status_page_updated='Yes'
                """.format(bu.replace("'", ""), bu.replace("'", ""), current_quarter, current_year)

                # Execute SQL queries for quarterly data
                cursor.execute(sql_nonplatform_ttr)
                nonplatform_ttr_row = cursor.fetchone()
                nonplatform_ttr = nonplatform_ttr_row[0] if nonplatform_ttr_row else None

                cursor.execute(sql_platform_ttr)
                platform_ttr_row = cursor.fetchone()
                platform_ttr = platform_ttr_row[0] if platform_ttr_row else None

                # Add data to results only if it's not None
                if nonplatform_ttr is not None or platform_ttr is not None:
                    results.append({
                        "Quarter": current_quarter + ' ' + str(current_year),
                        "BU": bu,
                        "With_Platform_TTR": platform_ttr or 0
                    })
                    results2.append({
                        "Quarter": current_quarter + ' ' + str(current_year),
                        "BU": bu,
                        "Non_Platform_TTR": nonplatform_ttr or 0
                    })
                else:
                    results.append({
                        "Quarter": current_quarter + ' ' + str(current_year),
                        "BU": bu,
                        "With_Platform_TTR": 0
                    })
                    results2.append({
                        "Quarter": current_quarter + ' ' + str(current_year),
                        "BU": bu,
                        "Non_Platform_TTR": 0
                    })

            return results,results2

    except mysql.connector.Error as err:
        print("Error:", err)


# def calculate_availability_percentage_monthly(month, year):
#     # Define the input month and year
#     conn = connect_to_mysql()
#     temp_month = month[:3].capitalize()  # Temporary variable to store the capitalized month abbreviation
#     month_number = list(calendar.month_abbr).index(month[:3].capitalize())  # Get the month number
#     year = int(year)

#     # Define the SQL query to fetch the required data for the specified month and year
#     query = f"""
#     SELECT msf_products_affected, msf_affected_regions, time_to_recover_in_minutes
#     FROM incidents
#     WHERE major_incident_type IN ('Full Outage (P0)', 'Partial Outage (P0)')
#         AND `month` = '{month}' AND `year` = {year}
#     """

#     # Fetch data from MySQL
#     df = pd.read_sql(query, conn)
#     # Close the database connection
#     conn.close()

#     # Initialize a dictionary to store availability data
#     availability_data = {}

#     # Calculate total minutes for the month
#     total_days_in_month = calendar.monthrange(year, month_number)[1]  # Use month_number instead of month
#     total_minutes_per_month = total_days_in_month * 24 * 60  # Total days * 24 hours * 60 minutes

#     # Iterate over each row in the DataFrame
#     for _, row in df.iterrows():
#         products = row['msf_products_affected'].split(',')  # Split comma-separated products
#         regions = row['msf_affected_regions'].split(',')  # Split comma-separated regions
#         ttr_minutes = row['time_to_recover_in_minutes']

#         # Handle NaN values
#         if pd.isna(ttr_minutes):
#             ttr_minutes = 0
#             availability_percentage = 100.0
#         else:
#             # Calculate availability percentage
#             availability_percentage = round(((total_minutes_per_month - ttr_minutes) / total_minutes_per_month) * 100, 2)

#         # Update availability data for each product and region
#         for product in products:
#             for region in regions:
#                 if product not in availability_data:
#                     availability_data[product] = {}
#                 if region not in availability_data[product]:
#                     availability_data[product][region] = []

#                 # Append the availability percentage and downtime to the list
#                 availability_data[product][region].append({
#                     'availability_percentage': availability_percentage,
#                     'ttr_minutes': ttr_minutes
#                 })

#     # Ensure all products have entries for all regions
#     for product in availability_data:
#         for region in ['US', 'EU', 'IN', 'AU']:
#             if region not in availability_data[product]:
#                 availability_data[product][region] = [{
#                     'availability_percentage': 100.0,
#                     'ttr_minutes': 0
#                 }]

#     # Calculate availability percentage considering multiple entries for the same product and region
#     for product in availability_data:
#         for region in availability_data[product]:
#             total_ttr_minutes = sum(entry['ttr_minutes'] for entry in availability_data[product][region])
#             total_availability_percentage = round(((total_minutes_per_month - total_ttr_minutes) / total_minutes_per_month) * 100, 2)
#             availability_data[product][region] = [{
#                 'availability_percentage': total_availability_percentage,
#                 'ttr_minutes': total_ttr_minutes
#             }]

#     # Sort regions alphabetically
#     for product in availability_data:
#         for region in availability_data[product]:
#             availability_data[product][region] = sorted(availability_data[product][region], key=lambda x: x['availability_percentage'], reverse=True)

#     # Check if availability_data is empty
#     if not availability_data:
#         availability_data = {
#             'Freshdesk': {'US': [{'availability_percentage': 100.0, 'ttr_minutes': 0}], 'EU': [{'availability_percentage': 100.0, 'ttr_minutes': 0}], 'AU': [{'availability_percentage': 100.0, 'ttr_minutes': 0}], 'IN': [{'availability_percentage': 100.0, 'ttr_minutes': 0}]},
#             'Freshchat': {'US': [{'availability_percentage': 100.0, 'ttr_minutes': 0}], 'EU': [{'availability_percentage': 100.0, 'ttr_minutes': 0}], 'AU': [{'availability_percentage': 100.0, 'ttr_minutes': 0}], 'IN': [{'availability_percentage': 100.0, 'ttr_minutes': 0}]},
#             'Freshworks CRM': {'US': [{'availability_percentage': 100.0, 'ttr_minutes': 0}], 'EU': [{'availability_percentage': 100.0, 'ttr_minutes': 0}], 'AU': [{'availability_percentage': 100.0, 'ttr_minutes': 0}], 'IN': [{'availability_percentage': 100.0, 'ttr_minutes': 0}]},
#             'Freshmarketer': {'US': [{'availability_percentage': 100.0, 'ttr_minutes': 0}], 'EU': [{'availability_percentage': 100.0, 'ttr_minutes': 0}], 'AU': [{'availability_percentage': 100.0, 'ttr_minutes': 0}], 'IN': [{'availability_percentage': 100.0, 'ttr_minutes': 0}]},
#             'Freshservice': {'EU': [{'availability_percentage': 100.0, 'ttr_minutes': 0}], 'US': [{'availability_percentage': 100.0, 'ttr_minutes': 0}], 'IN': [{'availability_percentage': 100.0, 'ttr_minutes': 0}], 'AU': [{'availability_percentage': 100.0, 'ttr_minutes': 0}]},
#             'Freshsales': {'IN': [{'availability_percentage': 100.0, 'ttr_minutes': 0}], 'US': [{'availability_percentage': 100.0, 'ttr_minutes': 0}], 'EU': [{'availability_percentage': 100.0, 'ttr_minutes': 0}], 'AU': [{'availability_percentage': 100.0, 'ttr_minutes': 0}]},
#             'Freshcaller': {'IN': [{'availability_percentage': 100.0, 'ttr_minutes': 0}], 'AU': [{'availability_percentage': 100.0, 'ttr_minutes': 0}], 'US': [{'availability_percentage': 100.0, 'ttr_minutes': 0}], 'EU': [{'availability_percentage': 100.0, 'ttr_minutes': 0}]}
#         }
#     # Return availability_data
#     return availability_data

def calculate_availability_percentage_monthly(month, year):
    # Define the input month and year
    conn = connect_to_mysql()
    temp_month = month[:3].capitalize()  # Temporary variable to store the capitalized month abbreviation
    month_number = list(calendar.month_abbr).index(temp_month)  # Get the month number
    year = int(year)

    # Define the SQL query to fetch the required data for the specified month and year
    query = f"""
    SELECT msf_products_affected, msf_affected_regions, time_to_recover_in_minutes
    FROM incidents
    WHERE major_incident_type IN ('Full Outage (P0)', 'Partial Outage (P0)')
        AND `month` = '{month}' AND `year` = {year} AND status_page_updated='Yes'
    """

    # Fetch data from MySQL
    df = pd.read_sql(query, conn)
    # Close the database connection
    conn.close()

    # List of all products and regions
    products_list = ['Freshdesk', 'Freshchat', 'Freshworks CRM', 'Freshmarketer', 'Freshservice', 'Freshsales', 'Freshcaller','Freshbots']
    regions_list = ['US', 'EU', 'IN', 'AU']

    # Initialize a dictionary to store availability data
    availability_data = {product: {region: [] for region in regions_list} for product in products_list}

    # Calculate total minutes for the month
    total_days_in_month = calendar.monthrange(year, month_number)[1]
    total_minutes_per_month = total_days_in_month * 24 * 60

    # Iterate over each row in the DataFrame
    for _, row in df.iterrows():
        products = row['msf_products_affected'].split(',')  # Split comma-separated products
        regions = row['msf_affected_regions'].split(',')  # Split comma-separated regions
        ttr_minutes = row['time_to_recover_in_minutes']

        # Handle NaN values
        if pd.isna(ttr_minutes):
            ttr_minutes = 0
            availability_percentage = 100.0
        else:
            # Calculate availability percentage
            availability_percentage = round(((total_minutes_per_month - ttr_minutes) / total_minutes_per_month) * 100, 2)

        # Update availability data for each product and region
        for product in products:
            for region in regions:
                if product in availability_data and region in availability_data[product]:
                    # Append the availability percentage and downtime to the list
                    availability_data[product][region].append({
                        'availability_percentage': availability_percentage,
                        'ttr_minutes': ttr_minutes
                    })

    # Ensure all products have entries for all regions
    for product in availability_data:
        for region in regions_list:
            if not availability_data[product][region]:
                availability_data[product][region].append({
                    'availability_percentage': 100.0,
                    'ttr_minutes': 0
                })

    # Calculate availability percentage considering multiple entries for the same product and region
    for product in availability_data:
        for region in availability_data[product]:
            total_ttr_minutes = sum(entry['ttr_minutes'] for entry in availability_data[product][region])
            total_availability_percentage = round(((total_minutes_per_month - total_ttr_minutes) / total_minutes_per_month) * 100, 2)
            availability_data[product][region] = [{
                'availability_percentage': total_availability_percentage,
                'ttr_minutes': total_ttr_minutes
            }]

    # Return availability_data
    print(availability_data)
    return availability_data
    
def getIncidentDetails(bu, quarter):
    try:
        conn = connect_to_mysql()
        if conn:
            quarters = [(quarter,)]

            cursor = conn.cursor()
            quarter_str, year_str = quarter.split()
            year = int(year_str)
            quarter_num = int(quarter_str[1])

            # Calculate past three quarters
            for i in range(1, 4):
                prev_quarter_num = quarter_num - i
                prev_year = year
                if prev_quarter_num <= 0:
                    prev_quarter_num += 4
                    prev_year -= 1
                prev_quarter_str = 'Q' + str(prev_quarter_num) + ' ' + str(prev_year)
                quarters.append((prev_quarter_str,))

            results = {}
            print(quarters)

            for quarter_tuple in quarters:
                current_quarter = quarter_tuple[0]
                quarter_str, year_str = current_quarter.split()
                year = int(year_str)
                quarter = quarter_str
                sql_nonplatform_ttr = """
                SELECT id,subject,major_incident_type,module as caused_by_product,bu as caused_by_bu,msf_affected_regions as region,month,issue_category FROM incidents
                        WHERE (affected_bu LIKE '%{}%' OR bu LIKE '%{}%')
                        AND quarter = '{}'
                        AND year = {}
                        AND (major_incident_type LIKE '%P0%' OR major_incident_type LIKE '%P1%') AND status_page_updated='Yes'""".format(bu.replace("'", ""), bu.replace("'", ""), quarter, year)

                cursor.execute(sql_nonplatform_ttr)
                nonplatform_ttr_row = cursor.fetchall()
                response=[]
                for row in nonplatform_ttr_row:
                    incident = {
                        'id': f'<a href="https://lighthouse.freshservice.com/a/tickets/{row[0]}?current_tab=details">{row[0]}</a>',
                        'subject': row[1],
                        'major_incident_type': row[2],
                        'caused_by_product': row[3],
                        'caused_by_bu': row[4],
                        'region': row[5],
                        'month': row[6],
                        'issue_category': row[7]
                    }

                    response.append(incident)
                    results[current_quarter]=response
            return json.dumps(results, indent=4)

    except mysql.connector.Error as err:
        print("Error:", err)

def getAllIncidentDetails():
    try:
        # Assume connect_to_mysql is a valid connection function
        conn = connect_to_mysql()  
        if conn:
            cursor = conn.cursor()

            # SQL query to fetch the necessary incident details
            sql_query = """
            SELECT id, subject, created_at, alert_generated_by, issue_category, 
                   msf_affected_regions, major_incident_type, module as caused_by_p, 
                   msf_products_affected as products_affected, bu as caused_by_bu, 
                   affected_bu, year, month, quarter, time_to_detect_in_minutes as ttd, 
                   time_to_recover_in_minutes as ttr, status_page_updated 
            FROM incidents
            WHERE major_incident_type LIKE '%P0%' OR major_incident_type LIKE '%P1%';
            """

            # Execute the query
            cursor.execute(sql_query)
            incident_rows = cursor.fetchall()

            # Prepare the response
            response = []
            for row in incident_rows:
                # Convert created_at field (datetime) to string
                created_at_str = row[2].strftime("%Y-%m-%d %H:%M:%S") if isinstance(row[2], datetime) else row[2]
                
                incident = {
                    'id': f'<a href="https://lighthouse.freshservice.com/a/tickets/{row[0]}?current_tab=details">{row[0]}</a>',
                    'subject': row[1],
                    'created_at': created_at_str,  # Handle datetime format here
                    'alert_generated_by': row[3],
                    'issue_category': row[4],
                    'msf_affected_regions': row[5],
                    'major_incident_type': row[6],
                    'caused_by_product': row[7],
                    'products_affected': row[8],
                    'caused_by_bu': row[9],
                    'affected_bu': row[10],
                    'year': row[11],
                    'month': row[12],
                    'quarter': row[13],
                    'ttd': row[14],
                    'ttr': row[15],
                    'status_page_updated': row[16]  # No changes needed here
                }
                response.append(incident)

            # Return response as a JSON formatted string
            return json.dumps(response, indent=4)

    except mysql.connector.Error as err:
        print("Error:", err)

def get_last_two_years():
    current_year = datetime.now().year
    last_two_years = [current_year - 1, current_year]
    return last_two_years

def get_month_list():
    # Get current month as a number
    current_month = datetime.now().month

    # Define a list of month names
    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    # Rearrange month names starting from the current month
    months = month_names[current_month - 1:] + month_names[:current_month - 1]

    return months
