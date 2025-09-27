import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { AuthJwtService } from './auth-jwt.service';

export function authGuard(roles: string[] = []): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const authJwt = inject(AuthJwtService);
    const router = inject(Router);
    
    if (!auth.isAuthenticated()) {
      router.navigate(['/']);
      return false;
    }
    
    // Verificar si el token está próximo a expirar
    if (authJwt.isTokenExpiringSoon()) {
      console.warn('Token próximo a expirar, considere implementar renovación automática');
      // Nota: Para renovación automática, sería mejor usar un observable o resolver
    }
    
    const userRole = auth.getRole();
    if (roles.length && (!userRole || !roles.includes(userRole))) {
      router.navigate(['/']);
      return false;
    }
    
    return true;
  };
}
