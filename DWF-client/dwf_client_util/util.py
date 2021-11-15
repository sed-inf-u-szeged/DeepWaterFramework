import sys
import os
import json
import pickle
import shutil
from enum import IntEnum
from pathlib import Path

config = None
client_info = {}
ABS_PATH = os.path.dirname(os.path.abspath(__file__))
HASH_PICKLE = 'client_hash'
DEFAULT_CONFIG = 'config_default.json'
DEFAULT_CPARAMS = 'client_params_default.json'
CONFIG_PATH = 'config.json'
CPARAMS_PATH = 'client_params.json'


class ClientStatus(IntEnum):
    IDLE = 0
    WORKING = 1


class Signals(IntEnum):
    STOP_TASK = 0


def create_sandbox(dirname='sandbox'):
    if not os.path.isdir(dirname):
        os.mkdir(dirname)

def copy_if_not_exists(src : Path, dest : Path):
    if not dest.exists():
        shutil.copy(src, dest)

def init_config():
    copy_if_not_exists(Path(ABS_PATH) / DEFAULT_CONFIG, Path(CONFIG_PATH))
    copy_if_not_exists(Path(ABS_PATH) / DEFAULT_CPARAMS, Path(CPARAMS_PATH))


def load_config(path=CONFIG_PATH):
    with open(path, 'r') as config_file:
        config = json.load(config_file)

    if config['STORAGE_PREFIX']:
        config['STORAGE_PREFIX'] = os.path.normpath(config['STORAGE_PREFIX'])
    return config


def load_cparams(path=CPARAMS_PATH):
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
    if config['STORAGE_PREFIX']:
        return os.path.join(config['STORAGE_PREFIX'], os.path.normpath(path).strip(os.sep)).replace('\\', os.sep)
    else:
        return os.path.normpath(path)
        #.replace('\\', os.sep)


def merge_params(cparams, params):
    merged_params = {}
    merged_params['strategy'] = params['strategy']

    client_info['util_path'] = ABS_PATH
    merged_params['dwf_client_info'] = client_info

    return {**merged_params, **cparams}


def get_client_name(default):
    if 'NAME' in config and config['NAME']:
        return config['NAME']

    return default

def get_simbiota_save_filename(path_str):
    if "::" in path_str:
        path_str = path_str.split("::")[0]
    
    file_path = Path(path_str)
    return  file_path.parent.parent.parent.name + '_' + \
            file_path.parent.parent.name + "_" + \
            file_path.parent.name  


client_info['client_id'] = get_stored_hash()
init_config()
config = load_config()
