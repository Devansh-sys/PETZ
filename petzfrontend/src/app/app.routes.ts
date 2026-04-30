import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home) },

  // Auth
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.Register) },
  { path: 'profile', loadComponent: () => import('./pages/profile/profile').then(m => m.Profile), canActivate: [authGuard] },

  // SOS emergency workflow
  {
    path: 'sos',
    children: [
      { path: '', redirectTo: 'auth', pathMatch: 'full' },
      { path: 'auth', loadComponent: () => import('./pages/sos-auth-phone/sos-auth-phone').then(m => m.SosAuthPhone) },
      { path: 'auth/otp', loadComponent: () => import('./pages/sos-auth-otp/sos-auth-otp').then(m => m.SosAuthOtp) },
      { path: 'auth/missed-call', loadComponent: () => import('./pages/sos-auth-missed-call/sos-auth-missed-call').then(m => m.SosAuthMissedCall) },
      { path: 'rate-limit', loadComponent: () => import('./pages/sos-rate-limit/sos-rate-limit').then(m => m.SosRateLimit) },
      { path: 'success', loadComponent: () => import('./pages/sos-success/sos-success').then(m => m.SosSuccess) },
      { path: 'report', loadComponent: () => import('./pages/sos-report/sos-report').then(m => m.SosReport), canActivate: [authGuard] },
      { path: 'report/:id/media', loadComponent: () => import('./pages/sos-report-media/sos-report-media').then(m => m.SosReportMedia), canActivate: [authGuard] },
      { path: 'report/:id/confirmed', loadComponent: () => import('./pages/sos-report-confirmed/sos-report-confirmed').then(m => m.SosReportConfirmed) },
      { path: 'report/:id/status', loadComponent: () => import('./pages/sos-status/sos-status').then(m => m.SosStatus) }
    ]
  },

  // Public hospital directory & booking
  { path: 'hospitals', loadComponent: () => import('./pages/hospitals/hospitals').then(m => m.Hospitals) },
  {
    path: 'book',
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/book-hospital/book-hospital').then(m => m.BookHospital) },
      { path: 'service', loadComponent: () => import('./pages/book-service/book-service').then(m => m.BookService) },
      { path: 'doctor', loadComponent: () => import('./pages/book-doctor/book-doctor').then(m => m.BookDoctor) },
      { path: 'slot', loadComponent: () => import('./pages/book-slot/book-slot').then(m => m.BookSlot) },
      { path: 'pet', loadComponent: () => import('./pages/book-pet/book-pet').then(m => m.BookPet) },
      { path: 'confirm', loadComponent: () => import('./pages/book-confirm/book-confirm').then(m => m.BookConfirm) }
    ]
  },

  // User history pages
  { path: 'my-reports', loadComponent: () => import('./pages/my-reports/my-reports').then(m => m.MyReports), canActivate: [authGuard] },
  { path: 'appointments', loadComponent: () => import('./pages/my-appointments/my-appointments').then(m => m.MyAppointments), canActivate: [authGuard] },

  // Adoption — public browsing + protected apply/manage
  { path: 'adopt', loadComponent: () => import('./pages/adopt/adopt').then(m => m.Adopt) },
  // Static sub-paths MUST be declared before the :id route so they win the match.
  { path: 'adopt/my-applications', loadComponent: () => import('./pages/my-adoptions/my-adoptions').then(m => m.MyAdoptions), canActivate: [authGuard] },
  { path: 'adopt/:id', loadComponent: () => import('./pages/adopt-detail/adopt-detail').then(m => m.AdoptDetail) },
  { path: 'adopt/:id/apply', loadComponent: () => import('./pages/adopt-apply/adopt-apply').then(m => m.AdoptApply), canActivate: [authGuard] },
  { path: 'my-adoptions', loadComponent: () => import('./pages/my-adoptions/my-adoptions').then(m => m.MyAdoptions), canActivate: [authGuard] },
  { path: 'my-adoptions/:id', loadComponent: () => import('./pages/adopt-application-view/adopt-application-view').then(m => m.AdoptApplicationView), canActivate: [authGuard] },

  // NGO portal
  {
    path: 'ngo',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/ngo-dashboard/ngo-dashboard').then(m => m.NgoDashboard) },
      { path: 'queue', loadComponent: () => import('./pages/ngo-queue/ngo-queue').then(m => m.NgoQueue) },
      { path: 'missions/:id', loadComponent: () => import('./pages/ngo-mission/ngo-mission').then(m => m.NgoMission) },
      { path: 'adoptions', loadComponent: () => import('./pages/ngo-adoptions/ngo-adoptions').then(m => m.NgoAdoptions) },
      { path: 'adoptions/:id/review', loadComponent: () => import('./pages/ngo-adoption-review/ngo-adoption-review').then(m => m.NgoAdoptionReview) },
      { path: 'pets', loadComponent: () => import('./pages/ngo-pets/ngo-pets').then(m => m.NgoPets) },
      { path: 'pets/new', loadComponent: () => import('./pages/ngo-pet-form/ngo-pet-form').then(m => m.NgoPetForm) },
      { path: 'pets/:id/edit', loadComponent: () => import('./pages/ngo-pet-form/ngo-pet-form').then(m => m.NgoPetForm) },
      { path: 'sos-reports', loadComponent: () => import('./pages/ngo-sos-reports/ngo-sos-reports').then(m => m.NgoSosReports) }
    ]
  },

  // Admin portal
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard) },
      { path: 'hospitals', loadComponent: () => import('./pages/admin-hospitals/admin-hospitals').then(m => m.AdminHospitals) },
      { path: 'rescues', loadComponent: () => import('./pages/admin-rescues/admin-rescues').then(m => m.AdminRescues) },
      { path: 'adoptions', loadComponent: () => import('./pages/admin-adoptions/admin-adoptions').then(m => m.AdminAdoptions) },
      { path: 'appointments', loadComponent: () => import('./pages/admin-appointments/admin-appointments').then(m => m.AdminAppointments) }
    ]
  },

  { path: '**', redirectTo: '' }
];
