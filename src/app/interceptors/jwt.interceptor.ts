import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthJwtService } from '../auth-jwt.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthJwtService);
  const token = authService.getToken();
  
  // No agregar el token para rutas de login y registro
  if (req.url.includes('/Auth/login') || req.url.includes('/Auth/register')) {
    return next(req);
  }
  
  if (token && authService.isAuthenticated()) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }
  
  return next(req);
};