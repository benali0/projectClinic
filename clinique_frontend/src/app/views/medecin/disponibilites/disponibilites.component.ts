// views/medecin/disponibilites/disponibilites.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Disponibilite, DisponibiliteRequest } from '../../../models/rendezvous.model';
import { RendezVousService } from '../../../services/rendezvous.service';

@Component({
  selector: 'app-disponibilites',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './disponibilites.component.html',
  styleUrls: ['./disponibilites.component.css']
})
export class DisponibilitesComponent implements OnInit {
  disponibilites: Disponibilite[] = [];
  loading = true;
  isLoading = false;
  errorMessage = '';
  
  dispoForm: FormGroup;
  
  joursSemaine = [
    { value: 'LUNDI', label: 'Lundi' },
    { value: 'MARDI', label: 'Mardi' },
    { value: 'MERCREDI', label: 'Mercredi' },
    { value: 'JEUDI', label: 'Jeudi' },
    { value: 'VENDREDI', label: 'Vendredi' },
    { value: 'SAMEDI', label: 'Samedi' },
    { value: 'DIMANCHE', label: 'Dimanche' }
  ];

  constructor(
    private fb: FormBuilder,
    private rdvService: RendezVousService,
    private authService: AuthService
  ) {
    this.dispoForm = this.fb.group({
      jourSemaine: ['', Validators.required],
      heureDebut: ['08:00', Validators.required],
      heureFin: ['18:00', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDisponibilites();
  }

  loadDisponibilites(): void {
    const medecinId = this.getMedecinId();
    if (!medecinId) return;

    this.rdvService.getDisponibilites(medecinId).subscribe({
      next: (data: Disponibilite[]) => { // 🔥 Typer ici
        this.disponibilites = data;
        this.loading = false;
      },
      error: (err: any) => { // 🔥 Typer ici
        this.loading = false;
        this.errorMessage = 'Erreur lors du chargement';
      }
    });
  }

  ajouterDisponibilite(): void {
    if (this.dispoForm.invalid) {
      this.dispoForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const medecinId = this.getMedecinId();
    if (!medecinId) return;

    const request: DisponibiliteRequest = {
      medecinId,
      ...this.dispoForm.value
    };

    this.rdvService.addDisponibilite(request).subscribe({
      next: () => {
        this.isLoading = false;
        this.dispoForm.reset({ heureDebut: '08:00', heureFin: '18:00' });
        this.loadDisponibilites();
      },
      error: (err: any) => { // 🔥 Typer ici
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de l\'ajout';
      }
    });
  }

  supprimerDisponibilite(id: number): void {
    if (!confirm('Supprimer cette disponibilité ?')) return;

    this.rdvService.deleteDisponibilite(id).subscribe({
      next: () => this.loadDisponibilites(),
      error: () => alert('Erreur lors de la suppression')
    });
  }

  private getMedecinId(): number | null {
    const user = this.authService.currentUser();
    return user?.userId || null;
  }
}