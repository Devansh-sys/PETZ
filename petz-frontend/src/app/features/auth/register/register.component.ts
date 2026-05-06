import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-register',
  template: `
    <div class="auth-wrap">

      <!-- Left panel -->
      <div class="auth-left">
        <a class="brand" routerLink="/">
          <svg width="30" height="30" viewBox="0 0 40 40" fill="none" style="flex-shrink:0">
            <rect width="40" height="40" rx="12" fill="#FF8C42"/>
            <ellipse cx="13" cy="11" rx="3.8" ry="4.6" fill="white" opacity="0.9"/>
            <ellipse cx="27" cy="11" rx="3.8" ry="4.6" fill="white" opacity="0.9"/>
            <ellipse cx="7.5" cy="20" rx="3.2" ry="4" fill="white" opacity="0.9"/>
            <ellipse cx="32.5" cy="20" rx="3.2" ry="4" fill="white" opacity="0.9"/>
            <path d="M20 15.5C14.5 15.5 10 20.2 10 25.5C10 29.5 12.5 32.5 16 33.5H24C27.5 32.5 30 29.5 30 25.5C30 20.2 25.5 15.5 20 15.5Z" fill="white"/>
          </svg>
          PETZ
        </a>
        <h1>Join the<br>PETZ Community</h1>
        <p>Create your free account and start making a difference for animals in need.</p>
        <div class="features">
          <div class="feature-item">
            <div class="f-icon"><mat-icon>pets</mat-icon></div>
            <span>Register as pet owner</span>
          </div>
          <div class="feature-item">
            <div class="f-icon"><mat-icon>business</mat-icon></div>
            <span>NGO / Rescue organisations</span>
          </div>
          <div class="feature-item">
            <div class="f-icon"><mat-icon>local_hospital</mat-icon></div>
            <span>Veterinary hospitals</span>
          </div>
        </div>
      </div>

      <!-- Right panel -->
      <div class="auth-right">
        <a class="back-home" routerLink="/">
          <mat-icon>arrow_back</mat-icon> Back to home
        </a>
        <div class="auth-card">
          <div class="auth-header">
            <h2>Create account</h2>
            <p>Fill in the details to get started</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="fields-grid">
              <div class="field-group">
                <label>Full Name</label>
                <mat-form-field appearance="outline">
                  <input matInput formControlName="name" placeholder="John Doe">
                </mat-form-field>
              </div>
              <div class="field-group">
                <label>Phone</label>
                <mat-form-field appearance="outline">
                  <input matInput formControlName="phone" placeholder="+91 00000 00000">
                </mat-form-field>
              </div>
            </div>

            <div class="field-group">
              <label>Email address</label>
              <mat-form-field appearance="outline">
                <input matInput type="email" formControlName="email" placeholder="you@example.com">
              </mat-form-field>
            </div>

            <div class="field-group">
              <label>Password</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#8BA3B5;margin-right:6px">lock_outline</mat-icon>
                <input matInput [type]="showPassword ? 'text' : 'password'"
                       formControlName="password" placeholder="min. 6 characters">
                <button mat-icon-button matSuffix type="button"
                        (click)="showPassword = !showPassword"
                        [title]="showPassword ? 'Hide password' : 'Show password'"
                        style="color:#8BA3B5">
                  <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-form-field>
            </div>

            <div class="field-group">
              <label>Account Type</label>
              <mat-form-field appearance="outline">
                <mat-select formControlName="role">
                  <mat-option value="USER">🐾 &nbsp;Pet Owner</mat-option>
                  <mat-option value="NGO">🏢 &nbsp;NGO / Rescue Organisation</mat-option>
                  <mat-option value="HOSPITAL">🏥 &nbsp;Veterinary Hospital</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <button mat-raised-button color="primary" type="submit"
                    [disabled]="form.invalid || loading"
                    style="width:100%;height:48px;font-size:1rem;margin-top:4px">
              {{ loading ? 'Creating account...' : 'Create Account' }}
            </button>
          </form>

          <p class="auth-footer">
            Already have an account?
            <a routerLink="/auth/login">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrap { min-height: 100vh; display: flex; }

    .auth-left {
      width: 40%;
      background: linear-gradient(160deg, #1A3547 0%, #2D5D7B 60%, #3D7EA6 100%);
      padding: 60px 48px;
      display: flex; flex-direction: column; justify-content: center; color: #fff;
      @media (max-width: 768px) { display: none; }
      .brand { font-family: 'Quicksand', system-ui, sans-serif; font-size: 1.3rem; font-weight: 700; color: #fff; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 48px; text-decoration: none; display: flex; align-items: center; gap: 10px; transition: opacity 0.2s; &:hover { opacity: 0.8; } }
      h1 { font-family: 'Quicksand', system-ui, sans-serif; font-size: 2.2rem; font-weight: 700; line-height: 1.2; margin: 0 0 20px; }
      p  { color: rgba(255,255,255,0.65); font-size: 0.95rem; line-height: 1.7; margin: 0 0 36px; }
    }

    .features { display: flex; flex-direction: column; gap: 14px; }
    .feature-item { display: flex; align-items: center; gap: 12px; color: rgba(255,255,255,0.85); font-weight: 500; font-size: 0.9rem; }
    .f-icon {
      width: 36px; height: 36px; border-radius: 12px;
      background: rgba(255,140,66,0.18);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { color: #FF8C42; font-size: 18px; width: 18px; height: 18px; }
    }

    .auth-right {
      flex: 1; background: #F9FBFB;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 40px 24px; overflow-y: auto;
    }

    .back-home {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      max-width: 460px;
      margin-bottom: 14px;
      font-size: 0.84rem;
      font-weight: 600;
      color: #4A6478;
      text-decoration: none;
      cursor: pointer;
      transition: color 0.2s;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &:hover { color: #FF8C42; }
    }

    .auth-card {
      width: 100%; max-width: 460px;
      background: #fff; border-radius: 24px;
      padding: 40px; box-shadow: 0 8px 40px rgba(26,53,71,0.09);
      border: 1px solid #E0EBF2;
    }

    .auth-header {
      margin-bottom: 28px;
      h2 { font-family: 'Quicksand', system-ui, sans-serif; font-size: 1.7rem; font-weight: 700; color: #1A3547; margin: 0 0 6px; }
      p  { color: #8BA3B5; margin: 0; font-size: 0.88rem; }
    }

    .fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 14px; }

    .field-group {
      margin-bottom: 14px;
      label { display: block; font-size: 0.8rem; font-weight: 700; color: #1A3547; margin-bottom: 5px; }
    }

    .auth-footer {
      text-align: center; margin: 20px 0 0; color: #8BA3B5; font-size: 0.88rem;
      a { color: #FF8C42; font-weight: 700; text-decoration: none; }
      a:hover { text-decoration: underline; }
    }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  showPassword = false;

  constructor(private fb: FormBuilder, private auth: AuthService,
              private router: Router, private snack: MatSnackBar) {
    this.form = this.fb.group({
      name:     ['', Validators.required],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone:    [''],
      role:     ['USER']
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.register(this.form.value).subscribe({
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
        this.snack.open(err.error?.message ?? 'Registration failed.', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
