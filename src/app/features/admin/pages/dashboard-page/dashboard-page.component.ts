import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// Importez d'autres modules/composants que vous utilisez dans votre template

@Component({
  selector: 'app-dashboard-page',
  standalone: true, // Ajout de cette propriété
  imports: [
    CommonModule,
    // Ajoutez d'autres modules/composants dont vous avez besoin
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent {
  // Votre logique de composant
}
