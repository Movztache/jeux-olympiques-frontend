// src/app/core/core.module.ts

// NgModule : Décorateur qui définit une classe comme un module Angular
// Optional : Décorateur qui marque un paramètre d'injection comme optionnel
// SkipSelf : Décorateur qui empêche de rechercher des dépendances dans l'injecteur du composant actuel
import { NgModule, Optional, SkipSelf } from '@angular/core';

// CommonModule : Fournit les directives communes (ngIf, ngFor, etc.) et les pipes de base
// nécessaires pour la plupart des applications Angular
import { CommonModule } from '@angular/common';

// provideHttpClient : Fonction moderne pour configurer le client HTTP
import { provideHttpClient } from '@angular/common/http';

/**
 * Module Core qui contient les services singleton et fonctionnalités essentielles de l'application.
 * Ce module ne doit être importé qu'une seule fois, dans le AppModule.
 */
@NgModule({
  // Liste des composants, directives et pipes appartenant à ce module
  declarations: [],

  // Les modules importés par ce module
  imports: [
    CommonModule // Fournit les directives communes comme ngIf, ngFor, etc.
  ],

  // Liste des éléments exportés qui seront disponibles pour les modules important CoreModule
  exports: [],

  // Services fournis au niveau du module
  providers: [
    // Fonction provider pour HttpClient - approche moderne remplaçant HttpClientModule
    // Cette méthode améliore le tree-shaking et respecte les nouvelles recommandations Angular
    provideHttpClient()
  ]
})
export class CoreModule {
  /**
   * Constructeur vérifiant que le CoreModule n'est pas importé plusieurs fois.
   * @param parentModule - Instance existante de CoreModule si déjà chargé ailleurs
   */
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    // Vérification pour s'assurer que CoreModule n'est pas importé plusieurs fois
    if (parentModule) {
      throw new Error('CoreModule est déjà chargé. Importez-le uniquement dans AppModule.');
    }
  }
}
