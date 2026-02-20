import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import SignaturePad from 'signature_pad';
import { ButtonComponent } from '../../shared/ui/button.component';

@Component({
  selector: 'app-signature-pad',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './signature-pad.component.html',
  styles: []
})
export class SignaturePadComponent implements AfterViewInit, OnChanges {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() penColor = 'rgb(0, 0, 0)';
  @Output() onSignature = new EventEmitter<string>();

  private signaturePad!: SignaturePad;
  private resizeObserver!: ResizeObserver;

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgba(255, 255, 255, 0)',
      penColor: this.penColor
    });

    // Use ResizeObserver for more reliable canvas sizing in modals/tabs
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    });
    this.resizeObserver.observe(canvas);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['penColor'] && this.signaturePad) {
      this.signaturePad.penColor = this.penColor;
    }
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d')?.scale(ratio, ratio);
    this.signaturePad?.clear();
  }

  clear() {
    this.signaturePad.clear();
  }

  getSignatureDataUrl(): string | null {
    if (this.signaturePad.isEmpty()) return null;
    return this.signaturePad.toDataURL('image/png');
  }
}
