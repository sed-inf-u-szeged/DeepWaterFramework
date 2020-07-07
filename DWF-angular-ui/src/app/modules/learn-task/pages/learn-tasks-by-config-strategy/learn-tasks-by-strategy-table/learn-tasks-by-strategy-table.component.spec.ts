import { DragDropModule } from '@angular/cdk/drag-drop';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@app/shared/shared.module';
import { LearnTasksByStrategyTableComponent } from './learn-tasks-by-strategy-table.component';
import { LearnResultColumnPickerComponent } from '../../../components/learn-result-column-picker/learn-result-column-picker.component';
import { LearnResultFocusButtonComponent } from '../../../components/learn-result-focus-button/learn-result-focus-button.component';
import { LearnResultHeatmapButtonComponent } from '../../../components/learn-result-heatmap-button/learn-result-heatmap-button.component';
import { LearnResultValueCellComponent } from '../../../components/learn-result-value-cell/learn-result-value-cell.component';
import { MatTableShellComponent } from '../../../components/mat-table-shell/mat-table-shell.component';
import { LearnResultTableService } from '../../../services/learn-result-table.service';

describe('LearnTasksByAlgorithmTableComponent', () => {
  let component: LearnTasksByStrategyTableComponent;
  let fixture: ComponentFixture<LearnTasksByStrategyTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DragDropModule, NoopAnimationsModule, RouterTestingModule, SharedModule],
      declarations: [
        LearnTasksByStrategyTableComponent,
        LearnResultColumnPickerComponent,
        LearnResultFocusButtonComponent,
        LearnResultHeatmapButtonComponent,
        LearnResultValueCellComponent,
        MatTableShellComponent,
      ],
      providers: [LearnResultTableService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearnTasksByStrategyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
