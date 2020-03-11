import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [],
  imports: [CommonModule, MatToolbarModule, MatProgressBarModule, MatButtonModule, MatIconModule, MatMenuModule],
  exports: [MatToolbarModule, MatProgressBarModule, MatButtonModule, MatIconModule, MatMenuModule],
})
export class CoreModule {}
