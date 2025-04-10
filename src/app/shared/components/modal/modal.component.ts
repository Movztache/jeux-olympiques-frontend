import { Component, Input, Output, EventEmitter, OnInit, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideUpDown', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(20px)', opacity: 0 }))
      ])
    ])
  ]
})
export class ModalComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() showCloseButton: boolean = true;
  @Input() size: 'small' | 'medium' | 'large' | 'fullscreen' = 'medium';
  @Output() close = new EventEmitter<void>();

  @ContentChild('modalHeader') headerTemplate!: TemplateRef<any>;
  @ContentChild('modalFooter') footerTemplate!: TemplateRef<any>;

  constructor() {}

  ngOnInit(): void {}

  closeModal(): void {
    this.close.emit();
  }

  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }
}
