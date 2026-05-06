import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { HospitalDashboardComponent } from './hospital-dashboard/hospital-dashboard.component';
import { HospitalAppointmentsComponent } from './hospital-appointments/hospital-appointments.component';
import { DoctorsManageComponent } from './doctors-manage/doctors-manage.component';

@NgModule({
  declarations: [HospitalDashboardComponent, HospitalAppointmentsComponent, DoctorsManageComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '',            component: HospitalDashboardComponent },
      { path: 'appointments', component: HospitalAppointmentsComponent },
      { path: 'doctors',     component: DoctorsManageComponent }
    ])
  ]
})
export class HospitalModule {}
