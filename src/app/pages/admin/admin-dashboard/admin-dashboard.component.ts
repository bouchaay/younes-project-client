import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  imports: [RouterModule] // ✅ Ajout de RouterModule pour permettre router-outlet
})
export class AdminDashboardComponent { }
