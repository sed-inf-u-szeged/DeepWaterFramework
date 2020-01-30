from . import elastic as es
from config import es_task_index as t_idx
from model.task import Task
from model.obj_flatten import flatten


def new_task(task):
    return es.create_document(t_idx, task.__dict__)


def get_task_by_id(task_id):
    doc = es.get_document_by_id(t_idx, task_id)
    if doc:
        return Task.from_es_data(doc['_source'])

    return None


def search_task(task):
    doc = es.search_one_document(t_idx, es.dict_query(task.flatten()))
    if doc:
        return doc['_id']

    return None


def search_task_by_dict(dict):
    doc = es.search_one_document(t_idx, es.dict_query(flatten(dict), sort))
    if doc:
        return doc['_id'], Task.from_es_data(doc['_source'])

    return None, None


def search_task_by_order(exp_id):
    doc = es.search_one_document(
        t_idx,
        es.dict_query(
            flatten({'experiment_id': exp_id, 'state': "runnable"}),
            {'order_in_exp': {'order': 'asc'}}
        )
    )
    if doc:
        return doc['_id'], Task.from_es_data(doc['_source'])

    return None, None


def get_all_task():
    return es.search_documents(t_idx, {'query': {'match_all': {}}}, Task.from_es_data)


def update_task(fields, task_id):
    return es.update_document(t_idx, task_id, fields)
