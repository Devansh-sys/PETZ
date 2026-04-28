import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class FirebasePhoneService {
  private authService = inject(AuthService);
  private pendingPhone: string | null = null;

  async sendOtp(phoneE164: string, _recaptchaContainerId = 'recaptcha-container'): Promise<void> {
    await firstValueFrom(this.authService.sendOtp(phoneE164));
    this.pendingPhone = phoneE164;
  }

  hasPendingConfirmation(): boolean {
    return this.pendingPhone !== null;
  }

  async verifyOtp(code: string): Promise<{ uid: string; idToken: string; phone: string }> {
    if (!this.pendingPhone) {
      throw new Error('No OTP in progress. Please request a new code.');
    }
    const session = await firstValueFrom(this.authService.verifyOtp(this.pendingPhone, code));
    return {
      uid: session.userId,
      idToken: session.accessToken,
      phone: session.phone ?? this.pendingPhone
    };
  }

  reset(): void {
    this.pendingPhone = null;
  }
}
