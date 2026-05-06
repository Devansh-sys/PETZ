import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { RescueListComponent } from './rescue-list/rescue-list.component';
import { ReportRescueComponent } from './report-rescue/report-rescue.component';

@NgModule({
  declarations: [RescueListComponent, ReportRescueComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '',       component: RescueListComponent },
      { path: 'report', component: ReportRescueComponent }
    ])
  ]
})
export class RescueModule {}
