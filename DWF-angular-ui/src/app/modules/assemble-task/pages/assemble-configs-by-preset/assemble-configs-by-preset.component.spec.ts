import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { EXPERIMENTS } from '@app/data/mocks/mock-experiments';
import { OnlyAssembleConfig } from '@app/data/models/experiment';
import { SharedModule } from '@app/shared/shared.module';
import { of } from 'rxjs';
import { pickBy } from 'lodash-es';
import { AssembleConfigsByPresetComponent } from './assemble-configs-by-preset.component';

describe('AssembleConfigsByPresetComponent', () => {
  let component: AssembleConfigsByPresetComponent;
  let fixture: ComponentFixture<AssembleConfigsByPresetComponent>;

  const assembleConfigsByPreset: OnlyAssembleConfig[] = EXPERIMENTS.map(exp => ({
    tasks: pickBy(exp.tasks, task => task.assemble_config.strategy_id === 'ac_strategy_id'),
  }));

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule],
      declarations: [AssembleConfigsByPresetComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                assembleConfigsByPreset: {
                  resolved: { data: assembleConfigsByPreset },
                  observable: of({ data: assembleConfigsByPreset }),
                },
              },
            },
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssembleConfigsByPresetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
