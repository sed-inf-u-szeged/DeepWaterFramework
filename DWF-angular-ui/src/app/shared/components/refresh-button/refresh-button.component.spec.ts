import { OverlayContainer } from '@angular/cdk/overlay';
import { async, ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ResolvedData } from '@app/data/models/resolved-data';
import { ResolvedAndObservable } from '@app/data/models/resolved-and-observable';
import { SharedModule } from '@app/shared/shared.module';
import { defer, of } from 'rxjs';
import { RefreshButtonComponent } from './refresh-button.component';

describe('RefreshButtonComponent', () => {
  let component: RefreshButtonComponent;
  let fixture: ComponentFixture<RefreshButtonComponent>;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;
  const data: ResolvedAndObservable<number> = { resolved: { data: 1 }, observable: defer(() => of({ data: 2 })) };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RefreshButtonComponent],
      imports: [SharedModule, NoopAnimationsModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefreshButtonComponent);
    component = fixture.componentInstance;
    component.resolvedAndObservable = data;
    fixture.detectChanges();
  });

  beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
    overlayContainer = oc;
    overlayContainerElement = oc.getContainerElement();
  }));

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should notify about change', fakeAsync(() => {
    component.ngOnInit();
    tick(component.REFRESH_INTERVAL);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('button[mat-mini-fab]'))).toBeTruthy();
    expect(overlayContainerElement.querySelector('snack-bar-container')).toBeTruthy();
    tick(3000);
    expect(overlayContainerElement.querySelector('snack-bar-container')).toBeFalsy(
      'snackbar should dismiss after 3sec'
    );
    expect(fixture.debugElement.query(By.css('button[mat-mini-fab]'))).toBeTruthy('fab button should stay');
    component.ngOnDestroy();
    tick(component.REFRESH_INTERVAL);
  }));

  it('should emit new data when snackbar action clicked', fakeAsync(() => {
    let emittedNewData: ResolvedData<number> | undefined;
    component.ngOnInit();
    component.newData.subscribe((newData: ResolvedData<number>) => (emittedNewData = newData));
    tick(component.REFRESH_INTERVAL);
    fixture.detectChanges();
    (overlayContainerElement.querySelector('snack-bar-container button[mat-button]') as HTMLButtonElement).click();
    expect(emittedNewData).not.toBeNull();
    component.ngOnDestroy();
    tick(component.REFRESH_INTERVAL);
  }));

  it('should emit new data when fab button clicked', fakeAsync(() => {
    let emittedNewData: ResolvedData<number> | undefined;
    component.ngOnInit();
    component.newData.subscribe((newData: ResolvedData<number>) => (emittedNewData = newData));
    tick(component.REFRESH_INTERVAL);
    fixture.detectChanges();
    (fixture.debugElement.query(By.css('button[mat-mini-fab]')).nativeElement as HTMLButtonElement).click();
    expect(emittedNewData).not.toBeNull();
    component.ngOnDestroy();
    tick(component.REFRESH_INTERVAL);
  }));
});
