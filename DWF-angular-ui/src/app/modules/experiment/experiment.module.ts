import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { MarkdownModule } from 'ngx-markdown';
import { ExperimentRoutingModule } from './experiment-routing.module';
import { ExperimentListComponent } from './pages/experiment-list/experiment-list.component';

@NgModule({
  imports: [ExperimentRoutingModule, MarkdownModule.forRoot(), SharedModule],
  declarations: [ExperimentListComponent],
})
export class ExperimentModule {}
