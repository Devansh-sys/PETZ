import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pass    = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pass && confirm && pass !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  showPassword = false;
  showConfirm  = false;

  constructor(private fb: FormBuilder, private auth: AuthService,
              private router: Router, private snack: MatSnackBar) {
    this.form = this.fb.group({
      name:            ['', Validators.required],
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      phone:           [''],
      role:            ['USER']
    }, { validators: passwordMatchValidator });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    // Strip confirmPassword — backend doesn't need it
    const { confirmPassword, ...payload } = this.form.value;
    this.auth.register(payload).subscribe({
      next: (res) => {
        if (res.success) {
          const role = res.data?.role;
          const isApproved = res.data?.isApproved;

          // NGO / HOSPITAL accounts require admin approval before they can log in
          if ((role === 'NGO' || role === 'HOSPITAL') && !isApproved) {
            this.snack.open(
              'Account created! Your registration is pending admin approval. You will be notified once approved.',
              'OK',
              { duration: 8000 }
            );
            this.router.navigate(['/auth/login']);
          } else {
            const dest = role === 'ADMIN' ? '/admin' : '/dashboard';
            this.router.navigate([dest]);
          }
        } else {
          this.snack.open(res.message, 'Close', { duration: 3000 });
        }
        this.loading = false;
      },
      error: (err) => {
        this.snack.open(err.error?.message ?? 'Registration failed.', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
