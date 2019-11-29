from flask_restful import Resource, abort
from flask import request, redirect, url_for, render_template, make_response, jsonify
from strategies import config as strategy_config

from model import config_builder as cb
import config
from controller import strategy_config_store as scs
from controller import experiment_store as es


class AddAssembleConfig(Resource):
    @staticmethod
    def post(hash):
        try:
            if not request.form:
                abort(403, message='missing form')

            assemble_config_list = cb.generate_assemble_configs(form_data=request.form)
            assemble_config_id_list = [scs.new_config(c) for c in assemble_config_list]
            e = es.get_experiment(hash)
            changes = e.add_assemble_config_list(assemble_config_id_list)
            success = es.update_experiment(changes, hash)
            if success:
                return redirect(url_for('manage_experiment', hash=hash))

            abort(403, message="Couldn't save to elastic")

        except Exception as e:
            if config.debug_mode:
                abort(400, message=str(e))

            else:
                abort(400, message="something went wrong")

    @staticmethod
    def get(hash):
        try:
            return make_response(
                render_template(
                    'experiment/add_assembling_config_form.j2',
                    title="Add Feature Assembling config",
                    default_label="BUG",
                    strategies=strategy_config['assembler_strategies'],
                    strategy_type="assembler_strategies",
                ),
                200,
                {'Content-Type': 'text/html'}
            )

        except Exception as e:
            if config.debug_mode:
                abort(400, message=str(e))

            else:
                abort(400, message="something went wrong")
