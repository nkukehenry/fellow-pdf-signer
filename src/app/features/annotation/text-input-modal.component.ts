import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/ui/modal.component';
import { ButtonComponent } from '../../shared/ui/button.component';

@Component({
    selector: 'app-text-input-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent],
    template: `
    <app-modal [isOpen]="isOpen" title="Add Text" (onClose)="onClose.emit()">
      <div class="space-y-6">
        <div class="space-y-2">
          <label class="text-sm font-semibold text-slate-700">Enter text</label>
          <input [(ngModel)]="text" 
            (keyup.enter)="save()"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all text-slate-800 placeholder:text-slate-400"
            placeholder="Type something here..." 
            autoFocus />
        </div>
      </div>

      <div footer class="flex gap-3">
        <app-button variant="ghost" (onClick)="onClose.emit()" className="text-slate-500">Cancel</app-button>
        <app-button (onClick)="save()" [disabled]="!text.trim()" className="px-8 rounded-full">Apply</app-button>
      </div>
    </app-modal>
  `
})
export class TextInputModalComponent {
    @Input() isOpen = false;
    @Output() onClose = new EventEmitter<void>();
    @Output() onSave = new EventEmitter<string>();

    text: string = '';

    save() {
        if (this.text.trim()) {
            this.onSave.emit(this.text);
            this.text = '';
            this.onClose.emit();
        }
    }
}
