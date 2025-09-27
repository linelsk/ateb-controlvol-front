import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { UserRole } from '../../models/auth.models';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-layout',
  standalone: true,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
  imports: [RouterModule, CommonModule, MatIconModule]
})
export class LayoutComponent {
  role: UserRole | null = null;
  username: string | null = null;
  
  constructor(private readonly auth: AuthService) {
    this.role = this.auth.getRole();
    const currentUser = this.auth.getCurrentUser();
    
    if (this.role === 'Administrador') {
      this.username = currentUser?.nombre || 'admin';
    } else if (this.role === 'Cliente') {
      this.username = currentUser?.nombre || 'cliente';
    } else {
      this.username = currentUser?.nombre || 'usuario';
    }
  }

  logout() {
    this.auth.logout();
  }
}