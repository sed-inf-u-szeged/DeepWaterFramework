import { Component, Output, EventEmitter } from '@angular/core';

/** Creates a toggle and outputs whether its enabled or not. */
@Component({
  selector: 'app-learn-result-heatmap-button',
  templateUrl: './learn-result-heatmap-button.component.html',
  styleUrls: ['./learn-result-heatmap-button.component.scss'],
})
export class LearnResultHeatmapButtonComponent {
  /** Whether the toggle is checked. */
  @Output() enabled = new EventEmitter<boolean>();
}
