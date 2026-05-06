import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ProfileComponent } from './profile.component';

@NgModule({
  declarations: [ProfileComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '', component: ProfileComponent }
    ])
  ]
})
export class ProfileModule {}
