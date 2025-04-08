import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Import du composant LoginComponent
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent} from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

const routes: Routes = [
  // Configuration de la route pour le composant LoginComponent
  { path: 'login', component: LoginComponent },
  // Redirection vers login si aucun chemin n'est spécifié dans /auth
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
