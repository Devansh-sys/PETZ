import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminNgosComponent } from './admin-ngos/admin-ngos.component';
import { AdminRescuesComponent } from './admin-rescues/admin-rescues.component';

@NgModule({
  declarations: [AdminDashboardComponent, AdminUsersComponent, AdminNgosComponent, AdminRescuesComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '',       component: AdminDashboardComponent },
      { path: 'users',  component: AdminUsersComponent },
      { path: 'ngos',   component: AdminNgosComponent },
      { path: 'rescues', component: AdminRescuesComponent }
    ])
  ]
})
export class AdminModule {}
