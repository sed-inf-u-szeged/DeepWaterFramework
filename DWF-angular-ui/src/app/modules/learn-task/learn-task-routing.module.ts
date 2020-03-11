import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LearnTasksByAlgorithmComponent } from './pages/learn-tasks-by-algorithm/learn-tasks-by-algorithm.component';
import { LearnTasksByAlgorithmResolver } from './pages/learn-tasks-by-algorithm/learn-tasks-by-algorithm.resolver.service';
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
        path: 'by-algorithm/:algorithmId',
        component: LearnTasksByAlgorithmComponent,
        resolve: { learnTasksByAlgorithm: LearnTasksByAlgorithmResolver },
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
