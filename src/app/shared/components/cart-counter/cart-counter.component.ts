import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cart-counter',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './cart-counter.component.html',
  styleUrl: './cart-counter.component.scss'
})
export class CartCounterComponent {
  @Input() count: number = 0;
  @Input() showZero: boolean = false;
}
