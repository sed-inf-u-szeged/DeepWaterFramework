import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Task } from '@app/data/models/experiment';
import { NgxEchartsCoreModule } from 'ngx-echarts/core';
import { LearnResultChartComponent } from './learn-result-chart.component';

describe('LearnResultChartComponent', () => {
  let component: LearnResultChartComponent;
  let fixture: ComponentFixture<LearnResultChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxEchartsCoreModule],
      declarations: [LearnResultChartComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearnResultChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create task name currectly', () => {
    const testTaskObj = {
      assemble_config: { strategy_name: 'ac_strategy_name' },
      learn_config: { strategy_name: 'lc_strategy_name' },
    } as Task;
    expect(component.taskName('0123456789', testTaskObj)).toBe('ac_strategy_name +\nlc_strategy_name (01234)');
  });
});
