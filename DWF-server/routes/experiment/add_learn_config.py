from flask_restful import Resource, abort
from flask import request, redirect, url_for, render_template, make_response, jsonify
from strategies import config as strategy_config

from model import config_builder as cb
import config
from controller import strategy_config_store as scs
from controller import experiment_store as es


class AddLearnConfig(Resource):
    @staticmethod
    def post(hash):
        try:
            if not request.form:
                abort(403, message='missing form')

            learn_config_list = cb.generate_learn_configs(form_data=request.form)
            learn_config_id_list = [scs.new_config(c) for c in learn_config_list]
            e = es.get_experiment(hash)
            changes = e.add_learn_config_list(learn_config_id_list)
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
                    'experiment/add_learning_config_form.j2',
                    title="Add learning config",
                    resample_types=[
                        ("none", "None", True),
                        ("up", "Up sampling", False),
                        ("down", "Down sampling", False),
                    ],
                    default_resample_amount=50,
                    feature_preprocess_types=[
                        ("none", "None", False),
                        ("binarize", "Binarize", False),
                        ("normalize", "Normalize", False),
                        ("standardize", "Standardize", True),
                    ],
                    label_preprocess_types=[
                        ("none", "None", False),
                        ("binarize", "Binarize", True),
                        ("normalize", "Normalize", False),
                        ("standardize", "Standardize", False),
                    ],
                    strategies=strategy_config['learning_strategies'],
                    strategy_type="learning_strategies",
                ),
                200,
                {'Content-Type': 'text/html'},
            )

        except Exception as e:
            if config.debug_mode:
                abort(400, message=str(e))

            else:
                abort(400, message="something went wrong")
