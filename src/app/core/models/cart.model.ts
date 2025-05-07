export interface CartItem {
  cartId: number;       // ID unique du panier dans le backend
  offerId: number;      // ID de l'offre
  quantity: number;     // Nombre de billets pour cette offre
  offerName: string;    // Nom de l'offre
  offerPrice: number;   // Prix unitaire de l'offre
  totalPrice: number;   // Prix total pour cet article (prix × quantité)
  personCount?: number; // Nombre de personnes par billet (SOLO=1, DUO=2, etc.)
  offerType?: string;   // Type d'offre (SOLO, DUO, TRIO, CUSTOM)
}

// Pour correspondre exactement à l'API summary
export interface CartSummary {
  total: number;        // Montant total du panier
  itemCount: number;    // Nombre d'articles dans le panier
}
