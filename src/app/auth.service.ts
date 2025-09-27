import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthJwtService } from './auth-jwt.service';
import { UserRole } from './models/auth.models';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'jwt_token';
  private readonly roleKey = 'user_role';

  constructor(
    private readonly router: Router,
    private readonly http: HttpClient,
    // private readonly clientesService: ClientesService, // Comentado - no existe en la nueva API
    private readonly authJwtService: AuthJwtService
  ) {}

  login(correo: string, password: string): Observable<boolean> {
    return this.authJwtService.login(correo, password).pipe(
      switchMap(success => {
        if (success) {
          // En el futuro, aquí se pueden obtener datos adicionales del cliente
          // si el servicio de clientes está disponible en la nueva API
          return of(true);
        }
        return of(false);
      }),
      catchError(error => {
        console.error('Error en login:', error);
        return of(false);
      })
    );
  }

  private processClienteData(response: any): void {
    try {
      let clientesArr: any[] = [];
      if (Array.isArray(response?.result)) {
        clientesArr = response.result;
      } else if (
        response?.result &&
        typeof response.result === 'object' &&
        response.result !== null &&
        Object.hasOwn(response.result, '$values') &&
        Array.isArray(response.result.$values)
      ) {
        clientesArr = response.result.$values;
      }
      
      if (clientesArr.length > 0) {
        localStorage.setItem('cliente_data', JSON.stringify(clientesArr[0]));
      }
    } catch (error) {
      console.warn('Error procesando datos del cliente:', error);
    }
  }

  private setSession(token: string, role: UserRole) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.roleKey, role);
  }

  logout() {
    localStorage.removeItem('cliente_data');
    this.authJwtService.logout();
  }

  isAuthenticated(): boolean {
    return this.authJwtService.isAuthenticated();
  }

  getRole(): UserRole | null {
    return this.authJwtService.getRole();
  }

  getToken(): string | null {
    return this.authJwtService.getToken();
  }

  getCurrentUser() {
    return this.authJwtService.getCurrentUser();
  }

  hasRole(roles: string[]): boolean {
    return this.authJwtService.hasRole(roles);
  }

  isFirstLogin(): boolean {
    return this.authJwtService.isFirstLogin();
  }

  getUserInfo() {
    return this.authJwtService.getUserInfo();
  }
}
