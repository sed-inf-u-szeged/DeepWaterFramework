import { ChangeDetectionStrategy, Component, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HeatmapRange } from './heatmap-range';
import { ValueCell } from '../../models/value-cell';

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
  comparison: { shouldDisplay: boolean; isBetter?: boolean; difference?: string } = {
    shouldDisplay: false,
  };

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
        worst == null || best == null || this.display.value == null ? 0 : (this.display.value - worst) / (best - worst);
      this.heatColor = `rgba(var(--heat-color-rgb), ${alpha})`;
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

  /** Updates the comparison whether it should be displayed and calculates the properties for it. */
  updateComparison(): void {
    if (this.compareTo == null || this.display === this.compareTo) {
      this.comparison = { shouldDisplay: false };
    } else if (this.compareTo.value == null || this.display.value == null) {
      this.comparison = {
        shouldDisplay: true,
        difference: `${ValueCell.PLUS_MINUS_SIGN} ${ValueCell.NOT_AVAILABLE}`,
      };
    } else {
      const difference = this.display.value - this.compareTo.value;
      this.comparison = {
        shouldDisplay: true,
        isBetter: (!this.display.lowerBetter && difference >= 0) || (this.display.lowerBetter && difference < 0),
        difference: `${difference < 0 ? '−' : '+'} ${Math.abs(difference).toFixed(
          (this.compareTo.value % 1 || difference % 1) && 3
        )}`,
      };
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
