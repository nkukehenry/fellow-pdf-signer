import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, ChangeDetectorRef } from '@angular/core';
// Re-save to trigger build
import { CommonModule } from '@angular/common';
import { PdfService } from '../../core/services/pdf.service';
import { SignatureInstance, Position } from '../../core/models/pdf.model';
import { PdfPagerComponent } from './pdf-pager.component';
import { PdfPageViewComponent } from './pdf-page-view.component';
import { ButtonComponent } from '../../shared/ui/button.component';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [CommonModule, PdfPagerComponent, PdfPageViewComponent, ButtonComponent],
  templateUrl: './pdf-viewer.component.html',
  styles: []
})
export class PdfViewerComponent implements OnInit, OnChanges {
  @Input() totalPages = 0;
  @Input() signatures: SignatureInstance[] = [];
  @Input() isPlacing = false;
  @Input() isModalOpen = false;

  @Output() onDownload = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onPlaceSignature = new EventEmitter<{ page: number, position: Position, width: number, height: number }>();
  @Output() onRemoveSignature = new EventEmitter<string>();
  @Output() onSignatureMoved = new EventEmitter<{ id: string, position: Position }>();
  @Output() onStartPlacing = new EventEmitter<'signature' | 'text'>();
  @Output() onCancelPlacing = new EventEmitter<void>();

  currentPage = 1;
  pageImage: string | null = null;

  constructor(
    private pdfService: PdfService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    console.log('[PdfViewerComponent] Initialized. totalPages:', this.totalPages);
    if (this.totalPages > 0) {
      this.loadPage(1);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('[PdfViewerComponent] ngOnChanges:', Object.keys(changes));
    if (changes['totalPages'] && this.totalPages > 0) {
      console.log('[PdfViewerComponent] totalPages changed to:', this.totalPages);
      this.loadPage(1);
    }
  }

  get currentPageSignatures() {
    return this.signatures.filter(s => s.pageNumber === this.currentPage);
  }

  async goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      await this.loadPage(page);
    }
  }

  private isLoadingPage = false;

  async loadPage(page: number) {
    if (this.isLoadingPage && this.pageImage === null) {
      console.log('[PdfViewerComponent] Already loading a page, skipping...');
      return;
    }

    console.log('[PdfViewerComponent] loadPage:', page);
    this.isLoadingPage = true;
    this.pageImage = null;
    this.cdr.detectChanges();

    try {
      this.pageImage = await this.pdfService.renderPage(page);
      console.log('[PdfViewerComponent] Page image loaded');
    } catch (e) {
      console.error('[PdfViewerComponent] Error rendering page', e);
    } finally {
      this.isLoadingPage = false;
      this.cdr.detectChanges();
    }
  }

  handleBoxDrawn(event: { position: Position, width: number, height: number }) {
    if (!this.isPlacing) return;

    this.onPlaceSignature.emit({
      page: this.currentPage,
      position: event.position,
      width: event.width,
      height: event.height
    });
  }
}
