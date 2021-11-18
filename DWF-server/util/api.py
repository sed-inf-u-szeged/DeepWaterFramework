import requests
import logging
from enum import IntEnum

logging.basicConfig(format='%(asctime)s %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p', level=logging.DEBUG)

class DWFServer():
    SERVER_ENDPOINTS = {
        'EXPERIMENT' : 'experiment',
        'GET' : 'get',
        'NEW': 'new',
        'ADD_LEARNING' : 'add_learning_config', 
        'ADD_ASSEMBLER'  : 'add_assembler_config'
    }

    JSONS = {
        'GENERATE_TASKS' : {
            'command': 'generate_tasks'
        },
        'RUN_ALL' : {
            'command' : 'run_all'
        }
    }

    def __init__(self, url):
        self.base_url = url
        self.get_experiment_url = '/'.join((self.base_url, 
        DWFServer.SERVER_ENDPOINTS['EXPERIMENT'], DWFServer.SERVER_ENDPOINTS['GET']))

    def add_experiment(self, data):
        new_exp_url = '/'.join((self.base_url, DWFServer.SERVER_ENDPOINTS['EXPERIMENT'], DWFServer.SERVER_ENDPOINTS['NEW']))
        resp = requests.post(new_exp_url, data)

        return resp.status_code == 200
            

    def get_experiment_id(self, experiment_name):
        get_exp_url = '/'.join((self.base_url, DWFServer.SERVER_ENDPOINTS['EXPERIMENT'], DWFServer.SERVER_ENDPOINTS['GET'], experiment_name))
        resp = requests.get(get_exp_url)

        if resp.status_code == 200:
            return resp.text
        else:
            return None


    def add_learning_config(self, exp_id, data):
        new_learn_config_url = '/'.join((self.base_url, DWFServer.SERVER_ENDPOINTS['EXPERIMENT'], exp_id, DWFServer.SERVER_ENDPOINTS['ADD_LEARNING']))
        resp = requests.post(new_learn_config_url, data)

        if resp.status_code == 200:
            return resp.text
        else:
            return None

    def add_assembler_config(self, exp_id, data):
        new_learn_config_url = '/'.join((self.base_url, DWFServer.SERVER_ENDPOINTS['EXPERIMENT'], exp_id, DWFServer.SERVER_ENDPOINTS['ADD_ASSEMBLER']))
        resp = requests.post(new_learn_config_url, data)

        if resp.status_code == 200:
            return resp.text
        else:
            return None

    def generate_tasks(self, exp_id):
        generate_tasks_url = '/'.join((self.base_url, DWFServer.SERVER_ENDPOINTS['EXPERIMENT'], exp_id))
        resp = requests.post(generate_tasks_url, json = DWFServer.JSONS['GENERATE_TASKS'])
        return resp.status_code == 200

    def run_tasks(self, exp_id):
        run_tasks_url = '/'.join((self.base_url, DWFServer.SERVER_ENDPOINTS['EXPERIMENT'], exp_id))
        resp = requests.post(run_tasks_url, json = DWFServer.JSONS['RUN_ALL'])
        return resp.status_code == 200

class Config():
    def __init__(self, strategy_name, data):

        self.stategy_name = strategy_name
        self.data = data
        self.data['selected_strategy'] = strategy_name

    def __init__(self, config_params_class):
        self.stategy_name = config_params_class.get_name()
        self.data = config_params_class.get_data()
        self.data['selected_strategy'] = self.stategy_name

class Priority(IntEnum):
    LOW  = 0
    NORMAL = 1
    HIGH = 2

class Experiment():
    def __init__(self, server, name, markdown = "", priority = Priority.NORMAL):
        self.id = None
        self.server = server
        self.name = name
        self.markdown = markdown
        self.priority = priority
        self.learning_configs = []
        self.assembling_configs = []

    
    def _add_learn_config(self, config):
        if not self.server.add_learning_config(self.id, config.data):
            logging.warning(f"Couldn't add learn config '{config.strategy_name}'")
            return False
        else:
            return True
            
    
    def _add_assembler_config(self, config):
        if not self.server.add_assembler_config(self.id, config.data):
            logging.warning(f"Couldn't add assembler config '{config.strategy_name}'")
            return False
        else:
            return True


    def create(self):
        data = {
            'experiment_name' : self.name,
            'markdown' : self.markdown,
            'experiment_priority': int(self.priority)
        }
        
        if self.server.add_experiment(data):
            logging.info(f"Experiment '{self.name}' created.")
        else:
            logging.warning("Could not create experiment")

        self.id = self.server.get_experiment_id(self.name)

        if self.id:
            logging.info(f"Got experiment '{self.name}' ID: {self.id}.")
        else:
            logging.info(f"Couldn't get experiment '{self.name}'")

    def add_all_configs(self):
        is_ok = True

        for config in self.learning_configs:
            if not self._add_learn_config(config):
                is_ok = False
        for config in self.assembling_configs:
            if not self._add_assembler_config(config):
                is_ok = False
        
        logging.info("Configs added.")
        return is_ok


    def generate_tasks(self):
        if not self.server.generate_tasks(self.id):
            logging.error(f"Can't generate tasks on server '{self.server.url}'")
            return False
        logging.info("Tasks are generated")
        return True

    def run_tasks(self):
        if not self.server.run_tasks(self.id):
            logging.error(f"Can't run tasks on server '{self.server.url}'")
            return False
        logging.info("Tasks are started.")
        return True



    def start(self):
        self.create()

        if not self.id:
            logging.error(f"Can't run experiment: it's not created on server '{self.server.url}'")
            return False

        self.add_all_configs()

        if not self.generate_tasks():
            return False

        if not self.run_tasks():
            return False

        return True