export interface Medecin {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  tel?: string;
  specialite: string;
  specialiteId?: number;    // nouveau
  specialiteNom?: string;   // nouveau
}