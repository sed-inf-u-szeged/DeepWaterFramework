import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButton } from '@angular/material/button';
import { MatSlideToggleHarness } from '@angular/material/slide-toggle/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '@app/shared/shared.module';
import { FocusState } from './focus-state';
import { LearnResultFocusButtonComponent } from './learn-result-focus-button.component';

describe('LearnResultFocusButtonComponent', () => {
  let component: LearnResultFocusButtonComponent;
  let fixture: ComponentFixture<LearnResultFocusButtonComponent>;
  let rootLoader: HarnessLoader;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule],
      declarations: [LearnResultFocusButtonComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearnResultFocusButtonComponent);
    component = fixture.componentInstance;
    rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
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

  it('should emit FocusState when toggle clicked', async () => {
    let focusChange: FocusState | undefined;
    component.focusChange.subscribe((change: FocusState) => (focusChange = change));
    // await (await loader.getHarness(MatMenuHarness)).open(); // doesn't opens the menu for some reason.
    fixture.debugElement.query(By.directive(MatButton)).triggerEventHandler('click', null);
    const slideToggle = await rootLoader.getHarness(MatSlideToggleHarness);

    component.dataSize = 1;
    fixture.detectChanges();
    await slideToggle.toggle();
    expect(focusChange).toEqual({ checked: true, index: 0 });

    component.dataSize = 3;
    fixture.detectChanges();
    await slideToggle.toggle();
    expect(focusChange).toEqual({ checked: false, index: 0 });

    component.dataSize = 0;
    fixture.detectChanges();
    expect(await slideToggle.isDisabled()).toBeTrue();
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
