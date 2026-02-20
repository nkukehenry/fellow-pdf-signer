import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignatureInstance, Position } from '../../core/models/pdf.model';

@Component({
  selector: 'app-pdf-page-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pdf-page-view.component.html',
  styleUrl: './pdf-page-view.component.css'
})
export class PdfPageViewComponent {
  @Input() pageImage: string | null = null;
  @Input() signatures: SignatureInstance[] = [];
  @Input() isPlacing = false;
  @Input() isModalOpen = false;

  @Output() onBoxDrawn = new EventEmitter<{ position: Position, width: number, height: number }>();
  @Output() onRemoveSignature = new EventEmitter<string>();
  @Output() onSignatureMoved = new EventEmitter<{ id: string, position: Position }>();

  isDragging = false;
  isMoving = false;
  movingSignatureId: string | null = null;
  moveOffset: Position = { x: 0, y: 0 };
  startPos: Position = { x: 0, y: 0 };
  selectionRect = { x: 0, y: 0, width: 0, height: 0 };

  constructor(private cdr: ChangeDetectorRef) { }

  onMouseDown(event: MouseEvent) {
    if (!this.isPlacing) return;

    // Prevent default browser behavior (text selection, etc)
    event.preventDefault();

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.isDragging = true;
    this.startPos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    this.selectionRect = { ...this.startPos, width: 0, height: 0 };
    console.log('[PdfPageView] onMouseDown at:', this.startPos);
    this.cdr.detectChanges();
  }

  onSignatureMouseDown(event: MouseEvent, sig: SignatureInstance) {
    // If we're in placing mode, let the interaction layer handle drawing
    if (this.isPlacing) return;

    event.stopPropagation();
    event.preventDefault();

    this.isMoving = true;
    this.movingSignatureId = sig.id;
    this.moveOffset = {
      x: event.clientX - sig.position.x,
      y: event.clientY - sig.position.y
    };
    console.log('[PdfPageView] onSignatureMouseDown for:', sig.id);
  }

  onMouseMove(event: MouseEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;

    if (this.isDragging) {
      this.selectionRect = {
        x: Math.min(this.startPos.x, currentX),
        y: Math.min(this.startPos.y, currentY),
        width: Math.abs(currentX - this.startPos.x),
        height: Math.abs(currentY - this.startPos.y)
      };
      this.cdr.detectChanges();
    } else if (this.isMoving && this.movingSignatureId) {
      const newX = event.clientX - this.moveOffset.x;
      const newY = event.clientY - this.moveOffset.y;

      const sig = this.signatures.find(s => s.id === this.movingSignatureId);
      if (sig) {
        sig.position = { x: newX, y: newY };
        this.cdr.detectChanges();
      }
    }
  }

  onMouseUp() {
    if (this.isDragging) {
      console.log('[PdfPageView] onMouseUp, rectangle:', this.selectionRect);
      this.isDragging = false;
      if (this.selectionRect.width > 5 && this.selectionRect.height > 5) {
        this.onBoxDrawn.emit({
          position: { x: this.selectionRect.x, y: this.selectionRect.y },
          width: this.selectionRect.width,
          height: this.selectionRect.height
        });
      }
      this.selectionRect = { x: 0, y: 0, width: 0, height: 0 };
      this.cdr.detectChanges();
    } else if (this.isMoving && this.movingSignatureId) {
      const sig = this.signatures.find(s => s.id === this.movingSignatureId);
      if (sig) {
        this.onSignatureMoved.emit({ id: sig.id, position: sig.position });
      }
      this.isMoving = false;
      this.movingSignatureId = null;
      console.log('[PdfPageView] Signature move finished');
      this.cdr.detectChanges();
    }
  }
}
