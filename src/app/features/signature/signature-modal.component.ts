import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/ui/modal.component';
import { ButtonComponent } from '../../shared/ui/button.component';
import { SignaturePadComponent } from './signature-pad.component';
import { TypeSignatureComponent } from './type-signature.component';
import { ImageUploadComponent } from './image-upload.component';
import { SignatureService } from '../../core/services/signature.service';

@Component({
  selector: 'app-signature-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    ButtonComponent,
    SignaturePadComponent,
    TypeSignatureComponent,
    ImageUploadComponent
  ],
  templateUrl: './signature-modal.component.html',
  styles: []
})
export class SignatureModalComponent {
  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<{ data: string, type: string, includeDate: boolean }>();

  @ViewChild('sigPad') sigPad?: SignaturePadComponent;
  @ViewChild('typeSigComp') typeSigComp?: TypeSignatureComponent;
  @ViewChild('imageUploadComp') imageUploadComp?: ImageUploadComponent;

  activeTab = 'draw';
  includeDate = true;
  selectedFontSize = 12;
  typeSig: { name: string, font: string, fontSize: number } | null = null;
  imageSig: string | null = null;

  selectedColor = 'rgb(0, 0, 0)';
  colors = [
    { name: 'Black', value: 'rgb(0, 0, 0)', class: 'bg-black' },
    { name: 'Navy', value: 'rgb(0, 51, 102)', class: 'bg-[#003366]' },
    { name: 'Red', value: 'rgb(204, 0, 0)', class: 'bg-[#CC0000]' }
  ];

  tabs = [
    { id: 'draw', label: 'Draw' },
    { id: 'type', label: 'Type' },
    { id: 'upload', label: 'Upload' }
  ];

  constructor(private signatureService: SignatureService) { }

  reset() {
    this.typeSig = null;
    this.imageSig = null;
    this.sigPad?.clear();
    this.typeSigComp?.reset();
    this.imageUploadComp?.reset();
  }

  tabClasses(id: string) {
    return `flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${this.activeTab === id
      ? 'border-primary-500 text-primary-600'
      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
      }`;
  }

  onTypeChange(event: { name: string, font: string, fontSize: number }) {
    this.typeSig = event;
    this.selectedFontSize = event.fontSize;
  }

  onImageSelect(data: string) {
    this.imageSig = data;
  }

  save() {
    let signatureData: string | null = null;
    let type = this.activeTab;

    if (this.activeTab === 'draw' && this.sigPad) {
      signatureData = this.sigPad.getSignatureDataUrl();
    } else if (this.activeTab === 'type' && this.typeSig) {
      signatureData = this.signatureService.generateTextSignatureImage(
        this.typeSig.name,
        this.typeSig.font,
        this.selectedColor,
        this.typeSig.fontSize
      );
    } else if (this.activeTab === 'upload' && this.imageSig) {
      signatureData = this.imageSig;
    }

    if (signatureData) {
      this.onSave.emit({
        data: signatureData,
        type: type,
        includeDate: this.includeDate
      });
      this.reset();
      this.onClose.emit();
    }
  }
}
