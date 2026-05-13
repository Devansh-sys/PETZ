import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Pet } from '../../../core/models/pet.model';

@Component({
  standalone: false,
  selector: 'app-pets-list',
  templateUrl: './pets-list.component.html',
  styleUrls: ['./pets-list.component.scss']
})
export class PetsListComponent implements OnInit {
  pets: Pet[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/pets/my').subscribe({
      next: res => { this.pets = res.data ?? []; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  delete(id: number): void {
    if (!confirm('Remove this pet from your list?')) return;
    this.api.delete<any>(`/pets/${id}`).subscribe(() => {
      this.pets = this.pets.filter(p => p.id !== id);
    });
  }
}
