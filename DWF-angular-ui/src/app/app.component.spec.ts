import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressBar } from '@angular/material/progress-bar';
import { By } from '@angular/platform-browser';
import {
  NavigationEnd,
  NavigationStart,
  ResolveStart,
  Router,
  RouterEvent,
  RouterStateSnapshot,
} from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { SharedModule } from '@app/shared/shared.module';
import { ReplaySubject } from 'rxjs';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  const routerEvent$ = new ReplaySubject<RouterEvent>(1);
  const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    events: routerEvent$.asObservable(),
    url: 'mock/url',
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, CoreModule],
      declarations: [AppComponent],
      providers: [{ provide: Router, useValue: mockRouter }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should load and show progress-bar correctly when router navigates`, () => {
    routerEvent$.next(new NavigationStart(1, 'url'));
    expect(component.isLoading).toBeTruthy();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(MatProgressBar))).not.toBeNull();

    const mockRouterStateSnapshot = jasmine.createSpyObj<RouterStateSnapshot>('RouterStateSnapshot', ['toString']);
    routerEvent$.next(new ResolveStart(1, 'url', 'urlAfterRedirects', mockRouterStateSnapshot));
    expect(component.isLoading).toBeTruthy();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(MatProgressBar))).not.toBeNull();

    routerEvent$.next(new NavigationEnd(1, 'url', 'urlAfterRedirects'));
    expect(component.isLoading).toBeFalsy();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(MatProgressBar))).toBeNull();
  });
});
