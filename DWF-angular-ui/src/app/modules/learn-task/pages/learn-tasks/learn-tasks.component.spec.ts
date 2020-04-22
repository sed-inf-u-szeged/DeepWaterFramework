import { DragDropModule } from '@angular/cdk/drag-drop';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EXPERIMENTS } from '@app/data/mocks/mock-experiments';
import { SharedModule } from '@app/shared/shared.module';
import { NgxEchartsCoreModule } from 'ngx-echarts/core';
import { of } from 'rxjs';
import { BestResultsChartComponent } from './best-results-chart/best-results-chart.component';
import { LearnTaskTableComponent } from './learn-task-table/learn-task-table.component';
import { LearnTasksComponent } from './learn-tasks.component';
import { LearnResultChartComponent } from '../../components/learn-result-chart/learn-result-chart.component';
import { LearnResultColumnPickerComponent } from '../../components/learn-result-column-picker/learn-result-column-picker.component';
import { LearnResultFocusButtonComponent } from '../../components/learn-result-focus-button/learn-result-focus-button.component';
import { LearnResultHeatmapButtonComponent } from '../../components/learn-result-heatmap-button/learn-result-heatmap-button.component';
import { LearnResultValueCellComponent } from '../../components/learn-result-value-cell/learn-result-value-cell.component';
import { MatTableShellComponent } from '../../components/mat-table-shell/mat-table-shell.component';

describe('LearnTasksComponent', () => {
  let component: LearnTasksComponent;
  let fixture: ComponentFixture<LearnTasksComponent>;
  const hashWithTasks = EXPERIMENTS.flatMap(experiment => Object.entries(experiment.tasks));

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DragDropModule, NoopAnimationsModule, RouterTestingModule, SharedModule, NgxEchartsCoreModule],
      declarations: [
        BestResultsChartComponent,
        LearnTaskTableComponent,
        LearnTaskTableComponent,
        LearnTasksComponent,
        MatTableShellComponent,
        LearnResultChartComponent,
        LearnResultColumnPickerComponent,
        LearnResultFocusButtonComponent,
        LearnResultHeatmapButtonComponent,
        LearnResultValueCellComponent,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { learnTasks: { resolved: { data: hashWithTasks }, observable: of({ data: hashWithTasks }) } },
              paramMap: convertToParamMap({ experimentIds: 'a,b' }),
            },
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearnTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('handleNewData', () => {
    component.hashWithTasks = [];
    component.errorMessage = undefined;
    component.handleNewData({ data: hashWithTasks, error: 'error' });
    expect(component.hashWithTasks).toEqual(hashWithTasks);
    expect(component.errorMessage!).toBe('error');
  });
});
