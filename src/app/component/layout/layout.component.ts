import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { UserRole } from '../../models/auth.models';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-layout',
  standalone: true,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
  imports: [RouterModule, CommonModule, MatIconModule, MatExpansionModule, MatListModule, MatMenuModule, MatButtonModule]
})
export class LayoutComponent {
  role: UserRole | null = null;
  username: string | null = null;
  
  // Submenu state management
  catalogosExpanded = false;
  administracionExpanded = false;
  
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

  toggleCatalogos(): void {
    this.catalogosExpanded = !this.catalogosExpanded;
  }

  toggleAdministracion(): void {
    this.administracionExpanded = !this.administracionExpanded;
  }

  logout() {
    this.auth.logout();
  }
}