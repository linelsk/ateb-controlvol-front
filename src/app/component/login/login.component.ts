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
      // Todos los usuarios autenticados van a /home
      this.router.navigate(['/home']);
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { correo, password } = this.loginForm.value;
      
      console.log('Intentando login con:', correo);
      
      this.auth.login(correo, password).subscribe({
        next: (isAuthenticated) => {
          console.log('Respuesta de login:', isAuthenticated);
          if (isAuthenticated) {
            this.handleSuccessfulLogin();
          } else {
            this.handleLoginError('Correo o contraseña incorrectos');
          }
        },
        error: (error) => {
          console.error('Error en login:', error);
          this.onLoginError(error);
        }
      });
    } else {
      console.log('Formulario inválido');
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
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
    // Obtener información del usuario después del login exitoso
    const role = this.auth.getRole();
    const user = this.auth.getCurrentUser();
    
    console.log('=== LOGIN EXITOSO ===');
    console.log('Usuario completo:', user);
    console.log('Rol detectado:', role);
    console.log('Token presente:', !!this.auth.getToken());
    console.log('IsAuthenticated:', this.auth.isAuthenticated());
    
    // Todos los usuarios van a /home después del login
    const targetRoute = '/home';
    
    console.log('Redirigiendo a:', targetRoute);
    
    // Navegación directa e inmediata
    this.router.navigateByUrl(targetRoute).then(navigationResult => {
      console.log(`Resultado de navegación a ${targetRoute}:`, navigationResult);
      if (!navigationResult) {
        console.error('Navegación falló, intentando con navigate()');
        this.router.navigate([targetRoute]);
      }
    }).catch(error => {
      console.error('Error en navegación con navigateByUrl:', error);
      // Fallback con navigate
      this.router.navigate([targetRoute]);
    });
  }

  private handleLoginError(message: string) {
    alert(message);
    // Aquí podrías usar un servicio de notificaciones más sofisticado
  }
}
