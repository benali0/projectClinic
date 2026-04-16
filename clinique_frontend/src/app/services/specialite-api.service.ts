import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Specialite } from '../models/specialite.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class SpecialiteApiService {
  private readonly API_URL = API_CONFIG.baseUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Specialite[]> {
    return this.http.get<Specialite[]>(`${this.API_URL}/specialites`);
  }
}