# -*- coding: utf-8 -*-
# create API Data
import csv
import sqlite3
import pandas as pd
from ebaysdk.trading import Connection
from ebaysdk.exception import ConnectionError
import re
from dateutil import parser
from datetime import datetime
from datetime import timedelta
import sys
import csv
import requests
from urllib.request import urlopen
import json
import time
import zipfile
import sys
import smtplib
from email.mime.text import MIMEText
from time import sleep
import logging



sys.path.append('/Users/ayoooona/discogs-sync/config')
import config
#define mail setting
mail_from = config.mail_from
mail_to = config.mail_to


#/ebay.yaml
ebay_yaml = "/Users/ayoooona/discogs-sync/config/ebay.yaml"

#define db
product_db = '/Users/ayoooona/discogs-sync/product.db'



#get dates converted
def convert_date_format(date):
  date = re.sub(r" +","T",date.strftime('%Y-%m-%dT%H:%M:%S.%f'))[:-4] + 'Z'
  return date

now = datetime.now()
ending_date =  now
#start_time = now - timedelta(days=1)
start_time = now - timedelta(hours=4)

api= Connection(config_file=ebay_yaml, debug=False, domain='api.ebay.com')

request = {
   'StartTimeFrom': convert_date_format(start_time),
   'StartTimeTo': convert_date_format(ending_date),
    "Pagination": {
        "EntriesPerPage":
          2,
        "PageNumber": 1
        },
    'DetailLevel': 'ReturnAll'
}
response = api.execute('GetSellerList', request)

#display(response.dict())

allpages = int(api.response.reply.PaginationResult.TotalNumberOfPages)

print("retrieve all pages of pagination: " + str(allpages))



# Setting for logger format
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
format = '%(asctime)s [%(levelname)s] %(filename)s, lines %(lineno)d. %(message)s'
formatter = logging.Formatter(format, '%Y-%m-%d %H:%M:%S')
stream_handler = logging.StreamHandler()
stream_handler.setFormatter(formatter)
logger.addHandler(stream_handler)
class ApiConnectionError(Exception):
    pass
def call_api(i):
    logger.info('API call')
    raise ApiConnectionError('API Connection error')


page = 0
retry_interval = 2
tries = 4

try:
   while page < allpages:
      try:
        page = page +1
        time.sleep(2)
        print("going to " + str(page))
        try:
          for i in range(0, tries):
            api.execute('GetSellerList', {
              'StartTimeFrom': convert_date_format(start_time),
              'StartTimeTo': convert_date_format(ending_date),
              "Pagination": {
              "EntriesPerPage":
                  2,
              "PageNumber": page
              },
            'DetailLevel': 'ReturnAll'
            }
                          )
            time.sleep(3)
            try:
              for item in api.response.reply.ItemArray.Item:
                sku = item.SKU
                itemid = int(item.ItemID)
              try:
                sku2 = re.split("/|Ω",sku)[1]
              except Exception:
                sku2 = sku

              try:
                conn = sqlite3.connect(product_db)
                conn.execute("INSERT INTO  ebay_item (listing_id,ebay_id) \
                VALUES (?,?)", [sku2,itemid])
                conn.commit()
                conn.close()
                print("Discogs ID")
                print(sku2)

              except Exception:
                conn = sqlite3.connect(product_db)
                conn.execute("INSERT INTO  ebay_item (listing_id,ebay_id) \
                VALUES (?,?)", [sku2,itemid])
                conn.commit()
                conn.close()
                print("didnt work")
                print("Discogs ID")
                print(sku2)

            except AttributeError:
              pass

        except Exception as e:
          if i + 1 == tries:
            mail_subject = "Error" 
            mail_body = str(e)
            def send_gmail(mail_from, mail_to, mail_subject, mail_body):
                msg = MIMEText(mail_body, "plain", "utf-8")
                msg['Subject'] = mail_subject
                msg['From'] = mail_from
                msg['To'] = mail_to
                
                try:
                    """ Connect to SMTP mail server """
                    smtpobj = smtplib.SMTP('smtp.gmail.com', 587)  
                    smtpobj.ehlo()                                
                    smtpobj.starttls()                         
                    gmail_addr = config.gmail_addr       
                    app_passwd = config.app_passwd      
                    smtpobj.login(gmail_addr, app_passwd)
                 
                    smtpobj.sendmail(mail_from, mail_to, msg.as_string())
                    smtpobj.quit()
                except Exception as e:
                    print(e)
                return print("Sent email")

            result = send_gmail(mail_from, mail_to, mail_subject, mail_body)
            print(result)
            raise e
          
          sleep(retry_interval)
          logger.info('retry:{}'.format(i + 1))
          continue
      
      except AttributeError:
        pass     

except AttributeError:
    pass


#get listed_id list from ebay
conn=sqlite3.connect(product_db)
c=conn.cursor()
cur = conn.execute('select * from ebay_item')
rows = cur.fetchall()
df = pd.DataFrame.from_records(rows)
df.columns = ["listing_id","ebay_id"]


#get discogs_item
conn=sqlite3.connect(product_db)
c=conn.cursor()
cur = conn.execute('select * from discogs_item')
rows = cur.fetchall()
df1 = pd.DataFrame.from_records(rows)
df1.columns = ["realformat","listing_id","style","genre","year","artist","title","desc","country","comments","CustomLabel","label","catno","fmt","status","price","cond","sleeve_cond","image","image2","image3","image4","image5","image6","image7","trackt","trackp1","trackt1","trackp2","trackt2","trackp3","trackt3","trackp4","trackt4","trackp5","trackt5","trackp6","trackt6","trackp7","trackt7","trackp8","trackt8","trackp9","trackt9","trackp10","trackt10","trackp11","trackt11","trackp12","trackt12","trackp13","trackt13","trackp14","trackt14","trackp15","trackt15","trackp16","trackt16","trackp17","trackt17","trackp18","trackt18","trackp19","trackt19","trackp20","trackt20","trackp21","trackt21","weight","times"]
#find listing id to delete
df["isValid"] = df.listing_id.isin(df1.listing_id)
df = df.loc[df.isValid == True]
df = df.drop('isValid', axis=1)

df["ebay_id"] = df["ebay_id"].fillna(0).apply(int).apply(str)

df = df[df["ebay_id"] != "0"]

df = df.reset_index()

