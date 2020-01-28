from controller import task_store as ts
from controller import assemble_task_store as ats
from controller import learn_task_store as lts


def set_task_priority(task_id, priority):
    task = ts.get_task_by_id(task_id)
    changes = task.set_priority(priority)
    success = ts.update_task(changes, task_id)
    success = _set_priority(task.assemble_task_id, task_id, priority, ats) and success
    return (not task.learn_task_id or _set_priority(task.learn_task_id, task_id, priority, lts)) and success


def _set_priority(task_id, parent_id, priority, task_store):
    task = task_store.get_task_by_id(task_id)
    if not task:
        return None

    if priority < task.priority:
        parent_tasks = [ts.get_task_by_id(pt_id) for pt_id in task.parent_tasks if pt_id != parent_id]
        higher_priority_parents = [p.priority for p in parent_tasks if p.priority > priority]
        changes = task.set_priority(max(higher_priority_parents))

    elif priority > task.priority:
        changes = task.set_priority(priority)

    else:
        changes = None

    return not changes or task_store.update_task(changes, task_id)
