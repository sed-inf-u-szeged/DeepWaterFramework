from flask import Flask, send_from_directory, jsonify
from flask_restful import Api
from flask_bootstrap import Bootstrap
import os

import config
from routes import *
from controller import worker_observer

app = Flask(__name__)
worker_observer.init()

Bootstrap(app)

api = Api(app)

api.add_resource(Ping, '/ping')
api.add_resource(GetTask, '/get_task')
api.add_resource(Register, '/register')
api.add_resource(Error, '/error')
api.add_resource(Status, '/status')
api.add_resource(Result, '/result')
api.add_resource(WorkerDetails, '/worker/<hash>', endpoint="worker_details")
api.add_resource(WorkerFixed, '/worker_fixed/<hash>')
api.add_resource(WorkerList, '/workers')
api.add_resource(TaskDetails, '/task/<hash>', endpoint="task_details")
api.add_resource(experiment.New, '/experiment/new', endpoint="new_experiment")
api.add_resource(experiment.New, '/experiment/<copy_id>/copy', endpoint="copy_experiment")
api.add_resource(experiment.New, '/experiment/<edit_id>/edit', endpoint="edit_experiment")
api.add_resource(experiment.Manage, '/experiment/<hash>', endpoint="manage_experiment")
api.add_resource(experiment.List, '/', '/experiment/list', endpoint="list_experiments")
api.add_resource(experiment.Get, '/experiment/get/<name>', endpoint="get_experiment")
api.add_resource(experiment.Summary, '/experiment/<hash>/summary', endpoint="experiment_summary")
api.add_resource(experiment.AddAssembleConfig, '/experiment/<hash>/add_assembler_config', endpoint="add_assembling")
api.add_resource(experiment.AddLearnConfig, '/experiment/<hash>/add_learning_config', endpoint="add_learning")
api.add_resource(experiment.AddAssembleConfig, '/experiment/<hash>/edit_assembler_config/<edit_id>', endpoint="edit_assembling")
api.add_resource(experiment.AddLearnConfig, '/experiment/<hash>/edit_learning_config/<edit_id>', endpoint="edit_learning")
api.add_resource(experiment.AddAssembleConfig, '/experiment/<hash>/copy_assembler_config/<copy_id>', endpoint="copy_assembling")
api.add_resource(experiment.AddLearnConfig, '/experiment/<hash>/copy_learning_config/<copy_id>', endpoint="copy_learning")
api.add_resource(experiment.CountGeneratedConfigs, '/count_generated_configs', endpoint="count_generated_configs")
api.add_resource(experiment.DeleteConfig, '/delete_config', endpoint="delete_config")
api.add_resource(experiment.CheckName, '/check_name', endpoint="check_name")


def _get_list_of_dirs(path):
    output_dictionary = {}
    list_of_dirs = [os.path.join(path, item) for item in os.listdir(path)]
    output_dictionary["text"] = os.path.basename(path)
    output_dictionary["a_attr"] = {"label": path[len(config.storage_dir):]}
    if not output_dictionary["text"]:
        output_dictionary["text"] = 'Deep-Water'
    
    output_dictionary["icon"] = "jstree-folder"
    output_dictionary["children"] = []

    for dir in list_of_dirs:
        if os.path.isdir(dir):
            output_dictionary["children"].append(_get_list_of_dirs(dir))
            output_dictionary["icon"] = "jstree-folder"
        else:
            item = {
                "text": os.path.basename(dir),
                "a_attr": {
                    "label": dir[len(config.storage_dir):]
                }
            }
            if dir.endswith('csv'):
                item["type"] = "csv"
            else:
                item["icon"] = "jstree-file"
            output_dictionary["children"].append(item)
    return output_dictionary


@app.route('/browse_files.json')
def tree_data():
    return jsonify(_get_list_of_dirs(config.storage_dir))


@app.route('/<filename>')
def favicon(filename):
    return send_from_directory(
        os.path.join(app.root_path, 'static'),
        filename
    )


if __name__ == '__main__':
    app.run(host=config.flask_host, port=config.flask_port)
