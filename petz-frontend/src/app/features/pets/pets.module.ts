import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { PetsListComponent } from './pets-list/pets-list.component';
import { PetFormComponent } from './pet-form/pet-form.component';

@NgModule({
  declarations: [PetsListComponent, PetFormComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '',      component: PetsListComponent },
      { path: 'new',   component: PetFormComponent },
      { path: ':id',   component: PetFormComponent }
    ])
  ]
})
export class PetsModule {}
