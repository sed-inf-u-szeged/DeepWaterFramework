import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SharedModule } from '@app/shared/shared.module';
import { NgxEchartsCoreModule } from 'ngx-echarts/core';
import { LearnTaskRoutingModule } from './learn-task-routing.module';
import { LearnResultValueCellComponent } from './components/learn-result-value-cell/learn-result-value-cell.component';
import { LearnResultFocusButtonComponent } from './components/learn-result-focus-button/learn-result-focus-button.component';
import { LearnResultHeatmapButtonComponent } from './components/learn-result-heatmap-button/learn-result-heatmap-button.component';
import { LearnResultColumnPickerComponent } from './components/learn-result-column-picker/learn-result-column-picker.component';
import { LearnResultChartComponent } from './components/learn-result-chart/learn-result-chart.component';
import { BestResultsChartComponent } from './pages/learn-tasks/best-results-chart/best-results-chart.component';
import { LearnTasksComponent } from './pages/learn-tasks/learn-tasks.component';
import { LearnTasksByAlgorithmComponent } from './pages/learn-tasks-by-algorithm/learn-tasks-by-algorithm.component';
import { LearnTasksCompareComponent } from './pages/learn-tasks-compare/learn-tasks-compare.component';
import { LearnTaskTableComponent } from './pages/learn-tasks/learn-task-table/learn-task-table.component';

@NgModule({
  imports: [SharedModule, LearnTaskRoutingModule, NgxEchartsCoreModule, DragDropModule],
  declarations: [
    LearnTasksByAlgorithmComponent,
    LearnResultChartComponent,
    LearnResultValueCellComponent,
    LearnResultFocusButtonComponent,
    LearnResultHeatmapButtonComponent,
    LearnResultColumnPickerComponent,
    BestResultsChartComponent,
    LearnTasksComponent,
    LearnTasksCompareComponent,
    LearnTaskTableComponent,
  ],
  providers: [],
})
export class LearnTaskModule {}
