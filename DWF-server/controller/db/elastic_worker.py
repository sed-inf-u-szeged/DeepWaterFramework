from . import elastic as es
from config import es_workers_index as w_idx
from model import Worker


def register_worker(worker):
    return es.create_document(w_idx, worker.__dict__)


def get_worker_by_id(worker_id):
    doc = es.get_document_by_id(w_idx, worker_id)
    if doc:
        return Worker.from_es_data(doc['_source'])

    return None


def get_idle_worker():
    doc = es.search_one_document(w_idx, es.missing_field_query("current_task_id"))
    if doc:
        worker = Worker.from_es_data(doc['_source'])
        worker_id = doc['_id']
        return worker, worker_id

    return None, None


def update_worker(fields, worker_id):
    return es.update_document(w_idx, worker_id, fields)


def get_all_worker():
    return es.search_documents(w_idx, {'query': {'match_all': {}}}, Worker.from_es_data)
