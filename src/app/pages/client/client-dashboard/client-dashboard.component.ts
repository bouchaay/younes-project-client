import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Appointment } from '../../../models/appointment.model';
import { AppointmentService } from '../../../services/appointment.service';
import { UserService } from '../../../services/user.service';
import { take } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.scss'],
  imports: [FormsModule],
})
export class ClientDashboardComponent implements OnInit {
  appointments: Appointment[] = [];
  currentUser: string = 'Moi'; // Remplace par l'utilisateur authentifié
  availableServices = [
    'Coupe & Brushing',
    'Coloration',
    'Soin capillaire',
    'Extensions',
    'Brushing',
    'Soin profond',
  ];
  employees: { id: number | undefined; name: string }[] = [];
  showAppointmentModal = false;
  
  newAppointment: Appointment = {
    clientName: '',
    clientEmail: '',
    service: '',
    date: new Date(),
    dateCreation: new Date(),
    time: '',
    status: 'En attente',
    employeeName: '',
  };

  constructor(private appointmentService: AppointmentService, private userService: UserService, private authService: AuthService) {}

  ngOnInit(): void {
    this.getCurrentUser();
    this.loadAppointments();
    this.loadEmployees();
  }

  getCurrentUser() {
    const user = this.authService.getUser(); // 🔹 Récupérer l'utilisateur depuis AuthService
    if (user) {
      this.currentUser = user.name; // Remplacez par user.name si vous stockez le nom
    } else {
      console.warn('Aucun utilisateur connecté.');
    }
  }
  

  // ✅ Charger les rendez-vous du client connecté
  loadAppointments() {
    this.appointmentService.getAppointmentsByClient(this.currentUser).pipe(take(1)).subscribe({
      next: (appointments) => {
        this.appointments = appointments;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des rendez-vous :', err);
      },
    });
  }

  // ✅ Charger la liste des employés depuis UserService
  loadEmployees() {
    this.userService.getUsersByRole('employee').pipe(take(1)).subscribe({
      next: (employees) => {
        this.employees = employees.map((e) => ({ id: e.id, name: e.name }));
      },
      error: (err) => console.error('Erreur chargement employés:', err),
    });
  }

  // ✅ Rendez-vous à venir
  get upcomingAppointments() {
    return this.appointments.filter((a) => a.status === 'Confirmé').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // ✅ Rendez-vous en attente
  get pendingAppointments() {
    return this.appointments.filter((a) => a.status === 'En attente').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // ✅ Rendez-vous terminés
  get completedAppointments() {
    return this.appointments.filter((a) => a.status === 'Terminé').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  get canceledAppointments() {
    return this.appointments.filter((a) => a.status === 'Annulé').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

 // ✅ Annuler un rendez-vous (mise à jour complète de l'objet)
cancelAppointment(id: number | undefined) {
  if (id !== undefined && confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) {
    // Récupérer l'objet complet depuis la liste des rendez-vous
    const appointment = this.appointments.find(a => a.id === id);

    if (!appointment) {
      console.error('Rendez-vous introuvable.');
      return;
    }

    // Mettre à jour le statut à "Annulé"
    const updatedAppointment = { ...appointment, status: 'Annulé' };

    this.appointmentService
      .updateAppointment(updatedAppointment)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loadAppointments(); // Recharger la liste après mise à jour
          alert('🚫 Rendez-vous annulé avec succès.');
        },
        error: (err) => console.error('Erreur lors de l’annulation:', err),
      });
  }
}



  // ✅ Ouvrir le formulaire de prise de rendez-vous
  openAppointmentModal() {
    this.showAppointmentModal = true;
    this.newAppointment = {
      clientName: this.currentUser,
      service: '',
      date: new Date(),
      dateCreation: new Date(),
      time: '',
      status: 'En attente',
      employeeName: '',
    };
  }

  // ✅ Fermer la modale
  closeAppointmentModal() {
    this.showAppointmentModal = false;
  }

  // ✅ Prendre un rendez-vous
  bookAppointment() {
    if (!this.newAppointment.service || !this.newAppointment.date || !this.newAppointment.time || !this.newAppointment.employeeName) {
      alert('⚠️ Veuillez remplir tous les champs.');
      return;
    }

    this.newAppointment.dateCreation = new Date();
    this.newAppointment.clientEmail = this.authService.getUser()?.email;

    this.appointmentService.addAppointment(this.newAppointment).pipe(take(1)).subscribe({
      next: () => {
        this.closeAppointmentModal();
        this.loadAppointments();
        alert('📅 Rendez-vous ajouté avec succès !');
      },
      error: (err) => console.error('Erreur lors de la réservation:', err),
    });
  }
}
