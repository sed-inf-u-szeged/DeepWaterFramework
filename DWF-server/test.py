from requests import post, get
import time

BASE_URL = 'http://localhost:4000'
NEW_EXPERIMENT_URL = BASE_URL + '/experiment/new'
GET_EXPERIMENT_URL = BASE_URL + '/experiment/get'


def new_experiment(name):
    try:
        resp = post(NEW_EXPERIMENT_URL, data={'experiment_name': name, 'markdown': f"{name}'s markdown"})
        if resp.status_code == 200:
            print('create experiment OK')
            resp = get(f'{GET_EXPERIMENT_URL}/{name}')
            if resp.status_code == 200:
                print('get experiment OK')
                return resp.text

    except Exception as e:
        pass

    return False


def add_configs(i, exp_id):
    try:
        assembling_data = {
            'label': 'BUG',
            'manual_file_input_file_path': '\\test\\dataset.csv',
            'ASTEmbedding_outputDir': '\\test\\output\\test_framework',
            'ASTEmbedding_astFile': '\\input\\ast.csv',
            'ASTEmbedding_bugFile': '\\input\\bugsu.csv',
            'ASTEmbedding_metricsFile': '\\input\\metrics.csv',
            'ASTEmbedding_model': 'none',
            'ASTEmbedding_window_size': '10',
            'ASTEmbedding_vector_size': '50',
            'ASTEmbedding_max_epochs': '1',
            'ASTEmbedding_seed': f'12345',
            'ASTEmbedding_dm': '0'
        }
        add_assemble_config(assembling_data, 'manual_file_input', exp_id)

        assembling_data['label'] = 'bug'
        add_assemble_config(assembling_data, 'ASTEmbedding', exp_id)

        learning_data = {
            'resample_amount': '50',
            'seed': f'{i}',
            'resample': 'up',
            'preprocess_features': 'standardize',
            'preprocess_labels': 'binarize',
            'cdnnc_layers': '5',
            'cdnnc_neurons': '250',
            'cdnnc_batch': '100',
            'cdnnc_lr': '0.1',
            'cdnnc_beta': '0.0005',
            'forest_n-estimators': '100',
            'forest_max-depth': '10',
            'forest_criterion': 'entropy',
            'knn_n_neighbors': '18',
            'logistic_C': '2.0',
            'logistic_tol': '0.0001',
            'logistic_solver': 'liblinear',
            'logistic_penalty': 'l2',
            'sdnnc_layers': '5',
            'sdnnc_neurons': '200',
            'sdnnc_batch': '100',
            'sdnnc_epochs': '10',
            'sdnnc_lr': '0.05',
            'svm_C': '2.6',
            'svm_gamma': '0.02',
            'svm_kernel': 'rbf',
            'tree_max-depth': '10',
        }
        add_learn_config(learning_data, 'bayes', exp_id)
        add_learn_config(learning_data, 'cdnnc', exp_id)
        add_learn_config(learning_data, 'forest', exp_id)
        add_learn_config(learning_data, 'linear', exp_id)
        add_learn_config(learning_data, 'logistic', exp_id)
        add_learn_config(learning_data, 'sdnnc', exp_id)
        add_learn_config(learning_data, 'svm', exp_id)
        add_learn_config(learning_data, 'tree', exp_id)
        add_learn_config(learning_data, 'zeror', exp_id)
        return True

    except Exception as e:
        print('add_configs error')
        print(e)
        return False


def add_config(config_type, data, strategy, exp_id):
    data['selected_strategy'] = strategy
    resp = post(f'{BASE_URL}/experiment/{exp_id}/add_{config_type}_config', data=data)
    if resp.status_code != 200:
        raise Exception(f'add {strategy} {config_type} error')

    print(f'add {strategy} {config_type} OK')


def add_learn_config(data, strategy, exp_id):
    add_config('learning', data, strategy, exp_id)


def add_assemble_config(data, strategy, exp_id):
    add_config('assembler', data, strategy, exp_id)


def generate_tasks(exp_id):
    resp = post(f'{BASE_URL}/experiment/{exp_id}', json={'command': 'generate_tasks'})
    if resp.status_code != 200:
        print('generate tasks error')
        return False

    print('generate tasks OK')
    return True


def run_tasks(exp_id):
    resp = post(f'{BASE_URL}/experiment/{exp_id}', json={'command': 'run_all'})
    if resp.status_code != 200:
        print('run tasks error')
        return False

    print('run tasks OK')
    return True


def create_experiment(i, name, task_gen, task_run):
    exp_id = new_experiment(name)
    while not exp_id:
        print("couldn't create experiment, try again in 5s...")
        time.sleep(5)
        exp_id = new_experiment(name)

    success = add_configs(i, exp_id)

    if task_gen:
        success = success and generate_tasks(exp_id)
        if task_run:
            success = success and run_tasks(exp_id)

    if success:
        print(f'create {name} experiment OK')

    else:
        print(f'create {name} experiment failed')

    return success


if __name__ == '__main__':
    test_cases = 6
    test_results = []
    for i in range(1, int(test_cases/3) + 1, 1):
        res = create_experiment(i, f'Default parameters {i}', True, True)
        test_results.append(res)
    for i in range(1, int(test_cases/3) + 1, 1):
        res = create_experiment(i, f'Tasks generated {i}', True, False)
        test_results.append(res)
    for i in range(1, int(test_cases/3) + 1, 1):
        res = create_experiment(i, f'Configs added {i}', False, False)
        test_results.append(res)

    num_of_tests = len(test_results)
    num_of_failed_tests = num_of_tests - sum(test_results)
    print(f'{num_of_tests} test(s) run successfully, {num_of_failed_tests} failed')
