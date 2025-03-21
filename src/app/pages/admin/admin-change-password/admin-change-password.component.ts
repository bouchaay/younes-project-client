import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { take } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-admin-change-password',
  templateUrl: './admin-change-password.component.html',
  styleUrls: ['./admin-change-password.component.scss'],
  standalone: true,
  imports: [FormsModule]
})
export class AdminChangePasswordComponent implements OnInit {
  newPassword: string = '';
  confirmPassword: string = '';
  successMessage: string | null = null;
  errorMessage: string | null = null;
  users: User[] = [];
  adminUser?: User;

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().pipe(take(1)).subscribe({
      next: (users: User[]) => {
        this.users = users;
        const loggedInUser = this.authService.getUser();
        if (loggedInUser && loggedInUser.email) {
          this.adminUser = this.users.find(user => user.email === loggedInUser.email);
        }
        if (!this.adminUser) {
          this.errorMessage = "❌ Impossible de récupérer l'utilisateur.";
        }
      },
      error: () => {
        this.errorMessage = "❌ Erreur lors du chargement des utilisateurs.";
      }
    });
  }

  validatePassword(): void {
    if (this.newPassword.length > 0 && this.newPassword.length < 6) {
      this.errorMessage = '⚠️ Le mot de passe doit contenir au moins 6 caractères.';
    } else if (this.confirmPassword.length > 0 && this.confirmPassword !== this.newPassword) {
      this.errorMessage = '⚠️ Les mots de passe ne correspondent pas.';
    } else {
      this.errorMessage = null;
    }
  }

  isFormValid(): boolean {
    return (
      this.newPassword.length >= 6 &&
      this.confirmPassword.length >= 6 &&
      this.newPassword === this.confirmPassword
    );
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onChangePassword() {
    this.successMessage = null;
    this.errorMessage = null;

    if (!this.adminUser) {
      this.errorMessage = "❌ Utilisateur introuvable.";
      return;
    }

    if (!this.isFormValid()) {
      this.errorMessage = "❌ Veuillez corriger les erreurs avant de soumettre.";
      return;
    }

    const updatedUser = { ...this.adminUser, password: this.newPassword };

    this.userService.updateUser(updatedUser).pipe(take(1)).subscribe({
      next: () => {
        this.successMessage = '✅ Mot de passe mis à jour avec succès !';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: () => {
        this.errorMessage = '❌ Erreur lors du changement de mot de passe.';
      }
    });
  }
}
