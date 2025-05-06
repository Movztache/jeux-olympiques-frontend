// src/app/core/interceptors/logging.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  // console.log(`🚀 Requête HTTP: ${req.method} ${req.url}`);
  // console.log('Headers:', req.headers.keys().map(key => `${key}: ${req.headers.get(key)}`));

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type !== 0) { // 0 est le type pour HttpEventType.Sent
          // console.log(`✅ Réponse HTTP pour ${req.url}:`, event);
        }
      },
      error: (error) => {
        // console.error(`❌ Erreur HTTP pour ${req.url}:`, error);
      }
    })
  );
};
