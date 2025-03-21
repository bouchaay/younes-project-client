import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [ReactiveFormsModule]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.loading = false;
        const user = this.authService.getUser();

        if (!user) {
          this.errorMessage = 'Erreur de connexion, utilisateur introuvable.';
          return;
        }

        // 🔹 Redirection selon le rôle
        switch (user.role) {
          case 'admin':
            this.router.navigate(['/admin']);
            break;
          case 'employee':
            this.router.navigate(['/employee']);
            break;
          default:
            this.router.navigate(['/client']);
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Identifiants incorrects. Veuillez réessayer.';
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
