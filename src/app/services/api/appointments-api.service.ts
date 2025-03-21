import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment } from '../../models/appointment.model';

@Injectable({
  providedIn: 'root',
})
export class AppointmentApiService {
  private apiUrl = `${environment.apiUrl}/appointments`; // URL du backend

  constructor(private http: HttpClient) {}

  // 🔹 Récupérer tous les rendez-vous
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/all`);
  }

  // 🔹 Récupérer un rendez-vous par ID
  getAppointmentById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`);
  }

  // 🔹 Ajouter un rendez-vous
  addAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/add`, appointment);
  }

  // 🔹 Mettre à jour un rendez-vous
  updateAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.put<Appointment>(
      `${this.apiUrl}/update/${appointment.id}`,
      appointment
    );
  }

  // 🔹 Mettre à jour le statut d'un rendez-vous
  updateAppointmentStatus(id: number, status: string): Observable<Appointment> {
    return this.http.patch<Appointment>(
      `${this.apiUrl}/update/${id}/status`,
      status
    );
  }

  // 🔹 Supprimer un rendez-vous
  deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  // 🔹 Filtrer par statut
  getAppointmentsByStatus(status: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/status/${status}`);
  }

  // 🔹 Filtrer par employé
  getAppointmentsByEmployee(employeeName: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(
      `${this.apiUrl}/employee/${employeeName}`
    );
  }

  // 🔹 Filtrer par plage de dates
  getAppointmentsByDateRange(
    startDate: string,
    endDate: string
  ): Observable<Appointment[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<Appointment[]>(`${this.apiUrl}/date-range`, {
      params,
    });
  }

  // 🔹 Récupérer les rendez-vous d'un client spécifique
getAppointmentsByClient(clientName: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/client/${clientName}`);
  }
  
}
