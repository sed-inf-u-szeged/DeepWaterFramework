import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExperimentListResolver } from './pages/experiment-list/experiment-list-resolver.service';
import { ExperimentListComponent } from './pages/experiment-list/experiment-list.component';

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
  {
    path: '**',
    redirectTo: 'list',
  },
];

@NgModule({
  imports: [RouterModule.forChild(EXPERIMENT_ROUTES)],
  exports: [RouterModule],
})
export class ExperimentRoutingModule {}
