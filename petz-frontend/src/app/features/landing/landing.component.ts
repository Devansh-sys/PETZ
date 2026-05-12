import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, style, animate, transition } from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-landing',
  template: `
    <div class="landing-root">

      <!-- ══════════ NAVBAR ══════════ -->
      <nav class="landing-nav" [class.scrolled]="scrolled">
        <a class="nav-logo-area" routerLink="/">
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="12" fill="#FF8C42"/>
            <ellipse cx="13" cy="11" rx="3.8" ry="4.6" fill="white" opacity="0.9"/>
            <ellipse cx="27" cy="11" rx="3.8" ry="4.6" fill="white" opacity="0.9"/>
            <ellipse cx="7.5" cy="20" rx="3.2" ry="4" fill="white" opacity="0.9"/>
            <ellipse cx="32.5" cy="20" rx="3.2" ry="4" fill="white" opacity="0.9"/>
            <path d="M20 15.5C14.5 15.5 10 20.2 10 25.5C10 29.5 12.5 32.5 16 33.5H24C27.5 32.5 30 29.5 30 25.5C30 20.2 25.5 15.5 20 15.5Z" fill="white"/>
          </svg>
          <span class="nav-logo-text">PET<span>Z</span></span>
        </a>

        <div class="nav-links">
          <a (click)="scrollTo('features')">Features</a>
          <a (click)="scrollTo('how')">How it Works</a>
          <a (click)="scrollTo('cities')">Cities</a>
        </div>

        <div class="nav-actions">
          <button class="btn-nav-ghost" routerLink="/auth/login">Log In</button>
          <button class="btn-nav-primary" routerLink="/auth/register">Sign Up Free</button>
        </div>
      </nav>

      <!-- ══════════ HERO ══════════ -->
      <section class="hero-section">
        <div class="hero-bg-blob"></div>
        <div class="hero-bg-blob b2"></div>

        <div class="hero-grid">

          <!-- Left content -->
          <div class="hero-left" [@heroLeft]>
            <div class="active-badge">
              <span class="pulse-dot"></span>
              Now Active in Chennai
            </div>

            <h1 class="hero-headline">
              Every <span class="text-grad">Paw</span><br>
              Deserves Care
            </h1>

            <p class="hero-sub">
              India's first unified pet welfare platform — report rescues, adopt animals,
              book vet appointments, and manage your pet's health. All in one place.
            </p>

            <div class="hero-ctas">
              <a class="btn-hero-primary" routerLink="/auth/register">
                <mat-icon style="font-size:18px;width:18px;height:18px">arrow_forward</mat-icon>
                Get Started Free
              </a>
              <a class="btn-hero-ghost" (click)="scrollTo('features')">
                See Features
              </a>
            </div>

            <div class="hero-trust">
              <div class="trust-item">
                <mat-icon>check_circle</mat-icon> 100% Free for adopters
              </div>
              <div class="trust-item">
                <mat-icon>check_circle</mat-icon> Verified NGOs only
              </div>
              <div class="trust-item">
                <mat-icon>check_circle</mat-icon> 24/7 rescue network
              </div>
            </div>
          </div>

          <!-- Right visual art -->
          <div class="hero-right" [@heroRight]>

            <!-- Main pet card -->
            <div class="art-card art-main">
              <div class="art-card-top">
                <div class="art-icon-box" style="background:linear-gradient(135deg,#F97316,#FF8C42)">
                  <mat-icon>pets</mat-icon>
                </div>
                <span class="art-pill green">Ready to Adopt</span>
              </div>
              <div class="art-name">Buddy</div>
              <div class="art-breed">Golden Retriever · 2 yrs · Chennai</div>
              <div class="art-bar"></div>
              <button class="art-btn">Adopt Now →</button>
            </div>

            <!-- Rescue alert card -->
            <div class="art-card art-rescue">
              <div class="art-card-top" style="margin-bottom:8px">
                <div class="art-icon-box sm" style="background:linear-gradient(135deg,#F87171,#DC2626)">
                  <mat-icon style="font-size:16px;width:16px;height:16px">emergency</mat-icon>
                </div>
                <span class="art-pill red">Urgent</span>
              </div>
              <div class="art-name" style="font-size:0.82rem">Rescue Reported</div>
              <div class="art-breed">NGO dispatched · 2 min ago</div>
              <div class="art-progress">
                <div class="art-progress-fill" style="width:60%"></div>
              </div>
            </div>

            <!-- Appointment card -->
            <div class="art-card art-appt">
              <div class="art-card-top" style="margin-bottom:8px">
                <div class="art-icon-box sm" style="background:linear-gradient(135deg,#B97AFB,#7C3AED)">
                  <mat-icon style="font-size:16px;width:16px;height:16px">event</mat-icon>
                </div>
                <span class="art-pill purple">Confirmed</span>
              </div>
              <div class="art-name" style="font-size:0.82rem">Vet Appointment</div>
              <div class="art-breed">Pawsome Clinic · Wed 10 AM</div>
            </div>

            <!-- Paw decoration -->
            <div class="paw-deco p1">🐾</div>
            <div class="paw-deco p2">🐾</div>
            <div class="paw-deco p3">🐾</div>
          </div>

        </div>
      </section>

      <!-- ══════════ STATS STRIP ══════════ -->
      <section class="stats-section">
        <div class="stats-inner">
          <div class="stat-item">
            <div class="stat-num">2,400<span>+</span></div>
            <p class="stat-desc">Animals Rescued</p>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-num">120<span>+</span></div>
            <p class="stat-desc">Partner Clinics</p>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-num">1</div>
            <p class="stat-desc">City Active (Growing!)</p>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-num">98<span>%</span></div>
            <p class="stat-desc">Rescue Response Rate</p>
          </div>
        </div>
      </section>

      <!-- ══════════ FEATURES BENTO ══════════ -->
      <section class="features-section" id="features">
        <p class="section-label">WHY PETZ</p>
        <h2 class="section-title">Everything Your Pet Needs</h2>
        <p class="section-sub">
          A complete ecosystem built for animal lovers, rescue workers, and veterinary professionals.
        </p>

        <div class="bento-grid">

          <!-- Card 1 — Manage Pets (wide) -->
          <div class="bento-card bento-wide bento-animate" style="animation-delay:0ms">
            <div class="bento-icon-box" style="background:linear-gradient(135deg,#F97316,#FF8C42)">
              <mat-icon>pets</mat-icon>
            </div>
            <h3 class="bento-title">Manage Your Pets</h3>
            <p class="bento-desc">
              Keep all pet records, vaccinations, medical history, and appointment schedules
              in one beautiful, easy-to-navigate dashboard.
            </p>
            <span class="bento-tag" style="background:#FFF3E8;color:#E07828">For Pet Owners</span>
          </div>

          <!-- Card 2 — Rescue (tall) -->
          <div class="bento-card bento-animate" style="animation-delay:80ms">
            <div class="bento-icon-box" style="background:linear-gradient(135deg,#F87171,#DC2626)">
              <mat-icon>emergency</mat-icon>
            </div>
            <h3 class="bento-title">Report Rescues</h3>
            <p class="bento-desc">
              Spot an animal in distress? Report it instantly and our NGO network responds within minutes.
            </p>
            <span class="bento-tag" style="background:#FEE2E2;color:#991B1B">SOS Network</span>
          </div>

          <!-- Card 3 — Adopt (tall) -->
          <div class="bento-card bento-animate" style="animation-delay:160ms">
            <div class="bento-icon-box" style="background:linear-gradient(135deg,#34D399,#059669)">
              <mat-icon>favorite</mat-icon>
            </div>
            <h3 class="bento-title">Adopt an Animal</h3>
            <p class="bento-desc">
              Browse hundreds of animals waiting for a forever home. Start your adoption journey today.
            </p>
            <span class="bento-tag" style="background:#D1FAE5;color:#065F46">Open Adoptions</span>
          </div>

          <!-- Card 4 — Book Vets (wide) -->
          <div class="bento-card bento-wide bento-animate" style="animation-delay:240ms">
            <div class="bento-icon-box" style="background:linear-gradient(135deg,#B97AFB,#7C3AED)">
              <mat-icon>event</mat-icon>
            </div>
            <h3 class="bento-title">Book Vet Appointments</h3>
            <p class="bento-desc">
              Schedule appointments at verified veterinary hospitals near you. View doctors, services,
              available slots, and get confirmations — all without a phone call.
            </p>
            <span class="bento-tag" style="background:#EDE9FE;color:#5B21B6">120+ Clinics</span>
          </div>

        </div>
      </section>

      <!-- ══════════ HOW IT WORKS ══════════ -->
      <section class="how-section" id="how">
        <div class="how-inner">
          <p class="section-label">THE PROCESS</p>
          <h2 class="section-title">Simple. Fast. Effective.</h2>
          <p class="section-sub">From report to rescue in under 10 minutes.</p>

          <div class="steps-grid">

            <div class="step-card">
              <div class="step-num">01</div>
              <div class="step-icon-box" style="background:linear-gradient(135deg,#F87171,#DC2626)">
                <mat-icon>report_problem</mat-icon>
              </div>
              <h3 class="step-title">Report or Browse</h3>
              <p class="step-desc">
                Spot an animal in distress — snap a photo, add a location, and submit in under 30 seconds.
                Or browse adoptable animals listed by verified NGOs in Chennai.
              </p>
            </div>

            <div class="step-connector">
              <div class="connector-line"></div>
              <mat-icon class="connector-arrow">chevron_right</mat-icon>
            </div>

            <div class="step-card">
              <div class="step-num">02</div>
              <div class="step-icon-box" style="background:linear-gradient(135deg,#60A5FA,#2563EB)">
                <mat-icon>group</mat-icon>
              </div>
              <h3 class="step-title">NGOs Respond</h3>
              <p class="step-desc">
                Our verified NGO network receives instant alerts. They accept the case, update you
                in real time, and dispatch rescue teams to the location.
              </p>
            </div>

            <div class="step-connector">
              <div class="connector-line"></div>
              <mat-icon class="connector-arrow">chevron_right</mat-icon>
            </div>

            <div class="step-card">
              <div class="step-num">03</div>
              <div class="step-icon-box" style="background:linear-gradient(135deg,#34D399,#059669)">
                <mat-icon>favorite</mat-icon>
              </div>
              <h3 class="step-title">Animals Thrive</h3>
              <p class="step-desc">
                Rescued animals receive medical care at partner clinics. They're listed for adoption
                and placed with verified families for a loving forever home.
              </p>
            </div>

          </div>
        </div>
      </section>

      <!-- ══════════ CITIES ══════════ -->
      <section class="cities-section" id="cities">
        <p class="section-label">COVERAGE</p>
        <h2 class="section-title">Where We Operate</h2>
        <p class="section-sub">Currently serving Chennai with rapid expansion planned.</p>

        <div class="cities-grid">
          <div class="city-card city-active">
            <div class="city-dot active"></div>
            <div class="city-info">
              <span class="city-name">Chennai</span>
              <span class="city-status">🟢 Live Now</span>
            </div>
            <span class="city-badge active-badge-chip">Active</span>
          </div>
          <div class="city-card city-soon">
            <div class="city-dot soon"></div>
            <div class="city-info">
              <span class="city-name">Bangalore</span>
              <span class="city-status">🔜 Coming Soon</span>
            </div>
          </div>
          <div class="city-card city-soon">
            <div class="city-dot soon"></div>
            <div class="city-info">
              <span class="city-name">Mumbai</span>
              <span class="city-status">🔜 Coming Soon</span>
            </div>
          </div>
          <div class="city-card city-soon">
            <div class="city-dot soon"></div>
            <div class="city-info">
              <span class="city-name">Delhi</span>
              <span class="city-status">🔜 Coming Soon</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════ CTA BANNER ══════════ -->
      <section class="cta-section">
        <div class="cta-inner">
          <div class="cta-paw">🐾</div>
          <h2 class="cta-title">Ready to Make a Difference?</h2>
          <p class="cta-sub">Join thousands of animal lovers in Chennai helping pets find safety, health, and love.</p>
          <div class="cta-btns">
            <a class="btn-cta-primary" routerLink="/auth/register">
              Get Started — It's Free
            </a>
            <a class="btn-cta-ghost" routerLink="/auth/login">
              Already have an account?
            </a>
          </div>
        </div>
      </section>

      <!-- ══════════ FOOTER ══════════ -->
      <footer class="landing-footer">
        <div class="footer-inner">
          <div class="footer-brand">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="#FF8C42"/>
              <ellipse cx="13" cy="11" rx="3.8" ry="4.6" fill="white" opacity="0.9"/>
              <ellipse cx="27" cy="11" rx="3.8" ry="4.6" fill="white" opacity="0.9"/>
              <ellipse cx="7.5" cy="20" rx="3.2" ry="4" fill="white" opacity="0.9"/>
              <ellipse cx="32.5" cy="20" rx="3.2" ry="4" fill="white" opacity="0.9"/>
              <path d="M20 15.5C14.5 15.5 10 20.2 10 25.5C10 29.5 12.5 32.5 16 33.5H24C27.5 32.5 30 29.5 30 25.5C30 20.2 25.5 15.5 20 15.5Z" fill="white"/>
            </svg>
            <span class="footer-logo-text">PET<span>Z</span></span>
          </div>
          <p class="footer-tagline">Made with ❤️ in Chennai for every paw that deserves care.</p>
          <div class="footer-links">
            <a routerLink="/auth/login">Log In</a>
            <a routerLink="/auth/register">Sign Up</a>
            <a (click)="scrollTo('features')">Features</a>
            <a (click)="scrollTo('how')">How it Works</a>
          </div>
          <p class="footer-copy">© 2025 PETZ Platform. All rights reserved.</p>
        </div>
      </footer>

    </div>
  `,
  styles: [`
    /* ── Reset / root ── */
    :host { display: block; }

    .landing-root {
      min-height: 100vh;
      font-family: 'Inter', system-ui, sans-serif;
      overflow-x: hidden;
      background: #F9FBFB;
    }

    /* ══════════ NAVBAR ══════════ */
    .landing-nav {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      padding: 0 6%;
      height: 68px;
      background: rgba(248,251,252,0.90);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-bottom: 1px solid rgba(224,235,242,0.7);
      transition: box-shadow 0.3s, background 0.3s;
    }
    .landing-nav.scrolled {
      background: rgba(249,251,251,0.98);
      box-shadow: 0 2px 24px rgba(26,53,71,0.08);
    }

    .nav-logo-area {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      flex-shrink: 0;
    }
    .nav-logo-text {
      font-size: 1.1rem;
      font-weight: 900;
      color: #1A3547;
      letter-spacing: 2px;
      text-transform: uppercase;
      span { color: #FF8C42; }  // Gold brand accent
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 36px;
      margin: 0 auto;
      a {
        font-size: 0.88rem;
        font-weight: 600;
        color: #4A6478;
        cursor: pointer;
        transition: color 0.2s;
        &:hover { color: #FF8C42; }
      }
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    .btn-nav-ghost {
      padding: 8px 20px;
      border-radius: 12px;
      border: 1px solid #C8DCE8;
      background: transparent;
      color: #1A3547;
      font-size: 0.86rem;
      font-weight: 600;
      cursor: pointer;
      font-family: 'Inter', system-ui, sans-serif;
      transition: all 0.2s;
      &:hover { background: #FFF7ED; border-color: #FF8C42; color: #FF8C42; }
    }

    .btn-nav-primary {
      padding: 8px 20px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #FF9F5A, #FF8C42);
      color: #fff;
      font-size: 0.86rem;
      font-weight: 700;
      cursor: pointer;
      font-family: 'Inter', system-ui, sans-serif;
      box-shadow: 0 4px 14px rgba(255,140,66,0.30);
      transition: all 0.2s;
      &:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,140,66,0.45); }
    }

    /* ══════════ HERO ══════════ */
    .hero-section {
      min-height: 100vh;
      padding: 68px 6% 0;
      display: flex;
      align-items: center;
      background: linear-gradient(160deg, #F9FBFB 55%, #FFF7ED 100%);
      position: relative;
      overflow: hidden;
    }

    .hero-bg-blob {
      position: absolute;
      width: 600px; height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,140,66,0.07) 0%, transparent 70%);
      top: -100px; right: -100px;
      pointer-events: none;
    }
    .hero-bg-blob.b2 {
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(255,140,66,0.05) 0%, transparent 70%);
      bottom: -80px; left: -80px;
      top: auto; right: auto;
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      padding: 60px 0;
    }

    .hero-left { z-index: 2; }

    .active-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #D1FAE5;
      border: 1px solid #A7F3D0;
      border-radius: 999px;
      padding: 5px 14px 5px 10px;
      font-size: 0.78rem;
      font-weight: 700;
      color: #065F46;
      margin-bottom: 22px;
    }

    .pulse-dot {
      width: 8px; height: 8px;
      background: #22C55E;
      border-radius: 50%;
      flex-shrink: 0;
      animation: pulseDot 2s ease-in-out infinite;
    }
    @keyframes pulseDot {
      0%,100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
      50% { opacity: 0.8; transform: scale(0.9); box-shadow: 0 0 0 4px rgba(34,197,94,0); }
    }

    .hero-headline {
      font-size: 4rem;
      font-weight: 900;
      color: #1A3547;
      line-height: 1.08;
      letter-spacing: -0.04em;
      margin: 0 0 22px;
    }
    .text-grad {
      background: linear-gradient(135deg, #FF8C42, #E07828);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-sub {
      font-size: 1.05rem;
      color: #4A6478;
      line-height: 1.75;
      margin: 0 0 36px;
      max-width: 480px;
    }

    .hero-ctas {
      display: flex;
      gap: 14px;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 32px;
    }

    .btn-hero-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 28px;
      border-radius: 14px;
      background: linear-gradient(135deg, #FF9F5A, #FF8C42);
      color: #fff;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      font-family: 'Inter', system-ui, sans-serif;
      box-shadow: 0 6px 24px rgba(255,140,66,0.38);
      transition: all 0.22s;
      text-decoration: none;
      border: none;
      &:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(255,140,66,0.50); }
    }

    .btn-hero-ghost {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 24px;
      border-radius: 14px;
      border: 1.5px solid #C8DCE8;
      background: #fff;
      color: #1A3547;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      font-family: 'Inter', system-ui, sans-serif;
      transition: all 0.2s;
      text-decoration: none;
      &:hover { background: #FFF7ED; border-color: #FF8C42; color: #FF8C42; }
    }

    .hero-trust {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }
    .trust-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.78rem;
      font-weight: 600;
      color: #8BA3B5;
      mat-icon { font-size: 15px; width: 15px; height: 15px; color: #22C55E; }
    }

    /* ── Hero right art ── */
    .hero-right {
      position: relative;
      height: 540px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .art-card {
      background: #fff;
      border-radius: 22px;
      border: 1px solid #E0EBF2;
      box-shadow: 0 12px 48px rgba(26,53,71,0.11);
      padding: 20px;
      position: absolute;
    }

    .art-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }

    .art-icon-box {
      width: 46px; height: 46px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      mat-icon { color: #fff; font-size: 22px; width: 22px; height: 22px; }
      &.sm { width: 32px; height: 32px; border-radius: 10px; }
    }

    .art-pill {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      &.green { background: #D1FAE5; color: #065F46; }
      &.red   { background: #FEE2E2; color: #991B1B; }
      &.purple { background: #EDE9FE; color: #5B21B6; }
    }

    .art-name {
      font-weight: 800;
      font-size: 1rem;
      color: #1A3547;
      margin: 0 0 3px;
    }
    .art-breed {
      font-size: 0.76rem;
      color: #8BA3B5;
      margin: 0 0 14px;
    }
    .art-bar {
      height: 4px;
      background: #E0EBF2;
      border-radius: 99px;
      margin-bottom: 14px;
      position: relative;
      &::after {
        content: '';
        position: absolute;
        left: 0; top: 0; bottom: 0;
        width: 70%;
        background: linear-gradient(90deg, #FF9F5A, #FF8C42);
        border-radius: 99px;
      }
    }
    .art-progress {
      height: 4px;
      background: #E0EBF2;
      border-radius: 99px;
      margin-top: 8px;
    }
    .art-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #F87171, #DC2626);
      border-radius: 99px;
      transition: width 1s;
    }

    .art-btn {
      width: 100%;
      padding: 9px;
      border-radius: 11px;
      border: none;
      background: linear-gradient(135deg, #FF9F5A, #FF8C42);
      color: #fff;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      font-family: 'Inter', system-ui, sans-serif;
      text-align: center;
    }

    /* Card positions & animations */
    .art-main {
      width: 210px;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      animation: floatMain 6s ease-in-out infinite;
      z-index: 3;
    }
    .art-rescue {
      width: 185px;
      top: 12%; right: 8%;
      animation: floatRescue 7s ease-in-out infinite;
      z-index: 4;
      transform: rotate(-3deg);
    }
    .art-appt {
      width: 178px;
      bottom: 10%; left: 6%;
      animation: floatAppt 8s ease-in-out infinite;
      z-index: 2;
      transform: rotate(2deg);
    }

    @keyframes floatMain {
      0%,100% { transform: translate(-50%,-50%) translateY(0); }
      50%      { transform: translate(-50%,-50%) translateY(-14px); }
    }
    @keyframes floatRescue {
      0%,100% { transform: rotate(-3deg) translateY(0); }
      50%     { transform: rotate(-3deg) translateY(-10px); }
    }
    @keyframes floatAppt {
      0%,100% { transform: rotate(2deg) translateY(0); }
      50%     { transform: rotate(2deg) translateY(-8px); }
    }

    /* Paw decorations */
    .paw-deco {
      position: absolute;
      font-size: 1.4rem;
      opacity: 0.25;
      animation: floatPaw 5s ease-in-out infinite;
    }
    .p1 { top: 18%; left: 18%; animation-delay: 0s; }
    .p2 { bottom: 18%; right: 16%; animation-delay: 1.5s; font-size: 1rem; }
    .p3 { top: 68%; left: 42%; animation-delay: 3s; font-size: 0.8rem; }
    @keyframes floatPaw {
      0%,100% { transform: translateY(0) rotate(-10deg); }
      50%     { transform: translateY(-8px) rotate(-10deg); }
    }

    /* ══════════ STATS STRIP ══════════ */
    .stats-section {
      background: linear-gradient(160deg, #1A3547 0%, #2D5D7B 60%, #FF8C42 100%);
      padding: 60px 6%;
    }
    .stats-inner {
      max-width: 1000px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
      align-items: center;
      text-align: center;
    }
    .stat-item {
      padding: 10px 24px;
      .stat-num {
        font-size: 3rem;
        font-weight: 900;
        color: #FF8C42;
        line-height: 1;
        margin: 0 0 8px;
        letter-spacing: -0.03em;
        span { font-size: 1.8rem; }
      }
      .stat-desc {
        font-size: 0.86rem;
        color: rgba(255,255,255,0.55);
        font-weight: 500;
        margin: 0;
      }
    }
    .stat-divider {
      width: 1px;
      height: 60px;
      background: rgba(255,255,255,0.1);
    }

    /* ══════════ FEATURES ══════════ */
    .features-section {
      padding: 100px 6%;
      background: #F9FBFB;
    }

    .section-label {
      text-align: center;
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: #FF8C42;
      margin: 0 0 12px;
    }
    .section-title {
      text-align: center;
      font-size: 2.5rem;
      font-weight: 900;
      color: #1A3547;
      margin: 0 0 14px;
      letter-spacing: -0.03em;
    }
    .section-sub {
      text-align: center;
      font-size: 1rem;
      color: #4A6478;
      max-width: 540px;
      margin: 0 auto 56px;
      line-height: 1.75;
    }

    /* Bento grid: 3 columns, cards 1&4 span 2 cols */
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      max-width: 1040px;
      margin: 0 auto;
    }

    .bento-card {
      border-radius: 24px;
      border: 1.5px solid #E0EBF2;
      background: #fff;
      padding: 32px;
      box-shadow: 0 4px 24px rgba(26,53,71,0.06);
      transition: all 0.25s ease;
      cursor: default;
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 56px rgba(26,53,71,0.11);
        border-color: #A8C4D4;
      }
    }
    .bento-wide { grid-column: span 2; }

    .bento-icon-box {
      width: 56px; height: 56px;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      mat-icon { color: #fff; font-size: 28px; width: 28px; height: 28px; }
    }

    .bento-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: #1A3547;
      margin: 0 0 10px;
      letter-spacing: -0.01em;
    }
    .bento-desc {
      font-size: 0.88rem;
      color: #4A6478;
      line-height: 1.75;
      margin: 0;
    }
    .bento-tag {
      display: inline-block;
      margin-top: 18px;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    /* CSS fade-up for bento cards */
    .bento-animate {
      opacity: 0;
      transform: translateY(28px);
      animation: fadeUpCard 0.55s ease-out forwards;
    }
    @keyframes fadeUpCard {
      to { opacity: 1; transform: translateY(0); }
    }

    /* ══════════ HOW IT WORKS ══════════ */
    .how-section {
      padding: 100px 6%;
      background: linear-gradient(160deg, #F0F5F9 0%, #F9FBFB 60%);
    }
    .how-inner { max-width: 1040px; margin: 0 auto; }

    .steps-grid {
      display: grid;
      grid-template-columns: 1fr auto 1fr auto 1fr;
      gap: 0 20px;
      align-items: start;
      margin-top: 16px;
    }

    .step-card {
      background: #fff;
      border-radius: 24px;
      border: 1.5px solid #E0EBF2;
      padding: 32px 28px;
      box-shadow: 0 4px 20px rgba(26,53,71,0.06);
      transition: all 0.22s;
      &:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(26,53,71,0.1); border-color: #A8C4D4; }
    }
    .step-num {
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #FF8C42;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    .step-icon-box {
      width: 52px; height: 52px;
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 18px;
      mat-icon { color: #fff; font-size: 24px; width: 24px; height: 24px; }
    }
    .step-title {
      font-size: 1rem;
      font-weight: 800;
      color: #1A3547;
      margin: 0 0 10px;
    }
    .step-desc {
      font-size: 0.85rem;
      color: #4A6478;
      line-height: 1.75;
      margin: 0;
    }

    .step-connector {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding-top: 80px;
      gap: 0;
    }
    .connector-line {
      width: 32px; height: 2px;
      background: linear-gradient(90deg, #E0EBF2, #A8C4D4);
      border-radius: 99px;
    }
    .connector-arrow {
      color: #FF8C42 !important;
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
      margin-top: -4px;
    }

    /* ══════════ CITIES ══════════ */
    .cities-section {
      padding: 80px 6%;
      background: #F9FBFB;
    }

    .cities-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      max-width: 800px;
      margin: 0 auto;
    }

    .city-card {
      border-radius: 18px;
      border: 1.5px solid #E0EBF2;
      background: #fff;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 2px 12px rgba(26,53,71,0.05);
      transition: all 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(26,53,71,0.08); }
      &.city-active { border-color: #A7F3D0; background: #F0FDF4; }
    }

    .city-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
      &.active { background: #22C55E; animation: pulseDot 2s infinite; }
      &.soon   { background: #C8DCE8; }
    }
    .city-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      .city-name { font-weight: 700; font-size: 0.9rem; color: #1A3547; }
      .city-status { font-size: 0.72rem; color: #8BA3B5; }
    }
    .active-badge-chip {
      padding: 2px 8px;
      border-radius: 999px;
      background: #D1FAE5;
      color: #065F46;
      font-size: 0.65rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    /* ══════════ CTA BANNER ══════════ */
    .cta-section {
      padding: 80px 6%;
      background: linear-gradient(160deg, #1A3547 0%, #2D5D7B 60%, #FF8C42 100%);
      position: relative;
      overflow: hidden;
      &::before {
        content: '';
        position: absolute;
        top: -50%; left: -20%;
        width: 600px; height: 600px;
        background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
        border-radius: 50%;
      }
    }
    .cta-inner {
      max-width: 680px;
      margin: 0 auto;
      text-align: center;
      position: relative;
      z-index: 1;
    }
    .cta-paw {
      font-size: 2.5rem;
      margin-bottom: 16px;
      filter: brightness(0) invert(1);
      opacity: 0.6;
    }
    .cta-title {
      font-size: 2.4rem;
      font-weight: 900;
      color: #fff;
      margin: 0 0 14px;
      letter-spacing: -0.02em;
    }
    .cta-sub {
      font-size: 1rem;
      color: rgba(255,255,255,0.82);
      margin: 0 0 36px;
      line-height: 1.7;
    }
    .cta-btns {
      display: flex;
      gap: 14px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn-cta-primary {
      display: inline-flex;
      align-items: center;
      padding: 14px 30px;
      border-radius: 14px;
      background: #fff;
      color: #1A3547;
      font-size: 0.95rem;
      font-weight: 800;
      text-decoration: none;
      box-shadow: 0 6px 24px rgba(0,0,0,0.2);
      transition: all 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(0,0,0,0.25); }
    }
    .btn-cta-ghost {
      display: inline-flex;
      align-items: center;
      padding: 14px 24px;
      border-radius: 14px;
      border: 1.5px solid rgba(255,255,255,0.5);
      background: transparent;
      color: #fff;
      font-size: 0.9rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
      &:hover { background: rgba(255,255,255,0.12); border-color: #fff; }
    }

    /* ══════════ FOOTER ══════════ */
    .landing-footer {
      background: #1A3547;
      padding: 48px 6%;
    }
    .footer-inner {
      max-width: 1040px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .footer-logo-text {
      font-size: 1.1rem;
      font-weight: 900;
      color: #fff;
      letter-spacing: 2px;
      text-transform: uppercase;
      span { color: #FF8C42; }
    }
    .footer-tagline {
      font-size: 0.85rem;
      color: rgba(255,255,255,0.45);
      margin: 0;
    }
    .footer-links {
      display: flex;
      gap: 28px;
      flex-wrap: wrap;
      justify-content: center;
      a {
        font-size: 0.82rem;
        font-weight: 600;
        color: rgba(255,255,255,0.4);
        cursor: pointer;
        transition: color 0.2s;
        text-decoration: none;
        &:hover { color: #FF8C42; }
      }
    }
    .footer-copy {
      font-size: 0.76rem;
      color: rgba(255,255,255,0.25);
      margin: 0;
    }

    /* ══════════ RESPONSIVE ══════════ */
    @media (max-width: 900px) {
      .hero-grid { grid-template-columns: 1fr; gap: 40px; padding: 40px 0 60px; }
      .hero-right { height: 360px; }
      .hero-headline { font-size: 2.8rem; }
      .bento-grid { grid-template-columns: 1fr 1fr; }
      .bento-wide { grid-column: span 2; }
      .steps-grid { grid-template-columns: 1fr; }
      .step-connector { display: none; }
      .stats-inner { grid-template-columns: 1fr 1fr; gap: 0; }
      .stat-divider { display: none; }
      .cities-grid { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 600px) {
      .landing-nav { padding: 0 4%; }
      .nav-links { display: none; }
      .hero-section { padding: 68px 4% 0; }
      .hero-grid { gap: 20px; }
      .hero-headline { font-size: 2.2rem; }
      .bento-grid { grid-template-columns: 1fr; }
      .bento-wide { grid-column: span 1; }
      .cities-grid { grid-template-columns: 1fr 1fr; }
      .stats-inner { grid-template-columns: 1fr; }
      .cta-title { font-size: 1.8rem; }
    }
  `],
  animations: [
    trigger('heroLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-28px)' }),
        animate('650ms 100ms cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, transform: 'none' }))
      ])
    ]),
    trigger('heroRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(28px)' }),
        animate('650ms 250ms cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, transform: 'none' }))
      ])
    ])
  ]
})
export class LandingComponent implements OnInit {

  scrolled = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Redirect already-authenticated users to their dashboard
    if (this.auth.isLoggedIn()) {
      const role = this.auth.getRole();
      const map: Record<string, string> = {
        ADMIN: '/admin',
        NGO: '/ngo',
        HOSPITAL: '/hospital'
      };
      this.router.navigate([map[role ?? ''] ?? '/dashboard']);
      return;
    }

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
      this.scrolled = window.scrollY > 20;
    });
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
