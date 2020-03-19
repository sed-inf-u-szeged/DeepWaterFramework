import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FilterInputComponent } from './filter-input.component';
import { By } from '@angular/platform-browser';
import { SharedModule } from '@app/shared/shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('FilterInputComponent', () => {
  let component: FilterInputComponent;
  let fixture: ComponentFixture<FilterInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule],
      declarations: [FilterInputComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should lowercase and trim', fakeAsync(() => {
    let output: string | undefined;
    const sub = component.filter.subscribe((filter: string) => (output = filter));
    const inputElement: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    inputElement.value = '  qWe    RTz      ';
    inputElement.dispatchEvent(new Event('keyup'));

    expect(output).toBeUndefined();
    tick(300);
    expect(output).toBe('qwe    rtz');
    sub.unsubscribe();
  }));

  it('should debounce by 300ms', fakeAsync(() => {
    let output: string | undefined;
    const sub = component.filter.subscribe((filter: string) => (output = filter));
    const inputElement: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    inputElement.value = 'a';
    inputElement.dispatchEvent(new Event('keyup'));

    expect(output).toBeUndefined();
    tick(299);
    expect(output).toBeUndefined();
    tick(1);
    expect(output).toBe('a');
    sub.unsubscribe();
  }));
});
