import { Component, Output, EventEmitter, Input } from '@angular/core';
import { range } from 'lodash-es';
import { FocusState } from './focus-state';

@Component({
  selector: 'app-learn-result-focus-button',
  templateUrl: './learn-result-focus-button.component.html',
  styleUrls: ['./learn-result-focus-button.component.scss'],
})
export class LearnResultFocusButtonComponent {
  focusEnabled = false;
  focusedValueIndex?: number;
  numberOptions: number[] = [];

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

  @Output() focusChange = new EventEmitter<FocusState>();

  get badgeNumber(): string {
    return this.focusEnabled && this.focusedValueIndex != null ? (this.focusedValueIndex + 1).toString() : '';
  }

  onChange(checked: boolean, index?: number) {
    this.focusChange.emit({ checked, index });
  }
}
