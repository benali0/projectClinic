import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="page-container animate-fade-in">
      <!-- Welcome -->
      <div class="welcome-card">
        <div class="welcome-content">
          <h1>Bonjour, {{ authService.currentUser()?.prenom }} !</h1>
          <p>Bienvenue dans votre espace santé. Gérez vos rendez-vous et consultez votre dossier médical.</p>
          <button mat-flat-button color="primary" (click)="navigateTo('/patient/prendre-rdv')">
            <mat-icon>add_circle</mat-icon> Prendre un rendez-vous
          </button>
        </div>
        <mat-icon class="welcome-icon">favorite</mat-icon>
      </div>

      <!-- Quick actions -->
      <div class="stats-grid">
        <div class="quick-action" (click)="navigateTo('/patient/rendezvous')">
          <div class="stat-icon primary"><mat-icon>event_available</mat-icon></div>
          <div>
            <div class="stat-label">Mes Rendez-vous</div>
            <small>Voir et gérer mes RDV</small>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </div>

        <div class="quick-action" (click)="navigateTo('/patient/prendre-rdv')">
          <div class="stat-icon success"><mat-icon>add_circle</mat-icon></div>
          <div>
            <div class="stat-label">Nouveau RDV</div>
            <small>Prendre un rendez-vous</small>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </div>

        <div class="quick-action" (click)="navigateTo('/patient/dossier')">
          <div class="stat-icon warning"><mat-icon>folder_open</mat-icon></div>
          <div>
            <div class="stat-label">Dossier Médical</div>
            <small>Consultations & historique</small>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </div>

        <div class="quick-action" (click)="navigateTo('/patient/medecins')">
          <div class="stat-icon info"><mat-icon>local_hospital</mat-icon></div>
          <div>
            <div class="stat-label">Nos Médecins</div>
            <small>Annuaire des spécialistes</small>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </div>
      </div>

      <!-- Specialties -->
      <div class="content-card">
        <div class="content-card-header">
          <h3 style="margin:0;font-size:16px;font-weight:600">Nos spécialités</h3>
        </div>
        <div class="content-card-body">
          <div class="specialties-grid">
            @for (spec of specialites; track spec) {
              <div class="specialty-chip">{{ spec }}</div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  specialites = ['Cardiologie', 'Dermatologie', 'Pédiatrie', 'Gynécologie', 
                 'Neurologie', 'Ophtalmologie', 'Orthopédie', 'Généraliste'];
  
  constructor(public authService: AuthService, private router: Router) {}

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}