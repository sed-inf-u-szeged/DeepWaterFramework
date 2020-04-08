import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ValueCell } from '@app/shared/models/value-cell';
import { LearnResultTableService } from '@app/modules/learn-task/services/learn-result-table/learn-result-table.service';
import { SharedModule } from '@app/shared/shared.module';
import { LearnTasksByAlgorithmTableComponent } from './learn-tasks-by-algorithm-table.component';
import { LearnResultHeatmapButtonComponent } from '../../../components/learn-result-heatmap-button/learn-result-heatmap-button.component';
import { LearnResultValueCellComponent } from '../../../components/learn-result-value-cell/learn-result-value-cell.component';
import { LearnResultFocusButtonComponent } from '../../../components/learn-result-focus-button/learn-result-focus-button.component';
import { LearnResultColumnPickerComponent } from '../../../components/learn-result-column-picker/learn-result-column-picker.component';

describe('LearnTasksByAlgorithmTableComponent', () => {
  let component: LearnTasksByAlgorithmTableComponent;
  let fixture: ComponentFixture<LearnTasksByAlgorithmTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule, DragDropModule],
      declarations: [
        LearnTasksByAlgorithmTableComponent,
        LearnResultHeatmapButtonComponent,
        LearnResultValueCellComponent,
        LearnResultFocusButtonComponent,
        LearnResultColumnPickerComponent,
      ],
      providers: [LearnResultTableService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearnTasksByAlgorithmTableComponent);
    component = fixture.componentInstance;
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
