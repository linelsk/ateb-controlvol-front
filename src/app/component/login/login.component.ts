import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hide = true;

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Redirección automática si ya hay token válido
    if (this.auth.isAuthenticated()) {
      const role = this.auth.getRole();
      if (role === 'Administrador') {
        this.router.navigate(['/admin']);
      } else if (role === 'Cliente') {
        this.router.navigate(['/clientes']);
      }
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { correo, password } = this.loginForm.value;
      this.auth.login(correo, password).subscribe({
        next: (isAuthenticated) => {
          this.onLoginSuccess(isAuthenticated);
        },
        error: (error) => {
          this.onLoginError(error);
        }
      });
    }
  }

  private onLoginSuccess(isAuthenticated: boolean) {
    if (isAuthenticated) {
      this.handleSuccessfulLogin();
      return;
    }
    this.handleLoginError('Correo o contraseña incorrectos');
  }

  private onLoginError(error: any) {
    console.error('Error en login:', error);
    if (error.status === 401) {
      this.handleLoginError('Credenciales incorrectas. Verifica tu correo y contraseña.');
    } else if (error.status === 0) {
      this.handleLoginError('No se puede conectar con el servidor. Verifica tu conexión.');
    } else {
      this.handleLoginError('Error del servidor. Por favor, intenta más tarde.');
    }
  }

  private handleSuccessfulLogin() {
    // Verificar si es primera vez del usuario
    if (this.auth.isFirstLogin()) {
      this.router.navigate(['/home']);
      return;
    }
    
    // Redirigir según el rol del usuario
    const role = this.auth.getRole();
    switch (role) {
      case 'Administrador':
        this.router.navigate(['/admin']);
        break;
      case 'Supervisor':
        this.router.navigate(['/supervisor']);
        break;
      case 'Cliente':
        this.router.navigate(['/clientes']);
        break;
      case 'Usuario':
      default:
        this.router.navigate(['/dashboard']);
        break;
    }
  }

  private handleLoginError(message: string) {
    alert(message);
    // Aquí podrías usar un servicio de notificaciones más sofisticado
  }
}
