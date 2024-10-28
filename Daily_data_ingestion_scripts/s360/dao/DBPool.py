import mysql.connector.pooling
import configparser


class Database:
    def __init__(self):

        config = configparser.ConfigParser()
        config.read('app.conf')
        self.dbconfig = {
            'host': config['database']['host'],
            'port': config['database']['port'],
            'database': config['database']['database'],
            'user': config['database']['user'],
            'password': config['database']['password'],
        }

        self.cnxpool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool", pool_size=10, **self.dbconfig)

    def insert_data(self, records):
        cnx = self.cnxpool.get_connection()
        cursor = cnx.cursor()
        columns = records.keys()
        # sql_params = [tuple(record.values()) for record in records][0]
        sql_params = tuple(records.values())
        placeholders = ', '.join(['%s'] * len(columns))
        sql_query = f"INSERT INTO Incidents ({', '.join(columns)}) VALUES ({placeholders}) ON DUPLICATE KEY UPDATE {', '.join([f'{column}=VALUES({column})' for column in columns])}"
        # print(sql_query)
        # print(sql_params)
        cursor.execute("SET time_zone = 'UTC'")
        cursor.execute(sql_query, sql_params)
        cursor.execute("DELETE FROM Incidents where issue_category like '%Third%'")
        cnx.commit()
        cursor.close()
        cnx.close()
