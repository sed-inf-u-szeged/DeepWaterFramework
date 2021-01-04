import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '@app/shared/shared.module';
import { FilterInputComponent } from './filter-input.component';

describe('FilterInputComponent', () => {
  let component: FilterInputComponent;
  let fixture: ComponentFixture<FilterInputComponent>;
  let loader: HarnessLoader;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule],
      declarations: [FilterInputComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterInputComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should lowercase and trim', fakeAsync(async () => {
    let output: string | undefined;
    const sub = component.filter.subscribe((filter: string) => (output = filter));
    (await loader.getHarness(MatInputHarness)).setValue('  qWe    RTz      ');
    expect(output).toBeUndefined();
    tick(300);
    expect(output).toBe('qwe    rtz');
    sub.unsubscribe();
  }));

  it('should debounce by 300ms', fakeAsync(async () => {
    let output: string | undefined;
    const sub = component.filter.subscribe((filter: string) => (output = filter));
    (await loader.getHarness(MatInputHarness)).setValue('a');
    expect(output).toBeUndefined();
    tick(299);
    expect(output).toBeUndefined();
    tick(1);
    expect(output).toBe('a');
    sub.unsubscribe();
  }));
});
