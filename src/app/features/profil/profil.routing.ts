// src/app/features/profil/profil.routes.ts
import { Routes } from '@angular/router';
import { ProfilViewComponent } from './pages/profil-view/profil-view.component';
import { authGuard } from '../../core/guards/auth.guard';
import {NgxQRCodeModule} from '@techiediaries/ngx-qrcode';

export const PROFIL_ROUTES: Routes = [
  { path: '',component: ProfilViewComponent, canActivate: [authGuard] }

];
