from flask_restful import Resource, abort
from flask import request, redirect, url_for, render_template, make_response
from strategies import config as strategy_config

from model import config_builder as cb
import config
from controller import strategy_config_store as scs
from controller import experiment_store as es


class AddAssembleConfig(Resource):
    @staticmethod
    def post(hash, copy_id=None, edit_id=None):
        try:
            if not request.form:
                abort(403, message='missing form')

            assemble_config_list = cb.generate_assemble_configs(form_data=request.form)
            success = es.add_config_list(hash, edit_id, assemble_config_list, True)
            if success:
                return redirect(url_for('manage_experiment', hash=hash))

            abort(403, message="Couldn't save to elastic")

        except Exception as e:
            if config.debug_mode:
                abort(400, message=str(e))

            else:
                abort(400, message="something went wrong")

    def get(self, hash, copy_id=None, edit_id=None):
        try:
            if copy_id or edit_id:
                config_data = scs.get_config_by_id(copy_id if copy_id else edit_id)
                return self.make_response(
                    "edit" if edit_id else "copy",
                    config_data.shared_parameters.get('label', "BUG"),
                    config_data,
                )

            return self.make_response("add", "BUG")

        except Exception as e:
            if config.debug_mode:
                abort(400, message=str(e))

            else:
                abort(400, message="something went wrong")

    @staticmethod
    def make_response(mode, default_label, config_data=False):
        return make_response(
            render_template(
                'experiment/add_assembling_config_form.j2',
                title="Add Feature Assembling config",
                default_label=default_label,
                strategies=strategy_config['assembler_strategies'],
                strategy_type="assembler_strategies",
                mode=mode,
                config_data=config_data
            ),
            200,
            {'Content-Type': 'text/html'}
        )
