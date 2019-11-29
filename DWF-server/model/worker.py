from common import timestamp_ms


class Worker:
    def __init__(self, platform_info, environment):
        self.platform_info = platform_info
        self.environment = environment
        self.current_task_id = None
        self.job_started_ts = None
        self.task_history = []
        self.error_logs = []
        self.blocked_by_error = False
        self.communication_ts = timestamp_ms()
        self.register_ts = timestamp_ms()

    @classmethod
    def from_es_data(cls, worker):
        res = cls(worker['platform_info'], worker['environment'])
        res.current_task_id = worker['current_task_id']
        res.job_started_ts = worker['job_started_ts']
        res.task_history = worker['task_history']
        res.error_logs = worker['error_logs']
        res.blocked_by_error = worker['blocked_by_error']
        res.communication_ts = worker['communication_ts']
        res.register_ts = worker['register_ts']
        return res

    def is_working(self):
        return True if self.current_task_id else False

    def error_solved(self):
        self.error_logs = []
        self.blocked_by_error = False
        return {
            'error_logs': self.error_logs,
            'blocked_by_error': self.blocked_by_error,
        }

    def error(self, log):
        self.blocked_by_error = True
        result = {'blocked_by_error': self.blocked_by_error}
        if log:
            self.error_logs.append({
                "timestamp": timestamp_ms(),
                "message": log,
            })
            result.update({'error_logs': self.error_logs})

        if self.is_working():
            result.update(self.clear_task())

        return result

    def clear_task(self):
        self.current_task_id = None
        self.job_started_ts = None
        self.communication_ts = timestamp_ms()
        return {
            'current_task_id': self.current_task_id,
            'job_started_ts': self.job_started_ts,
            'communication_ts': self.communication_ts,
        }

    def new_task(self, task_id):
        self.current_task_id = task_id
        self.job_started_ts = timestamp_ms()
        self.task_history.append(task_id)
        self.communication_ts = timestamp_ms()
        return {
            'current_task_id': self.current_task_id,
            'job_started_ts': self.job_started_ts,
            'task_history': self.task_history,
            'communication_ts': self.communication_ts,
        }

    def ping(self):
        self.communication_ts = timestamp_ms()
        return {
            'communication_ts': self.communication_ts,
        }
