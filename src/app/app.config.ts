import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Configuration du routeur avec les routes définies dans app.routes.ts
    provideRouter(routes),

    // Configuration du HttpClient pour les requêtes API
    provideHttpClient(/* withInterceptors([authInterceptor]) */ // Vous pourrez ajouter un intercepteur plus tard
    )
  ]
};
