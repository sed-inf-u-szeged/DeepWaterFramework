import { Component, Output, EventEmitter, Input } from '@angular/core';
import { range } from 'lodash-es';
import { FocusState } from './focus-state';

/** Creates a button with a popup that has a toggle and a select and emit the current toggle and select state. */
@Component({
  selector: 'app-learn-result-focus-button',
  templateUrl: './learn-result-focus-button.component.html',
  styleUrls: ['./learn-result-focus-button.component.scss'],
})
export class LearnResultFocusButtonComponent {
  /** Whether the focus toggle in on. */
  focusEnabled = false;
  /** The index of the selected option of the select. */
  focusedValueIndex?: number;
  /** Number options for the select. */
  numberOptions: number[] = [];

  /** Sets up the component based on the focused data's size. */
  @Input() set dataSize(dataSize: number) {
    if (dataSize === 0) {
      this.focusChange.emit({ checked: false });
      this.focusEnabled = false;
      this.focusedValueIndex = undefined;
    } else if (this.focusedValueIndex == null) {
      this.focusedValueIndex = 0;
    } else if (dataSize < this.focusedValueIndex) {
      this.focusChange.emit({ checked: this.focusEnabled, index: dataSize - 1 });
      this.focusedValueIndex = dataSize - 1;
    }
    this.numberOptions = range(Math.min(dataSize, 5));
  }

  /** Whether the focus enabled and the focused select option index. */
  @Output() focusChange = new EventEmitter<FocusState>();

  /** Badge number to display on the button. */
  get badgeNumber(): string {
    return this.focusEnabled && this.focusedValueIndex != null ? (this.focusedValueIndex + 1).toString() : '';
  }

  /**
   * Emits a FocusState output.
   * @param checked Whether the focus toggle is checked.
   * @param index Index of the selected option of the select.
   */
  onChange(checked: boolean, index?: number): void {
    this.focusChange.emit({ checked, index });
  }
}
