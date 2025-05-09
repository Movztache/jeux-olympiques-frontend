import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../../core/authentication/auth.service';

@Component({
  selector: 'app-profil-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './profil-dashboard.component.html',
  styleUrl: './profil-dashboard.component.scss'
})
export class ProfilDashboardComponent implements OnInit {
  userName: string = '';
  userEmail: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Récupérer les informations de base de l'utilisateur
    const user = this.authService.currentUserValue;
    if (user) {
      this.userName = user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.email.split('@')[0];
      this.userEmail = user.email;
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
