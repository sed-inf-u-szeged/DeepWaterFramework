"""
This is the entry point for the DWF Client. Before running, make sure to set configurations according to the README
"""

__version__ = "1.0.0-beta"

import sys
import argparse
import logging
import traceback
from multiprocessing import Process
from requests.exceptions import ConnectionError
from time import sleep

from dwf_client_util import util
from dwf_client_util import server
from dwf_client_util import dwf_logging
from dwf_client_util import task_manager

client_id = ''
args = None
logging.basicConfig(format='%(asctime)s %(levelname)-8s %(message)s', datefmt='%Y-%m-%d %H:%M:%S', level=logging.INFO)

def process_task(task):
    try:
        logging.info(f'New task assigned:\n {task}')
        task_manager.process_task(task)
        logging.info("Task is done.")

    except Exception as e:
        logging.info(f"Task can't be completed, error occured: {str(e)}")
        if args.debug:
            logging.info(traceback.format_exc())

        server.send_to_endpoint('ERROR', {"hash": client_id, "log": str(e)})
        return


def run(client_id, args):
    try:
        while True:
            task = server.request_task(client_id)

            if not task:
                logging.info(f"No task available. Retrying in {util.config['RETRY_INTVAL']}s...")
                sleep(util.config['RETRY_INTVAL'])

            else:
                process_task(task)
    except ConnectionError as e:
        logging.info(f"Can't connect to server. Error message: \n {str(e)}\n Client is exiting...")
        if args.debug:
            logging.info(traceback.format_exc())

        sys.exit(-1)

    except KeyError:
        logging.info("Worker id is unknown, try running the client with the --reinit argument.")
        if args.debug:
            logging.info(traceback.format_exc())

        sys.exit(-1)

    except Exception as e:
        logging.info(f"Unhandled exception occured:\n{str(e)} \n Client is exiting...")
        server.send_to_endpoint('ERROR', {"hash": client_id, "log": f"Unhandled exception: {str(e)}"})
        if args.debug:
            logging.info(traceback.format_exc())
        sys.exit(-1)

    except KeyboardInterrupt:
        logging.info("Keyboard interruption, client is exiting...")
        server.send_to_endpoint('ERROR', {"hash": client_id, "log": "Manual interruption."})
        if args.debug:
            logging.info(traceback.format_exc())

        sys.exit(0)



def manage_processes(processes):
    while True:
        for process in processes:
            if not process.is_alive():
                other_processes = list(filter(lambda p: p != process, processes))
                for other_process in other_processes:
                    other_process.terminate()
                    other_process.join()
                logging.info("Client is exiting...")
                return

                      

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Start a DWF Client instance.")
    parser.add_argument('--reinit', help='reinitailize client id', action='store_true', default=False)
    parser.add_argument('--debug', help='print traceback along with exceptions', action='store_true', default=False)
    args = parser.parse_args()

    logging.info("Client started...")

    dwf_logging.get_versions()
    
    #Sandbox creation for DNN and CNN
    util.create_sandbox()

    if args.reinit:
        util.delete_hash()

    try:
        client_id = util.get_stored_hash()
        if client_id == '':
            logging.info(f"Registering to server \'{util.config['SERVER_URL']}\'")
            client_id = server.register()

        else:
            logging.info(f"Client id is set to locally stored value ")

        logging.info(f"Client id: {client_id}")
        util.client_info['client_id'] = client_id

        runner = Process(target=run, args=(client_id, args,))
        pinging = Process(target=server.ping, args=(client_id, args, ))

        runner.start()
        pinging.start()

        manage_processes([runner, pinging])

    except ConnectionError as e:
        logging.info(f"Can't connect to server. Error message: \n {str(e)}\n Client is exiting...")
        if args.debug:
            logging.info(traceback.format_exc())

        sys.exit(-1)

    except KeyError:
        logging.info("Worker id is unknown, try running the client with the --reinit argument.")
        runner.terminate()
        if args.debug:
            logging.info(traceback.format_exc())

        sys.exit(-1)

    except Exception as e:
        logging.info(f"Unhandled exception occured:\n{str(e)} \n Client is exiting...")
        server.send_to_endpoint('ERROR', {"hash": client_id, "log": f"Unhandled exception: {str(e)}"})
        if args.debug:
            logging.info(traceback.format_exc())

        runner.terminate()
        sys.exit(-1)

    except KeyboardInterrupt:
        logging.info("Keyboard interruption, client is exiting...")
        server.send_to_endpoint('ERROR', {"hash": client_id, "log": "Manual interruption."})
        runner.terminate()
        if args.debug:
            logging.info(traceback.format_exc())

        sys.exit(0)
