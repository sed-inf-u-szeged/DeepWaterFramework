import os
init_test_environment = os.environ.get('DWF_INIT_TEST', False)
debug_mode = os.environ.get('DWF_DEBUG_MODE', False)
local_mode = os.environ.get('DWF_LOCAL_MODE', False)
init_db = os.environ.get('DWF_INIT_DB', False)

es_host = 'elasticsearch' if not local_mode else 'localhost'
es_port = 9200

es_experiments_index = 'experiments'
es_experiment_data = 'experiment_data'
es_strategy_config_index = 'strategy_config'
es_assemble_task_index = 'assemble_task'
es_learn_task_index = 'learn_task'
es_task_index = 'experiment_task'
es_workers_index = 'workers'
storage_dir = '/Deep-Water' if not local_mode else r'\\sedstor.inf.u-szeged.hu\common\team\columbus\projects\kutatas\Deep-Water'

es_indices = [
    es_experiments_index,
    es_experiment_data,
    es_strategy_config_index,
    es_assemble_task_index,
    es_learn_task_index,
    es_task_index,
    es_workers_index,
]

flask_port = 12345 if not local_mode else 4000
flask_host = '0.0.0.0' if not local_mode else 'localhost'

_ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
_LOCK_FILE = os.path.join(_ROOT_DIR, 'db_init.lock')
