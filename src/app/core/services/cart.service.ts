// src/app/core/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Cart, CartItem, Offer } from '../models/cart.model';
import { AuthService } from '../authentication/auth.service';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>({ items: [] });
  public cart$ = this.cartSubject.asObservable();
  private apiUrl = `${environment.apiUrl}/carts`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {

    const isUserLoggedIn = this.authService.isLoggedIn();

    if (isUserLoggedIn) {
      this.fetchCart().subscribe(cart => {
        this.cartSubject.next(cart);
      });
    } else {
      this.cartSubject.next({ items: [] });
    }


    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.fetchCart().subscribe(cart => {
          this.cartSubject.next(cart);
        });
      } else {
        this.cartSubject.next({ items: [] });
      }
    });
  }

  private fetchCart(): Observable<Cart> {
    return this.http.get<CartItem[]>(`${this.apiUrl}`).pipe(
      map((items: CartItem[]) => ({ items }))
    );
  }

  addToCart(offer: Offer, quantity: number): Observable<CartItem> {
    const cartItem = {
      quantity,
      offer: { id: offer.id }
    };

    return this.http.post<CartItem>(`${this.apiUrl}`, cartItem).pipe(
      tap(() => {
        this.fetchCart().subscribe(cart => {
          this.cartSubject.next(cart);
        });
      })
    );
  }

  removeFromCart(cartId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${cartId}`).pipe(
      tap(() => {
        this.fetchCart().subscribe(cart => {
          this.cartSubject.next(cart);
        });
      })
    );
  }

  updateQuantity(cartId: number, quantity: number): Observable<CartItem> {
    return this.http.patch<CartItem>(`${this.apiUrl}/${cartId}`, { quantity }).pipe(
      tap(() => {
        this.fetchCart().subscribe(cart => {
          this.cartSubject.next(cart);
        });
      })
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clear`).pipe(
      tap(() => {
        this.cartSubject.next({ items: [] });
      })
    );
  }

  getCartItemsCount(): Observable<number> {
    return this.cart$.pipe(
      map(cart => cart.items.length)
    );
  }
}
