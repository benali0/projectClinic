// views/patient/mon-dossier/mon-dossier.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { RendezVousService } from '../../../services/rendezvous.service';
import { Consultation, FactureResponse } from '../../../models/rendezvous.model';

@Component({
  selector: 'app-mon-dossier',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-4">
      <h2 class="mb-4 text-primary">
        <i class="bi bi-folder-medical me-2"></i>Mon Dossier Médical
      </h2>

      <!-- Informations personnelles -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0"><i class="bi bi-person me-2"></i>Informations personnelles</h5>
        </div>
        <div class="card-body">
          @if (user) {
            <div class="row g-3">
              <div class="col-md-6">
                <label class="text-muted small">Nom</label>
                <p class="fw-bold">{{ user.nom }}</p>
              </div>
              <div class="col-md-6">
                <label class="text-muted small">Prénom</label>
                <p class="fw-bold">{{ user.prenom }}</p>
              </div>
              <div class="col-md-6">
                <label class="text-muted small">Email</label>
                <p class="fw-bold">{{ user.email }}</p>
              </div>
              <div class="col-md-6">
                <label class="text-muted small">Téléphone</label>
                <p class="fw-bold">{{ user.tel || 'Non renseigné' }}</p>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Historique médical -->
      <div class="card border-0 shadow-sm mb-4" *ngIf="consultations.length > 0">
        <div class="card-header bg-info text-white">
          <h5 class="mb-0"><i class="bi bi-clipboard-pulse me-2"></i>Historique des consultations</h5>
        </div>
        <div class="card-body">
          <div class="timeline">
            <div 
              *ngFor="let consultation of consultations" 
              class="border-start border-4 border-secondary ps-3 pb-4 mb-3">
              
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <span class="badge bg-secondary">
                    {{ consultation.dateConsultation | date:'dd/MM/yyyy' }}
                  </span>
                  <h6 class="mt-2 mb-1">
                    Dr. {{ consultation.medecinPrenom }} {{ consultation.medecinNom }}
                    <span class="badge bg-light text-dark ms-2">{{ consultation.medecinSpecialite }}</span>
                  </h6>
                  <p class="mb-1"><strong>Diagnostic:</strong> {{ consultation.diagnostic }}</p>
                  <p class="mb-1" *ngIf="consultation.traitement">
                    <strong>Traitement:</strong> {{ consultation.traitement }}
                  </p>
                  <p class="mb-1" *ngIf="consultation.ordonnance">
                    <strong>Ordonnance:</strong> {{ consultation.ordonnance }}
                  </p>
                  <p class="mb-0 text-muted">
                    <i class="bi bi-cash me-1"></i>
                    {{ consultation.montantTotal }} DHS 
                    <span class="badge ms-2" [class]="'bg-' + (consultation.statutPaiement === 'PAYE' ? 'success' : 'warning')">
                      {{ consultation.statutPaiement === 'PAYE' ? 'Payé' : 'En attente' }}
                    </span>
                  </p>
                </div>
                <button 
                  class="btn btn-sm btn-outline-primary"
                  (click)="payerFacture(consultation)"
                  *ngIf="consultation.statutPaiement === 'EN_ATTENTE'">
                  <i class="bi bi-credit-card me-1"></i>Payer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message si vide -->
      <div class="alert alert-info" *ngIf="consultations.length === 0 && !loading">
        <i class="bi bi-info-circle me-2"></i>
        Vous n'avez pas encore de consultations enregistrées.
      </div>

      <!-- Loading -->
      <div class="text-center py-5" *ngIf="loading">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2 text-muted">Chargement de votre dossier...</p>
      </div>
    </div>
  `
})
export class MonDossierComponent implements OnInit {
  user: any = null;
  consultations: Consultation[] = [];
  loading = false;

  constructor(
    private authService: AuthService,
    private rdvService: RendezVousService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUser();
    this.loadConsultations();
  }

  loadConsultations(): void {
    const patientId = this.authService.getPatientId();
    if (!patientId) {
      console.error('❌ Patient ID non disponible');
      return;
    }

    this.loading = true;
    this.rdvService.getConsultationsByPatient(patientId).subscribe({
      next: (consultations) => {
        this.consultations = consultations.sort((a, b) => 
          new Date(b.dateConsultation || 0).getTime() - new Date(a.dateConsultation || 0).getTime()
        );
        this.loading = false;
        console.log('✅ Consultations chargées:', this.consultations.length);
      },
      error: (err) => {
        console.error('❌ Erreur chargement consultations:', err);
        this.loading = false;
      }
    });
  }

  payerFacture(consultation: Consultation): void {
    if (!confirm(`Confirmer le paiement de ${consultation.montantTotal} DHS ?`)) return;
    
    this.rdvService.updateStatutPaiement(consultation.id, 'PAYE').subscribe({
      next: (facture) => {
        consultation.statutPaiement = 'PAYE';
        alert('Paiement effectué avec succès ! Vous pouvez maintenant télécharger votre facture PDF.');
        
        // Proposer le téléchargement du PDF
        if (confirm('Télécharger la facture PDF ?')) {
          this.telechargerFacture(consultation.id);
        }
      },
      error: (err) => {
        console.error('❌ Erreur paiement:', err);
        alert('Erreur lors du paiement');
      }
    });
  }

  telechargerFacture(consultationId: number): void {
    this.rdvService.genererFacturePDF(consultationId).subscribe({
      next: (facture) => {
        // Simulation téléchargement - dans la vraie vie, utiliser un blob
        console.log('📄 Facture PDF générée:', facture);
        alert(`Facture N° ${facture.numeroFacture} prête au téléchargement`);
      },
      error: (err) => {
        console.error('❌ Erreur génération PDF:', err);
        alert('Erreur lors de la génération du PDF');
      }
    });
  }
}
