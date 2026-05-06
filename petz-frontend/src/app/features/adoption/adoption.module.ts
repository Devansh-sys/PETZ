import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AnimalsListComponent } from './animals-list/animals-list.component';
import { AnimalDetailComponent } from './animal-detail/animal-detail.component';
import { MyApplicationsComponent } from './my-applications/my-applications.component';

@NgModule({
  declarations: [AnimalsListComponent, AnimalDetailComponent, MyApplicationsComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '',            redirectTo: 'animals', pathMatch: 'full' },
      { path: 'animals',     component: AnimalsListComponent },
      { path: 'animals/:id', component: AnimalDetailComponent },
      { path: 'my',          component: MyApplicationsComponent }
    ])
  ]
})
export class AdoptionModule {}
