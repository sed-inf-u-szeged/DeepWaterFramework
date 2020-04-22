import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ThemeService } from '@app/core/services/theme.service';

/** Column represetation inside column picker. */
interface ColumnPickerItem<T> {
  /** The column. */
  readonly column: T;
  /** Whether it is selected. */
  selected: boolean;
}

/** Options for the column picker. */
export interface ColumnPickerOptions<T> {
  /** Array of columns. */
  readonly columns: T[];
  /** An array of columns to toggle by default. */
  readonly defaultToggled: T[];
  /** Whether all columns selected by default. */
  readonly defaultAllSelected: boolean;
}

/** Component for selecting and ordering columns and getting them back as output on change. */
@Component({
  selector: 'app-learn-result-column-picker',
  templateUrl: './learn-result-column-picker.component.html',
  styleUrls: ['./learn-result-column-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearnResultColumnPickerComponent<T = any> {
  /** Array of the displayed column picker items. */
  columnPickerItems: ColumnPickerItem<T>[];

  /** The column picker options to use. */
  @Input() set columnOptions({ columns, defaultToggled, defaultAllSelected }: ColumnPickerOptions<T>) {
    this.columnPickerItems = columns.map(column => ({
      column,
      selected: defaultToggled.includes(column) ? !defaultAllSelected : defaultAllSelected,
    }));
  }

  /** Emits the selected columns in the current order. */
  @Output() readonly columns = new EventEmitter<ColumnPickerOptions<T>['columns']>();

  /**
   * Constructs a new `LearnResultColumnPickerComponent`.
   * @param themeService Theme service for observing the current app theme.
   */
  constructor(public readonly themeService: ThemeService) {}

  /**
   * Handles column drag and drop on UI.
   * @param event Drag and Drop event.
   */
  columnDropped(event: CdkDragDrop<{ index: number }>): void {
    if (event.item.data.index === event.currentIndex) return;
    moveItemInArray(this.columnPickerItems, event.item.data.index, event.currentIndex);
    this.emitChange();
  }

  /**
   * Handles column toggle on UI.
   * @param item item
   */
  columnToggled(item: ColumnPickerItem<T>): void {
    item.selected = !item.selected;
    this.emitChange();
  }

  /** Emits the selected columns in the current order on {@link LearnResultColumnPickerComponent#columns}. */
  emitChange(): void {
    this.columns.emit(
      this.columnPickerItems.reduce((acc, item) => {
        if (item.selected) acc.push(item.column);
        return acc;
      }, [] as ColumnPickerItem<T>['column'][])
    );
  }
}
