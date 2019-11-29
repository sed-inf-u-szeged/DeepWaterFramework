'''
This is the entry point for the DWF Client. Before running, make sure to set configurations according to the README
'''

__version__ = "1.0.0-beta"

import sys
import json
import argparse
from time import sleep
import logging
import os

PATH_TO_UTIL = "dwf_client_util"
sys.path.insert(1, PATH_TO_UTIL)

import dwf_client_util.util as util
import dwf_client_util.server as server
import dwf_client_util.dwf_logging as dwf_logging

def process_task(task):
    try:
      logging.info(f'New task assigned:\n {task}')
      util.process_task(task)
      logging.info("Task is done.")
    except Exception as e:
            logging.info(f"Task can't be completed, error occured: {str(e)}")
            server.send_to_endpoint('ERROR', {"hash": util.client_info['client_id'], "log": str(e)})
            return

def run(client_id):
    task = server.request_task(client_id)

    if not task:
        logging.info(f"No task available. Retrying in {util.config['RETRY_INTVAL']}s...")
        sleep(util.config['RETRY_INTVAL'])
    else:
        process_task(task)
        

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Start a DWF Client instance.")
    parser.add_argument('--reinit', help='reinitailize client id', action='store_true', default=False)
    args = parser.parse_args()

    logging.basicConfig(format='%(asctime)s %(levelname)-8s %(message)s', datefmt='%Y-%m-%d %H:%M:%S', level = logging.INFO)
    logging.info("Client started...")
    
    dwf_logging.get_versions()
        
    if args.reinit and os.path.isfile(server.HASH_PICKLE):
        os.remove(server.HASH_PICKLE)

    logging.info(f"Connecting to server \'{util.config['SERVER_URL']}\'")
    client_id, task = server.connect()
    logging.info(f"Client id: {client_id}")
    util.client_info['client_id'] = client_id

    try:
        if task:
            process_task(task)

        while(True):
            run(client_id)
    except KeyboardInterrupt:
            logging.info("Keyboard interruption, client is exiting...")
            server.send_to_endpoint('ERROR', {"hash": util.client_info['client_id'], "log": "Manual interruption."})
            sys.exit(0)
