export interface LoginRequest {
  correo: string;
  password: string;
}

// Interface para mapear con OpenAPI
export interface OpenApiLoginRequest {
  username: string;
  password: string;
}

export interface Usuario {
  usuarioId: string;
  password: string;
  correo: string;
  nombre: string;
  perfilId: number;
  activo: boolean;
  primeraVez: boolean;
  updatePassword: string;
  historyPasses: any[];
  perfil: any;
}

export interface LoginResult {
  token: string;
  usuario: Usuario;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  result: T;
}

export type LoginResponse = ApiResponse<LoginResult>;

export type UserRole = 'Administrador' | 'Usuario' | 'Cliente' | 'Supervisor';

export interface CurrentUser {
  usuarioId: string;
  correo: string;
  nombre: string;
  perfilId: number;
  role: UserRole;
  activo: boolean;
  primeraVez: boolean;
}