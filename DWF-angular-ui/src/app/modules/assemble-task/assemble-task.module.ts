import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { AssembleTaskRoutingModule } from './assemble-task-routing.module';
import { AssembleConfigsByPresetComponent } from './pages/assemble-configs-by-preset/assemble-configs-by-preset.component';

@NgModule({
  imports: [SharedModule, AssembleTaskRoutingModule],
  declarations: [AssembleConfigsByPresetComponent],
  providers: [],
})
export class AssembleTaskModule {}
