import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-type-signature',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './type-signature.component.html',
  styles: []
})
export class TypeSignatureComponent {
  @Input() color: string = 'black';
  @Input() fontSize: number = 12;
  @Output() onSignatureChange = new EventEmitter<{ name: string, font: string, fontSize: number }>();

  name: string = '';
  selectedFont: string = 'Great Vibes';
  fonts: string[] = ['Great Vibes', 'Playfair Display', 'Cursive', 'Serif'];

  onNameChange() {
    this.emitChange();
  }

  onSizeChange() {
    this.emitChange();
  }

  selectFont(font: string) {
    this.selectedFont = font;
    this.emitChange();
  }

  reset() {
    this.name = '';
    this.emitChange();
  }

  private emitChange() {
    this.onSignatureChange.emit({
      name: this.name,
      font: this.selectedFont,
      fontSize: this.fontSize
    });
  }
}
