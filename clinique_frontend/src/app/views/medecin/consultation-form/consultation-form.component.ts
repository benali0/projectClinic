import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RendezVousService } from '../../../services/rendezvous.service';
import { AuthService } from '../../../services/auth.service';
import { Consultation } from '../../../models/rendezvous.model';

@Component({
  selector: 'app-consultation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './consultation-form.component.html',
  styleUrls: ['./consultation-form.component.css']
})
export class ConsultationFormComponent implements OnInit {
  consultationForm: FormGroup;
  loading = false;
  saving = false;
  currentUserId: number | null = null;
  
  // Données du rendez-vous
  rdvId: number | null = null;
  patientId: number | null = null;
  patientNom = '';
  patientPrenom = '';
  rdvDate = '';
  rdvHeure = '';
  rdvMotif = '';
  
  // Montants calculés
  montantTotal = 0;
  
  // Étapes du wizard
  currentStep = 1;
  totalSteps = 3;
  
  // Consultation créée (après sauvegarde)
  consultationCreee: any = null;

  constructor(
    private fb: FormBuilder,
    private rdvService: RendezVousService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.consultationForm = this.fb.group({
      // Étape 1: Consultation
      diagnostic: ['', [Validators.required, Validators.minLength(10)]],
      ordonnance: [''],
      traitement: [''],
      notes: [''],
      
      // Étape 2: Facturation
      prixConsultation: [0, [Validators.required, Validators.min(0)]],
      montantMedicaments: [0, [Validators.min(0)]],
      
      // Étape 3: Paiement
      statutPaiement: ['EN_ATTENTE', Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getMedecinId();
    
    // Récupérer les paramètres de la route
    this.route.queryParams.subscribe(params => {
      this.rdvId = Number(params['rdvId']) || null;
      this.patientId = Number(params['patientId']) || null;
      this.patientNom = params['patientNom'] || '';
      this.patientPrenom = params['patientPrenom'] || '';
      this.rdvDate = params['date'] || '';
      this.rdvHeure = params['heure'] || '';
      this.rdvMotif = params['motif'] || '';
      
      if (!this.rdvId || !this.patientId) {
        alert('Erreur: Informations du rendez-vous manquantes');
        this.router.navigate(['/medecin/rendez-vous']);
      }
    });
    
    // Calculer le total automatiquement
    this.consultationForm.valueChanges.subscribe(values => {
      this.montantTotal = (values.prixConsultation || 0) + (values.montantMedicaments || 0);
    });
  }

  // ============ NAVIGATION WIZARD ============

  nextStep(): void {
    if (this.currentStep === 1 && this.isStep1Valid()) {
      this.currentStep++;
    } else if (this.currentStep === 2 && this.isStep2Valid()) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isStep1Valid(): boolean {
    return this.consultationForm.get('diagnostic')?.valid || false;
  }

  isStep2Valid(): boolean {
    return this.consultationForm.get('prixConsultation')?.valid || false;
  }

  // ============ SAUVEGARDE ============

  saveConsultation(): void {
    if (!this.rdvId || !this.currentUserId) return;
    
    this.saving = true;
    
    const consultationData: Partial<Consultation> = {
      diagnostic: this.consultationForm.value.diagnostic,
      ordonnance: this.consultationForm.value.ordonnance,
      traitement: this.consultationForm.value.traitement,
      notes: this.consultationForm.value.notes,
      prixConsultation: this.consultationForm.value.prixConsultation,
      montantMedicaments: this.consultationForm.value.montantMedicaments,
      statutPaiement: this.consultationForm.value.statutPaiement
    };
    
    this.rdvService.createConsultation(this.rdvId, consultationData).subscribe({
      next: (consultation) => {
        this.consultationCreee = consultation;
        this.saving = false;
        this.currentStep = 4; // Étape de succès
        
        // Notification de succès
        console.log('✅ Consultation créée:', consultation);
      },
      error: (err) => {
        this.saving = false;
        alert('Erreur lors de la création: ' + (err.error?.message || err.message));
      }
    });
  }

  // ============ NAVIGATION ============

  voirDossierMedical(): void {
    this.router.navigate(['/medecin/dossiers'], {
      queryParams: {
        patientId: this.patientId,
        patientNom: `${this.patientPrenom} ${this.patientNom}`
      }
    });
  }

  voirFacture(): void {
    if (this.consultationCreee?.id) {
      this.router.navigate(['/medecin/facture', this.consultationCreee.id]);
    }
  }

  retourListeRdv(): void {
    this.router.navigate(['/medecin/rendez-vous']);
  }

  nouveauRdv(): void {
    this.router.navigate(['/medecin/rendez-vous']);
  }

  // ============ HELPERS ============

  getProgressWidth(): string {
    return `${(this.currentStep / this.totalSteps) * 100}%`;
  }

  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant);
  }
}