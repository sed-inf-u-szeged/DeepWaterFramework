import { DragDropModule } from '@angular/cdk/drag-drop';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EXPERIMENTS } from '@app/data/mocks/mock-experiments';
import { HashWithTask } from '@app/data/models/experiment';
import { SharedModule } from '@app/shared/shared.module';
import { of } from 'rxjs';
import { NgxEchartsCoreModule } from 'ngx-echarts/core';
import { LearnTasksByConfigStrategyComponent } from './learn-tasks-by-config-strategy.component';
import { LearnTasksByStrategyTableComponent } from './learn-tasks-by-strategy-table/learn-tasks-by-strategy-table.component';
import { StrategyBoxplotComponent } from './strategy-boxplot/strategy-boxplot.component';
import { LearnResultHeatmapButtonComponent } from '../../components/learn-result-heatmap-button/learn-result-heatmap-button.component';
import { LearnResultValueCellComponent } from '../../components/learn-result-value-cell/learn-result-value-cell.component';
import { LearnResultFocusButtonComponent } from '../../components/learn-result-focus-button/learn-result-focus-button.component';
import { LearnResultColumnPickerComponent } from '../../components/learn-result-column-picker/learn-result-column-picker.component';

describe('LearnTasksByConfigStrategyComponent', () => {
  let component: LearnTasksByConfigStrategyComponent;
  let fixture: ComponentFixture<LearnTasksByConfigStrategyComponent>;
  const learnTasksByAlgorithm: HashWithTask[] = EXPERIMENTS.flatMap(experiment =>
    Object.entries(experiment.tasks).filter(([_hash, task]) => task.learn_config.strategy_id === 'lc_strategy_id')
  );

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule, RouterTestingModule, DragDropModule, NgxEchartsCoreModule],
      declarations: [
        LearnTasksByConfigStrategyComponent,
        LearnTasksByStrategyTableComponent,
        LearnResultHeatmapButtonComponent,
        LearnResultValueCellComponent,
        LearnResultFocusButtonComponent,
        LearnResultColumnPickerComponent,
        StrategyBoxplotComponent,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                learnTasksByConfigStrategy: {
                  resolved: { data: learnTasksByAlgorithm },
                  observable: of({ data: learnTasksByAlgorithm }),
                },
                config: 'assemble_config',
              },
              paramMap: convertToParamMap({ experimentIds: '1,2,3' }),
            },
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearnTasksByConfigStrategyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
