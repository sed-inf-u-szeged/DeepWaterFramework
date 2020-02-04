from threading import Lock
from controller.db import worker_db as db
from model import Worker
from controller import task_store as ts
from controller import assemble_task_store as ats
from controller import learn_task_store as lts
from controller.task_scheduler import scheduler

mutex = Lock()


def is_worker(worker_id):
    return True if db.get_worker_by_id(worker_id) else False


def register_worker(name, platform_info, environment):
    return db.register_worker(Worker(name, platform_info, environment))


def worker_error(worker_id, worker, log):
    remove_success = _remove_task(worker_id, worker)
    block_success = _worker_blocked(worker_id, worker, log)
    return remove_success and block_success


def assign_task_to_worker(worker_id, worker):
    if worker.blocked_by_error:
        return None, None

    if worker.current_task_id:
        task = ats.get_config_by_task_id(worker.current_task_id) or lts.get_config_by_task_id(worker.current_task_id)
        return worker.current_task_id, task

    task = _assign_parent_task(worker_id, worker)
    return worker.current_task_id, task


def _remove_task(worker_id, worker):
    try:
        task = ats.get_task_by_id(worker.current_task_id) or lts.get_task_by_id(worker.current_task_id)
        task_changes = task.revoke_assign_from(worker_id)
        success = ats.update_task(task_changes, worker.current_task_id) or lts.update_task(task_changes, worker.current_task_id)
        parents = [(pt_id, ts.get_task_by_id(pt_id)) for pt_id in task.parent_tasks]
        for pt_id, parent in parents:
            t_change = parent.make_runnable(True)
            success = ts.update_task(t_change, pt_id) and success

        return success

    except Exception as e:
        return None


def _worker_blocked(worker_id, worker, log):
    try:
        worker_changes = worker.error(log)
        return update_worker(worker_changes, worker_id)

    except Exception as e:
        return None


def _assign_parent_task(worker_id, worker):
    with mutex:
        scheduled_experiment = scheduler.get_next()
        if not scheduled_experiment:
            return None

        task_id, task = ts.search_task_by_order(scheduled_experiment)
        assigned_task_id, experiment_ids = _assign_task(worker_id, task.assemble_task_id, ats)
        if not assigned_task_id:
            assigned_task_id, experiment_ids = _assign_task(worker_id, task.learn_task_id, lts)

        if not assigned_task_id:
            return None

        for exp_id in experiment_ids:
            task_id, task = ts.search_task_by_order(exp_id)
            if not task_id:
                scheduler.remove_experiment(exp_id)

    task_dict = ats.get_config_by_task_id(assigned_task_id) or lts.get_config_by_task_id(assigned_task_id)
    worker_changes = worker.new_task(assigned_task_id)
    worker_result_id = db.update_worker(worker_changes, worker_id)
    if not worker_result_id or not assigned_task_id:
        return None

    return task_dict


def _assign_task(worker_id, task_id, task_store):
    task = task_store.get_task_by_id(task_id)
    if task.state != "runnable":
        return None, None

    task_changes = task.assign_to(worker_id)
    task_result_id = task_store.update_task(task_changes, task_id)
    parents = [(pt_id, ts.get_task_by_id(pt_id)) for pt_id in task.parent_tasks]
    experiment_ids = {p.experiment_id for _, p in parents}
    parent_success = True
    for pt_id, parent in parents:
        p_change = parent.start()
        parent_success = ts.update_task(p_change, pt_id) and parent_success

    return task_id, experiment_ids


def ping_worker(worker_id, worker):
    changes = worker.ping()
    return db.update_worker(changes, worker_id)


def is_working(worker_id):
    worker = db.get_worker_by_id(worker_id)
    if worker:
        return worker.is_working

    return False


def work_done(worker_id):
    worker = db.get_worker_by_id(worker_id)
    if worker:
        changes = worker.clear_task()
        return db.update_worker(changes, worker_id)

    return None


def add_status(worker_id, progress, message):
    worker = get_worker(worker_id)
    if worker:
        changes = worker.set_status(progress, message)
        return db.update_worker(changes, worker_id)

    return None


# return [(worker_id_1, worker_1), (worker_id_2, worker_2), ...]
def list_workers():
    return db.get_all_worker()


def list_worker_ids():
    return db.get_all_worker_id()


def get_worker(worker_id):
    return db.get_worker_by_id(worker_id)


def update_worker(changes, worker_id):
    return db.update_worker(changes, worker_id)


def delete_worker(worker_id):
    worker = get_worker(worker_id)
    changes = worker.delete()
    return update_worker(changes, worker_id)
