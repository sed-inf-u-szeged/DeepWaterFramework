import { Component, DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SharedModule } from '@app/shared/shared.module';
import { HeatmapRange } from './heatmap-range';
import { LearnResultValueCellComponent } from './learn-result-value-cell.component';
import { ValueCell } from '../../models/value-cell';

@Component({
  template: `
    <td
      app-learn-result-value-cell
      [display]="display"
      [compareTo]="compareTo"
      [heatmapRange]="heatmapRange"
      [unfocusThreshold]="unfocusThreshold"
    ></td>
  `,
})
class TestHostComponent {
  display: ValueCell;
  compareTo: ValueCell;
  heatmapRange?: HeatmapRange;
  unfocusThreshold?: number;
}

describe('LearnResultValueCellComponent', () => {
  let testHost: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let componentDE: DebugElement;
  let component: LearnResultValueCellComponent;

  const TASK = new ValueCell(0.1, 0.1);
  const TASK_LOWER_BETTER = new ValueCell(0.1, 0.1, true);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LearnResultValueCellComponent, TestHostComponent],
      imports: [SharedModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    componentDE = fixture.debugElement.query(By.directive(LearnResultValueCellComponent));
    component = componentDE.componentInstance;
    testHost.display = TASK;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not have transparent class when unfocus threshold is undefined', () => {
    expect(component.transparentClass).toBeUndefined();
    expect(componentDE.nativeElement.classList).not.toContain('transparent');
  });

  it('should not have transparent-inner class when unfocus threshold is undefined', () => {
    expect(component.transparentClass).toBeUndefined();
    expect(componentDE.nativeElement.classList).not.toContain('transparent-inner');
  });

  it('should not have "transparent" class when task.value < unfocus threshold and lowerBetter is not given', () => {
    testHost.display = TASK;
    testHost.unfocusThreshold = TASK.value! + 0.1;
    fixture.detectChanges();
    expect(component.transparentClass).not.toBe('transparent');
    expect(componentDE.nativeElement.classList).not.toContain('transparent');
  });

  it('should not have any transparent class when task.value < unfocus threshold and lowerBetter = true', () => {
    testHost.display = TASK_LOWER_BETTER;
    testHost.unfocusThreshold = TASK.value! + 0.1;
    fixture.detectChanges();
    expect(component.transparentClass).toBeUndefined();
    expect(componentDE.nativeElement.classList).not.toContain('transparent');
  });

  it('should have "transparent-inner" class when display.value < unfocus threshold and lowerBetter is not given', () => {
    testHost.display = TASK;
    testHost.unfocusThreshold = TASK.value! + 0.1;
    fixture.detectChanges();
    expect(component.transparentClass).toBe('transparent-inner');
    expect(componentDE.nativeElement.classList).toContain('transparent-inner');
  });

  it('should have transparent-inner class when display.value is undefined and unfocus threshold is not undefined', () => {
    testHost.display = new ValueCell(undefined, undefined);
    testHost.unfocusThreshold = TASK.value! + 0.1;
    fixture.detectChanges();
    expect(component.transparentClass).toBe('transparent-inner');
    expect(componentDE.nativeElement.classList).toContain('transparent-inner');
  });

  it('should compare decimals correctly when difference is negative', () => {
    testHost.display = new ValueCell(0.1, 0.1, true);
    testHost.compareTo = new ValueCell(0.1005, 0.1, true);
    fixture.detectChanges();
    const diffSpan = componentDE.query(By.css('.label'));
    expect(diffSpan.nativeElement.innerText).toBe('− 0.001');
    expect(diffSpan.nativeElement.classList).toContain('label--better');
  });

  it('should compare decimals correctly when difference is zero/positive', () => {
    testHost.display = new ValueCell(0.1, 0.1);
    testHost.compareTo = new ValueCell(0.1, 0.1);
    fixture.detectChanges();
    const diffSpan = componentDE.query(By.css('.label'));
    expect(diffSpan.nativeElement.innerText).toBe('+ 0.000');
    expect(diffSpan.nativeElement.classList).toContain('label--better');
  });

  it('should compare integers correctly', () => {
    testHost.display = new ValueCell(10, 10);
    testHost.compareTo = new ValueCell(10, 10);
    fixture.detectChanges();
    const diffSpan = componentDE.query(By.css('.label'));
    expect(diffSpan.nativeElement.innerText).toBe('+ 0');
    expect(diffSpan.nativeElement.classList).toContain('label--better');
  });

  it('should compare to undefined correctly', () => {
    testHost.display = new ValueCell(10, 10);
    testHost.compareTo = new ValueCell(undefined, undefined);
    fixture.detectChanges();
    const diffSpan = componentDE.query(By.css('.label'));
    expect(diffSpan.nativeElement.innerText).toBe(`${ValueCell.PLUS_MINUS_SIGN} ${ValueCell.NOT_AVAILABLE}`);
    expect(diffSpan.nativeElement.classList).toContain('label--na');
  });

  it('should have 0 opacity heatmap color with undefined value', () => {
    testHost.display = new ValueCell(undefined, undefined);
    testHost.heatmapRange = { worst: 0, best: 1 };
    fixture.detectChanges();
    expect(componentDE.nativeElement.style['background-color']).toBe('rgba(var(--heat-color-rgb), 0)');
    expect(componentDE.nativeElement.classList).toContain('borderless');
  });

  it('should show and generate heatmap color corretly when heatMapRange is not undefined', () => {
    testHost.display = TASK;
    testHost.heatmapRange = { worst: 0, best: 1 };
    fixture.detectChanges();
    expect(componentDE.nativeElement.style['background-color']).toBe('rgba(var(--heat-color-rgb), 0.1)');
    expect(componentDE.nativeElement.classList).toContain('borderless');
    testHost.heatmapRange = { worst: 0, best: TASK.value };
    fixture.detectChanges();
    expect(componentDE.nativeElement.style['background-color']).toBe('rgba(var(--heat-color-rgb), 1)');
    expect(componentDE.nativeElement.classList).toContain('borderless');
  });

  it('should use the transparent class instead of transparent-inner when it should be transparent and heatmap enabled', () => {
    testHost.display = TASK;
    testHost.unfocusThreshold = TASK.value! + 0.1;
    fixture.detectChanges();
    expect(component.transparentClass).toBe('transparent-inner');
    expect(componentDE.nativeElement.classList).toContain('transparent-inner');
    testHost.heatmapRange = { worst: 0, best: TASK.value! + 0.1 };
    fixture.detectChanges();
    expect(component.transparentClass).toBe('transparent');
    expect(componentDE.nativeElement.classList).toContain('transparent');
  });
});
