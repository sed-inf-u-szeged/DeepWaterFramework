import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@app/shared/shared.module';
import { LearnResultHeatmapButtonComponent } from './learn-result-heatmap-button.component';

describe('LearnResultHeatmapButtonComponent', () => {
  let component: LearnResultHeatmapButtonComponent;
  let fixture: ComponentFixture<LearnResultHeatmapButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [LearnResultHeatmapButtonComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearnResultHeatmapButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
