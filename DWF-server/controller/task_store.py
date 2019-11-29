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


def list_tasks():
    return db.get_all_task()


def update_task(changes, task_id):
    return db.update_task(changes, task_id)
