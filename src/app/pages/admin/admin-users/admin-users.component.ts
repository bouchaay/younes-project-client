import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { take } from 'rxjs';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
  imports: [FormsModule, DatePipe, TitleCasePipe],
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  // Modale d'ajout d'employé
  showAddEmployeeModal = false;
  newEmployee: User = {
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'employee',
    status: 'actif',
    createdAt: new Date(),
    completedAppointments: 0,
    canceledAppointments: 0,
  };

  // **Filtres Clients**
  clientStatusFilter: string = 'all';
  clientSortBy: string = 'date';
  clientPage: number = 0;
  itemsPerPage: number = 7;

  // **Filtres Employés**
  employeeStatusFilter: string = 'all';
  employeeSortBy: string = 'date';
  employeePage: number = 0;

  // **Gestion de l'édition du statut**
  editingUserId: number | null | undefined = null;
  editedStatus: string = '';

  // pour changement de mdp
  editingPasswordUserId: number | null = null;
  newPassword: { [key: number]: string } = {};
  confirmPassword: { [key: number]: string } = {};

  showAddClientModal = false;
  newClient : User = {
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'client',
    status: 'actif',
    createdAt: new Date(),
    completedAppointments: 0,
    canceledAppointments: 0,
  };
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users.map((user) => ({
          ...user,
          createdAt: new Date(user.createdAt), // ✅ Convertir en `Date`
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs:', err);
        this.errorMessage = 'Impossible de charger les utilisateurs.';
        this.isLoading = false;
      },
    });
  }

  // **Filtrer et trier les clients**
  get filteredClients(): User[] {
    let filtered = this.users.filter((user) => user.role === 'client');

    if (this.clientStatusFilter !== 'all') {
      filtered = filtered.filter(
        (user) => user.status === this.clientStatusFilter
      );
    }

    if (this.clientSortBy === 'date') {
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (this.clientSortBy === 'appointments') {
      filtered.sort(
        (a, b) => b.completedAppointments - a.completedAppointments
      );
    }

    return filtered;
  }

  // **Pagination Clients**
  get paginatedClients(): User[] {
    const start = this.clientPage * this.itemsPerPage;
    return this.filteredClients.slice(start, start + this.itemsPerPage);
  }

  get totalClientPages(): number {
    return Math.ceil(this.filteredClients.length / this.itemsPerPage);
  }

  // **Filtrer et trier les employés**
  get filteredEmployees(): User[] {
    let filtered = this.users.filter((user) => user.role === 'employee');

    if (this.employeeStatusFilter !== 'all') {
      filtered = filtered.filter(
        (user) => user.status === this.employeeStatusFilter
      );
    }

    if (this.employeeSortBy === 'date') {
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (this.employeeSortBy === 'appointments') {
      filtered.sort(
        (a, b) => b.completedAppointments - a.completedAppointments
      );
    }

    return filtered;
  }

  // **Pagination Employés**
  get paginatedEmployees(): User[] {
    const start = this.employeePage * this.itemsPerPage;
    return this.filteredEmployees.slice(start, start + this.itemsPerPage);
  }

  get totalEmployeePages(): number {
    return Math.ceil(this.filteredEmployees.length / this.itemsPerPage);
  }

  // **Changer de page**
  prevPage(type: 'client' | 'employee') {
    if (type === 'client' && this.clientPage > 0) {
      this.clientPage--;
    } else if (type === 'employee' && this.employeePage > 0) {
      this.employeePage--;
    }
  }

  nextPage(type: 'client' | 'employee') {
    if (
      type === 'client' &&
      (this.clientPage + 1) * this.itemsPerPage < this.filteredClients.length
    ) {
      this.clientPage++;
    } else if (
      type === 'employee' &&
      (this.employeePage + 1) * this.itemsPerPage <
        this.filteredEmployees.length
    ) {
      this.employeePage++;
    }
  }

  // **Éditer le statut d'un utilisateur**
  editUser(user: User) {
    this.editingUserId = user.id;
    this.editedStatus = user.status;
  }

  // **Mettre à jour le statut d'un utilisateur**
  saveUserStatus(user: User) {
    user.status = this.editedStatus;
    this.userService
      .updateUserStatus(user)
      .pipe(take(1)) // Prend une seule valeur et ferme l'Observable
      .subscribe({
        next: () => {
          this.editingUserId = null;
          this.loadUsers(); // Recharger les utilisateurs après mise à jour
        },
        error: (error) =>
          console.error('Erreur lors de la mise à jour du statut:', error),
      });
  }

  // **Annuler l'édition**
  cancelEdit() {
    this.editingUserId = null;
  }

  deleteUser(userId: number | undefined) {
    if (userId != undefined) {
      const confirmation = confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.");
      
      if (!confirmation) {
        return; // Annuler la suppression si l'utilisateur clique sur "Annuler"
      }
  
      this.userService
        .deleteUser(userId)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.loadUsers(); // Recharger la liste après suppression
          },
          error: (error) => {
            console.error("Erreur lors de la suppression de l’utilisateur :", error);
            alert("Une erreur s'est produite lors de la suppression.");
          },
        });
    }
  }
  

  // **Ouvrir la modale d'ajout**
  openAddEmployeeModal() {
    this.showAddEmployeeModal = true;
    this.newEmployee = {
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'employee',
      status: 'actif',
      createdAt: new Date(),
      completedAppointments: 0,
      canceledAppointments: 0,
    };
  }

  // **Fermer la modale**
  closeAddEmployeeModal() {
    this.showAddEmployeeModal = false;
  }

  // **Ajouter un employé**
  addEmployee() {
    if (
      this.newEmployee.name &&
      this.newEmployee.email &&
      this.newEmployee.phone &&
      this.newEmployee.password
    ) {
      this.userService
        .addUser(this.newEmployee)
        .pipe(take(1)) // Prend une seule valeur et ferme l'Observable
        .subscribe({
          next: () => {
            this.closeAddEmployeeModal(); // Fermer le modal après ajout
            this.loadUsers(); // Recharger la liste des utilisateurs
          },
          error: (error) =>
            console.error('Erreur lors de l’ajout de l’employé:', error),
        });
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }

  // ✅ Activer/Désactiver le mode édition du mot de passe
  togglePasswordEdit(user: User) {
    if (user.id != undefined) {
      if (this.editingPasswordUserId === user.id) {
        this.editingPasswordUserId = null; // Fermer le formulaire si déjà ouvert
      } else {
        this.editingPasswordUserId = user.id; // Ouvrir le formulaire pour cet utilisateur
        this.newPassword[user.id] = '';
        this.confirmPassword[user.id] = '';
      }
    }
  }

  // ✅ Sauvegarder le mot de passe modifié
  changePassword(user: User) {
    if (user.id != undefined) {
      if (!this.newPassword[user.id] || !this.confirmPassword[user.id]) {
        alert('Veuillez remplir tous les champs.');
        return;
      }

      if (this.newPassword[user.id] !== this.confirmPassword[user.id]) {
        alert('Les mots de passe ne correspondent pas !');
        return;
      }

      if (this.newPassword[user.id].length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères !');
        return;
      }

      const confirmation = confirm("Êtes-vous sûr de vouloir chnager le mot de passe de cet utilisateur ? Cette action est irréversible.");
      
      if (!confirmation) {
        return; // Annuler la suppression si l'utilisateur clique sur "Annuler"
      }
      // Créer un objet utilisateur mis à jour avec le nouveau mot de passe
      const updatedUser: User = {
        ...user,
        password: this.newPassword[user.id],
      };

      this.userService
        .updateUser(updatedUser)
        .pipe(take(1))
        .subscribe({
          next: () => {
            alert('Mot de passe mis à jour avec succès !');
            this.editingPasswordUserId = null; // Fermer le formulaire après mise à jour
            this.loadUsers(); // Recharger la liste des utilisateurs
          },
          error: (error) => {
            console.error(
              'Erreur lors de la mise à jour du mot de passe :',
              error
            );
            alert('Erreur lors de la mise à jour du mot de passe.');
          },
        });
    }
  }

  // ✅ Annuler l'édition du mot de passe
  cancelPasswordEdit() {
    this.editingPasswordUserId = null;
  }

    // **Ouvrir la modale d'ajout**
    openAddClientModal() {
      this.showAddClientModal = true;
      this.newClient = {
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'client',
        status: 'actif',
        createdAt: new Date(),
        completedAppointments: 0,
        canceledAppointments: 0,
      };
    }
  
    // **Fermer la modale**
    closeAddClientModal() {
      this.showAddClientModal = false;
    }
  
    // **Ajouter un employé**
    addClient() {
      if (
        this.newClient.name &&
        this.newClient.email &&
        this.newClient.phone &&
        this.newClient.password
      ) {
        this.userService
          .addUser(this.newClient)
          .pipe(take(1)) // Prend une seule valeur et ferme l'Observable
          .subscribe({
            next: () => {
              this.closeAddClientModal(); // Fermer le modal après ajout
              this.loadUsers(); // Recharger la liste des utilisateurs
            },
            error: (error) =>
              console.error('Erreur lors de l’ajout du client:', error),
          });
      } else {
        alert('Veuillez remplir tous les champs obligatoires.');
      }
    }
}
