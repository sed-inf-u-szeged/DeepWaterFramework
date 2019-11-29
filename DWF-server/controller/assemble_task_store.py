from controller.db import elastic_assemble_task as db
from model import task_builder


def new_assemble_task(task):
    a_es_id, a_task = search_assemble_task(task)
    if not a_es_id:
        if task.assemble_config['strategy_id'] == "manual_file_input":
            task.assign_to("none")
            task.completed(task.assemble_config['strategy_parameters']['file_path'])

        a_task = task
        a_es_id = db.new_assemble_task(task)

    return a_es_id, a_task


def get_task_by_id(task_id):
    return db.get_assemble_task_by_id(task_id)


def get_config_by_task_id(task_id):
    try:
        task = db.get_assemble_task_by_id(task_id)
        return task_builder.assemble_task_json(task)

    except Exception as e:
        return None


def search_assemble_task(task):
    return db.search_assemble_task(task)


def get_unassigned_task():
    tasks = db.get_unassigned_assemble_tasks()
    tasks = [(t_id, t) for t_id, t in tasks if t.state == "runnable"]
    if len(tasks):
        return tasks[0]

    return None, None


def update_task(changes, task_id):
    return db.update_task(changes, task_id)
