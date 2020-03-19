import {
  async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  flushMicrotasks,
  discardPeriodicTasks,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@app/shared/shared.module';
import { EXPERIMENTS } from '@app/data/mocks/mock-experiments';
import { DataResolved } from '@app/data/models/data-resolved';
import { MarkdownModule } from 'ngx-markdown';
import { of } from 'rxjs';
import { ExperimentListComponent } from './experiment-list.component';
import { ExperimentListItem } from './experiment-list-item';

describe('ExperimentListComponent', () => {
  let component: ExperimentListComponent;
  let fixture: ComponentFixture<ExperimentListComponent>;
  const dataResolved: DataResolved<ExperimentListItem[]> = {
    data: EXPERIMENTS.map((exp, i) => ({
      indexHash: `index${i}`,
      name: exp.name,
      numberOfTasks: Object.keys(exp.tasks).length,
      created: new Date(exp.created_ts),
      markdown: exp.markdown,
    })),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, MarkdownModule.forRoot(), RouterTestingModule, NoopAnimationsModule],
      declarations: [ExperimentListComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: { experimentList: { resolved: dataResolved, observable: of(dataResolved) } } },
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create render$', fakeAsync(() => {
    fixture.detectChanges();
    flushMicrotasks();
    fixture.detectChanges();
    expect(component.render$).toBeTruthy();
    discardPeriodicTasks();
  }));
});
