"""
This is the entry point for the DWF Client. Before running, make sure to set configurations according to the README
"""

__version__ = "1.0.0-beta"

import sys
import argparse
import logging
import traceback
from requests.exceptions import ConnectionError

from dwf_client_util import util, server, worker

ClientStatus = util.ClientStatus

client_id = ''
args = None
logging.basicConfig(format='%(asctime)s %(levelname)-8s %(message)s', datefmt='%Y-%m-%d %H:%M:%S', level=logging.INFO)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Start a DWF Client instance.")
    parser.add_argument('--reinit', help='reinitailize client id', action='store_true', default=False)
    parser.add_argument('--debug', help='print traceback along with exceptions', action='store_true', default=False)
    parser.add_argument('--name', help='set name for the worker', default='')
    parser.add_argument('--save_models', help='save ML models to path given in config.json', action='store_true', default=False)
    args = parser.parse_args()

    logging.info("Client started...")

    # Sandbox creation for DNN and CNN
    util.create_sandbox()

    if args.reinit:
        util.delete_hash()

    try:
        client_id = util.get_stored_hash()
        if client_id == '':
            logging.info(f"Registering to server \'{util.config['SERVER_URL']}\'")
            client_id = server.register(client_name=args.name)

        else:
            logging.info(f"Client id is set to locally stored value ")

        logging.info(f"Client id: {client_id}")
        util.client_info['client_id'] = client_id

        process_manager = worker.ProcessManager(client_id, args.debug, args.save_models)
        process_manager.launch()

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
