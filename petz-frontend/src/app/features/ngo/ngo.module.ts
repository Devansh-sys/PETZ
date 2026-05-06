import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { NgoDashboardComponent } from './ngo-dashboard/ngo-dashboard.component';
import { NgoAnimalsComponent } from './ngo-animals/ngo-animals.component';
import { NgoRescuesComponent } from './ngo-rescues/ngo-rescues.component';
import { NgoApplicationsComponent } from './ngo-applications/ngo-applications.component';

@NgModule({
  declarations: [NgoDashboardComponent, NgoAnimalsComponent, NgoRescuesComponent, NgoApplicationsComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '',            component: NgoDashboardComponent },
      { path: 'animals',     component: NgoAnimalsComponent },
      { path: 'rescues',     component: NgoRescuesComponent },
      { path: 'applications', component: NgoApplicationsComponent }
    ])
  ]
})
export class NgoModule {}
