import { Component, Input } from '@angular/core';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgIf, NgClass],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  @Input() cardType: 'sport' | 'news' = 'sport';
  @Input() imgSrc: string = '';
  @Input() imgAlt: string = '';
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() linkUrl: string = '';
  @Input() linkText: string = 'Lire la suite';
}
