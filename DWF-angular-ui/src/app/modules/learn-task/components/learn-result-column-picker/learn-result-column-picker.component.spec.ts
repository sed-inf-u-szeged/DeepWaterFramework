import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearnResultColumnPickerComponent } from './learn-result-column-picker.component';
import { SharedModule } from '@app/shared/shared.module';
import { DragDropModule } from '@angular/cdk/drag-drop';

describe('LearnResultColumnPickerComponent', () => {
  let component: LearnResultColumnPickerComponent;
  let fixture: ComponentFixture<LearnResultColumnPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, DragDropModule],
      declarations: [LearnResultColumnPickerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearnResultColumnPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
