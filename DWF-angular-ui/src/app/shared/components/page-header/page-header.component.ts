import { Component, Input } from '@angular/core';

/** A compontent to display a header used on pages. */
@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
})
export class PageHeaderComponent {
  /** The page's title to display. */
  @Input() pageTitle: string;
  /** An optional error message to display. */
  @Input() errorMessage?: string;
}
