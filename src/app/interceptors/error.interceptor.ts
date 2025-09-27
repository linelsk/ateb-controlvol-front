import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthJwtService } from '../auth-jwt.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthJwtService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expirado o no válido
        authService.logout();
        router.navigate(['/']);
      } else if (error.status === 403) {
        // Sin permisos
        console.error('Acceso denegado');
        // Opcional: mostrar mensaje de error o redirigir
      }
      
      return throwError(() => error);
    })
  );
};