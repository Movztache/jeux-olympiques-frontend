import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartItem } from '../../../../core/models/cart.model';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.scss'
})
export class CartItemComponent {
  @Input() item!: CartItem;
  @Output() quantityChange = new EventEmitter<{ cartId: number, quantity: number }>();
  @Output() remove = new EventEmitter<number>();

  increaseQuantity(): void {
    this.quantityChange.emit({ cartId: this.item.cartId, quantity: this.item.quantity + 1 });
  }

  decreaseQuantity(): void {
    if (this.item.quantity > 1) {
      this.quantityChange.emit({ cartId: this.item.cartId, quantity: this.item.quantity - 1 });
    }
  }

  onRemove(): void {
    this.remove.emit(this.item.cartId);
  }
}
