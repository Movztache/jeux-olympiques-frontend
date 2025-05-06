// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withDebugTracing } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { routes } from './app.routes';
import { tokenInterceptor } from './core/authentication/token.interceptor';
import { loggingInterceptor } from './core/interceptors/logging.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withDebugTracing()
    ),
    provideHttpClient(
      withInterceptors([loggingInterceptor, tokenInterceptor])
    ),
    provideStore(),
    provideEffects(),
    provideAnimations()
  ]
};
