export interface Offer {
  offerId: number;
  name: string;
  description?: string;
  price: number;
  offerType: string;
  personCount: number;
  available?: boolean;  // Pour la compatibilité avec le code existant
  isAvailable?: boolean; // Pour la compatibilité avec les données du serveur
}

// Fonction utilitaire pour obtenir l'état de disponibilité d'une offre
export function isOfferAvailable(offer: Offer): boolean {
  // Vérifie les deux propriétés possible et retourne true par défaut si aucune n'est définie
  return offer.isAvailable !== undefined ? offer.isAvailable :
         (offer.available !== undefined ? offer.available : true);
}
