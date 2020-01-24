from multiprocessing import Lock
from controller.db import worker_db as db
from model import Worker
from controller import assemble_task_store as ats
from controller import learn_task_store as lts

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

    task = assign_task(worker_id, worker, ats) or assign_task(worker_id, worker, lts)
    return worker.current_task_id, task


def _remove_task(worker_id, worker):
    try:
        task = ats.get_task_by_id(worker.current_task_id) or lts.get_task_by_id(worker.current_task_id)
        task_changes = task.revoke_assign_from(worker_id)
        return ats.update_task(task_changes, worker.current_task_id) or lts.update_task(task_changes, worker.current_task_id)

    except Exception as e:
        return None


def _worker_blocked(worker_id, worker, log):
    try:
        worker_changes = worker.error(log)
        return update_worker(worker_changes, worker_id)

    except Exception as e:
        return None


def assign_task(worker_id, worker, task_store):
    with mutex:
        task_id, task = task_store.get_unassigned_task()
        if not task_id:
            return None

        task_dict = task_store.get_config_by_task_id(task_id)
        if not task_dict:
            return None

        task_changes = task.assign_to(worker_id)
        task_result_id = task_store.update_task(task_changes, task_id)

    worker_changes = worker.new_task(task_id)
    worker_result_id = db.update_worker(worker_changes, worker_id)
    if not worker_result_id or not task_result_id:
        return None

    return task_dict


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
