import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/authentication/auth.service';
import { NgOptimizedImage } from '@angular/common';
import { CardComponent } from '../../../../shared/components/card/card.component'; // Ajustez le chemin selon votre structure

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  standalone: true,
  imports: [NgOptimizedImage, CardComponent],
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  isUserLoggedIn = false;
  bannerPath = '../../../../../assets/pictures/banner.png';
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Vérification si l'utilisateur est connecté
    this.isUserLoggedIn = this.authService.isLoggedIn();

    // Option: s'abonner aux changements d'état de connexion
    this.authService.currentUser.subscribe(user => {
      this.isUserLoggedIn = !!user;
    });
  }
}
