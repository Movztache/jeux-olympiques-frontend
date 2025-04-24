import { Routes } from '@angular/router';
import { ReservationListComponent } from './pages/reservation-list/reservation-list.component';
import { ReservationDetailComponent } from './pages/reservation-detail/reservation-detail.component';
import { CreateReservationComponent } from './pages/create-reservation/create-reservation.component';
import { authGuard } from '../../core/guards/auth.guard';

export const RESERVATIONS_ROUTES: Routes = [
  {
    path: '',
    component: ReservationListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'create',
    component: CreateReservationComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'form/:offerId',
        component: CreateReservationComponent,
        data: { step: 'form' }
      },
      {
        path: 'payment/:offerId',
        component: CreateReservationComponent,
        data: { step: 'payment' }
      },
      {
        path: '',
        redirectTo: 'form',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: ':id',
    component: ReservationDetailComponent,
    canActivate: [authGuard]
  }
];
