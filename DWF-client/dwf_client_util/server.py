from requests import post
from platform_info import get_platform_info
import json
import pickle
import os
import sys

HASH_PICKLE = 'client_hash'
ABS_PATH = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(ABS_PATH, 'config.json')
CPARAMS_PATH = os.path.join(ABS_PATH, 'client_params.json')

with open(CONFIG_PATH) as config_file:
    config = json.load(config_file)

def send_to_endpoint(endpoint, data):
    return post(config['SERVER_URL'] + config['API_ENDPOINTS'][endpoint], json=data)    
    
def prepare_connection_data():
    data = {}
    if os.path.exists(HASH_PICKLE):
        data['hash'] = pickle.load(open(HASH_PICKLE, 'rb'))
    else:
        data['hash'] = ''
    data['platform_info'] = get_platform_info()
    data['environment'] = _set_environment()
    print(data)

    return data

def _set_environment():
    with open(CPARAMS_PATH) as cparams_file:
        cparams = json.load(cparams_file)['environment']
    for var in cparams.keys():
        os.environ[var] = str(cparams[var])
    return cparams
    
def connect():
    data = prepare_connection_data()
    task = None
    hash = None
    if data['hash']:
        try:
            task = request_task(data['hash'])
        except KeyError:
            print("Worker id is unknown, try running the client with the --reinit argument.")
            sys.exit(-1)
        hash = data['hash']
    else:
        response = post(url=config['SERVER_URL'] + config['API_ENDPOINTS']['PING'], json = data).json()
        hash = response['hash']
        task = response['task']
        pickle.dump(hash, open(HASH_PICKLE, 'ab'))
    return hash, task 

def request_task(client_id):
    response = send_to_endpoint('PING', {'hash': client_id}).json()
    
    return response['task']