import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { EXPERIMENTS } from '@app/data/mocks/mock-experiments';
import { SharedModule } from '@app/shared/shared.module';
import { of } from 'rxjs';
import { NgxEchartsCoreModule } from 'ngx-echarts/core';
import { LearnTasksCompareComponent } from './learn-tasks-compare.component';
import { LearnResultChartComponent } from '../../components/learn-result-chart/learn-result-chart.component';

describe('LearnTasksCompareComponent', () => {
  let component: LearnTasksCompareComponent;
  let fixture: ComponentFixture<LearnTasksCompareComponent>;
  const learnTasksCompare = EXPERIMENTS.flatMap(experiment => Object.entries(experiment.tasks));
  const fakeActivatedRoute = {
    snapshot: {
      data: {
        learnTasksCompare: {
          resolved: { data: learnTasksCompare, error: 'No such index: index1' },
          observable: of({ data: learnTasksCompare, error: 'No such index: index1' }),
        },
      },
      paramMap: convertToParamMap({ ids: 'a,b' }),
    },
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NgxEchartsCoreModule],
      declarations: [LearnTasksCompareComponent, LearnResultChartComponent],
      providers: [{ provide: ActivatedRoute, useValue: fakeActivatedRoute }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearnTasksCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updateCharts with not train result set', () => {
    component.updateCharts('dev');
    expect(component.chart1Data.resultSetParams as any[]).toContain('completeness');
    expect(component.chart2Data.resultSetParams as any[]).toContain('covered_issues');
    expect(component.chart2Data.resultSetParams as any[]).toContain('missed_issues');
  });

  it('updateCharts with train result set', () => {
    component.updateCharts('train');
    expect(component.chart1Data.resultSetParams as any[]).not.toContain('completeness');
    expect(component.chart2Data.resultSetParams as any[]).not.toContain('covered_issues');
    expect(component.chart2Data.resultSetParams as any[]).not.toContain('missed_issues');
  });

  it('handleNewData', () => {
    component.tasks = [];
    component.handleNewData({ data: learnTasksCompare, error: 'error' });
    expect(component.tasks).toEqual(learnTasksCompare);
    expect(component.errorMessage).toBe('error');
  });
});
