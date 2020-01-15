from requests import post
import os
from time import sleep

import logging, sys, traceback

from dwf_client_util.platform_info import get_platform_info
import dwf_client_util.util as util
from dwf_client_util.util import ClientStatus

logging.basicConfig(format='%(asctime)s %(levelname)-8s %(message)s', datefmt='%Y-%m-%d %H:%M:%S', level=logging.INFO)
config = util.load_config()

def send_to_endpoint(endpoint, data):
    return post(config['SERVER_URL'] + config['API_ENDPOINTS'][endpoint], json=data)


def prepare_connection_data():
    data = {}
    data['platform_info'] = get_platform_info()
    data['environment'] = _set_environment()
    data['name'] = util.get_client_name(data['platform_info']['node'])
    print(data)

    return data


def _set_environment():
    cparams = util.load_cparams()
    for var in cparams.keys():
        os.environ[var] = str(cparams[var])
    return cparams


def is_stop(response, client_status):
    return not response.json()['working'] and client_status.value == ClientStatus.WORKING

def ping(client_id, args, client_status):
    try:
        while True:
            resp = send_to_endpoint('PING', {'hash': client_id})
            if is_stop(resp, client_status):
                logging.info(f"Client received stop command from server")
                return

            sleep(util.config['PING_INTVAL'])
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
        send_to_endpoint('ERROR', {"hash": client_id, "log": f"Unhandled exception: {str(e)}"})
        if args.debug:
            logging.info(traceback.format_exc())
        sys.exit(-1)

    except KeyboardInterrupt:
        logging.info("Keyboard interruption, client is exiting...")
        send_to_endpoint('ERROR', {"hash": client_id, "log": "Manual interruption."})
        if args.debug:
            logging.info(traceback.format_exc())

        sys.exit(0)


def register():
    data = prepare_connection_data()

    hash = send_to_endpoint('REGISTER', data).json()['hash']
    util.store_hash(hash)
    return hash


def request_task(client_id):
    task = send_to_endpoint('GET_TASK', {'hash': client_id}).json()['task']

    return task
