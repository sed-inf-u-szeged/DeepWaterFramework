import { DragDropModule } from '@angular/cdk/drag-drop';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EXPERIMENTS } from '@app/data/mocks/mock-experiments';
import { HashWithTask } from '@app/data/models/experiment';
import { SharedModule } from '@app/shared/shared.module';
import { ValueCell } from '@app/shared/models/value-cell';
import { of } from 'rxjs';
import { LearnTasksByAlgorithmComponent } from './learn-tasks-by-algorithm.component';
import { LearnResultHeatmapButtonComponent } from '../../components/learn-result-heatmap-button/learn-result-heatmap-button.component';
import { LearnResultValueCellComponent } from '../../components/learn-result-value-cell/learn-result-value-cell.component';
import { LearnResultFocusButtonComponent } from '../../components/learn-result-focus-button/learn-result-focus-button.component';
import { LearnResultColumnPickerComponent } from '../../components/learn-result-column-picker/learn-result-column-picker.component';
import { LearnResultTableService } from '../../services/learn-result-table/learn-result-table.service';

describe('LearnTasksByAlgorithmComponent', () => {
  let component: LearnTasksByAlgorithmComponent;
  let fixture: ComponentFixture<LearnTasksByAlgorithmComponent>;
  const learnTasksByAlgorithm: HashWithTask[] = EXPERIMENTS.flatMap(experiment =>
    Object.entries(experiment.tasks).filter(([_hash, task]) => task.learn_config.strategy_id === 'lc_strategy_id')
  );

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule, RouterTestingModule, DragDropModule],
      declarations: [
        LearnTasksByAlgorithmComponent,
        LearnResultHeatmapButtonComponent,
        LearnResultValueCellComponent,
        LearnResultFocusButtonComponent,
        LearnResultColumnPickerComponent,
      ],
      providers: [
        LearnResultTableService,
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

  it('sortingDataAccessor should return value field for ValueCells if defined, if not then Infinity for lowerBetter cells and -Infinity otherwise', () => {
    const testTableRow = ({
      'test-tp': new ValueCell(0.1111, 1),
      'test-fp': new ValueCell(undefined, undefined, true),
      'test-fmes': new ValueCell(),
    } as unknown) as Parameters<typeof component['sortingDataAccessor']>[0];
    expect(component.sortingDataAccessor(testTableRow, 'test-tp')).toBe(0.1111);
    expect(component.sortingDataAccessor(testTableRow, 'test-fp')).toBe(Infinity);
    expect(component.sortingDataAccessor(testTableRow, 'test-fmes')).toBe(-Infinity);
  });

  it('sortingDataAccessor should try to return strings converted to numbers, if its NaN then just return it as string', () => {
    const testTableRow = ({
      'test-number-cell': 1,
      'test-number-as-string': '0123',
      'test-NaN-string-cell': '1test',
    } as unknown) as Parameters<typeof component['sortingDataAccessor']>[0];
    expect(component.sortingDataAccessor(testTableRow, 'test-number-cell')).toBe(1);
    expect(component.sortingDataAccessor(testTableRow, 'test-number-as-string')).toBe(123);
    expect(component.sortingDataAccessor(testTableRow, 'test-NaN-string-cell')).toBe('1test');
  });
});
