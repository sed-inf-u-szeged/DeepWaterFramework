import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { NgxEchartsCoreModule } from 'ngx-echarts/core';
import { LearnResultChartComponent } from './components/learn-result-chart/learn-result-chart.component';
import { LearnResultColumnPickerComponent } from './components/learn-result-column-picker/learn-result-column-picker.component';
import { LearnResultFocusButtonComponent } from './components/learn-result-focus-button/learn-result-focus-button.component';
import { LearnResultHeatmapButtonComponent } from './components/learn-result-heatmap-button/learn-result-heatmap-button.component';
import { LearnResultValueCellComponent } from './components/learn-result-value-cell/learn-result-value-cell.component';
import { MatTableShellComponent } from './components/mat-table-shell/mat-table-shell.component';
import { LearnTaskRoutingModule } from './learn-task-routing.module';
import { LearnTasksByConfigStrategyComponent } from './pages/learn-tasks-by-config-strategy/learn-tasks-by-config-strategy.component';
import { LearnTasksByStrategyTableComponent } from './pages/learn-tasks-by-config-strategy/learn-tasks-by-strategy-table/learn-tasks-by-strategy-table.component';
import { StrategyBoxplotComponent } from './pages/learn-tasks-by-config-strategy/strategy-boxplot/strategy-boxplot.component';
import { LearnTasksCompareComponent } from './pages/learn-tasks-compare/learn-tasks-compare.component';
import { BestResultsChartComponent } from './pages/learn-tasks/best-results-chart/best-results-chart.component';
import { LearnTaskTableComponent } from './pages/learn-tasks/learn-task-table/learn-task-table.component';
import { LearnTasksComponent } from './pages/learn-tasks/learn-tasks.component';

import 'custom-echarts-build';

@NgModule({
  imports: [DragDropModule, SharedModule, NgxEchartsCoreModule, LearnTaskRoutingModule],
  declarations: [
    LearnResultChartComponent,
    LearnResultColumnPickerComponent,
    LearnResultFocusButtonComponent,
    LearnResultHeatmapButtonComponent,
    LearnResultValueCellComponent,
    MatTableShellComponent,
    LearnTasksByConfigStrategyComponent,
    LearnTasksByStrategyTableComponent,
    StrategyBoxplotComponent,
    LearnTasksCompareComponent,
    BestResultsChartComponent,
    LearnTaskTableComponent,
    LearnTasksComponent,
  ],
})
export class LearnTaskModule {}
