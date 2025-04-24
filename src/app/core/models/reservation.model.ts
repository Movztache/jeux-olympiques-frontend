import { User } from './user.model';
import { Offer } from './offer.model';

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
