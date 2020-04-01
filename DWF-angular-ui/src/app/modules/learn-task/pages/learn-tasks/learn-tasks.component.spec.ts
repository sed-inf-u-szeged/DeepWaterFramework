import { DragDropModule } from '@angular/cdk/drag-drop';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EXPERIMENTS } from '@app/data/mocks/mock-experiments';
import { SharedModule } from '@app/shared/shared.module';
import { of } from 'rxjs';
import { NgxEchartsCoreModule } from 'ngx-echarts/core';
import { LearnTasksComponent } from './learn-tasks.component';
import { BestResultsChartComponent } from './best-results-chart/best-results-chart.component';
import { LearnTaskTableComponent } from './learn-task-table/learn-task-table.component';
import { LearnResultHeatmapButtonComponent } from '../../components/learn-result-heatmap-button/learn-result-heatmap-button.component';
import { LearnResultValueCellComponent } from '../../components/learn-result-value-cell/learn-result-value-cell.component';
import { LearnResultFocusButtonComponent } from '../../components/learn-result-focus-button/learn-result-focus-button.component';
import { LearnResultChartComponent } from '../../components/learn-result-chart/learn-result-chart.component';
import { LearnResultColumnPickerComponent } from '../../components/learn-result-column-picker/learn-result-column-picker.component';

describe('LearnTasksComponent', () => {
  let component: LearnTasksComponent;
  let fixture: ComponentFixture<LearnTasksComponent>;
  const learnTasks = EXPERIMENTS.map(experiment => experiment.tasks);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule, NgxEchartsCoreModule, DragDropModule],
      declarations: [
        LearnTasksComponent,
        LearnTaskTableComponent,
        BestResultsChartComponent,
        LearnTaskTableComponent,
        LearnResultHeatmapButtonComponent,
        LearnResultValueCellComponent,
        LearnResultFocusButtonComponent,
        LearnResultChartComponent,
        LearnResultColumnPickerComponent,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { learnTasks: { resolved: { data: learnTasks }, observable: of({ data: learnTasks }) } },
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
    component.tasksOfExperiments = [{}];
    component.errorMessage = undefined;
    component.handleNewData({ data: learnTasks, error: 'error' });
    expect(component.tasksOfExperiments).toEqual(learnTasks);
    expect(component.errorMessage!).toBe('error');
  });
});
