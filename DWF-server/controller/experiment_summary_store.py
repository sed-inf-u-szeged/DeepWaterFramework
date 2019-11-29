from controller.db import elastic_experiment_summary as db


def new_experiment_summary(exp_id, exp_sum):
    return db.new_experiment_summary(exp_id, exp_sum)


def get_experiment_summary(exp_id):
    return db.get_experiment_summary_by_id(exp_id)


def update_experiment_summary(changes, exp_id):
    return db.update_experiment_summary(changes, exp_id)
