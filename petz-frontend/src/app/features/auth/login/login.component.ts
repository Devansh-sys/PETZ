import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-login',
  template: `
    <div class="auth-wrap">

      <!-- Left panel -->
      <div class="auth-left">
        <a class="brand" routerLink="/">🐾 PETZ</a>
        <h1>Animal Welfare<br>Platform</h1>
        <p>Connecting pets, owners, hospitals and rescue organisations — all in one place.</p>

        <div class="features">
          <div class="feature-item">
            <div class="f-icon"><mat-icon>pets</mat-icon></div>
            <span>Manage your pets</span>
          </div>
          <div class="feature-item">
            <div class="f-icon"><mat-icon>emergency</mat-icon></div>
            <span>Report & track rescues</span>
          </div>
          <div class="feature-item">
            <div class="f-icon"><mat-icon>favorite</mat-icon></div>
            <span>Adopt animals</span>
          </div>
          <div class="feature-item">
            <div class="f-icon"><mat-icon>local_hospital</mat-icon></div>
            <span>Book vet appointments</span>
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
            <h2>Welcome back</h2>
            <p>Sign in to your account</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="field-group">
              <label>Email address</label>
              <mat-form-field appearance="outline">
                <input matInput type="email" formControlName="email" placeholder="you@example.com">
                <mat-icon matPrefix style="color:#A8A29E;margin-right:6px">mail_outline</mat-icon>
              </mat-form-field>
            </div>

            <div class="field-group">
              <label>Password</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#A8A29E;margin-right:6px">lock_outline</mat-icon>
                <input matInput [type]="showPassword ? 'text' : 'password'"
                       formControlName="password" placeholder="••••••••">
                <button mat-icon-button matSuffix type="button"
                        (click)="showPassword = !showPassword"
                        [title]="showPassword ? 'Hide password' : 'Show password'"
                        style="color:#A8A29E">
                  <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-form-field>
            </div>

            <button mat-raised-button color="primary" type="submit"
                    [disabled]="form.invalid || loading"
                    style="width:100%;height:48px;font-size:1rem;margin-top:8px">
              @if (loading) {
                <mat-spinner diameter="20" style="display:inline-block;margin-right:8px"></mat-spinner>
              }
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <p class="auth-footer">
            Don't have an account?
            <a routerLink="/auth/register">Create one</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrap {
      min-height: 100vh;
      display: flex;
    }

    /* Left decorative panel */
    .auth-left {
      width: 45%;
      background: linear-gradient(160deg, #1C0902 0%, #3D1505 60%, #7C2D12 100%);
      padding: 60px 56px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      color: #fff;

      @media (max-width: 768px) { display: none; }

      .brand {
        font-size: 1.4rem;
        font-weight: 900;
        color: #F97316;
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-bottom: 48px;
        text-decoration: none;
        display: inline-block;
        transition: opacity 0.2s;
        &:hover { opacity: 0.8; }
      }

      h1 {
        font-size: 2.5rem;
        font-weight: 900;
        line-height: 1.2;
        margin: 0 0 20px;
        color: #fff;
      }

      p {
        color: rgba(255,255,255,0.65);
        font-size: 1rem;
        line-height: 1.7;
        margin: 0 0 40px;
      }
    }

    .features { display: flex; flex-direction: column; gap: 16px; }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 14px;
      color: rgba(255,255,255,0.85);
      font-weight: 500;
      font-size: 0.92rem;
    }
    .f-icon {
      width: 38px; height: 38px;
      border-radius: 10px;
      background: rgba(249,115,22,0.2);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      mat-icon { color: #F97316; font-size: 18px; width: 18px; height: 18px; }
    }

    /* Right form panel */
    .auth-right {
      flex: 1;
      background: #FFF8F4;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
    }

    .back-home {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      max-width: 420px;
      margin-bottom: 14px;
      font-size: 0.84rem;
      font-weight: 600;
      color: #78716C;
      text-decoration: none;
      cursor: pointer;
      transition: color 0.2s;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &:hover { color: #F97316; }
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      background: #fff;
      border-radius: 24px;
      padding: 44px 40px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.08);
      border: 1px solid #F0E0D6;
    }

    .auth-header {
      margin-bottom: 32px;
      h2 { font-size: 1.8rem; font-weight: 900; color: #1C0902; margin: 0 0 6px; }
      p  { color: #A8A29E; margin: 0; font-size: 0.9rem; }
    }

    .field-group {
      margin-bottom: 18px;
      label {
        display: block;
        font-size: 0.82rem;
        font-weight: 700;
        color: #1C0902;
        margin-bottom: 6px;
      }
      mat-form-field { margin: 0; }
    }

    .auth-footer {
      text-align: center;
      margin: 24px 0 0;
      color: #A8A29E;
      font-size: 0.88rem;
      a { color: #F97316; font-weight: 700; text-decoration: none; }
      a:hover { text-decoration: underline; }
    }
  `]
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
