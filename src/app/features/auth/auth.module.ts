import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Importation du module de routing
import { AuthRoutingModule } from './auth-routing.module';

// Importation des composants standalone
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

@NgModule({
  declarations: [],  // Vide car nous utilisons des composants standalone
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthRoutingModule,
    // Import des composants standalone
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent
  ]
})
export class AuthModule { }
