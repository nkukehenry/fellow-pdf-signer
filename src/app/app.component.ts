import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// Re-save to trigger build
import { CommonModule } from '@angular/common';
import { PdfService } from './core/services/pdf.service';
import { SignatureService } from './core/services/signature.service';
import { SignatureInstance, Position } from './core/models/pdf.model';
import { TextInputModalComponent } from './features/annotation/text-input-modal.component';
import { PdfViewerComponent } from './features/pdf-viewer/pdf-viewer.component';
import { SignatureModalComponent } from './features/signature/signature-modal.component';
import { ButtonComponent } from './shared/ui/button.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    PdfViewerComponent,
    SignatureModalComponent,
    TextInputModalComponent,
    ButtonComponent
  ],
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent implements OnInit {
  isPdfLoaded = false;
  totalPages = 0;
  signatures: SignatureInstance[] = [];
  isModalOpen = false;
  isPlacing = false;
  isPlacingText = false;
  isTextModalOpen = false;
  isLoading = false;

  pendingSignature: { data: string, type: string, includeDate: boolean } | null = null;
  lastDrawnBox: { page: number, position: Position, width: number, height: number } | null = null;
  currentPlacingType: 'signature' | 'text' = 'signature';

  constructor(
    private pdfService: PdfService,
    private signatureService: SignatureService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    console.log('AppComponent: Initialized');
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('AppComponent: File selected:', file.name);
      this.loadPdf(file);
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.type === 'application/pdf') {
      console.log('AppComponent: File dropped:', file.name);
      this.loadPdf(file);
    }
  }

  async loadPdf(file: File) {
    console.log('AppComponent: Starting loadPdf for', file.name);
    this.isLoading = true;
    this.cdr.detectChanges(); // Early update to show spinner

    try {
      this.totalPages = await this.pdfService.loadPdf(file);
      console.log('AppComponent: PDF loaded, total pages:', this.totalPages);
      this.isPdfLoaded = true;
    } catch (e) {
      console.error('AppComponent: Error loading PDF', e);
      alert('Failed to load PDF. Please try another one.');
    } finally {
      this.isLoading = false;
      console.log('AppComponent: Loading state cleared, isPdfLoaded:', this.isPdfLoaded);
      this.cdr.detectChanges(); // CRITICAL: Force update since async file ops might have run outside Zone
    }
  }

  startPlacing(type: 'signature' | 'text' = 'signature') {
    this.currentPlacingType = type;
    this.isPlacing = true;
  }

  cancelPlacing() {
    this.isPlacing = false;
    this.lastDrawnBox = null;
  }

  handleBoxDrawn(event: { page: number, position: Position, width: number, height: number }) {
    this.lastDrawnBox = event;
    if (this.currentPlacingType === 'signature') {
      this.isModalOpen = true;
    } else {
      this.isTextModalOpen = true;
    }
  }

  handleTextSave(text: string) {
    if (!this.lastDrawnBox) return;

    const signatureData = this.signatureService.generatePlainTextImage(text);

    // For text, we'll use a fixed height and variable width based on the generated image
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const finalHeight = 24; // Standard height for plain text
      const finalWidth = finalHeight * aspectRatio;

      // Center the text in the drawn box horizontally
      const centerX = this.lastDrawnBox!.position.x + (this.lastDrawnBox!.width / 2) - (finalWidth / 2);
      const centerY = this.lastDrawnBox!.position.y + (this.lastDrawnBox!.height / 2) - (finalHeight / 2);

      const newAnnotation: SignatureInstance = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'annotation',
        data: signatureData,
        pageNumber: this.lastDrawnBox!.page,
        position: { x: centerX, y: centerY },
        width: finalWidth,
        height: finalHeight
      };

      this.signatures.push(newAnnotation);
      this.isPlacing = false;
      this.isTextModalOpen = false;
      this.lastDrawnBox = null;
      this.cdr.detectChanges();
    };
    img.src = signatureData;
  }

  handleSignatureSave(event: { data: string, type: string, includeDate: boolean }) {
    if (!this.lastDrawnBox) return;

    // For typed signatures, we might want to respect the aspect ratio of the generated text
    // instead of stretching it to fit the box.
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const finalHeight = this.lastDrawnBox!.height;
      const finalWidth = event.type === 'type' ? finalHeight * aspectRatio : this.lastDrawnBox!.width;

      const newSig: SignatureInstance = {
        id: Math.random().toString(36).substr(2, 9),
        type: event.type as any,
        data: event.data,
        pageNumber: this.lastDrawnBox!.page,
        position: this.lastDrawnBox!.position,
        width: finalWidth,
        height: finalHeight,
        dateStamp: event.includeDate ? new Date().toLocaleDateString() : undefined
      };

      this.signatures.push(newSig);
      this.isPlacing = false;
      this.isModalOpen = false;
      this.lastDrawnBox = null;
      this.cdr.detectChanges();
    };
    img.src = event.data;
  }

  removeSignature(id: string) {
    this.signatures = this.signatures.filter(s => s.id !== id);
  }

  handleSignatureMoved(event: { id: string, position: Position }) {
    const sig = this.signatures.find(s => s.id === event.id);
    if (sig) {
      sig.position = event.position;
    }
  }

  async downloadSignedPdf() {
    this.isLoading = true;
    try {
      const bytes = await this.pdfService.addSignatures(this.signatures);
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'signed_document.pdf';
      link.click();
    } catch (e) {
      console.error('Error signing PDF', e);
      alert('Failed to generate signed PDF.');
    } finally {
      this.isLoading = false;
    }
  }
}
