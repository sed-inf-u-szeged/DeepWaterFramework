import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core/core.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DataModule } from './data/data.module';

@NgModule({
  declarations: [AppComponent],
  imports: [AppRoutingModule, BrowserAnimationsModule, BrowserModule, DataModule, CoreModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
