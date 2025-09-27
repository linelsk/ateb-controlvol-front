import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { LoginResponse, CurrentUser, UserRole } from './models/auth.models';
import { AuthService as OpenApiAuthService } from './openapi/api/services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthJwtService {
  private readonly tokenKey = 'jwt_token';
  private readonly userKey = 'current_user';
  private readonly currentUserSubject = new BehaviorSubject<CurrentUser | null>(this.getCurrentUserFromStorage());
  
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly openApiAuthService: OpenApiAuthService
  ) {}

  private getCurrentUserFromStorage(): CurrentUser | null {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      const userStr = localStorage.getItem(this.userKey);
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  login(correo: string, password: string): Observable<boolean> {
    // Usar HttpClient directamente ya que OpenAPI no tiene la respuesta correcta definida
    // Mapear correo a username para coincidir con la estructura de OpenAPI
    return this.http.post<LoginResponse>(`${environment.apiUrl}/api/Auth/login`, {
      username: correo,
      password
    })
      .pipe(
        map(response => {
          if (response.success && response.result) {
            // Guardar token
            localStorage.setItem(this.tokenKey, response.result.token);
            
            // Mapear el usuario y determinar el role basado en perfilId
            const currentUser: CurrentUser = {
              usuarioId: response.result.usuario.usuarioId,
              correo: response.result.usuario.correo,
              nombre: response.result.usuario.nombre,
              perfilId: response.result.usuario.perfilId,
              role: this.mapPerfilIdToRole(response.result.usuario.perfilId),
              activo: response.result.usuario.activo,
              primeraVez: response.result.usuario.primeraVez
            };

            // Guardar datos del usuario
            localStorage.setItem(this.userKey, JSON.stringify(currentUser));
            this.currentUserSubject.next(currentUser);

            return true;
          }
          return false;
        }),
        catchError(error => {
          console.error('Error en login:', error);
          return of(false);
        })
      );
  }

  private mapPerfilIdToRole(perfilId: number): UserRole {
    // Mapea el perfilId a roles según tu lógica de negocio
    switch (perfilId) {
      case 1:
        return 'Administrador';
      case 2:
        return 'Supervisor';
      case 3:
        return 'Usuario';
      case 4:
        return 'Cliente';
      default:
        return 'Usuario';
    }
  }

  refreshToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return of(false);
    }

    return this.http.post<LoginResponse>(`${environment.apiUrl}/api/Auth/refresh`, { token })
      .pipe(
        map(response => {
          if (response.success && response.result) {
            localStorage.setItem(this.tokenKey, response.result.token);
            return true;
          }
          return false;
        }),
        catchError(() => {
          this.logout();
          return of(false);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('cliente_data');
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  getRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  hasRole(roles: string[]): boolean {
    const userRole = this.getRole();
    return userRole ? roles.includes(userRole) : false;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch {
      return true;
    }
  }

  isTokenExpiringSoon(threshold: number = 300000): boolean { // 5 minutos por defecto
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000;
        return (exp - Date.now()) < threshold;
      } catch {
        return true;
      }
    }
    return false;
  }

  // Método para verificar si es primera vez del usuario
  isFirstLogin(): boolean {
    const user = this.getCurrentUser();
    return user?.primeraVez || false;
  }

  // Método para obtener información específica del usuario
  getUserInfo(): { usuarioId: string; nombre: string; correo: string } | null {
    const user = this.getCurrentUser();
    if (user) {
      return {
        usuarioId: user.usuarioId,
        nombre: user.nombre,
        correo: user.correo
      };
    }
    return null;
  }

  // Método para obtener claims del token
  getTokenClaims(): any {
    const token = this.getToken();
    if (token) {
      try {
        return JSON.parse(atob(token.split('.')[1]));
      } catch {
        return null;
      }
    }
    return null;
  }
}