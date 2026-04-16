import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors 
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SpecialiteApiService } from '../../../services/specialite-api.service';
import { CreateMedecinRequest } from '../../../models/user.model';
import { Specialite } from '../../../models/specialite.model';

@Component({
  selector: 'app-create-medecin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-medecin.component.html',
  styleUrls: ['./create-medecin.component.css']
})
export class CreateMedecinComponent implements OnInit {
  medecinForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  loadingSpecialites = false;

  specialites: Specialite[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private specialiteService: SpecialiteApiService,
    private router: Router
  ) {
    this.medecinForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      tel: ['', [Validators.pattern(/^[0-9]{8}$/)]],
      specialiteId: [null, Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadSpecialites();
  }

  loadSpecialites(): void {
    this.loadingSpecialites = true;
    this.specialiteService.getAll().subscribe({
      next: (data) => {
        this.specialites = data;
        this.loadingSpecialites = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des spécialités';
        this.loadingSpecialites = false;
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.medecinForm.invalid) {
      this.markAllAsTouched();
      this.errorMessage = 'Veuillez corriger les erreurs du formulaire.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { confirmPassword, ...formData } = this.medecinForm.value;

    // Construire la requête avec specialiteId
    const data: CreateMedecinRequest = {
      email: formData.email,
      password: formData.password,
      nom: formData.nom,
      prenom: formData.prenom,
      tel: formData.tel,
      specialiteId: formData.specialiteId
    };

    this.authService.createMedecin(data).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.success) {
          this.successMessage = `Dr. ${data.prenom} ${data.nom} créé avec succès ! Redirection...`;
          this.medecinForm.reset();
          
          // ✅ REDIRECTION VERS L'INTERFACE MEDECIN
          setTimeout(() => {
            this.router.navigate(['/medecin/dashboard']);
          }, 1500);
        } else {
          this.errorMessage = response.message || 'Erreur lors de la création.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la création du médecin.';
        console.error(err);
      }
    });
  }

  private markAllAsTouched(): void {
    Object.values(this.medecinForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}