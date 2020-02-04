from flask_restful import Resource, abort
from flask import render_template, make_response, request, redirect, url_for

import config
from model import Experiment, Priority
from controller import experiment_store as es


class New(Resource):
    @staticmethod
    def post(copy_id=None, edit_id=None):
        try:
            if not request.form:
                abort(403, message='missing form')

            orig_exp = es.get_experiment(edit_id or copy_id)
            if edit_id:
                experiment_id = edit_id
                success = es.edit_experiment(
                    edit_id,
                    request.form['experiment_name'],
                    request.form['markdown'],
                    int(request.form['experiment_priority'])
                )

            else:
                new_experiment = Experiment(
                    request.form['experiment_name'],
                    request.form['markdown'],
                    int(request.form['experiment_priority'])
                )
                experiment_id = es.new_experiment(new_experiment)
                if experiment_id and copy_id:
                    changes = new_experiment.copy_configs_from_experiment(orig_exp)
                    experiment_id = es.update_experiment(changes, experiment_id)

            if experiment_id:
                return redirect(url_for('manage_experiment', hash=experiment_id))

            abort(403, message="Couldn't save to elastic")

        except Exception as e:
            if config.debug_mode:
                abort(400, message=str(e))

            else:
                abort(404, message="Page not found")

    def get(self, copy_id=None, edit_id=None):
        try:
            if copy_id or edit_id:
                exp = es.get_experiment(copy_id or edit_id)
                return self.make_response("copy" if copy_id else "edit", exp.name, exp.markdown, exp.priority)

            return self.make_response("new", "", "", Priority.NORMAL)

        except Exception as e:
            if config.debug_mode:
                abort(400, message=str(e))

            else:
                abort(404, message="Page not found")

    @staticmethod
    def make_response(mode, name, md, priority):
        return make_response(
            render_template(
                'experiment/new.j2',
                mode=mode,
                name=name,
                md=md,
                priorities=[
                    (0, "LOW", priority == Priority.LOW),
                    (1, "NORMAL", priority == Priority.NORMAL),
                    (2, "HIGH", priority == Priority.HIGH),
                    (3, "IMMEDIATE", priority == Priority.IMMEDIATE)
                ]
            ),
            200,
            {'Content-Type': 'text/html'}
        )
