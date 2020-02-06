from controller.db import elastic_experiment as db
from controller import experiment_summary_store as ess
from controller import task_store as ts
from controller import strategy_config_store as scs
from controller.task_scheduler import scheduler
from model import Experiment


def new_experiment(name, md, priority, copy_id=None):
    new_exp = Experiment(name, md, priority)
    if copy_id:
        orig_exp = get_experiment(copy_id)
        new_exp.copy_configs_from_experiment(orig_exp)

    return db.new_experiment(new_exp)


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
    if priority != exp.priority and ts.search_task_by_order(exp_id):
        scheduler.change_exp_priority(exp_id, priority)

    changes = exp.edit_experiment(name, md, priority)
    edit_id = update_experiment(changes, exp_id)
    return ess.update_experiment_summary(changes, edit_id) and success and edit_id


def add_config_list(exp_id, edit_id, config_list, assembling_configs):
    e = get_experiment(exp_id)
    if edit_id:
        changes = e.remove_config(edit_id)
        success = update_experiment(changes, exp_id)

    config_id_list = [scs.new_config(c) for c in config_list]

    if assembling_configs:
        changes = e.add_assemble_config_list(config_id_list)

    else:
        changes = e.add_learn_config_list(config_id_list)

    return update_experiment(changes, exp_id)


def remove_config(exp_id, config_id):
    e = get_experiment(exp_id)
    change = e.remove_config(config_id)
    return False if not change else update_experiment(change, exp_id)
