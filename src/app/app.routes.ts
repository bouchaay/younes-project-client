import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ServicesComponent } from './pages/services/services.component';
import { TeamComponent } from './pages/team/team.component';
import { ContactComponent } from './pages/contact/contact.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

// Espaces utilisateurs
import { EmployeeDashboardComponent } from './pages/employee/employee-dashboard/employee-dashboard.component';
import { ClientDashboardComponent } from './pages/client/client-dashboard/client-dashboard.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';

// Espaces Admin (sous-sections)
import { AdminUsersComponent } from './pages/admin/admin-users/admin-users.component';
import { AdminAppointmentsComponent } from './pages/admin/admin-appointments/admin-appointments.component';

import { AuthGuard } from './guards/auth.guard';
import { AdminChangePasswordComponent } from './pages/admin/admin-change-password/admin-change-password.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'team', component: TeamComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Espaces sécurisés avec rôle
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard], data: { role: 'admin' }, children: [
      { path: 'users', component: AdminUsersComponent },
      { path: 'appointments', component: AdminAppointmentsComponent },
      { path: 'change-password', component: AdminChangePasswordComponent },
      { path: '', redirectTo: 'users', pathMatch: 'full' } // Rediriger par défaut vers users
  ]},
  { path: 'employee', component: EmployeeDashboardComponent, canActivate: [AuthGuard], data: { role: 'employee' } },
  { path: 'client', component: ClientDashboardComponent, canActivate: [AuthGuard], data: { role: 'client' } },

  { path: '**', redirectTo: '', pathMatch: 'full' } // Redirection si route inconnue
];
