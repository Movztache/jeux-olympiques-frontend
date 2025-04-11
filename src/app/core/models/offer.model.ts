export interface Offer {
  offerId: number;
  name: string;
  description?: string;
  price: number;
  offerType: string;
  personCount: number;
  available: boolean;
}
