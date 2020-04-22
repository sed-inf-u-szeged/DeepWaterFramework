import { TestBed } from '@angular/core/testing';
import { LearnResultTableService } from './learn-result-table.service';

describe('LearnResultTableService', () => {
  let service: LearnResultTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LearnResultTableService],
    });
    service = TestBed.inject(LearnResultTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
