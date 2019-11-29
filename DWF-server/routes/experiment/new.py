from flask_restful import Resource, abort
from flask import render_template, make_response, request, redirect, url_for

import config
from model import Experiment
from controller import experiment_store as es


class New(Resource):
    @staticmethod
    def post():
        try:
            if not request.form:
                abort(403, message='missing form')

            new_experiment = Experiment(request.form['experiment_name'], request.form['markdown'])
            experiment_id = es.new_experiment(new_experiment)
            if experiment_id:
                return redirect(url_for('manage_experiment', hash=experiment_id))

            abort(403, message="Couldn't save to elastic")

        except Exception as e:
            if config.debug_mode:
                abort(400, message=str(e))

            else:
                abort(404, message="Page not found")

    @staticmethod
    def get():
        try:
            return make_response(render_template('experiment/new.j2'), 200, {'Content-Type': 'text/html'})

        except Exception as e:
            if config.debug_mode:
                abort(400, message=str(e))

            else:
                abort(404, message="Page not found")
