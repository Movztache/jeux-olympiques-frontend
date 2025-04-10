import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss'
})
export class AlertComponent {
  @Input() message: string = '';
  @Input() type: AlertType = 'info';
  @Input() dismissible: boolean = true;
  @Output() closed = new EventEmitter<void>();

  visible: boolean = true;

  dismiss(): void {
    this.visible = false;
    this.closed.emit();
  }

  // Retourne l'icône appropriée selon le type d'alerte
  get alertIcon(): string {
    switch (this.type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }
}
