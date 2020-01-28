from controller.db import elastic_experiment as db
from controller import experiment_summary_store as ess
from controller import priority_controller as pc


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


def delete_experiment(exp_id):
    return db.delete_experiment(exp_id)


def edit_experiment(exp_id, name, md, priority):
    exp = get_experiment(exp_id)
    success = True
    if priority != exp.priority:
        for t_id in exp.tasks:
            success = pc.set_task_priority(t_id, priority) and success

    changes = exp.edit_experiment(name, md, priority)
    edit_id = update_experiment(changes, exp_id)
    return ess.update_experiment_summary(changes, edit_id) and success and edit_id
