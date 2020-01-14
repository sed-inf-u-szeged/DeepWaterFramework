from elasticsearch import Elasticsearch

import config

es = Elasticsearch([{'host': config.es_host, 'port': 9200}])


def create_document(index, doc):
    try:
        document_id = es.index(index=index, body=doc, refresh='true')['_id']
        return document_id

    except Exception as e:
        return None


def get_document_by_id(index, id):
    try:
        return es.get(index=index, id=id)

    except:
        return None


def search_one_document(index, query):
    try:
        return es.search(index=index, body=query, size=1)['hits']['hits'][0]

    except Exception as e:
        return None


def dict_query(dict):
    return {
        'query': {
            'bool': {
                'must': list(map(lambda attr: {'term': {attr[0]: attr[1]}}, dict))
            }
        }
    }


def missing_field_query(field):
    return {
        'query': {
            "bool": {
                "must_not": {
                    "exists": {
                        "field": field
                    }
                }
            }
        }
    }


def overwrite_document(index, id, doc, field_limit=None):
    try:
        if field_limit:
            settings = {
                "settings": {
                    "index.mapping.total_fields.limit": field_limit,
                    "number_of_shards": 1,
                    "number_of_replicas": 0
                },
            }
            asd = es.indices.create(index=index, ignore=400, body=settings)

        return es.index(index=index, id=id, body=doc, refresh='true')['_id']

    except Exception as e:
        return None


def update_document(index, id, fields):
    try:
        return es.update(index=index, id=id, body={"doc": fields}, refresh='true')['_id']

    except Exception as e:
        return None


def delete_document(index, id):
    try:
        return es.delete(index=index, id=id, refresh='true')['_id']

    except Exception as e:
        return None


def search_documents(index, query, mapper):
    try:
        size = es.search(index=index)['hits']['total']['value']
        results = es.search(index=index, body=query, size=size)['hits']['hits']
        return [(d['_id'], mapper(d['_source'])) for d in results]

    except Exception as e:
        pass

    return []


def search_document_ids(index, query):
    try:
        size = es.search(index=index)['hits']['total']['value']
        results = es.search(index=index, body=query, size=size)['hits']['hits']
        return [d['_id'] for d in results]

    except Exception as e:
        pass

    return []
