import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LearnTasksByConfigStrategyComponent } from './pages/learn-tasks-by-config-strategy/learn-tasks-by-config-strategy.component';
import { LearnTasksByConfigStrategyResolver } from './pages/learn-tasks-by-config-strategy/learn-tasks-by-config-strategy.resolver.service';
import { LearnTasksComponent } from './pages/learn-tasks/learn-tasks.component';
import { LearnTasksResolver } from './pages/learn-tasks/learn-tasks.resolver.service';
import { LearnTasksCompareComponent } from './pages/learn-tasks-compare/learn-tasks-compare.component';
import { LearnTasksCompareResolver } from './pages/learn-tasks-compare/learn-tasks-compare.resolver.service';

const LEARN_TASK_ROUTES: Routes = [
  {
    path: 'of-experiments/:experimentIds',
    children: [
      {
        path: '',
        component: LearnTasksComponent,
        resolve: { learnTasks: LearnTasksResolver },
      },
      {
        path: 'by-preset/:strategyId',
        data: { config: 'assemble_config' },
        component: LearnTasksByConfigStrategyComponent,
        resolve: { learnTasksByConfigStrategy: LearnTasksByConfigStrategyResolver },
      },
      {
        path: 'by-algorithm/:strategyId',
        data: { config: 'learn_config' },
        component: LearnTasksByConfigStrategyComponent,
        resolve: { learnTasksByConfigStrategy: LearnTasksByConfigStrategyResolver },
      },
      {
        path: 'compare/:learnTaskIds',
        component: LearnTasksCompareComponent,
        resolve: { learnTasksCompare: LearnTasksCompareResolver },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(LEARN_TASK_ROUTES)],
  exports: [RouterModule],
})
export class LearnTaskRoutingModule {}
