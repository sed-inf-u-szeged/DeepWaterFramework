import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-learn-result-heatmap-button',
  templateUrl: './learn-result-heatmap-button.component.html',
  styleUrls: ['./learn-result-heatmap-button.component.scss'],
})
export class LearnResultHeatmapButtonComponent {
  @Output() enabled = new EventEmitter<boolean>();
}
