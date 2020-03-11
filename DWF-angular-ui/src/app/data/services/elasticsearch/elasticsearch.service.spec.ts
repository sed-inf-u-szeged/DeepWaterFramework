import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SearchResponse } from 'elasticsearch';
import { ElasticsearchService } from './elasticsearch.service';

describe('ElasticsearchService', () => {
  let service: ElasticsearchService;
  let http: HttpTestingController;

  const createMockSearchResponse = <T = any>(hitIndexes = ['test'], source: T = {} as any): SearchResponse<T> => ({
    took: 1,
    timed_out: false,
    _shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
    hits: {
      total: 1,
      max_score: 1.0,
      hits: hitIndexes.map(index => ({ _index: index, _type: '_doc', _id: '1', _score: 1.0, _source: source })),
    },
  });

  const mockSearchResponse = createMockSearchResponse<any>();

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ElasticsearchService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('search', () => {
    service.search<string>('test_index').subscribe(response => expect(response).toEqual(mockSearchResponse));
    http.expectOne('/api/test_index/_search?size=10000').flush(mockSearchResponse);
  });

  it('search should add body to the request', () => {
    service
      .search('test_index', { testKey: 'testValue' })
      .subscribe(response => expect(response).toEqual(mockSearchResponse));
    const mockRequest = http.expectOne('/api/test_index/_search?size=10000');
    mockRequest.flush(mockSearchResponse);
    expect(mockRequest.request.body).toEqual({ testKey: 'testValue' });
  });

  it('search should add params to the request and override defaults', () => {
    service
      .search('test_index', {}, { param1: '1', param2: '2', size: '1' })
      .subscribe(response => expect(response).toEqual(mockSearchResponse));
    http.expectOne('/api/test_index/_search?size=1&param1=1&param2=2').flush(mockSearchResponse);
  });

  it('getAllExperimentItems', () => {
    service.getAllExperimentItems().subscribe(response => expect(response).toEqual(mockSearchResponse));
    http.expectOne('/api/experiments_*/_search?size=10000').flush(mockSearchResponse);
  });

  it('getExperiments', () => {
    service.getExperiments(['1', '2']).subscribe(response => expect(response).toEqual(mockSearchResponse));
    http
      .expectOne('/api/experiments_1,experiments_2/_search?size=10000&ignore_unavailable=true')
      .flush(mockSearchResponse);
  });

  it('getOnlyAssembleConfigs', () => {
    service.getOnlyAssembleConfigs(['1', '2']).subscribe(response => expect(response).toEqual(mockSearchResponse));
    http
      .expectOne('/api/experiments_1,experiments_2/_search?size=10000&ignore_unavailable=true')
      .flush(mockSearchResponse);
  });

  it('getOnlyTasks', () => {
    service.getOnlyTasks(['1', '2']).subscribe(response => expect(response).toEqual(mockSearchResponse));
    http
      .expectOne('/api/experiments_1,experiments_2/_search?size=10000&ignore_unavailable=true')
      .flush(mockSearchResponse);
  });

  it('checkMissingExperimentIndexes no missing', () => {
    const missingCheck = service.checkMissingExperimentIndexes(
      ['index_1', 'index_2'],
      createMockSearchResponse(['index_1', 'index_2'])
    );
    expect(missingCheck.missing).toBeFalse();
    expect(missingCheck.message).toBeUndefined();
  });

  it('checkMissingExperimentIndexes single miss', () => {
    const missingCheck = service.checkMissingExperimentIndexes(
      ['index_1', 'index_2'],
      createMockSearchResponse(['index_1'])
    );
    expect(missingCheck.missing).toBeTrue();
    expect(missingCheck.message).toBe('No such experiment index: index_2');
  });

  it('checkMissingExperimentIndexes multiple misses', () => {
    const missingCheck = service.checkMissingExperimentIndexes(
      ['index_1', 'index_2'],
      createMockSearchResponse(['index_3'])
    );
    expect(missingCheck.missing).toBeTrue();
    expect(missingCheck.message).toBe('No such experiment indexes: [index_1, index_2]');
  });
});
