import os
init_test_environment = os.environ.get('DWF_INIT_TEST', False)
debug_mode = os.environ.get('DWF_DEBUG_MODE', False)
local_mode = os.environ.get('DWF_LOCAL_MODE', False)

DB_LOCK_FILE = '/dwf_data/db_init.lock'
init_db = os.environ.get('DWF_INIT_DB', False) and (local_mode or not os.path.isfile(DB_LOCK_FILE))

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
