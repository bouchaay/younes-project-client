import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  newClient?: User;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{10,15}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordsMatch });
  }

  get f() {
    return this.registerForm.controls;
  }

  passwordsMatch(group: FormGroup) {
    return group.get('password')!.value === group.get('confirmPassword')!.value
      ? null : { notMatching: true };
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }
  
    this.loading = true;
    this.errorMessage = null;
  
    const { firstName, lastName, email, phone, password } = this.registerForm.value;
    this.newClient = {
      name: firstName + " " + lastName,
      email: email,
      password: password,
      phone: phone,
      role: 'client',
      status: 'actif',
      createdAt: new Date(),
      completedAppointments: 0,
      canceledAppointments: 0,
    };
  
    this.authService.register(this.newClient).subscribe({
      next: () => {
        this.loading = false;
        alert('✅ Inscription réussie ! Vous pouvez maintenant vous connecter.');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.loading = false;
        console.error('❌ Erreur API:', error);
  
        // ✅ Vérification si l'utilisateur est bien créé malgré l'erreur
        if (error.status === 201 || error.status === 200) {
          alert('✅ Inscription réussie malgré une réponse inattendue. Vous pouvez maintenant vous connecter.');
          this.router.navigate(['/login']);
          return;
        }
  
        this.errorMessage = error.error?.message || '❌ Erreur lors de l’inscription, veuillez réessayer.';
      }
    });
  }
  

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
