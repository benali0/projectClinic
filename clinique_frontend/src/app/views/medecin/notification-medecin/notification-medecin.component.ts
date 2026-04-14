// notification-medecin.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationResponse, NotificationType, NotificationStatut } from '../../../models/notification.model';

@Component({
  selector: 'app-notification-medecin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-medecin.component.html',
  styleUrls: ['./notification-medecin.component.css']
})
export class NotificationMedecinComponent implements OnInit, OnDestroy {
  
  notifications: NotificationResponse[] = [];
  unreadCount: number = 0;
  loading: boolean = false;
  showDropdown: boolean = false;
  
  private medecinId: number | null = null;  // 🔥 ID médecin spécifique
  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // 🔥 UTILISER getMedecinId()
    this.medecinId = this.authService.getMedecinId();
    
    console.log('👤 User complet:', this.authService.currentUser());
    console.log('🩺 Médecin ID:', this.medecinId);
    
    if (this.medecinId) {
      this.loadNotifications();
      this.startPolling();
    } else {
      console.error('❌ Aucun ID médecin disponible');
      // Fallback
      const userId = this.authService.getCurrentUserId();
      if (userId) {
        console.log('⚠️ Fallback sur userId:', userId);
        this.medecinId = userId;
        this.loadNotifications();
        this.startPolling();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadNotifications(): void {
    if (!this.medecinId) return;
    
    this.loading = true;
    
    const subNotifs = this.notificationService
      .getNotificationsByMedecin(this.medecinId)
      .subscribe({
        next: (notifs) => {
          this.notifications = notifs;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur chargement:', err);
          this.loading = false;
        }
      });

    const subCount = this.notificationService
      .getUnreadCountMedecin(this.medecinId)
      .subscribe({
        next: (count) => this.unreadCount = count,
        error: (err) => console.error('Erreur compteur:', err)
      });

    this.subscriptions.push(subNotifs, subCount);
  }

  startPolling(): void {
    if (!this.medecinId) return;
    
    const sub = this.notificationService
      .startPollingMedecin(this.medecinId, 30000)
      .subscribe(count => this.unreadCount = count);
    
    this.subscriptions.push(sub);
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown && this.medecinId) {
      this.loadNotifications();
    }
  }

  markAsRead(notification: NotificationResponse, event: Event): void {
    event.stopPropagation();
    
    this.notificationService.markAsReadMedecin(notification.id).subscribe({
      next: () => {
        notification.statut = NotificationStatut.LUE;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      },
      error: (err) => console.error('Erreur mark read:', err)
    });
  }

  markAllAsRead(): void {
    if (!this.medecinId) return;
    
    this.notificationService.markAllAsReadMedecin(this.medecinId).subscribe({
      next: () => {
        this.unreadCount = 0;
        this.notifications.forEach(n => n.statut = NotificationStatut.LUE);
      },
      error: (err) => console.error('Erreur mark all:', err)
    });
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  getIcon(type: string): string {
    return this.notificationService.getIconForType(type);
  }

  getColor(type: string): string {
    return this.notificationService.getColorForType(type);
  }

  formatDate(date: string): string {
    return this.notificationService.formatDate(date);
  }

  getTypeLabel(type: NotificationType | string): string {
    const labels: { [key: string]: string } = {
      'NOUVEAU_RDV': 'Nouveau rendez-vous',
      'CONFIRMATION_RDV': 'Rendez-vous confirmé',
      'ANNULATION_PAR_PATIENT': 'Annulation patient',
      'ANNULATION_PAR_MEDECIN': 'Annulation médecin',
      'RAPPEL_RDV': 'Rappel',
      'DEMANDE_EN_ATTENTE': 'Demande en attente',
      'FACTURE': 'Nouvelle facture',
      'PAIEMENT_RECU': 'Paiement reçu'
    };
    return labels[type as string] || type;
  }

  goToRendezVous(notification: NotificationResponse): void {
    if (notification.rendezVousId) {
      this.closeDropdown();
    }
  }
}