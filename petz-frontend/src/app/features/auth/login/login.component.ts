import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  showPassword = false;

  constructor(private fb: FormBuilder, private auth: AuthService,
              private router: Router, private snack: MatSnackBar) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const { email, password } = this.form.value;
    this.auth.login(email, password).subscribe({
      next: (res) => {
        if (res.success) {
          const role = res.data?.role;
          const dest = role === 'ADMIN' ? '/admin'
                     : role === 'NGO'      ? '/ngo'
                     : role === 'HOSPITAL' ? '/hospital'
                     : '/dashboard';
          this.router.navigate([dest]);
        } else {
          this.snack.open(res.message, 'Close', { duration: 3000 });
        }
        this.loading = false;
      },
      error: (err) => {
        this.snack.open(err.error?.message ?? 'Login failed.', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
