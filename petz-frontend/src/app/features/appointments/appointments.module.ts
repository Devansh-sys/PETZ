import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AppointmentsListComponent } from './appointments-list/appointments-list.component';
import { BookAppointmentComponent } from './book-appointment/book-appointment.component';

@NgModule({
  declarations: [AppointmentsListComponent, BookAppointmentComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '',    component: AppointmentsListComponent },
      { path: 'book', component: BookAppointmentComponent }
    ])
  ]
})
export class AppointmentsModule {}
