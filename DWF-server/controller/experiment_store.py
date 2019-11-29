from controller.db import elastic_experiment as db


def new_experiment(exp):
    return db.new_experiment(exp)


def get_experiment(exp_id):
    return db.get_experiment_by_id(exp_id)


def get_experiment_by_name(exp_name):
    return db.get_experiment_by_name(exp_name)


def list_experiments():
    return db.get_all_experiment()


def update_experiment(changes, exp_id):
    return db.update_experiment(changes, exp_id)
