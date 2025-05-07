import { User } from './user.model';
import { Offer } from './offer.model';
import { PaymentInfo } from './payment.model';

export interface ReservationModel {
  reservationId?: number;
  reservationDate: Date;
  reservationKey: string;
  qrCode: string;
  finalKey?: string;
  isUsed: boolean;
  usageDate?: Date;
  quantity: number;
  userApp: User;
  offer: Offer;
}

// Interface pour la création d'une réservation
export interface CreateReservationDto {
  quantity: number;
  offerId: number;
}

// Interface pour la mise à jour d'une réservation
export interface UpdateReservationDto {
  isUsed?: boolean;
  usageDate?: Date;
  quantity?: number;
}

// DTO pour la création d'une réservation avec paiement
export interface ReservationCreateDTO {
  offerId: number;
  quantity: number;
  paymentInfo: string; // Format attendu: 'cardNumber|MM/YY|CVV'
}

// DTO pour la réponse après création d'une réservation
export interface ReservationResponseDTO {
  reservationId: number;
  reservationDate: string;
  reservationKey: string;
  qrCode: string;
  finalKey?: string;
  offer: {
    offerId: number;
    name: string;
    price: number;
    offerType: string;
    personCount: number;
  };
  totalPrice: number;
  quantity: number;
}
