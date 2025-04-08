// src/app/features/profil/profil-routing.module.ts (mise à jour)
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {authGuard} from '../../core/guards/auth.guard'
import { ProfilViewComponent } from './pages/profil-view/profil-view.component';

const routes: Routes = [
  {
    path: '',
    component: ProfilViewComponent,
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfilRoutingModule { }
