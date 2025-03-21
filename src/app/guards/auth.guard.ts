import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['role']; // Rôle attendu depuis la route
    const user = this.authService.getUser(); // Récupérer l'utilisateur connecté

    if (!user) {
      this.router.navigate(['/login']); // Redirige si non connecté
      return false;
    }

    if (expectedRole && user.role !== expectedRole) {
      this.router.navigate(['/']); // Redirige si rôle incorrect
      return false;
    }

    return true;
  }
}
