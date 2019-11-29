from server import send_to_endpoint
import sys
import os
import json

config = None
client_info = {}
ABS_PATH = os.path.dirname(os.path.abspath(__file__))


def load_config(path = 'dwf_client_util/config.json'):
    with open(path, 'r') as config_file:
        config = json.load(config_file)
    config['STORAGE_PREFIX'] = os.path.normpath(config['STORAGE_PREFIX'])

    return config

config = load_config()

def get_module(path, module_name):
    if path: 
        sys.path.insert(0, path)
    
    return __import__(module_name)
    
def strip_prefix(path):
    prefix = config['STORAGE_PREFIX']
    if(path.startswith(prefix)):
        return path[len(prefix):].strip(os.sep)

def prepend_prefix(path):
    return os.path.join(config['STORAGE_PREFIX'], os.path.normpath(path).strip(os.sep))

def merge_params(cparams, params):
    merged_params = {} 
    merged_params['strategy'] = params['strategy']

    client_info['util_path'] = ABS_PATH
    merged_params['dwf_client_info'] = client_info
    
    return {**merged_params, **cparams}    

def calc_features(args):
    with open(os.path.join(ABS_PATH, 'client_params.json'), 'r') as cparams_file:
        cparams = json.load(cparams_file)['calc_features']

    params = merge_params(cparams, args)
    
    #TODO temporal workaround for prefix management in ASTEmbedding--->
    if(params['strategy'][0].startswith('ASTEmbedding')):
        sargs = [arg.strip() for arg in params['strategy'][1].split('--')]

        new_sargs = ''
        for sarg in sargs:
            
            if sarg:
                sarg_splt = sarg.split(' ')
                if sarg_splt[0] == 'outputDir' or sarg_splt[0] == 'astFile' or sarg_splt[0] == 'bugFile' or sarg_splt[0] == 'metricsFile':
                    sarg_splt[1] = prepend_prefix(sarg_splt[1])
                new_sargs += f'--{sarg_splt[0]} {sarg_splt[1]} '
            
        new_sargs = new_sargs.strip()
        params['strategy'][1] = new_sargs
    # <----

    get_module(config['FA_PATH'], 'fa').main(params)
        

def learn(args):
    with open(os.path.join(ABS_PATH, 'client_params.json'), 'r') as cparams_file:
        cparams = json.load(cparams_file)['DBH']
    
    params = {**args['shared'], **merge_params(cparams, args)}
    params['preprocess'] = args['preprocess']

    params['csv'] = prepend_prefix(params['csv'])
    get_module(config['DBH_PATH'], 'dbh').main(params)
    
def process_task(task):        
        if task['type'] == 'feature_assembling':
            calc_features(task['parameters'])
        if task['type'] == 'learning':
            learn(task['parameters'])
            