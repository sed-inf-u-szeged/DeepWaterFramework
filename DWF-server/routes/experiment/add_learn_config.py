from flask_restful import Resource, abort
from flask import request, redirect, url_for, render_template, make_response
from strategies import config as strategy_config

from model import config_builder as cb
import config
from controller import strategy_config_store as scs
from controller import experiment_store as es


class AddLearnConfig(Resource):
    @staticmethod
    def post(hash, copy_id=None, edit_id=None):
        try:
            if not request.form:
                abort(403, message='missing form')

            e = es.get_experiment(hash)
            if edit_id:
                changes = e.remove_config(edit_id)
                success = es.update_experiment(changes, hash)

            learn_config_list = cb.generate_learn_configs(form_data=request.form)
            learn_config_id_list = [scs.new_config(c) for c in learn_config_list]

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

    def get(self, hash, copy_id=None, edit_id=None):
        try:
            if copy_id or edit_id:
                config_data = scs.get_config_by_id(copy_id if copy_id else edit_id)
                return self.make_response(
                    "edit" if edit_id else "copy",
                    config_data.shared_parameters.get('resample', "none"),
                    config_data.shared_parameters.get('resample_amount', 50),
                    config_data.shared_parameters.get('seed', 1337),
                    config_data.shared_parameters.get('preprocess_features', "standardize"),
                    config_data.shared_parameters.get('preprocess_labels', "binarize"),
                    config_data,
                )

            return self.make_response("add", "none", 50, 1337, "standardize", "binarize")

        except Exception as e:
            if config.debug_mode:
                abort(400, message=str(e))

            else:
                abort(400, message="something went wrong")

    @staticmethod
    def make_response(mode, resample, res_amount, seed, feature_prep, label_prep, config=False):
        return make_response(
            render_template(
                'experiment/add_learning_config_form.j2',
                title="Add learning config",
                resample_types=[
                    ("none", "None", resample == "none"),
                    ("up", "Up sampling", resample == "up"),
                    ("down", "Down sampling", resample == "down"),
                ],
                default_resample_amount=res_amount,
                default_seed=seed,
                feature_preprocess_types=[
                    ("none", "None", feature_prep == "none"),
                    ("binarize", "Binarize", feature_prep == "binarize"),
                    ("normalize", "Normalize", feature_prep == "normalize"),
                    ("standardize", "Standardize", feature_prep == "standardize"),
                ],
                label_preprocess_types=[
                    ("none", "None", label_prep == "none"),
                    ("binarize", "Binarize", label_prep == "binarize"),
                    ("normalize", "Normalize", label_prep == "normalize"),
                    ("standardize", "Standardize", label_prep == "standardize"),
                ],
                strategies=strategy_config['learning_strategies'],
                strategy_type="learning_strategies",
                mode=mode,
                config_data=config
            ),
            200,
            {'Content-Type': 'text/html'},
        )
