import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // Importe RouterOutlet pour pouvoir utiliser <router-outlet>
  template: `
    <!-- Container principal de l'application -->
    <div class="container">
      <!-- Emplacement où les routes seront chargées -->
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    /* Styles pour le conteneur principal */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
  `]
})
export class AppComponent {
  title = 'jeux-olympiques-frontend';
}
