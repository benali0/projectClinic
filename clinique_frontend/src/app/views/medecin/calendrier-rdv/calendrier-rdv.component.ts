import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RendezVousService } from '../../../services/rendezvous.service';
import { AuthService } from '../../../services/auth.service';
import { RendezVous, CalendarEvent } from '../../../models/rendezvous.model';

@Component({
  selector: 'app-calendrier-rdv',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendrier-rdv.component.html',
  styleUrls: ['./calendrier-rdv.component.css']
})
export class CalendrierRdvComponent implements OnInit {
  
  rendezVous: RendezVous[] = [];
  selectedDate: Date = new Date();
  currentMonth: Date = new Date();
  weekDays: string[] = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  calendarDays: Date[] = [];
  loading = false;
  currentUserId: number | null = null;
  selectedRdv: RendezVous | null = null;

  constructor(
    private rdvService: RendezVousService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.generateCalendar();
    this.loadRendezVous();
  }

  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    this.calendarDays = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      this.calendarDays.push(date);
    }
  }

  loadRendezVous(): void {
    if (!this.currentUserId) return;
    
    this.loading = true;
    const dateStr = this.formatDate(this.selectedDate);
    
    this.rdvService.getRendezVousDuJour(this.currentUserId, dateStr).subscribe({
      next: (rdvs: RendezVous[]) => {
        this.rendezVous = rdvs.sort((a, b) => a.heure.localeCompare(b.heure));
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement RDV:', err);
        this.loading = false;
      }
    });
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    this.loadRendezVous();
  }

  previousMonth(): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.generateCalendar();
  }

  hasRdv(date: Date): boolean {
    const dateStr = this.formatDate(date);
    return this.rendezVous.some(rdv => rdv.date === dateStr);
  }

  getRdvCount(date: Date): number {
    const dateStr = this.formatDate(date);
    return this.rendezVous.filter(rdv => rdv.date === dateStr).length;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isSelected(date: Date): boolean {
    return date.toDateString() === this.selectedDate.toDateString();
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth.getMonth();
  }



confirmRdv(rdv: RendezVous): void {
  const medecinId = this.authService.getCurrentUserId();
  if (!medecinId) return;
  
  this.rdvService.updateStatus(rdv.id, 'CONFIRME', medecinId).subscribe({
    next: (updated) => { 
      rdv.statut = updated.statut;
      // 🔄 Recharger la liste pour voir le changement
      this.loadRendezVous();
    },
    error: (err) => {
      console.error('Erreur confirmation:', err);
      alert('Erreur lors de la confirmation du rendez-vous');
    }
  });
}

cancelRdv(rdv: RendezVous): void {
  const medecinId = this.authService.getCurrentUserId();
  if (!medecinId) return;
  
  this.rdvService.updateStatus(rdv.id, 'ANNULE', medecinId).subscribe({
    next: (updated) => { 
      rdv.statut = updated.statut;
      // 🔄 Recharger la liste
      this.loadRendezVous();
    },
    error: (err) => {
      console.error('Erreur annulation:', err);
      alert('Erreur lors de l\'annulation du rendez-vous');
    }
  });
}

  completeRdv(rdv: RendezVous): void {
    this.selectedRdv = rdv;
    // Redirection vers la création de consultation
    this.router.navigate(['/medecin/dossiers'], { 
      queryParams: { 
        patientId: rdv.patientId,
        rdvId: rdv.id,
        action: 'consultation'
      }
    });
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'CONFIRME': return 'bg-primary';
      case 'EN_ATTENTE': return 'bg-warning';
      case 'ANNULE': return 'bg-danger';
      case 'TERMINE': return 'bg-secondary';
      default: return 'bg-info';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'CONFIRME': return 'Confirmé';
      case 'EN_ATTENTE': return 'En attente';
      case 'ANNULE': return 'Annulé';
      case 'TERMINE': return 'Terminé';
      default: return statut;
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
