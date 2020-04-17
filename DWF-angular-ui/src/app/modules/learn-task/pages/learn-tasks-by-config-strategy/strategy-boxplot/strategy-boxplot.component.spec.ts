import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '@app/shared/shared.module';
import { NgxEchartsCoreModule } from 'ngx-echarts/core';
import { StrategyBoxplotComponent } from './strategy-boxplot.component';

describe('StrategyBoxplotComponent', () => {
  let component: StrategyBoxplotComponent;
  let fixture: ComponentFixture<StrategyBoxplotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule, NgxEchartsCoreModule],
      declarations: [StrategyBoxplotComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategyBoxplotComponent);
    component = fixture.componentInstance;
    component.data = { config: 'assemble_config', hashWithTasks: [] };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
