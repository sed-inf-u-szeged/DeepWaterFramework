import atexit
from common import timestamp_ms
from . import worker_store as ws

from apscheduler.schedulers.background import BackgroundScheduler


def check_for_dead_workers():
    worker_ids = ws.list_worker_ids()
    for worker_id in worker_ids:
        worker = ws.get_worker(worker_id)
        if not worker.blocked_by_error and int(timestamp_ms()) - int(worker.communication_ts) > 60000:
            kill_worker(worker_id)


def kill_worker(worker_id):
    worker = ws.get_worker(worker_id)
    return ws.worker_error(worker_id, worker, "Worker is not alive...")


def init():
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=check_for_dead_workers, trigger="interval", seconds=10)
    scheduler.start()

    # Shut down the scheduler when exiting the app
    atexit.register(lambda: scheduler.shutdown())
