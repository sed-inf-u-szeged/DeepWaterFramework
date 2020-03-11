import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExperimentListComponent } from './pages/experiment-list/experiment-list.component';
import { ExperimentListResolver } from './pages/experiment-list/experiment-list-resolver.service';

const EXPERIMENT_ROUTES: Routes = [
  {
    path: 'list',
    component: ExperimentListComponent,
    resolve: {
      experimentList: ExperimentListResolver,
    },
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(EXPERIMENT_ROUTES)],
  exports: [RouterModule],
})
export class ExperimentRoutingModule {}
