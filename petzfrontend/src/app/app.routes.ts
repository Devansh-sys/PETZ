import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  {
    path: 'sos',
    children: [
      { path: '', redirectTo: 'auth', pathMatch: 'full' },
      { path: 'auth', loadComponent: () => import('./pages/sos-auth-phone/sos-auth-phone').then(m => m.SosAuthPhone) },
      { path: 'auth/otp', loadComponent: () => import('./pages/sos-auth-otp/sos-auth-otp').then(m => m.SosAuthOtp) },
      { path: 'auth/missed-call', loadComponent: () => import('./pages/sos-auth-missed-call/sos-auth-missed-call').then(m => m.SosAuthMissedCall) },
      { path: 'rate-limit', loadComponent: () => import('./pages/sos-rate-limit/sos-rate-limit').then(m => m.SosRateLimit) },
      { path: 'success', loadComponent: () => import('./pages/sos-success/sos-success').then(m => m.SosSuccess) },
      { path: 'report', loadComponent: () => import('./pages/sos-report/sos-report').then(m => m.SosReport) },
      { path: 'report/:id/media', loadComponent: () => import('./pages/sos-report-media/sos-report-media').then(m => m.SosReportMedia) },
      { path: 'report/:id/confirmed', loadComponent: () => import('./pages/sos-report-confirmed/sos-report-confirmed').then(m => m.SosReportConfirmed) },
      { path: 'report/:id/status', loadComponent: () => import('./pages/sos-status/sos-status').then(m => m.SosStatus) }
    ]
  },
  {
    path: 'ngo',
    children: [
      { path: '', redirectTo: 'queue', pathMatch: 'full' },
      { path: 'queue', loadComponent: () => import('./pages/ngo-queue/ngo-queue').then(m => m.NgoQueue) },
      { path: 'missions/:id', loadComponent: () => import('./pages/ngo-mission/ngo-mission').then(m => m.NgoMission) }
    ]
  },
  { path: 'hospitals', loadComponent: () => import('./pages/hospitals/hospitals').then(m => m.Hospitals) },
  { path: 'my-reports', loadComponent: () => import('./pages/my-reports/my-reports').then(m => m.MyReports) },
  { path: 'appointments', loadComponent: () => import('./pages/my-appointments/my-appointments').then(m => m.MyAppointments) },
  {
    path: 'book',
    children: [
      { path: '', loadComponent: () => import('./pages/book-hospital/book-hospital').then(m => m.BookHospital) },
      { path: 'service', loadComponent: () => import('./pages/book-service/book-service').then(m => m.BookService) },
      { path: 'doctor', loadComponent: () => import('./pages/book-doctor/book-doctor').then(m => m.BookDoctor) },
      { path: 'slot', loadComponent: () => import('./pages/book-slot/book-slot').then(m => m.BookSlot) },
      { path: 'pet', loadComponent: () => import('./pages/book-pet/book-pet').then(m => m.BookPet) },
      { path: 'confirm', loadComponent: () => import('./pages/book-confirm/book-confirm').then(m => m.BookConfirm) }
    ]
  },
  { path: '**', redirectTo: '' }
];
