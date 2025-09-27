import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { UserRole } from '../../models/auth.models';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class HomeComponent implements OnInit {
  currentUser: any = null;
  userRole: UserRole | null = null;

  constructor(private readonly authService: AuthService) {}

  ngOnInit() {
    // Obtener información del usuario actual
    this.currentUser = this.authService.getCurrentUser();
    this.userRole = this.authService.getRole();
  }

  logout() {
    this.authService.logout();
  }
}