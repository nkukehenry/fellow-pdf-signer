import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SignatureInstance } from '../models/pdf.model';

@Injectable({
    providedIn: 'root'
})
export class SignatureService {
    private signaturesSubject = new BehaviorSubject<SignatureInstance[]>([]);
    signatures$ = this.signaturesSubject.asObservable();

    addSignature(signature: SignatureInstance) {
        const current = this.signaturesSubject.value;
        this.signaturesSubject.next([...current, signature]);
    }

    removeSignature(id: string) {
        const current = this.signaturesSubject.value;
        this.signaturesSubject.next(current.filter(s => s.id !== id));
    }

    clearSignatures() {
        this.signaturesSubject.next([]);
    }

    generateTextSignatureImage(text: string, font: string, color: string = 'black', fontSizePt: number = 12): string {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return '';

        // High resolution rendering factor
        const oversample = 4;
        const fontSizePx = fontSizePt * 1.333 * oversample;

        // Measure text with high-res font
        context.font = `300 ${fontSizePx}px ${font}`;
        const metrics = context.measureText(text);

        // Add padding and set high-res dimensions
        canvas.width = metrics.width + (40 * oversample);
        canvas.height = fontSizePx * 1.8;

        // Render at high resolution
        context.font = `300 ${fontSizePx}px ${font}`;
        context.textBaseline = 'middle';
        context.fillStyle = color;
        context.fillText(text, 20 * oversample, canvas.height / 2);

        return canvas.toDataURL('image/png');
    }

    generatePlainTextImage(text: string, color: string = 'black', fontSizePt: number = 12): string {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return '';

        const oversample = 4;
        const fontSizePx = fontSizePt * 1.333 * oversample;

        // Use a standard, very readable font for annotations
        const font = 'Inter, Roboto, Arial, sans-serif';
        context.font = `${fontSizePx}px ${font}`;
        const metrics = context.measureText(text);

        canvas.width = metrics.width + (10 * oversample);
        canvas.height = fontSizePx * 1.5;

        context.font = `${fontSizePx}px ${font}`;
        context.textBaseline = 'middle';
        context.fillStyle = color;
        context.fillText(text, 5 * oversample, canvas.height / 2);

        return canvas.toDataURL('image/png');
    }
}
