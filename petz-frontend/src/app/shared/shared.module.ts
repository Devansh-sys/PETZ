import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatbotComponent } from './chatbot/chatbot.component';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';

const MATERIAL = [
  MatCardModule, MatButtonModule, MatIconModule, MatInputModule,
  MatFormFieldModule, MatTableModule, MatProgressSpinnerModule,
  MatSnackBarModule, MatDialogModule, MatSelectModule, MatDatepickerModule,
  MatNativeDateModule, MatChipsModule, MatDividerModule, MatTooltipModule,
  MatPaginatorModule, MatTabsModule
];

@NgModule({
  declarations: [ChatbotComponent],
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, ...MATERIAL],
  exports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, ...MATERIAL, ChatbotComponent]
})
export class SharedModule {}
