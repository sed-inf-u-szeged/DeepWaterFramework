import { HttpClientModule } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';

@NgModule({
  imports: [HttpClientModule],
})
export class DataModule {
  constructor(@Optional() @SkipSelf() parentModule: DataModule) {
    if (parentModule) throw new Error('DataModule is already loaded. Import it in the AppModule only.');
  }
}
