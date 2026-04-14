import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RendezVousService } from '../../../services/rendezvous.service';
import { AuthService } from '../../../services/auth.service';
import { RendezVous } from '../../../models/rendezvous.model';

@Component({
  selector: 'app-rendezvous-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rendezvous-list.component.html',
  styleUrls: ['./rendezvous-list.component.css']
})
export class RendezvousListComponent implements OnInit {
  rendezVous: RendezVous[] = [];
  filteredRendezVous: RendezVous[] = [];
  loading = false;
  currentUserId: number | null = null;
  filterStatut: string = '';
  today = new Date();
  
  stats = {
    enAttente: 0,
    confirmes: 0,
    termines: 0,
    annules: 0,
    nonVenus: 0,
    total: 0
  };
  
  showModal = false;
  modalType: 'confirm' | 'cancel' | 'done' | 'noShow' | null = null;
  selectedRdv: RendezVous | null = null;

  constructor(
    private rdvService: RendezVousService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getMedecinId();
    this.loadRendezVous();
  }

  loadRendezVous(): void {
    if (!this.currentUserId) return;
    
    this.loading = true;
    this.rdvService.getRendezVousByMedecin(this.currentUserId).subscribe({
      next: (rdvs) => {
        this.rendezVous = rdvs.sort((a, b) => {
          const dateA = new Date(a.date + 'T' + a.heure);
          const dateB = new Date(b.date + 'T' + b.heure);
          return dateB.getTime() - dateA.getTime();
        });
        
        this.calculateStats();
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement RDV:', err);
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats = {
      enAttente: this.countByStatus('EN_ATTENTE'),
      confirmes: this.countByStatus('CONFIRME'),
      termines: this.countByStatus('TERMINE'),
      annules: this.countByStatus('ANNULE'),
      nonVenus: this.countByStatus('NON_VENU'),
      total: this.rendezVous.length
    };
  }

  countByStatus(status: string): number {
    return this.rendezVous.filter(r => r.statut === status).length;
  }

  applyFilter(): void {
    if (this.filterStatut) {
      this.filteredRendezVous = this.rendezVous.filter(r => r.statut === this.filterStatut);
    } else {
      this.filteredRendezVous = this.rendezVous;
    }
  }

  // ============ LOGIQUE METIER ============

  isDatePassee(rdv: RendezVous): boolean {
    const rdvDateTime = new Date(rdv.date + 'T' + rdv.heure);
    return rdvDateTime < new Date();
  }

  isToday(dateStr: string): boolean {
    const rdvDate = new Date(dateStr);
    return rdvDate.toDateString() === this.today.toDateString();
  }

  canConfirmer(rdv: RendezVous): boolean {
    return rdv.statut === 'EN_ATTENTE';
  }

  canAnnuler(rdv: RendezVous): boolean {
    return rdv.statut === 'EN_ATTENTE';
  }

  canTerminer(rdv: RendezVous): boolean {
    // Date dépassée ET statut confirmé
    return rdv.statut === 'CONFIRME' && this.isDatePassee(rdv);
  }

  canMarquerNonVenu(rdv: RendezVous): boolean {
    // Date dépassée ET statut confirmé
    return rdv.statut === 'CONFIRME' && this.isDatePassee(rdv);
  }

  hasConsultation(rdv: RendezVous): boolean {
    return rdv.statut === 'TERMINE';
  }

  // ============ MODALES ============

  openModal(type: 'confirm' | 'cancel' | 'done' | 'noShow', rdv: RendezVous): void {
    this.modalType = type;
    this.selectedRdv = rdv;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.modalType = null;
    this.selectedRdv = null;
  }

  confirmAction(): void {
    if (!this.selectedRdv || !this.currentUserId) return;

    switch (this.modalType) {
      case 'confirm':
        this.confirmerRdv();
        break;
      case 'cancel':
        this.annulerRdv();
        break;
      case 'done':
        this.terminerRdv();
        break;
      case 'noShow':
        this.marquerNonVenu();
        break;
    }
  }

  // ============ ACTIONS ============

  private confirmerRdv(): void {
    this.rdvService.updateStatus(this.selectedRdv!.id, 'CONFIRME', this.currentUserId!).subscribe({
      next: (updated) => {
        this.selectedRdv!.statut = updated.statut;
        this.updateView();
        this.closeModal();
      },
      error: (err) => {
        alert('Erreur: ' + (err.error?.message || err.message));
        this.closeModal();
      }
    });
  }

  private annulerRdv(): void {
    this.rdvService.updateStatus(this.selectedRdv!.id, 'ANNULE', this.currentUserId!).subscribe({
      next: (updated) => {
        this.selectedRdv!.statut = updated.statut;
        this.updateView();
        this.closeModal();
      },
      error: (err) => {
        alert('Erreur: ' + (err.error?.message || err.message));
        this.closeModal();
      }
    });
  }

  private terminerRdv(): void {
    // 1. Mettre à jour le statut
    this.rdvService.updateStatus(this.selectedRdv!.id, 'TERMINE', this.currentUserId!).subscribe({
      next: (updated) => {
        this.selectedRdv!.statut = updated.statut;
        this.updateView();
        this.closeModal();
        
        // 2. Créer consultation et rediriger
        this.creerConsultationEtRediriger();
      },
      error: (err) => {
        alert('Erreur: ' + (err.error?.message || err.message));
        this.closeModal();
      }
    });
  }

  private marquerNonVenu(): void {
    this.rdvService.updateStatus(this.selectedRdv!.id, 'NON_VENU', this.currentUserId!).subscribe({
      next: (updated) => {
        this.selectedRdv!.statut = updated.statut;
        this.updateView();
        this.closeModal();
      },
      error: (err) => {
        alert('Erreur: ' + (err.error?.message || err.message));
        this.closeModal();
      }
    });
  }

  private updateView(): void {
    this.calculateStats();
    this.applyFilter();
  }

  private creerConsultationEtRediriger(): void {
    // Redirection vers le formulaire de consultation
    this.router.navigate(['/medecin/consultation/new'], {
      queryParams: {
        patientId: this.selectedRdv!.patientId,
        rdvId: this.selectedRdv!.id,
        patientNom: this.selectedRdv!.patientNom,
        patientPrenom: this.selectedRdv!.patientPrenom,
        date: this.selectedRdv!.date,
        heure: this.selectedRdv!.heure,
        motif: this.selectedRdv!.motif
      }
    });
  }

  // ============ NAVIGATION ============

  voirConsultation(rdv: RendezVous): void {
    this.rdvService.getConsultationByRendezVous(rdv.id).subscribe({
      next: (consultation) => {
        this.router.navigate(['/medecin/consultation', consultation.id]);
      },
      error: () => {
        // Si pas de consultation existante, créer nouvelle
        this.router.navigate(['/medecin/consultation/new'], {
          queryParams: {
            patientId: rdv.patientId,
            rdvId: rdv.id
          }
        });
      }
    });
  }

  voirDossierMedical(rdv: RendezVous): void {
    this.router.navigate(['/medecin/dossiers'], {
      queryParams: {
        patientId: rdv.patientId
      }
    });
  }

  // ============ HELPERS ============

  getStatusClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'CONFIRME': 'success',
      'EN_ATTENTE': 'warning',
      'ANNULE': 'danger',
      'TERMINE': 'primary',
      'NON_VENU': 'secondary'
    };
    return classes[statut] || 'secondary';
  }

  getStatusIcon(statut: string): string {
    const icons: { [key: string]: string } = {
      'CONFIRME': 'bi-check-circle-fill',
      'EN_ATTENTE': 'bi-hourglass-split',
      'ANNULE': 'bi-x-circle-fill',
      'TERMINE': 'bi-check-all',
      'NON_VENU': 'bi-person-x-fill'
    };
    return icons[statut] || 'bi-circle';
  }

  getStatusLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'CONFIRME': 'Confirmé',
      'EN_ATTENTE': 'En attente',
      'ANNULE': 'Annulé',
      'TERMINE': 'Terminé',
      'NON_VENU': 'Non venu'
    };
    return labels[statut] || statut;
  }

  getRowClass(rdv: RendezVous): string {
    if (rdv.statut === 'ANNULE') return 'table-secondary opacity-50';
    if (rdv.statut === 'TERMINE') return 'table-primary bg-opacity-25';
    if (rdv.statut === 'NON_VENU') return 'table-dark bg-opacity-10';
    if (this.isToday(rdv.date)) return 'table-warning';
    if (this.isDatePassee(rdv) && rdv.statut === 'CONFIRME') return 'table-danger';
    return '';
  }

  getModalTitle(): string {
    const titles: { [key: string]: string } = {
      'confirm': 'Confirmer le rendez-vous',
      'cancel': 'Annuler le rendez-vous',
      'done': 'Terminer la consultation',
      'noShow': 'Patient non venu'
    };
    return titles[this.modalType || ''] || 'Confirmation';
  }

  getModalIcon(): string {
    const icons: { [key: string]: string } = {
      'confirm': 'bi-check-circle',
      'cancel': 'bi-x-circle',
      'done': 'bi-file-medical',
      'noShow': 'bi-person-x'
    };
    return icons[this.modalType || ''] || 'bi-question-circle';
  }

  getModalColor(): string {
    const colors: { [key: string]: string } = {
      'confirm': 'success',
      'cancel': 'danger',
      'done': 'primary',
      'noShow': 'secondary'
    };
    return colors[this.modalType || ''] || 'primary';
  }

  getModalMessage(): string {
    if (!this.selectedRdv) return '';
    
    const patient = `${this.selectedRdv.patientPrenom} ${this.selectedRdv.patientNom}`;
    const dateHeure = `${this.formatDate(this.selectedRdv.date)} à ${this.selectedRdv.heure}`;
    
    switch (this.modalType) {
      case 'confirm':
        return `Confirmer le rendez-vous de <strong>${patient}</strong> prévu le <strong>${dateHeure}</strong> ?`;
      case 'cancel':
        return `Annuler le rendez-vous de <strong>${patient}</strong> prévu le <strong>${dateHeure}</strong> ?<br><span class="text-danger small">Le patient sera notifié.</span>`;
      case 'done':
        return `Le patient <strong>${patient}</strong> est venu à son rendez-vous du <strong>${dateHeure}</strong>.<br><br>La consultation va être créée et vous allez accéder au formulaire de saisie.`;
      case 'noShow':
        return `Confirmer que <strong>${patient}</strong> n'est pas venu à son rendez-vous du <strong>${dateHeure}</strong> ?`;
      default:
        return '';
    }
  }

  getConfirmButtonText(): string {
    const texts: { [key: string]: string } = {
      'confirm': 'Confirmer',
      'cancel': 'Annuler',
      'done': 'Terminer & Créer consultation',
      'noShow': 'Marquer non venu'
    };
    return texts[this.modalType || ''] || 'Confirmer';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getInitials(prenom: string, nom: string): string {
    return (prenom?.charAt(0) || '') + (nom?.charAt(0) || '');
  }
}