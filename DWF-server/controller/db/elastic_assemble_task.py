from . import elastic as es
from config import es_assemble_task_index as a_t_idx
from model import AssembleTask


def new_assemble_task(task):
    return es.create_document(a_t_idx, task.__dict__)


def get_assemble_task_by_id(task_id):
    doc = es.get_document_by_id(a_t_idx, task_id)
    if doc:
        return AssembleTask.from_es_data(doc['_source'])

    return None


def search_assemble_task(task):
    doc = es.search_one_document(a_t_idx, es.dict_query(task.flatten()))
    if doc:
        return doc['_id'], AssembleTask.from_es_data(doc['_source'])

    return None, None


def get_unassigned_assemble_tasks():
    return es.search_documents(a_t_idx, es.missing_field_query("assigned_to"), AssembleTask.from_es_data)


def update_task(fields, task_id):
    return es.update_document(a_t_idx, task_id, fields)
