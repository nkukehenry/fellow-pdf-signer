import { Injectable } from '@angular/core';
import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { SignatureInstance } from '../models/pdf.model';

@Injectable({
    providedIn: 'root'
})
export class PdfService {
    private pdfDoc: PDFDocument | null = null;
    private pdfBytes: Uint8Array | null = null;
    private pdfjsDoc: any | null = null;

    constructor() {
        // Use unpkg for a reliable worker source that matches the installed version
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        console.log('[PdfService] Initialized. PDF.js version:', pdfjsLib.version);
    }

    async loadPdf(file: File): Promise<number> {
        console.log('[PdfService] loadPdf started:', file.name);

        try {
            const buffer = await file.arrayBuffer();
            this.pdfBytes = new Uint8Array(buffer);
            console.log('[PdfService] ArrayBuffer ready');

            console.log('[PdfService] Loading pdf-lib document...');
            this.pdfDoc = await PDFDocument.load(this.pdfBytes, { ignoreEncryption: true });
            console.log('[PdfService] pdf-lib document loaded');

            console.log('[PdfService] Loading PDF.js document...');
            // Create a dedicated loading task with a timeout
            // Use slice(0) to prevent detachment of the underlying ArrayBuffer
            const loadingTask = pdfjsLib.getDocument({
                data: this.pdfBytes.slice(0),
                useSystemFonts: true,
                isEvalSupported: false
            });

            // Add a timeout to prevent infinite processing
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('PDF.js loading timed out')), 15000)
            );

            this.pdfjsDoc = await Promise.race([loadingTask.promise, timeoutPromise]);
            console.log('[PdfService] PDF.js document ready. Buffer length:', this.pdfBytes.length);

            const count = this.pdfDoc.getPageCount();
            return count;
        } catch (err) {
            console.error('[PdfService] Critical error in loadPdf:', err);
            throw err;
        }
    }

    async renderPage(pageNumber: number): Promise<string> {
        console.log('[PdfService] renderPage:', pageNumber);
        if (!this.pdfjsDoc) throw new Error('PDF.js document not initialized');

        try {
            const page = await this.pdfjsDoc.getPage(pageNumber);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (!context) throw new Error('Canvas context failed');

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            return canvas.toDataURL('image/png');
        } catch (err) {
            console.error('[PdfService] renderPage error:', err);
            throw err;
        }
    }

    async addSignatures(signatures: SignatureInstance[]): Promise<Uint8Array> {
        console.log('[PdfService] addSignatures started, count:', signatures.length);
        if (!this.pdfDoc || !this.pdfBytes || this.pdfBytes.length === 0) {
            throw new Error('No PDF loaded or buffer is empty');
        }

        try {
            // Load from a copy to be safe
            const newDoc = await PDFDocument.load(this.pdfBytes.slice(0));
            const pages = newDoc.getPages();

            // Standard font for measurements
            const standardFont = await newDoc.embedFont('Helvetica');

            for (const sig of signatures) {
                console.log('[PdfService] Embedding signature:', sig.id);
                const pageIndex = sig.pageNumber - 1;
                const page = pages[pageIndex];
                const { width: pdfWidth, height: pdfHeight } = page.getSize();

                // Get viewport to calculate scale (UI uses scale 1.5)
                const pdfjsPage = await this.pdfjsDoc.getPage(sig.pageNumber);
                const viewport = pdfjsPage.getViewport({ scale: 1.5 });

                // Scale from browser pixels to PDF points
                const scaleX = pdfWidth / viewport.width;
                const scaleY = pdfHeight / viewport.height;

                // Convert base64 to bytes directly for faster processing
                const base64Data = sig.data.split(',')[1];
                const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
                const image = await newDoc.embedPng(imageBytes);

                // PDF Y is from bottom. Browser Y is from top.
                const drawX = sig.position.x * scaleX;
                const drawY = pdfHeight - (sig.position.y * scaleY) - (sig.height * scaleY);
                const drawWidth = sig.width * scaleX;
                const drawHeight = sig.height * scaleY;

                console.log(`[PdfService] Final PDF coords: X=${drawX.toFixed(2)}, Y=${drawY.toFixed(2)}, W=${drawWidth.toFixed(2)}, H=${drawHeight.toFixed(2)}`);

                page.drawImage(image, {
                    x: drawX,
                    y: drawY,
                    width: drawWidth,
                    height: drawHeight,
                });

                if (sig.dateStamp) {
                    const fontSize = 8;
                    const textWidth = standardFont.widthOfTextAtSize(sig.dateStamp, fontSize);

                    // Center the text relative to the signature width
                    const textX = drawX + (drawWidth / 2) - (textWidth / 2);

                    page.drawText(sig.dateStamp, {
                        x: textX,
                        y: drawY - 12, // Position slightly below the image
                        size: fontSize,
                        font: standardFont,
                        color: rgb(0, 0, 0.7), // Navy blue ink
                    });
                }
            }

            console.log('[PdfService] Saving signed PDF...');
            return await newDoc.save();
        } catch (err) {
            console.error('[PdfService] addSignatures error:', err);
            throw err;
        }
    }
}
