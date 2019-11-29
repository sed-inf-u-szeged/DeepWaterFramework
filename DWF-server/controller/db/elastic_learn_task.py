from . import elastic as es
from config import es_learn_task_index as l_t_idx
from model import LearnTask


def new_learn_task(task):
    return es.create_document(l_t_idx, task.__dict__)


def get_learn_task_by_id(task_id):
    doc = es.get_document_by_id(l_t_idx, task_id)
    if doc:
        return LearnTask.from_es_data(doc['_source'])

    return None


def search_learn_task(task):
    doc = es.search_one_document(l_t_idx, es.dict_query(task.flatten()))
    if doc:
        return doc['_id'], LearnTask.from_es_data(doc['_source'])

    return None, None


def get_unassigned_learn_tasks():
    return es.search_documents(l_t_idx, es.missing_field_query("assigned_to"), LearnTask.from_es_data)


def update_task(fields, task_id):
    return es.update_document(l_t_idx, task_id, fields)
