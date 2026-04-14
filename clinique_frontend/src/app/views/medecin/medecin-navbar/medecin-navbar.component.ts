// src/app/views/medecin/medecin-navbar/medecin-navbar.component.ts
import { Component, ElementRef, HostListener, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationResponse, NotificationStatut, NotificationType } from '../../../models/notification.model';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-medecin-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './medecin-navbar.component.html',
  styleUrls: ['./medecin-navbar.component.css']
})
export class MedecinNavbarComponent implements OnInit, OnDestroy {

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
    this.currentUserId = this.authService.getMedecinId();
    if (this.currentUserId) {
      this.loadNotifications();

      // Polling toutes les 30 secondes
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

    this.notificationService.getUnreadCountMedecin(this.currentUserId).subscribe({
      next: count => this.unreadCount = count,
      error: err => console.error('Erreur chargement compteur:', err)
    });

    this.notificationService.getNotificationsByMedecin(this.currentUserId).subscribe({
      next: notifs => this.notifications = notifs.slice(0, 5),
      error: err => console.error('Erreur chargement notifications:', err)
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.isNotificationsOpen = !this.isNotificationsOpen;

    if (this.isNotificationsOpen) {
      this.loadNotifications();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.notificationDropdown?.nativeElement &&
        !this.notificationDropdown.nativeElement.contains(event.target)) {
      this.isNotificationsOpen = false;
    }
  }

  onNotificationClick(notification: NotificationResponse): void {
    if (notification.statut === NotificationStatut.NON_LUE && notification.id) {
      this.notificationService.markAsReadMedecin(notification.id).subscribe({
        next: () => {
          notification.statut = NotificationStatut.LUE;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      });
    }

    this.redirectBasedOnType(notification);
    this.isNotificationsOpen = false;
  }

  redirectBasedOnType(notification: NotificationResponse): void {
    switch (notification.type) {
      case NotificationType.RAPPEL_RDV:
      case NotificationType.NOUVEAU_RDV:
      case NotificationType.ANNULATION_PAR_PATIENT:
      case NotificationType.ANNULATION_PAR_MEDECIN:
      case NotificationType.CONFIRMATION_RDV:
        this.router.navigate(['/medecin/rendezvous']);
        break;
      case NotificationType.FACTURE:
      case NotificationType.PAIEMENT_RECU:
        this.router.navigate(['/medecin/dashboard']);
        break;
      default:
        this.router.navigate(['/medecin/notifications']);
    }
  }

  markAllAsRead(event: Event): void {
    event.stopPropagation();
    if (!this.currentUserId) return;

    this.notificationService.markAllAsReadMedecin(this.currentUserId).subscribe({
      next: () => {
        this.notifications.forEach(n => n.statut = NotificationStatut.LUE);
        this.unreadCount = 0;
      }
    });
  }

  viewAllNotifications(event: Event): void {
    event.stopPropagation();
    this.isNotificationsOpen = false;
    this.router.navigate(['/medecin/notifications']);
  }

  goToSettings(event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/medecin/parametres']);
  }

  getNotificationIcon(type: NotificationType | undefined): string {
    switch (type) {
      case NotificationType.NOUVEAU_RDV: return 'bi-calendar-plus-fill';
      case NotificationType.CONFIRMATION_RDV: return 'bi-check-circle-fill';
      case NotificationType.ANNULATION_PAR_PATIENT: return 'bi-x-circle-fill';
      case NotificationType.ANNULATION_PAR_MEDECIN: return 'bi-x-circle-fill';
      case NotificationType.RAPPEL_RDV: return 'bi-clock-fill';
      case NotificationType.FACTURE: return 'bi-receipt';
      case NotificationType.PAIEMENT_RECU: return 'bi-cash-coin';
      case NotificationType.DEMANDE_EN_ATTENTE: return 'bi-exclamation-circle-fill';
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