from . import elastic as es
from config import es_strategy_config_index as sc_idx
from model import StrategyConfig


def new_config(config):
    return es.create_document(sc_idx, config.__dict__)


def get_config_by_id(config_id):
    doc = es.get_document_by_id(sc_idx, config_id)
    if doc:
        return StrategyConfig.from_es_data(doc['_source'])

    return None


def search_config(config):
    doc = es.search_one_document(sc_idx, es.dict_query(config.flatten()))
    if doc:
        return doc['_id']

    return None
