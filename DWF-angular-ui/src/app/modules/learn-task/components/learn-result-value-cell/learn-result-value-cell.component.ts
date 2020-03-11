import { Component, Input, HostBinding, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { ValueCell } from '@app/shared/models/value-cell';
import { HeatmapRange } from './heatmap-range';

@Component({
  selector: 'td[app-learn-result-value-cell]',
  templateUrl: './learn-result-value-cell.component.html',
  styleUrls: ['./learn-result-value-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearnResultValueCellComponent implements OnChanges {
  isUnfocused = false;
  comparison: { shouldDisplay: boolean; isBetter?: boolean; difference?: string } = { shouldDisplay: false };

  @Input() display: ValueCell;
  @Input() compareTo?: ValueCell;
  @Input() unfocusThreshold?: number;
  @Input() set heatmapRange(heatmapRange: HeatmapRange | undefined) {
    if (heatmapRange != null) {
      const { worst, best } = heatmapRange;
      const alpha = worst == null || best == null ? 0 : (this.display.value - worst) / (best - worst);
      this.heatColor = `rgba(47, 94, 196, ${alpha})`;
    } else {
      this.heatColor = undefined;
    }
  }

  @HostBinding('class.borderless')
  @HostBinding('style.background-color')
  heatColor?: string;

  @HostBinding('class') get transparentClass(): string | undefined {
    return this.isUnfocused ? (!!this.heatColor ? 'transparent' : 'transparent-inner') : undefined;
  }

  shouldDisplayComparison(): boolean {
    return (
      this.compareTo != null &&
      this.display !== this.compareTo &&
      isFinite(this.compareTo.value) &&
      isFinite(this.display.value)
    );
  }

  updateComparison(): void {
    if (this.shouldDisplayComparison()) {
      const difference = this.display.value - this.compareTo!.value;
      this.comparison = {
        shouldDisplay: true,
        isBetter: (!this.display.lowerBetter && difference >= 0) || (this.display.lowerBetter && difference < 0),
        difference: `${difference < 0 ? '−' : '+'} ${Math.abs(difference).toFixed(
          (this.compareTo!.value % 1 || difference % 1) && 3
        )}`,
      };
    } else {
      this.comparison = { shouldDisplay: false };
    }
  }

  updateIsUnfocused(): void {
    if (this.unfocusThreshold == null) {
      this.isUnfocused = false;
    } else if (this.display.value == null) {
      this.isUnfocused = true;
    } else {
      this.isUnfocused = this.display.lowerBetter
        ? this.unfocusThreshold < this.display.value
        : this.unfocusThreshold > this.display.value;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.display || changes.compareTo) this.updateComparison();
    if (changes.display || changes.unfocusThreshold) this.updateIsUnfocused();
  }
}
