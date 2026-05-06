import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'pets',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/pets/pets.module').then(m => m.PetsModule)
  },
  {
    path: 'appointments',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/appointments/appointments.module').then(m => m.AppointmentsModule)
  },
  {
    path: 'rescue',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/rescue/rescue.module').then(m => m.RescueModule)
  },
  {
    path: 'adoption',
    loadChildren: () => import('./features/adoption/adoption.module').then(m => m.AdoptionModule)
  },
  {
    path: 'ngo',
    canActivate: [AuthGuard],
    data: { roles: ['NGO'] },
    loadChildren: () => import('./features/ngo/ngo.module').then(m => m.NgoModule)
  },
  {
    path: 'hospital',
    canActivate: [AuthGuard],
    data: { roles: ['HOSPITAL'] },
    loadChildren: () => import('./features/hospital/hospital.module').then(m => m.HospitalModule)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
