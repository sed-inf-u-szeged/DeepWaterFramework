import { Component, Input, HostBinding, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { ValueCell } from '@app/shared/models/value-cell';
import { HeatmapRange } from './heatmap-range';

/** Table cell for `ValueCell`s with heatmap, unfocus, compare features. */
@Component({
  selector: 'td[app-learn-result-value-cell]',
  templateUrl: './learn-result-value-cell.component.html',
  styleUrls: ['./learn-result-value-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearnResultValueCellComponent implements OnChanges {
  /** Whether the cell is unfocused. */
  isUnfocused = false;
  /** Comparison state. */
  comparison: { shouldDisplay: boolean; isBetter?: boolean; difference?: string } = { shouldDisplay: false };

  /** The `ValueCell` to display. */
  @Input() display: ValueCell;
  /** The `ValueCell to compare to. */
  @Input() compareTo?: ValueCell;
  /** A threshold to unfocus this cell if the displayed `ValueCell`'s value is worse. */
  @Input() unfocusThreshold?: number;
  /** The worst and best values of the column to calculate the correct heatmap color for this cell. */
  @Input() set heatmapRange(heatmapRange: HeatmapRange | undefined) {
    if (heatmapRange != null) {
      const { worst, best } = heatmapRange;
      const alpha =
        worst == null || best == null || !isFinite(this.display.value)
          ? 0
          : (this.display.value - worst) / (best - worst);
      this.heatColor = `rgba(47, 94, 196, ${alpha})`;
    } else {
      this.heatColor = undefined;
    }
  }

  /** Heatmap background color of the cell. */
  @HostBinding('class.borderless')
  @HostBinding('style.background-color')
  heatColor?: string;

  /** Gets the correct transparent class when the cell is unfocused. */
  @HostBinding('class') get transparentClass(): string | undefined {
    return this.isUnfocused ? (!!this.heatColor ? 'transparent' : 'transparent-inner') : undefined;
  }

  /** Whether the cell should display comparision. */
  shouldDisplayComparison(): boolean {
    return (
      this.compareTo != null &&
      this.display !== this.compareTo &&
      isFinite(this.compareTo.value) &&
      isFinite(this.display.value)
    );
  }

  /** Updates the comparison whether it should be displayed and calculates the properties for it. */
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

  /** Updates whether the cell should be unfocused or not. */
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

  /** Calls update on the features when their dependent input is changed.  */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.display || changes.compareTo) this.updateComparison();
    if (changes.display || changes.unfocusThreshold) this.updateIsUnfocused();
  }
}
