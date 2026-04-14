import { Component, ElementRef, HostListener, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationResponse, NotificationStatut, NotificationType } from '../../../models/notification.model';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-patient-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-navbar.component.html',
  styleUrls: ['./patient-navbar.component.css']
})
export class PatientNavbarComponent implements OnInit, OnDestroy {
  
  @ViewChild('notificationDropdown') notificationDropdown!: ElementRef;
  
  isMenuOpen = false;
  isNotificationsOpen = false;
  unreadCount = 0;
  notifications: NotificationResponse[] = [];
  currentUserId: number | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
this.currentUserId = this.authService.getPatientId();    if (this.currentUserId) {
      this.loadNotifications();
      
      interval(30000)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.loadNotifications());
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(): void {
    if (!this.currentUserId) return;
    
    this.notificationService.getUnreadCountPatient(this.currentUserId).subscribe({
      next: (count: number) => this.unreadCount = count,
      error: (err) => console.error('Erreur chargement compteur:', err)
    });
    
    this.notificationService.getNotificationsByPatient(this.currentUserId).subscribe({
      next: (notifs: NotificationResponse[]) => this.notifications = notifs.slice(0, 5),
      error: (err) => console.error('Erreur chargement notifications:', err)
    });
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.isNotificationsOpen = !this.isNotificationsOpen;
    
    if (this.isNotificationsOpen) {
      this.loadNotifications();
    }
  }

  onNotificationClick(notification: NotificationResponse): void {
    if (notification.statut === NotificationStatut.NON_LUE && notification.id) {
      this.notificationService.markAsReadPatient(notification.id).subscribe({
        next: () => {
          // 🔥 CORRIGÉ: Utiliser NotificationStatut.LUE
          notification.statut = NotificationStatut.LUE;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      });
    }
    
    this.redirectBasedOnType(notification);
    this.isNotificationsOpen = false;
  }

  redirectBasedOnType(notification: NotificationResponse): void {
    // 🔥 CORRIGÉ: Utiliser NotificationType pour les comparaisons
    switch (notification.type) {
      case NotificationType.RAPPEL_RDV:
      case NotificationType.CONFIRMATION_RDV:
      case NotificationType.ANNULATION_PAR_MEDECIN:
        this.router.navigate(['/patient/rendezvous']);
        break;
      case NotificationType.FACTURE:
      case NotificationType.PAIEMENT_RECU:
        this.router.navigate(['/patient/factures']);
        break;
      default:
        this.router.navigate(['/patient/notifications']);
    }
  }

  markAllAsRead(event: Event): void {
    event.stopPropagation();
    if (!this.currentUserId) return;
    
    this.notificationService.markAllAsReadPatient(this.currentUserId).subscribe({
      next: () => {
        // 🔥 CORRIGÉ: Utiliser NotificationStatut.LUE
        this.notifications.forEach((n: NotificationResponse) => n.statut = NotificationStatut.LUE);
        this.unreadCount = 0;
      }
    });
  }

  viewAllNotifications(event: Event): void {
    event.stopPropagation();
    this.isNotificationsOpen = false;
    this.router.navigate(['/patient/notifications']);
  }

  goToSettings(event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/patient/parametres']);
  }

  getNotificationIcon(type: string | undefined): string {
    switch (type) {
      case 'RAPPEL_RDV': return 'bi-calendar-event-fill';
      case 'CONFIRMATION_RDV': return 'bi-check-circle-fill';
      case 'ANNULATION_PAR_MEDECIN': return 'bi-x-circle-fill';
      case 'FACTURE': return 'bi-receipt';
      case 'PAIEMENT_RECU': return 'bi-cash-coin';
      case 'SYSTEME': return 'bi-info-circle-fill';
      default: return 'bi-bell-fill';
    }
  }

  navigateTo(path: string): void {
    this.isMenuOpen = false;
    this.isNotificationsOpen = false;
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}