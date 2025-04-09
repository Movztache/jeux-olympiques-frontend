// src/app/core/models/cart.model.ts
export interface Offer {
  id: number;
  name?: string;
  price?: number;
  // autres propriétés selon votre modèle Offer
}

export interface UserApp {
  id: number;
  // autres propriétés selon votre modèle UserApp
}

export interface CartItem {
  cartId: number;
  quantity: number;
  offer: Offer;
  userApp?: UserApp; // Facultatif côté front, car géré via l'authentification
}

export interface Cart {
  items: CartItem[];
}
