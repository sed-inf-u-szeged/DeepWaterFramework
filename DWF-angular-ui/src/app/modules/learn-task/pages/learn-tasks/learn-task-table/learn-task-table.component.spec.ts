import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { EXPERIMENTS } from '@app/data/mocks/mock-experiments';
import { LinkCell } from '@app/shared/models/link-cell';
import { ValueCell } from '@app/shared/models/value-cell';
import { SharedModule } from '@app/shared/shared.module';
import { LearnTaskTableComponent } from './learn-task-table.component';
import { LearnResultHeatmapButtonComponent } from '../../../components/learn-result-heatmap-button/learn-result-heatmap-button.component';
import { LearnResultValueCellComponent } from '../../../components/learn-result-value-cell/learn-result-value-cell.component';
import { LearnResultFocusButtonComponent } from '../../../components/learn-result-focus-button/learn-result-focus-button.component';
import { LearnResultColumnPickerComponent } from '../../../components/learn-result-column-picker/learn-result-column-picker.component';
import { LearnResultTableService } from '../../../services/learn-result-table/learn-result-table.service';

describe('LearnTaskTableComponent', () => {
  let component: LearnTaskTableComponent;
  let fixture: ComponentFixture<LearnTaskTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule, DragDropModule],
      providers: [LearnResultTableService],
      declarations: [
        LearnTaskTableComponent,
        LearnResultHeatmapButtonComponent,
        LearnResultValueCellComponent,
        LearnResultFocusButtonComponent,
        LearnResultColumnPickerComponent,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearnTaskTableComponent);
    component = fixture.componentInstance;
    component.tasksOfExperiments = EXPERIMENTS.map(experiment => experiment.tasks);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filterPredicate should search in TableRow correctly', () => {
    const testTableRow = ({
      hash: 'hash12',
      Preset: new LinkCell('link', 'link'),
      'Train-F': new ValueCell(0.12345, 0.12345),
      parameters: { features: { feature1: 'feature1' }, learning: { learning1: 1 } },
    } as unknown) as Parameters<typeof component['filterPredicate']>[0];

    expect(component.filterPredicate(testTableRow, 'ash1')).toBeTruthy();
    expect(component.filterPredicate(testTableRow, 'li')).toBeTruthy();
    expect(component.filterPredicate(testTableRow, '0.123')).toBeTruthy();
    expect(component.filterPredicate(testTableRow, 'feature1: f')).toBeTruthy();
    expect(component.filterPredicate(testTableRow, 'learning1: 1')).toBeTruthy();

    expect(component.filterPredicate(testTableRow, 'undefined')).toBeFalsy();
    expect(component.filterPredicate(testTableRow, '0.12345')).toBeFalsy();
    expect(component.filterPredicate(testTableRow, 'learning1: 2')).toBeFalsy();
  });

  it('masterToggle should toggle selected rows', () => {
    component.checkboxMasterToggle();
    expect(component.selectedRows.selected.length).toBe(component.dataSource.data.length);
    component.checkboxMasterToggle();
    expect(component.selectedRows.selected.length).toBe(0);
  });

  it('sortingDataAccessor should work with ValueCells and LinkCells', () => {
    const testTableRow = ({
      Preset: new LinkCell('link', 'link'),
      Algorithm: new LinkCell('alg', 'alg'),
      'Train-F': new ValueCell(0.12345, 0.12345),
    } as unknown) as Parameters<typeof component['dataSource']['sortingDataAccessor']>[0];
    expect(component.dataSource.sortingDataAccessor(testTableRow, 'Preset')).toBe('link');
    expect(component.dataSource.sortingDataAccessor(testTableRow, 'Train-F')).toBe(0.12345);
  });
});
