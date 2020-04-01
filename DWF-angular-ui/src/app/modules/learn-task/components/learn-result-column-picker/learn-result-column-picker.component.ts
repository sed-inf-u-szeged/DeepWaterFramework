import { Component, ChangeDetectionStrategy, EventEmitter, Output, Input } from '@angular/core';
import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import { ThemeService } from '@app/core/services/theme/theme.service';

interface ColumnPickerItem<T> {
  readonly column: T;
  selected: boolean;
}

export interface ColumnPickerOptions<T> {
  readonly columns: T[];
  readonly defaultToggled: T[];
  readonly defaultAllSelected: boolean;
}

@Component({
  selector: 'app-learn-result-column-picker',
  templateUrl: './learn-result-column-picker.component.html',
  styleUrls: ['./learn-result-column-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearnResultColumnPickerComponent<T = any> {
  columnPickerItems: ColumnPickerItem<T>[];

  @Input() set columnOptions({ columns, defaultToggled, defaultAllSelected }: ColumnPickerOptions<T>) {
    this.columnPickerItems = columns.map(column => ({
      column,
      selected: defaultToggled.includes(column) ? !defaultAllSelected : defaultAllSelected,
    }));
  }

  @Output() readonly columns = new EventEmitter<ColumnPickerOptions<T>['columns']>();

  constructor(public readonly themeService: ThemeService) {}

  columnDropped(event: CdkDragDrop<{ index: number }>): void {
    if (event.item.data.index === event.currentIndex) return;
    moveItemInArray(this.columnPickerItems, event.item.data.index, event.currentIndex);
    this.emitChange();
  }

  columnToggled(item: ColumnPickerItem<T>): void {
    item.selected = !item.selected;
    this.emitChange();
  }

  emitChange(): void {
    this.columns.emit(
      this.columnPickerItems.reduce((acc, item) => {
        if (item.selected) acc.push(item.column);
        return acc;
      }, [] as ColumnPickerItem<T>['column'][])
    );
  }
}
