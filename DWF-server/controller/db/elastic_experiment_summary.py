from . import elastic as es
from config import es_experiments_index as e_idx
from model.experiment_summary import ExperimentSummary


def new_experiment_summary(exp_id, exp_sum):
    return es.overwrite_document(combine_index(exp_id), 1, exp_sum.to_dict(), 9999999)


def get_experiment_summary_by_id(exp_id):
    doc = es.get_document_by_id(combine_index(exp_id), 1)
    if doc:
        return ExperimentSummary.from_es_data(doc['_source'])

    return None


def update_experiment_summary(changes, exp_id):
    return es.update_document(combine_index(exp_id), 1, changes)


def combine_index(exp_id):
    return f'{e_idx}_{exp_id}'.lower()
