import { Component, computed, signal, OnInit, OnDestroy, effect, ViewChild } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './views/shared/navbar/navbar.component';
import { FooterComponent } from './views/shared/footer/footer.component';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    NavbarComponent,
    FooterComponent,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatBadgeModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isMobile = false;
  sidenavOpened = true;

  showPublicLayout = computed(() => {
    const role = this.authService.userRole();
    const isLoggedIn = this.authService.isLoggedIn();
    return !isLoggedIn || role === null;
  });

  showAuthLayout = computed(() => {
    return this.authService.isLoggedIn() && this.authService.userRole() !== null;
  });

  currentRole = computed(() => this.authService.userRole());
  
  showFooter = computed(() => {
    const url = this.currentUrl();
    const noFooterRoutes = ['/login', '/register'];
    return this.showPublicLayout() && !noFooterRoutes.includes(url);
  });

  currentUrl = signal('/');
  unreadNotifCount = 0;

  currentUserName = computed(() => {
    const user = this.authService.currentUser();
    if (user) return `${user.prenom || ''} ${user.nom || ''}`.trim() || user.email;
    return '';
  });

  currentUserInitials = computed(() => {
    const user = this.authService.currentUser();
    if (user) {
      const f = (user.prenom || '')[0] || '';
      const l = (user.nom || '')[0] || '';
      return (f + l).toUpperCase() || 'U';
    }
    return 'U';
  });

  navItems = computed<NavItem[]>(() => {
    const role = this.authService.userRole();
    switch (role) {
      case 'ADMIN': return [
        { icon: 'dashboard', label: 'Dashboard', route: '/admin/dashboard' },
        { icon: 'medical_services', label: 'Médecins', route: '/admin/medecins' },
        { icon: 'people', label: 'Patients', route: '/admin/patients' },
        { icon: 'calendar_month', label: 'Rendez-vous', route: '/admin/rendezvous' },
        { icon: 'person_add', label: 'Créer médecin', route: '/admin/create-medecin' }
      ];
      case 'MEDECIN': return [
        { icon: 'dashboard', label: 'Dashboard', route: '/medecin/dashboard' },
        { icon: 'event_note', label: 'Mes Rendez-vous', route: '/medecin/rendezvous' },
        { icon: 'calendar_month', label: 'Calendrier', route: '/medecin/calendrier' },
        { icon: 'groups', label: 'Mes Patients', route: '/medecin/patients' },
        { icon: 'folder_shared', label: 'Dossiers Médicaux', route: '/medecin/dossiers' },
        { icon: 'notifications', label: 'Notifications', route: '/medecin/notifications' }
      ];
      case 'PATIENT': return [
        { icon: 'dashboard', label: 'Mon Espace', route: '/patient/dashboard' },
        { icon: 'event_available', label: 'Mes Rendez-vous', route: '/patient/rendezvous' },
        { icon: 'add_circle', label: 'Prendre RDV', route: '/patient/prendre-rdv' },
        { icon: 'folder_open', label: 'Dossier Médical', route: '/patient/dossier' },
        { icon: 'local_hospital', label: 'Nos Médecins', route: '/patient/medecins' },
        { icon: 'notifications', label: 'Notifications', route: '/patient/notifications' }
      ];
      default: return [];
    }
  });

  get defaultRoute(): string {
    const items = this.navItems();
    return items.length > 0 ? items[0].route : '/';
  }

  roleLabel = computed(() => {
    switch (this.authService.userRole()) {
      case 'ADMIN': return 'Administration';
      case 'MEDECIN': return 'Espace Médecin';
      case 'PATIENT': return 'Espace Patient';
      default: return '';
    }
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl.set(event.urlAfterRedirects);
      if (this.isMobile && this.sidenav) {
        this.sidenav.close();
      }
    });

    effect(() => {
      const isLoggedIn = this.authService.isLoggedIn();
      if (isLoggedIn) {
        this.initWebSocketIfLoggedIn();
      } else {
        this.notificationService.closeWebSocket();
      }
    });
  }

  ngOnInit(): void {
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .subscribe(result => {
        this.isMobile = result.matches;
        this.sidenavOpened = !this.isMobile;
      });

    this.initWebSocketIfLoggedIn();
    this.notificationService.requestNotificationPermission();

    // Subscribe to notification counts
    this.notificationService.unreadCountPatient.subscribe(c => {
      if (this.authService.userRole() === 'PATIENT') this.unreadNotifCount = c;
    });
    this.notificationService.unreadCountMedecin.subscribe(c => {
      if (this.authService.userRole() === 'MEDECIN') this.unreadNotifCount = c;
    });
  }

  ngOnDestroy(): void {
    this.notificationService.closeWebSocket();
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  isActive(route: string): boolean {
    return this.currentUrl().startsWith(route);
  }

  toggleSidenav(): void {
    if (this.sidenav) {
      this.sidenav.toggle();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private initWebSocketIfLoggedIn(): void {
    const isLoggedIn = this.authService.isLoggedIn();
    const role = this.authService.userRole();
    
    if (isLoggedIn && (role === 'PATIENT' || role === 'MEDECIN')) {
      this.notificationService.initWebSocket();
      setTimeout(() => {
        this.notificationService.refreshNotifications();
      }, 1000);
    }
  }
}