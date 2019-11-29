from controller import worker_store as ws
from controller import task_store as ts
from model import Task


def setup():
    # ---------------------------------------------
    # --------- setup testing environment ---------
    # ---------------------------------------------
    dbh_task = Task(
        "dbh",
        {
            "shared": {
                "csv": r'\\sedstor.inf.u-szeged.hu\common\team\columbus\projects\kutatas\Deep-Water\test\dataset.csv',
                "label": "BUG",
                "seed": 1337,
                "resample": "up",
                "resample_amount": 50,
            },
            "strategy": [["tree", "--criterion entropy --max-depth 10"]],
            "preprocess": [["features", "standardize"], ["labels", "binarize"]],
            "classifier": "tree",
            "preprocess_features": "standardize",
            "preprocess_labels": "binarize",
        },
        {
            'criterion': 'entropy',
            'max-depth': 10,
        })
    dwf_task = Task(
        "dwf",
        {
            "shared": {
                "csv": "sample.csv",
                "label": "BUG",
                "lang": "java",
            },
            "strategy": ["astnn+metrics+test", ["--a 42 --b 33 --c aa", "--OSA-base-dir aaa --variant1 v11 --variant2 v22", ""]],
            "strategy_id": "astnn+metrics+test",
        },
        {
            'a': '42',
            'b': '33',
            'c': 'aa',
        })

    ts.add_task(dbh_task)
    ts.add_task(dwf_task)
    ts.add_task(dbh_task)
    ts.add_task(dbh_task)

    test_worker2 = ws.register_worker()
    test_worker1 = ws.register_worker()

    _, task_id_1 = ws.assign_task_to_worker(test_worker1)
    _, task_id_2 = ws.assign_task_to_worker(test_worker2)

    ws.add_status(test_worker1, .0, 'DBH started...')
    ws.add_status(test_worker1, .1, 'Fold 1/10 done')
    ws.add_status(test_worker1, .2, 'Fold 2/10 done')
    ws.add_status(test_worker1, .3, 'Fold 3/10 done')
    ws.add_status(test_worker1, .4, 'Fold 4/10 done')
    ws.add_status(test_worker1, .5, 'Fold 5/10 done')
    ws.add_status(test_worker1, .6, 'Fold 6/10 done')

    ws.add_status(test_worker2, .0, 'DBH started...')
    ws.add_status(test_worker2, .1, 'Fold 1/10 done')
    ws.add_status(test_worker2, .2, 'Fold 2/10 done')
    ws.add_status(test_worker2, .3, 'Fold 3/10 done')
    ws.add_status(test_worker2, .4, 'Fold 4/10 done')

    if task_id_1 and task_id_2:
        print("setup test environment successful", test_worker1, test_worker2, task_id_1, task_id_2)

    else:
        print("failed to setup test environment")
    # ---------------------------------------------
    # --------- setup testing environment ---------
    # ---------------------------------------------
