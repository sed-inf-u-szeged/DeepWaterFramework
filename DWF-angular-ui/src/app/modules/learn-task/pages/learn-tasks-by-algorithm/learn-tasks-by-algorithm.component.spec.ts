import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EXPERIMENTS } from '@app/data/mocks/mock-experiments';
import { HashWithTask } from '@app/data/models/experiment';
import { SharedModule } from '@app/shared/shared.module';
import { ValueCell } from '@app/shared/models/value-cell';
import { of } from 'rxjs';
import { TableRow } from './table-row';
import { LearnTasksByAlgorithmComponent } from './learn-tasks-by-algorithm.component';
import { LearnResultHeatmapButtonComponent } from '../../components/learn-result-heatmap-button/learn-result-heatmap-button.component';
import { LearnResultValueCellComponent } from '../../components/learn-result-value-cell/learn-result-value-cell.component';
import { LearnResultFocusButtonComponent } from '../../components/learn-result-focus-button/learn-result-focus-button.component';

describe('LearnTasksByAlgorithmComponent', () => {
  let component: LearnTasksByAlgorithmComponent;
  let fixture: ComponentFixture<LearnTasksByAlgorithmComponent>;
  const learnTasksByAlgorithm: HashWithTask[] = EXPERIMENTS.flatMap(experiment =>
    Object.entries(experiment.tasks).filter(([_hash, task]) => task.learn_config.strategy_id === 'lc_strategy_id')
  );

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule, RouterTestingModule],
      declarations: [
        LearnTasksByAlgorithmComponent,
        LearnResultHeatmapButtonComponent,
        LearnResultValueCellComponent,
        LearnResultFocusButtonComponent,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                learnTasksByAlgorithm: {
                  resolved: { data: learnTasksByAlgorithm },
                  observable: of({ data: learnTasksByAlgorithm }),
                },
              },
              paramMap: convertToParamMap({ experimentIds: '1,2,3' }),
            },
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearnTasksByAlgorithmComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create bestWorstValues', () => {
    expect(component.bestWorstValues).toEqual({
      'test-tp': { worst: 1, best: 2 },
      'test-fp': { worst: 2, best: 1 },
      'test-tn': { worst: 1, best: 2 },
      'test-fn': { worst: 2, best: 1 },
      'test-covered_issues': { worst: 1, best: 2 },
      'test-missed_issues': { worst: 1, best: 2 },
      'test-fmes': { worst: 1, best: 2 },
      'test-precision': { worst: 1, best: 2 },
      'test-accuracy': { worst: 1, best: 2 },
      'test-completeness': { worst: 1, best: 2 },
      'test-mcc': { worst: 1, best: 2 },
      'test-recall': { worst: 1, best: 2 },
    });
  });

  it('sortingDataAccessor should return value field for ValueCells if defined, if not then Infinity for lowerBetter cells and -Infinity otherwise', () => {
    const testTableRow: Partial<TableRow> = {
      'test-tp': new ValueCell(0.1111, 1),
      'test-fp': new ValueCell(undefined, undefined, true),
      'test-fmes': new ValueCell(),
    };
    expect(component.sortingDataAccessor(testTableRow as TableRow, 'test-tp')).toBe(0.1111);
    expect(component.sortingDataAccessor(testTableRow as TableRow, 'test-fp')).toBe(Infinity);
    expect(component.sortingDataAccessor(testTableRow as TableRow, 'test-fmes')).toBe(-Infinity);
  });

  it('sortingDataAccessor should try to return strings converted to numbers, if its NaN then just return it as string', () => {
    const testTableRow: Partial<TableRow> = {
      'test-number-cell': 1,
      'test-number-as-string': '0123',
      'test-NaN-string-cell': '1test',
    };
    expect(component.sortingDataAccessor(testTableRow as TableRow, 'test-number-cell')).toBe(1);
    expect(component.sortingDataAccessor(testTableRow as TableRow, 'test-number-as-string')).toBe(123);
    expect(component.sortingDataAccessor(testTableRow as TableRow, 'test-NaN-string-cell')).toBe('1test');
  });

  it('should create sortedValueColumns', () => {
    expect(component.sortedValueColumns).toEqual({
      'test-tp': [2, 1],
      'test-fp': [1, 2],
      'test-tn': [2, 1],
      'test-fn': [1, 2],
      'test-covered_issues': [2, 1],
      'test-missed_issues': [2, 1],
      'test-fmes': [2, 1],
      'test-precision': [2, 1],
      'test-accuracy': [2, 1],
      'test-completeness': [2, 1],
      'test-mcc': [2, 1],
      'test-recall': [2, 1],
    });
  });
});
