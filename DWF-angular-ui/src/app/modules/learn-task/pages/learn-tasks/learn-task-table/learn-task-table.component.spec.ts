import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { EXPERIMENTS } from '@app/data/mocks/mock-experiments';
import { LinkCell } from '@app/shared/models/link-cell';
import { ValueCell } from '@app/shared/models/value-cell';
import { SharedModule } from '@app/shared/shared.module';
import { LearnTaskTableComponent } from './learn-task-table.component';
import { TableRow } from './table-row';
import { LearnResultHeatmapButtonComponent } from '../../../components/learn-result-heatmap-button/learn-result-heatmap-button.component';
import { LearnResultValueCellComponent } from '../../../components/learn-result-value-cell/learn-result-value-cell.component';
import { LearnResultFocusButtonComponent } from '../../../components/learn-result-focus-button/learn-result-focus-button.component';

describe('LearnTaskTableComponent', () => {
  let component: LearnTaskTableComponent;
  let fixture: ComponentFixture<LearnTaskTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      declarations: [
        LearnTaskTableComponent,
        LearnResultHeatmapButtonComponent,
        LearnResultValueCellComponent,
        LearnResultFocusButtonComponent,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearnTaskTableComponent);
    component = fixture.componentInstance;
    component.tasks = EXPERIMENTS.map(experiment => experiment.tasks);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filterPredicate should search in TableRow correctly', () => {
    const testTableRow: Partial<TableRow> = {
      hash: 'hash12',
      Preset: new LinkCell('link', 'link'),
      'Train-F': new ValueCell(0.12345, 0.12345),
      parameters: { features: { feature1: 'feature1' }, learning: { learning1: 1 } },
    };

    expect(component.filterPredicate(testTableRow as TableRow, 'ash1')).toBeTruthy();
    expect(component.filterPredicate(testTableRow as TableRow, 'li')).toBeTruthy();
    expect(component.filterPredicate(testTableRow as TableRow, '0.123')).toBeTruthy();
    expect(component.filterPredicate(testTableRow as TableRow, 'feature1: f')).toBeTruthy();
    expect(component.filterPredicate(testTableRow as TableRow, 'learning1: 1')).toBeTruthy();

    expect(component.filterPredicate(testTableRow as TableRow, 'undefined')).toBeFalsy();
    expect(component.filterPredicate(testTableRow as TableRow, '0.12345')).toBeFalsy();
    expect(component.filterPredicate(testTableRow as TableRow, 'learning1: 2')).toBeFalsy();
  });

  it('masterToggle should toggle selected rows', () => {
    component.masterToggle();
    expect(component.selectedRows.selected.length).toBe(component.dataSource.data.length);
    component.masterToggle();
    expect(component.selectedRows.selected.length).toBe(0);
  });

  it('sortingDataAccessor should work with ValueCells and LinkCells', () => {
    const testTableRow: Partial<TableRow> = {
      Preset: new LinkCell('link', 'link'),
      'Train-F': new ValueCell(0.12345, 0.12345),
    };
    expect(component.dataSource.sortingDataAccessor(testTableRow as TableRow, 'Preset')).toBe('link');
    expect(component.dataSource.sortingDataAccessor(testTableRow as TableRow, 'Train-F')).toBe(0.12345);
  });

  it('should create bestWorstValues', () => {
    expect(component.bestWorstValues).toEqual({
      'Train-Prec': { worst: 1, best: 2 },
      'Train-Recall': { worst: 1, best: 2 },
      'Train-F': { worst: 1, best: 2 },
      'Dev-Prec': { worst: 1, best: 2 },
      'Dev-Recall': { worst: 1, best: 2 },
      'Dev-F': { worst: 1, best: 2 },
      'Test-Prec': { worst: 1, best: 2 },
      'Test-Recall': { worst: 1, best: 2 },
      'Test-F': { worst: 1, best: 2 },
    });
  });

  it('should create sortedValueColumns', () => {
    expect(component.sortedValueColumns).toEqual({
      'Train-Prec': [2, 1],
      'Train-Recall': [2, 1],
      'Train-F': [2, 1],
      'Dev-Prec': [2, 1],
      'Dev-Recall': [2, 1],
      'Dev-F': [2, 1],
      'Test-Prec': [2, 1],
      'Test-Recall': [2, 1],
      'Test-F': [2, 1],
    });
  });
});
