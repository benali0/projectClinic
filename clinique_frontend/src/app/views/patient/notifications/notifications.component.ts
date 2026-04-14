// notifications.component.ts - CORRIGÉ ET SIMPLIFIÉ

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationResponse, NotificationStatut } from '../../../models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  notifications: NotificationResponse[] = [];
  filteredNotifications: NotificationResponse[] = [];
  effectiveId: number | null = null; // 🔥 ID patient spécifique
  unreadCount = 0;
  activeFilter: 'ALL' | 'NON_LUE' | 'LUE' = 'ALL';

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

// notifications.component.ts - CORRECTION ngOnInit()

ngOnInit(): void {
  const patientId = this.authService.getPatientId();

  console.log('🎯 Patient ID FINAL:', patientId);

  if (patientId === null || patientId === undefined) {
    console.error('❌ patientId introuvable');
    return;
  }

  // 🔥 FORCER la bonne valeur
  this.effectiveId = patientId;

  this.loadNotifications();
  this.loadUnreadCount();
}

  loadNotifications(): void {
if (this.effectiveId === null || this.effectiveId === undefined) return;    
    console.log('🚀 Chargement notifications pour patient:', this.effectiveId);

    this.notificationService.getNotificationsByPatient(this.effectiveId).subscribe({
      next: (data) => {
        console.log('📥 Données reçues:', data);
        
        if (!Array.isArray(data)) {
          console.error('❌ Pas un tableau:', data);
          this.notifications = [];
          this.applyFilter();
          return;
        }

        this.notifications = data.sort((a, b) => {
          return new Date(b.dateEnvoi).getTime() - new Date(a.dateEnvoi).getTime();
        });

        console.log('✅ Notifications chargées:', this.notifications.length);
        this.applyFilter();
      },
      error: (err) => {
        console.error('❌ Erreur chargement:', err);
        this.notifications = [];
        this.applyFilter();
      }
    });
  }

  loadUnreadCount(): void {
if (this.effectiveId === null || this.effectiveId === undefined) return;
    this.notificationService.getUnreadCountPatient(this.effectiveId).subscribe({
      next: (count) => {
        console.log('🔔 Non lues:', count);
        this.unreadCount = count;
      },
      error: (err) => console.error('❌ Erreur compteur:', err)
    });
  }

  setFilter(filter: 'ALL' | 'NON_LUE' | 'LUE'): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    switch (this.activeFilter) {
      case 'NON_LUE':
        this.filteredNotifications = this.notifications.filter(n => n.statut === NotificationStatut.NON_LUE);
        break;
      case 'LUE':
        this.filteredNotifications = this.notifications.filter(n => n.statut === NotificationStatut.LUE);
        break;
      default:
        this.filteredNotifications = [...this.notifications];
    }
  }

  markAsRead(notificationId: number): void {
    this.notificationService.markAsReadPatient(notificationId).subscribe({
      next: () => {
        const notif = this.notifications.find(n => n.id === notificationId);
        if (notif) {
          notif.statut = NotificationStatut.LUE;
          notif.dateLecture = new Date().toISOString();
        }
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.applyFilter();
      },
      error: (err) => console.error('❌ Erreur mark read:', err)
    });
  }

  markAllAsRead(): void {
if (this.effectiveId === null || this.effectiveId === undefined) return;
    this.notificationService.markAllAsReadPatient(this.effectiveId).subscribe({
      next: () => {
        this.notifications.forEach(n => {
          n.statut = NotificationStatut.LUE;
          n.dateLecture = new Date().toISOString();
        });
        this.unreadCount = 0;
        this.applyFilter();
      },
      error: (err) => console.error('❌ Erreur mark all:', err)
    });
  }

  // ... méthodes helper inchangées ...
  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'CONFIRMATION_RDV': 'bi-calendar-check',
      'RAPPEL_RDV': 'bi-clock',
      'ANNULATION_PAR_MEDECIN': 'bi-calendar-x',
      'FACTURE': 'bi-receipt',
      'PAIEMENT_RECU': 'bi-cash-stack',
      'DEMANDE_EN_ATTENTE': 'bi-hourglass',
      'NOUVEAU_RDV': 'bi-calendar-plus',
      'ANNULATION_PAR_PATIENT': 'bi-calendar-x',
      'SYSTEME': 'bi-info-circle'
    };
    return icons[type] || 'bi-bell';
  }

  getNotificationTitle(type: string): string {
    const titles: { [key: string]: string } = {
      'CONFIRMATION_RDV': 'Rendez-vous confirmé',
      'RAPPEL_RDV': 'Rappel de rendez-vous',
      'ANNULATION_PAR_MEDECIN': 'Rendez-vous annulé',
      'FACTURE': 'Nouvelle facture',
      'PAIEMENT_RECU': 'Paiement reçu',
      'DEMANDE_EN_ATTENTE': 'Demande en attente',
      'NOUVEAU_RDV': 'Nouveau rendez-vous',
      'ANNULATION_PAR_PATIENT': 'Annulation par patient',
      'SYSTEME': 'Information'
    };
    return titles[type] || 'Notification';
  }

  formatDate(date: string): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    }
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
    
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}