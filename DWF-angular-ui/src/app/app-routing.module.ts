import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const APP_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'experiments' },
  {
    path: 'experiments',
    loadChildren: () => import('./modules/experiment/experiment.module').then(m => m.ExperimentModule),
  },
  {
    path: 'assemble-configs',
    loadChildren: () => import('./modules/assemble-task/assemble-task.module').then(m => m.AssembleTaskModule),
  },
  {
    path: 'learn-tasks',
    loadChildren: () => import('./modules/learn-task/learn-task.module').then(m => m.LearnTaskModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(APP_ROUTES, { relativeLinkResolution: 'corrected' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
