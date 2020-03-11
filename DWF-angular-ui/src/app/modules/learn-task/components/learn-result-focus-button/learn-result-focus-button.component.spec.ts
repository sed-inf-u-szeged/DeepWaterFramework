import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '@app/shared/shared.module';
import { MatButton } from '@angular/material/button';
import { FocusState } from './focus-state';
import { LearnResultFocusButtonComponent } from './learn-result-focus-button.component';

describe('LearnResultFocusButtonComponent', () => {
  let component: LearnResultFocusButtonComponent;
  let fixture: ComponentFixture<LearnResultFocusButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule],
      declarations: [LearnResultFocusButtonComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearnResultFocusButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit FocusState', () => {
    const expcetedFocusChange: FocusState = { checked: true, index: 2 };
    component.focusChange.subscribe((change: FocusState) => expect(change).toEqual(expcetedFocusChange));
    component.onChange(expcetedFocusChange.checked, expcetedFocusChange.index);
  });

  it('should emit FocusState when toggle clicked', () => {
    let focusChange: FocusState | undefined;
    component.focusChange.subscribe((change: FocusState) => (focusChange = change));
    fixture.debugElement.query(By.directive(MatButton)).triggerEventHandler('click', null);

    component.dataSize = 1;
    fixture.detectChanges();
    fixture.debugElement.query(By.css('mat-slide-toggle input')).nativeElement.click();
    expect(focusChange).toEqual({ checked: true, index: 0 });

    component.dataSize = 3;
    fixture.detectChanges();
    fixture.debugElement.query(By.css('mat-slide-toggle input')).nativeElement.click();
    expect(focusChange).toEqual({ checked: false, index: 0 });

    component.dataSize = 0;
    fixture.detectChanges();
    expect(Object.keys(fixture.debugElement.query(By.css('mat-slide-toggle input')).attributes)).toContain('disabled');
    expect(focusChange).toEqual({ checked: false });
  });

  it('should generate number options correctly', () => {
    component.dataSize = 4;
    expect(component.numberOptions).toEqual([0, 1, 2, 3]);
    component.dataSize = 0;
    expect(component.numberOptions).toEqual([]);
    component.dataSize = 10;
    expect(component.numberOptions).toEqual([0, 1, 2, 3, 4]);
  });
});
