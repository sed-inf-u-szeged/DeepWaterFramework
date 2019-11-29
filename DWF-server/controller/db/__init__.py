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
    settings = {
        "settings": {
            "index.mapping.total_fields.limit": 99999999,
            "number_of_shards": 1,
            "number_of_replicas": 0
        },
    }
    for index in config.es_indices:
        es.indices.delete(index=f'{index}*')
        asd = es.indices.create(index=index, ignore=400, body=settings)


if config.init_db:
    init_db()
