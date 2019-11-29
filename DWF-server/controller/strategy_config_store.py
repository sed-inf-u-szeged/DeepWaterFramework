from controller.db import strategy_config_db as db


def new_config(config):
    es_id = search_config(config)
    if not es_id:
        es_id = db.new_config(config)

    return es_id


def get_config_by_id(config_id):
    return db.get_config_by_id(config_id)


def search_config(config):
    return db.search_config(config)
