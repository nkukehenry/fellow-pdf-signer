import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/ui/button.component';

@Component({
  selector: 'app-pdf-pager',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './pdf-pager.component.html',
  styles: []
})
export class PdfPagerComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Output() onPageChange = new EventEmitter<number>();
}
