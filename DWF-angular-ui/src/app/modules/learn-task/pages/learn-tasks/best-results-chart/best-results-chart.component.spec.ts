import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BestResultsChartComponent } from './best-results-chart.component';
import { SharedModule } from '@app/shared/shared.module';
import { Experiment } from '@app/data/models/experiment';
import { NgxEchartsCoreModule } from 'ngx-echarts/core';
import { LearnResultChartComponent } from '../../../components/learn-result-chart/learn-result-chart.component';

describe('BestResultsChartComponent', () => {
  let component: BestResultsChartComponent;
  let fixture: ComponentFixture<BestResultsChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NgxEchartsCoreModule],
      declarations: [BestResultsChartComponent, LearnResultChartComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BestResultsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should find the best tasks by preset + algorithm', () => {
    const testTasks = ([
      {
        task1: {
          assemble_config: { strategy_name: 'ac_sn_1' },
          learn_config: { strategy_name: 'lc_sn_1' },
          learn_result: { test: { fmes: 0.1 } },
        },
      },
      {
        task2: {
          assemble_config: { strategy_name: 'ac_sn_1' },
          learn_config: { strategy_name: 'lc_sn_1' },
          learn_result: { test: { fmes: 1 } },
        },
      },
      {
        task3: {
          assemble_config: { strategy_name: 'ac_sn_1' },
          learn_config: { strategy_name: 'lc_sn_1' },
          learn_result: { test: { fmes: undefined } },
        },
      },
    ] as unknown) as Experiment['tasks'][];
    component.tasksOfExperiments = testTasks;
    fixture.detectChanges();
    expect(component.chartData.taskEntries).toEqual([['task2', testTasks[1].task2]]);
  });
});
