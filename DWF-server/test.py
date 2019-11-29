from requests import post, get


def post_request(route, json):
    resp = post('http://localhost:4000' + route, json=json)
    return resp.json(), resp.status_code


def ping_with_hash(hash):
    return post_request('/ping', {'hash': hash})


def send_status_message(hash, progress=None, msg=None):
    json = {'hash': hash}
    if progress != None:
        json['progress'] = progress

    if msg:
        json['message'] = msg

    return post_request('/status', json)


def send_result(hash, type, result=None):
    json = {'hash': hash, "type": type}
    if result:
        json['result'] = result

    return post_request('/result', json)


def true_test_ping():
    json, status = ping_with_hash('')
    if status != 200 or 'hash' not in json or not json['hash']:
        print(f'Failed test_ping with empty hash. Statuscode: {status}, json: {json}')
        return False

    task = json['task']
    hash = json['hash']
    json, status = ping_with_hash(hash)
    if status != 200 or 'hash' not in json or not json['hash'] or task != json['task']:
        print(f'Failed test_ping with {hash}. Statuscode: {status}, json: {json}')
        return False

    print('Successful true_test_ping.')
    return True


def false_test_ping():
    json, status = ping_with_hash('asd123456')
    if status == 200 or 'hash' in json:
        print(f'Failed test_ping with nonexistent hash. Statuscode: {status}, json: {json}')
        return False

    print('Successful false_test_ping.')
    return True


def true_test_status():
    json, status = ping_with_hash('')
    if status != 200 or 'hash' not in json or not json['hash'] or not json['task']:
        print(f'Failed test_status at ping server step. Statuscode: {status}, json: {json}')
        return False

    hash = json['hash']
    json, status = send_status_message(hash, 0, 'DBH started...')
    if status != 200 or 'hash' not in json or not json['hash']:
        print(f'Failed test_status. Statuscode: {status}, json: {json}')
        return False

    # fail on progress is not type of float
    json, status = send_status_message(hash, 'asd', 'asd')
    if status == 200 or 'hash' in json:
        print(f'Failed test_status without message. Statuscode: {status}, json: {json}')
        return False

    # fail on message is missing
    json, status = send_status_message(hash, 0)
    if status == 200 or 'hash' in json:
        print(f'Failed test_status without message. Statuscode: {status}, json: {json}')
        return False

    # fail on progress is missing
    json, status = send_status_message(hash, msg='Fold completed 1/10')
    if status == 200 or 'hash' in json:
        print(f'Failed test_status without progress. Statuscode: {status}, json: {json}')
        return False

    print('Successful true_test_status.')
    return True


def false_test_status():
    json, status = ping_with_hash('')
    if status != 200 or 'hash' not in json or not json['hash'] or json['task']:
        print(f'Failed test_status at ping server step. Statuscode: {status}, json: {json}')
        return False

    json, status = send_status_message(json['hash'], 'DBH started...')
    if status == 200 or 'hash' in json:
        print(f'Failed test_status with no task assigned. Statuscode: {status}, json: {json}')
        return False

    json, status = send_status_message('asd123', 'DBH started...')
    if status == 200 or 'hash' in json:
        print(f'Failed test_status with nonexistent hash. Statuscode: {status}, json: {json}')
        return False

    print('Successful false_test_status.')
    return True


def true_test_result():
    json, status = ping_with_hash('')
    if status != 200 or 'hash' not in json or not json['hash'] or not json['task']:
        print(f'Failed test_result at ping server step. Statuscode: {status}, json: {json}')
        return False

    json, status = send_result(json['hash'], 'dbh', {
        "train": {
            "tp": 110638,
            "tn": 263847,
            "fp": 50735,
            "fn": 82204,
            "accuracy": 0.7380119978558219,
            "precision": 0.6856041593078962,
            "recall": 0.573723566442965,
            "fmes": 0.6246940367937306
        },
        "dev": {
            "tp": 4352,
            "tn": 29250,
            "fp": 5710,
            "fn": 3558,
            "accuracy": 0.783811523209521,
            "precision": 0.4325183860063282,
            "recall": 0.5501896333747786,
            "fmes": 0.48430892006558734
        },
        "test": {
            "tp": 4927,
            "tn": 32505,
            "fp": 6333,
            "fn": 3853,
            "accuracy": 0.7860892939643022,
            "precision": 0.4375666074596469,
            "recall": 0.5611617312066501,
            "fmes": 0.4917165619423501
        }
    })
    if status != 200 or 'hash' not in json or not json['hash']:
        print(f'Failed test_result. Statuscode: {status}, json: {json}')
        return False

    json, status = send_result(json['hash'], "dbh")
    if status == 200 or 'hash' in json:
        print(f'Failed test_result without result. Statuscode: {status}, json: {json}')
        return False

    print('Successful true_test_result.')
    return True


def false_test_result():
    json, status = ping_with_hash('')
    if status != 200 or 'hash' not in json or not json['hash'] or json['task']:
        print(f'Failed test_result at ping server step. Statuscode: {status}, json: {json}')
        return False

    json, status = send_result(json['hash'], "dbh", {
        "train": {
            "tp": 110638,
            "tn": 263847,
            "fp": 50735,
            "fn": 82204,
            "accuracy": 0.7380119978558219,
            "precision": 0.6856041593078962,
            "recall": 0.573723566442965,
            "fmes": 0.6246940367937306
        },
        "dev": {
            "tp": 4352,
            "tn": 29250,
            "fp": 5710,
            "fn": 3558,
            "accuracy": 0.783811523209521,
            "precision": 0.4325183860063282,
            "recall": 0.5501896333747786,
            "fmes": 0.48430892006558734
        },
        "test": {
            "tp": 4927,
            "tn": 32505,
            "fp": 6333,
            "fn": 3853,
            "accuracy": 0.7860892939643022,
            "precision": 0.4375666074596469,
            "recall": 0.5611617312066501,
            "fmes": 0.4917165619423501
        }
    })
    if status == 200 or 'hash' in json:
        print(f'Failed test_result with no task assigned. Statuscode: {status}, json: {json}')
        return False

    json, status = send_result('asd123456', "dbh", {
        "train": {
            "tp": 110638,
            "tn": 263847,
            "fp": 50735,
            "fn": 82204,
            "accuracy": 0.7380119978558219,
            "precision": 0.6856041593078962,
            "recall": 0.573723566442965,
            "fmes": 0.6246940367937306
        },
        "dev": {
            "tp": 4352,
            "tn": 29250,
            "fp": 5710,
            "fn": 3558,
            "accuracy": 0.783811523209521,
            "precision": 0.4325183860063282,
            "recall": 0.5501896333747786,
            "fmes": 0.48430892006558734
        },
        "test": {
            "tp": 4927,
            "tn": 32505,
            "fp": 6333,
            "fn": 3853,
            "accuracy": 0.7860892939643022,
            "precision": 0.4375666074596469,
            "recall": 0.5611617312066501,
            "fmes": 0.4917165619423501
        }
    })
    if status == 200 or 'hash' in json:
        print(f'Failed test_result with nonexistent hash. Statuscode: {status}, json: {json}')
        return False

    print('Successful false_test_result.')
    return True


if __name__ == '__main__':
    results = []

    results.append(true_test_result())
    results.append(true_test_status())
    results.append(true_test_ping())
    results.append(false_test_result())
    results.append(false_test_status())
    results.append(false_test_ping())

    print(f'{sum(results)}/{len(results)} test succeeded!')
