import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssembleConfigsByPresetResolver } from './pages/assemble-configs-by-preset/assemble-configs-by-preset.resolver.service';
import { AssembleConfigsByPresetComponent } from './pages/assemble-configs-by-preset/assemble-configs-by-preset.component';

const ASSEMBLE_TASK_ROUTES: Routes = [
  {
    path: 'of-experiments/:experimentIds',
    children: [
      {
        path: 'by-preset/:presetId',
        component: AssembleConfigsByPresetComponent,
        resolve: {
          assembleConfigsByPreset: AssembleConfigsByPresetResolver,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(ASSEMBLE_TASK_ROUTES)],
  exports: [RouterModule],
})
export class AssembleTaskRoutingModule {}
