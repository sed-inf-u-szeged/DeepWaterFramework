from . import elastic as es
from config import es_experiment_data as e_idx
from model.experiment import Experiment
from model.obj_flatten import flatten


def new_experiment(exp):
    return es.create_document(e_idx, exp.__dict__)


def get_experiment_by_id(exp_id):
    doc = es.get_document_by_id(e_idx, exp_id)
    if doc:
        return Experiment.from_es_data(doc['_source'])

    return None


def get_experiment_by_name(exp_name):
    doc = es.search_one_document(e_idx, es.dict_query(flatten({'name': exp_name})))
    if doc:
        return doc['_id']

    return None


def get_all_experiment():
    return es.search_documents(e_idx, {'query': {'match_all': {}}}, Experiment.from_es_data)


def update_experiment(changes, exp_id):
    return es.update_document(e_idx, exp_id, changes)
