// src/app/features/payment/payment.routes.ts
import { Routes } from '@angular/router';
import { PaymentFormComponent } from './pages/payment-form/payment-form.component';
import { OrderConfirmationComponent } from './pages/order-confirmation/order-confirmation.component';
import { authGuard } from '../../core/guards/auth.guard';

export const PAYMENT_ROUTES: Routes = [
  { path: '', component: PaymentFormComponent, canActivate: [authGuard] },
  { path: 'confirmation', component: OrderConfirmationComponent, canActivate: [authGuard] }
];
