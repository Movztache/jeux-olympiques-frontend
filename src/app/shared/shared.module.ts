// NgModule : Décorateur qui définit une classe comme un module Angular
import { NgModule } from '@angular/core';

// CommonModule : Fournit les directives communes (ngIf, ngFor, etc.) et les pipes de base
// nécessaires pour la plupart des applications Angular
import { CommonModule } from '@angular/common';

// FormsModule : Fournit les directives pour les formulaires template-driven (ngModel, etc.)
// ReactiveFormsModule : Fournit les classes pour créer et gérer des formulaires réactifs
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/**
 * Module Shared qui contient les composants, directives et pipes réutilisables
 * à travers différentes parties de l'application.
 * Ce module peut être importé par n'importe quel module de fonctionnalité (feature module).
 */
@NgModule({
  // Liste des composants, directives et pipes déclarés dans ce module
  // Ces éléments doivent être également exportés pour être utilisables dans d'autres modules
  declarations: [
    // Exemples de déclarations futures :
    // ButtonComponent, CardComponent, LoadingIndicatorComponent,
    // HighlightDirective, TruncatePipe, etc.
  ],

  // Modules importés qui sont nécessaires pour les fonctionnalités de ce module
  imports: [
    CommonModule,         // Pour les directives structurelles (ngIf, ngFor)
    FormsModule,          // Pour les formulaires template-driven
    ReactiveFormsModule   // Pour les formulaires réactifs
  ],

  // Éléments exportés qui seront disponibles dans les modules important SharedModule
  // Les modules importés que l'on souhaite rendre disponibles sont aussi exportés
  exports: [
    CommonModule,         // Re-export pour simplifier les imports dans les autres modules
    FormsModule,          // Re-export pour simplifier les imports dans les autres modules
    ReactiveFormsModule,  // Re-export pour simplifier les imports dans les autres modules

    // Ajouter ici les composants, directives et pipes que vous exportez
    // ButtonComponent, CardComponent, HighlightDirective, TruncatePipe, etc.
  ]
})
export class SharedModule {
  // Contrairement au CoreModule, le SharedModule peut être importé plusieurs fois
  // sans causer de problèmes puisqu'il ne contient que des éléments réutilisables
  // et ne fournit pas de services singleton
}
