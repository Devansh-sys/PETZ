import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { AdoptionService } from '../../core/adoption/adoption.service';
import { AuthService } from '../../core/auth/auth.service';

type Step = 'personal' | 'lifestyle' | 'experience' | 'consent' | 'review';

@Component({
  selector: 'petz-adopt-apply',
  imports: [CommonModule, FormsModule, Navbar, RouterLink],
  templateUrl: './adopt-apply.html',
  styleUrl: './adopt-apply.scss'
})
export class AdoptApply implements OnInit {
  petId = '';
  applicationId = '';
  step: Step = 'personal';
  saving = false;
  starting = false;
  error = '';
  submitted = false;

  personal = { fullName: '', email: '', phone: '', addressLine: '', city: '', pincode: '' };
  lifestyle = { housingType: 'APARTMENT', hasYard: false, otherPetsCount: 0, workScheduleHours: 0 };
  experience = { prevPetOwnership: false, prevPetDetails: '', vetSupport: '' };
  consent = { consentHomeVisit: false, consentFollowUp: false, consentBackgroundCheck: false, agreedToTerms: false };

  steps: Step[] = ['personal', 'lifestyle', 'experience', 'consent', 'review'];
  stepLabels: Record<Step, string> = { personal: 'Personal', lifestyle: 'Lifestyle', experience: 'Experience', consent: 'Consent', review: 'Review' };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adoptionService: AdoptionService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.petId = this.route.snapshot.paramMap.get('id')!;
    const userId = this.auth.session()?.userId!;
    const existingId = this.route.snapshot.queryParamMap.get('applicationId');
    if (existingId) { this.applicationId = existingId; return; }
    this.starting = true;
    this.adoptionService.startApplication(this.petId, userId).subscribe({
      next: (app) => { this.applicationId = app.id; this.starting = false; },
      error: () => { this.error = 'Could not start application. Please try again.'; this.starting = false; }
    });
  }

  get stepIndex(): number { return this.steps.indexOf(this.step); }

  saveAndNext(): void {
    if (!this.applicationId) {
      this.error = 'Application is still initializing. Please wait a moment.';
      return;
    }
    this.saving = true;
    this.error = '';
    let call$;
    if (this.step === 'personal') {
      call$ = this.adoptionService.updatePersonal(this.applicationId, this.personal);
    } else if (this.step === 'lifestyle') {
      call$ = this.adoptionService.updateLifestyle(this.applicationId, this.lifestyle);
    } else if (this.step === 'experience') {
      call$ = this.adoptionService.updateExperience(this.applicationId, this.experience);
    } else {
      const { agreedToTerms, ...consentPayload } = this.consent;
      call$ = this.adoptionService.updateConsent(this.applicationId, consentPayload);
    }

    call$!.subscribe({
      next: () => { this.saving = false; this.goNext(); },
      error: () => { this.error = 'Failed to save. Try again.'; this.saving = false; }
    });
  }

  goNext(): void {
    const idx = this.stepIndex;
    if (idx < this.steps.length - 1) this.step = this.steps[idx + 1];
  }

  goBack(): void {
    const idx = this.stepIndex;
    if (idx > 0) this.step = this.steps[idx - 1];
  }

  submit(): void {
    this.saving = true;
    this.adoptionService.submitApplication(this.applicationId).subscribe({
      next: () => { this.saving = false; this.submitted = true; },
      error: () => { this.error = 'Submission failed. Check all fields are filled.'; this.saving = false; }
    });
  }
}
