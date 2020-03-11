import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PageEvent } from '@angular/material/paginator';
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
      created_ts: exp.created_ts,
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
            snapshot: {
              data: {
                experimentList: { resolved: dataResolved, observable: of(dataResolved) },
              },
            },
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should page', () => {
    component.paging({ pageIndex: 0, pageSize: 1 } as PageEvent);
    expect(component.experimentsPage.length).toEqual(1);
    expect(component.experimentsPage).toEqual(component.experiments.slice(0, 1));
    component.paging({ pageIndex: 1, pageSize: 1 } as PageEvent);
    expect(component.experimentsPage.length).toEqual(1);
    expect(component.experimentsPage).toEqual(component.experiments.slice(1, 2));
  });
});
