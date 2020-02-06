from controller.db import elastic_assemble_task as assemble_task_db
from controller.db import elastic_learn_task as learn_task_db
from controller.db import elastic_worker as worker_db
from controller.db import elastic_experiment as experiment_db
from controller.db import elastic_experiment_summary as experiment_summary_db
from controller.db import elastic_strategy_config as strategy_config_db
from controller.db import elastic_task as task_db
import config


def init_db():
    from elasticsearch import Elasticsearch

    es = Elasticsearch([{'host': config.es_host, 'port': config.es_port}])
    for index in config.es_indices:
        if config.local_mode and config.init_db:
            asd = es.indices.delete(index=f'{index}*')
            if config.debug_mode:
                print(f'{index}* deleted, res: {asd}')

            asd = create_index(es, index)
            if config.debug_mode:
                print(f'{index}* recreated, res: {asd}')

        elif not es.indices.exists(index=f'{index}*'):
            asd = create_index(es, index)
            if config.debug_mode:
                print(f'{index}* created, res: {asd}')

        else:
            if config.debug_mode:
                print(f'{index}* exists')


def create_index(es, name):
    if name == config.es_experiments_index:
        return None

    settings = {
        "settings": {
            "index.mapping.total_fields.limit": 99999999,
            "number_of_shards": 1,
            "number_of_replicas": 0
        },
    }
    return es.indices.create(index=name, ignore=400, body=settings)


init_db()
