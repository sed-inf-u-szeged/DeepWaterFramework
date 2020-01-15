import sys
import os
import json
import pickle
from enum import IntEnum

config = None
client_info = {}
ABS_PATH = os.path.dirname(os.path.abspath(__file__))
HASH_PICKLE = 'client_hash'
CONFIG_PATH = os.path.join(ABS_PATH, 'config.json')
CPARAMS_PATH = os.path.join(ABS_PATH, 'client_params.json')

class ClientStatus(IntEnum):
    IDLE = 0
    WORKING = 1

def create_sandbox(dirname='sandbox'):
    if not os.path.isdir(dirname):
        os.mkdir(dirname)


def load_config(path=CONFIG_PATH):
    with open(path, 'r') as config_file:
        config = json.load(config_file)
    config['STORAGE_PREFIX'] = os.path.normpath(config['STORAGE_PREFIX'])

    return config


def load_cparams(path = CPARAMS_PATH):
    with open(path) as cparams_file:
        cparams = json.load(cparams_file)
    return cparams


def get_stored_hash():
    if os.path.exists(HASH_PICKLE):
        return pickle.load(open(HASH_PICKLE, 'rb'))
    return ''


def store_hash(hash):
    pickle.dump(hash, open(HASH_PICKLE, 'ab'))


def delete_hash():
    if os.path.isfile(HASH_PICKLE):
        os.remove(HASH_PICKLE)


def get_module(path, module_name):
    if path:
        sys.path.insert(0, path)

    return __import__(module_name)
    

def strip_prefix(path):
    prefix = config['STORAGE_PREFIX']
    if path.startswith(prefix):
        return path[len(prefix):].strip(os.sep)


def prepend_prefix(path):
    return os.path.join(config['STORAGE_PREFIX'], os.path.normpath(path).strip(os.sep)).replace('\\', os.sep)


def merge_params(cparams, params):
    merged_params = {}
    merged_params['strategy'] = params['strategy']

    client_info['util_path'] = ABS_PATH
    merged_params['dwf_client_info'] = client_info
    
    return {**merged_params, **cparams}


client_info['client_id'] = get_stored_hash()
config = load_config()
