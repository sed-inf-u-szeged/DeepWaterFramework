from requests import post
import os
from time import sleep

import logging, sys, traceback

from dwf_client_util.platform_info import get_platform_info
import dwf_client_util.util as util
from dwf_client_util.util import ClientStatus

config = util.load_config()

def send_to_endpoint(endpoint, data):
    return post(config['SERVER_URL'] + config['API_ENDPOINTS'][endpoint], json=data)


def prepare_connection_data(client_name):
    data = {}
    data['platform_info'] = get_platform_info()
    data['environment'] = _set_environment()
    if client_name:
        data['name'] = client_name
    else:
        data['name'] = util.get_client_name(default = data['platform_info']['node'])
    
    print(data)
    return data


def _set_environment():
    cparams = util.load_cparams()
    for var in cparams.keys():
        os.environ[var] = str(cparams[var])
    return cparams


def is_stop(response, client_status):
    return not response.json()['working'] and client_status.value == ClientStatus.WORKING
    

def register(client_name = ''):
    data = prepare_connection_data(client_name)

    hash = send_to_endpoint('REGISTER', data).json()['hash']
    util.store_hash(hash)
    return hash


def request_task(client_id):
    task = send_to_endpoint('GET_TASK', {'hash': client_id}).json()['task']

    return task
