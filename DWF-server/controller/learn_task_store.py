from controller.db import learn_task_db as db
from model import task_builder, AssembleTask, LearnTask
from controller import assemble_task_store as ats


def new_learn_task(task):
    l_es_id, l_task = search_learn_task(task)
    if not l_es_id:
        l_task = task
        l_es_id = db.new_learn_task(task)

    return l_es_id, l_task


def get_task_by_id(task_id):
    return db.get_learn_task_by_id(task_id)


def get_config_by_task_id(task_id):
    task = db.get_learn_task_by_id(task_id)
    return task_builder.learn_task_json(task)


def search_learn_task(task):
    return db.search_learn_task(task)


def get_unassigned_task():
    tasks = db.get_unassigned_learn_tasks()
    tasks = [(t_id, t) for t_id, t in tasks if t.state == "runnable" and (ats.get_task_by_id(t.assemble_task_id) or AssembleTask('empty')).result_file_path]
    if len(tasks):
        return tasks[0]

    return None, None


def update_task(changes, task_id):
    return db.update_task(changes, task_id)


def rerun_task(task_id, assemble_task_id):
    l_task = get_task_by_id(task_id)
    l_task_changes = l_task.make_obsolete()
    update_task(l_task_changes, task_id)

    new_l_task = LearnTask(l_task.assemble_config, assemble_task_id, l_task.learn_config)
    new_l_task.make_runnable()
    new_l_task.add_parent(task_id)
    return new_learn_task(new_l_task)
