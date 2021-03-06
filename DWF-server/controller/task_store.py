from controller.db import elastic_task as db


def new_task(task):
    t_es_id = search_task(task)
    if not t_es_id:
        t_es_id = db.new_task(task)

    return t_es_id


def get_task_by_id(task_id):
    return db.get_task_by_id(task_id)


def search_task(task):
    return db.search_task(task)


def search_task_by_dict(dict):
    return db.search_task_by_dict(dict)


def get_assembling_parents(a_id):
    return [(t_id, t) for t_id, t in db.get_all_task_by_dict({'assemble_task_id': a_id}) if t.state != "generated"]


def get_learning_parents(l_id):
    return [(t_id, t) for t_id, t in db.get_all_task_by_dict({'learn_task_id': l_id}) if t.state != "generated"]


def search_task_by_order(exp_id):
    return db.search_task_by_order(exp_id)


def list_tasks():
    return db.get_all_task()


def update_task(changes, task_id):
    return db.update_task(changes, task_id)


def delete_tasks_by_experiment(exp_id):
    return db.delete_exp_tasks(exp_id)
