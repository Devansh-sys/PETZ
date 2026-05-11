import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  actionRoute?: string;
  actionLabel?: string;
}

@Component({
  standalone: false,
  selector: 'app-chatbot',
  template: `
    <!-- Floating bubble -->
    <div class="healio-bubble" (click)="toggle()" [class.open]="isOpen" title="Chat with Healio">
      <div class="bubble-ring"></div>
      @if (!isOpen) {
        <svg viewBox="0 0 40 40" fill="none" width="26" height="26">
          <circle cx="20" cy="20" r="8" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" stroke-width="1.2"/>
          <circle cx="20" cy="20" r="3" fill="white"/>
          <line x1="20" y1="6"  x2="20" y2="11" stroke="white" stroke-width="2" stroke-linecap="round"/>
          <line x1="20" y1="29" x2="20" y2="34" stroke="white" stroke-width="2" stroke-linecap="round"/>
          <line x1="6"  y1="20" x2="11" y2="20" stroke="white" stroke-width="2" stroke-linecap="round"/>
          <line x1="29" y1="20" x2="34" y2="20" stroke="white" stroke-width="2" stroke-linecap="round"/>
          <line x1="10.1" y1="10.1" x2="13.6" y2="13.6" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="26.4" y1="26.4" x2="29.9" y2="29.9" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="29.9" y1="10.1" x2="26.4" y2="13.6" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="13.6" y1="26.4" x2="10.1" y2="29.9" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      } @else {
        <mat-icon style="color:rgba(255,255,255,0.85);font-size:20px;width:20px;height:20px">close</mat-icon>
      }
      @if (!isOpen && unreadCount > 0) {
        <span class="bubble-badge">{{ unreadCount }}</span>
      }
    </div>

    <!-- Transparent backdrop — click anywhere outside to close -->
    @if (isOpen) {
      <div class="healio-backdrop" (click)="isOpen = false"></div>
    }

    <!-- Chat window -->
    @if (isOpen) {
      <div class="healio-window">

        <!-- Header -->
        <div class="hw-header">
          <div class="hw-avatar">
            <svg viewBox="0 0 40 40" fill="none" width="22" height="22">
              <circle cx="20" cy="20" r="7" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.7)" stroke-width="1.4"/>
              <circle cx="20" cy="20" r="3" fill="white"/>
              <line x1="20" y1="8"  x2="20" y2="12" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <line x1="20" y1="28" x2="20" y2="32" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <line x1="8"  y1="20" x2="12" y2="20" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <line x1="28" y1="20" x2="32" y2="20" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="hw-title-wrap">
            <span class="hw-name">Healio</span>
            <span class="hw-status"><span class="hw-dot"></span>Online · {{ roleLabel }}</span>
          </div>
          <button class="hw-clear" (click)="clearChat()" title="Clear chat">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>

        <!-- Messages -->
        <div class="hw-body" #scrollRef>
          @if (messages.length === 0 && !thinking) {
            <div class="hw-intro">
              <div class="hw-intro-icon">✦</div>
              <p class="hw-intro-title">Hey{{ firstName ? ' ' + firstName : '' }}! I'm <strong>Healio</strong></p>
              <p class="hw-intro-sub">{{ introSubtitle }}</p>
              <div class="hw-chips">
                @for (chip of roleChips; track chip.label) {
                  <button class="hw-chip" (click)="quickAsk(chip.question)">{{ chip.label }}</button>
                }
              </div>
              <div class="hw-intro-caution">
                <mat-icon>warning_amber</mat-icon>
                AI responses may not always be accurate. For serious health concerns, always visit a certified veterinarian.
              </div>
            </div>
          }

          @for (msg of messages; track $index) {
            <div class="hw-msg-wrap" [class.user-wrap]="msg.role === 'user'">
              @if (msg.role === 'assistant') {
                <div class="hw-bot-avatar">✦</div>
              }
              <div class="hw-msg-group" [class.user-group]="msg.role === 'user'">
                <div class="hw-msg"
                     [class.user-msg]="msg.role === 'user'"
                     [class.bot-msg]="msg.role === 'assistant'">
                  {{ msg.content }}
                </div>
                @if (msg.actionRoute) {
                  <button class="hw-action-btn" (click)="navigate(msg.actionRoute!)">
                    <mat-icon>open_in_new</mat-icon>
                    {{ msg.actionLabel || 'View Details' }}
                  </button>
                }
              </div>
            </div>
          }

          @if (thinking) {
            <div class="hw-msg-wrap">
              <div class="hw-bot-avatar">✦</div>
              <div class="hw-msg bot-msg hw-typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          }
        </div>

        <!-- Disclaimer -->
        <div class="hw-disclaimer">
          <mat-icon>warning_amber</mat-icon>
          Healio can make mistakes. Always consult a qualified vet for medical decisions.
        </div>

        <!-- Input -->
        <div class="hw-footer">
          <input
            #inputRef
            class="hw-input"
            [(ngModel)]="inputText"
            (keyup.enter)="send()"
            placeholder="Ask anything about PETZ or pets…"
            [disabled]="thinking"
            maxlength="500">
          <button class="hw-send" (click)="send()" [disabled]="!inputText.trim() || thinking">
            <mat-icon>send</mat-icon>
          </button>
        </div>

      </div>
    }
  `,
  styles: [`
    /* ══════════════════════════════════════════
       HEALIO — Classy & Futuristic Theme
       Palette: Deep space navy · Purple · Cyan
    ══════════════════════════════════════════ */

    .healio-bubble {
      position: fixed; bottom: 28px; right: 28px; z-index: 9999;
      width: 58px; height: 58px; border-radius: 50%;
      background: linear-gradient(135deg, #6D28D9 0%, #0891B2 100%);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      box-shadow: 0 8px 32px rgba(109,40,217,0.5), 0 0 0 0 rgba(109,40,217,0.3);
      transition: transform 0.22s ease, box-shadow 0.22s ease;
      animation: bubblePulse 3.5s ease-in-out infinite;
      user-select: none;
      &:hover { transform: scale(1.1); box-shadow: 0 12px 40px rgba(109,40,217,0.65); }
      &.open {
        background: linear-gradient(135deg, #1E1B4B, #0F172A);
        box-shadow: 0 6px 24px rgba(0,0,0,0.6);
        animation: none;
      }
    }
    .bubble-ring {
      position: absolute; inset: -6px; border-radius: 50%;
      border: 1.5px solid rgba(109,40,217,0.4);
      animation: ringExpand 3.5s ease-in-out infinite;
      pointer-events: none;
    }
    @keyframes bubblePulse {
      0%,100% { box-shadow: 0 8px 32px rgba(109,40,217,0.5), 0 0 0 0 rgba(109,40,217,0.35); }
      50%      { box-shadow: 0 8px 32px rgba(109,40,217,0.7), 0 0 0 14px rgba(109,40,217,0); }
    }
    @keyframes ringExpand {
      0%,100% { transform: scale(1);    opacity: 0.6; }
      50%      { transform: scale(1.25); opacity: 0; }
    }
    .bubble-badge {
      position: absolute; top: -3px; right: -3px;
      background: linear-gradient(135deg, #EC4899, #F43F5E); color: #fff;
      font-size: 0.58rem; font-weight: 900;
      width: 18px; height: 18px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid #0F0F1E;
      box-shadow: 0 2px 8px rgba(244,63,94,0.5);
    }

    /* ── Backdrop (click-outside-to-close) ── */
    .healio-backdrop {
      position: fixed; inset: 0; z-index: 9997;
      background: transparent; cursor: default;
    }

    /* ── Chat window ── */
    .healio-window {
      position: fixed; bottom: 100px; right: 28px; z-index: 9998;
      width: 370px; height: 530px;
      background: linear-gradient(160deg, #0F1628 0%, #08091A 100%);
      border: 1px solid rgba(109,40,217,0.28);
      border-radius: 24px;
      box-shadow:
        0 0 0 1px rgba(8,145,178,0.08),
        0 32px 80px rgba(0,0,0,0.75),
        0 0 80px rgba(109,40,217,0.06);
      display: flex; flex-direction: column; overflow: hidden;
      animation: hwSlide 0.25s cubic-bezier(0.4,0,0.2,1);
    }
    @keyframes hwSlide {
      from { opacity: 0; transform: translateY(20px) scale(0.96); }
      to   { opacity: 1; transform: translateY(0)    scale(1); }
    }

    /* ── Header ── */
    .hw-header {
      display: flex; align-items: center; gap: 10px;
      background: linear-gradient(135deg, rgba(109,40,217,0.3) 0%, rgba(8,145,178,0.2) 100%);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      padding: 14px 14px 13px; flex-shrink: 0;
      position: relative;
      &::after {
        content: '';
        position: absolute; bottom: 0; left: 10%; right: 10%; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(109,40,217,0.8), rgba(8,145,178,0.8), transparent);
      }
    }
    .hw-avatar {
      width: 40px; height: 40px; border-radius: 12px;
      background: linear-gradient(135deg, rgba(109,40,217,0.5), rgba(8,145,178,0.4));
      border: 1px solid rgba(139,92,246,0.4);
      box-shadow: 0 0 16px rgba(109,40,217,0.3);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .hw-title-wrap { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .hw-name {
      font-size: 0.95rem; font-weight: 800; line-height: 1;
      background: linear-gradient(90deg, #C4B5FD, #67E8F9);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      letter-spacing: 0.02em;
    }
    .hw-status { display: flex; align-items: center; gap: 5px; font-size: 0.63rem; color: rgba(148,163,184,0.7); }
    .hw-dot {
      width: 6px; height: 6px; border-radius: 50%; background: #34D399; flex-shrink: 0;
      box-shadow: 0 0 6px rgba(52,211,153,0.9);
      animation: hwBlink 2.5s ease-in-out infinite;
    }
    @keyframes hwBlink { 0%,100%{opacity:1} 50%{opacity:0.35} }
    .hw-clear {
      background: rgba(255,255,255,0.06) !important; border: none !important;
      color: rgba(148,163,184,0.7) !important; border-radius: 8px !important;
      width: 30px !important; height: 30px !important;
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      transition: all 0.15s;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
      &:hover { background: rgba(109,40,217,0.3) !important; color: #C4B5FD !important; }
    }

    /* ── Messages body ── */
    .hw-body {
      flex: 1; overflow-y: auto; padding: 16px 12px;
      display: flex; flex-direction: column; gap: 10px;
      &::-webkit-scrollbar { width: 3px; }
      &::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, rgba(109,40,217,0.5), rgba(8,145,178,0.5));
        border-radius: 999px;
      }
    }

    /* ── Intro state ── */
    .hw-intro {
      display: flex; flex-direction: column; align-items: center;
      text-align: center; padding: 8px 6px; gap: 7px;
    }
    .hw-intro-icon {
      font-size: 1.8rem; line-height: 1; margin-bottom: 2px;
      background: linear-gradient(135deg, #A78BFA, #67E8F9);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 8px rgba(167,139,250,0.6));
    }
    .hw-intro-title { font-size: 0.88rem; font-weight: 700; margin: 0; color: #E2E8F0; }
    .hw-intro-sub { font-size: 0.74rem; color: rgba(148,163,184,0.75); line-height: 1.55; margin: 0; }
    .hw-chips { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-top: 4px; }
    .hw-chip {
      font-size: 0.66rem; font-weight: 600; color: #A78BFA;
      background: rgba(109,40,217,0.12);
      border: 1px solid rgba(109,40,217,0.35);
      border-radius: 999px; padding: 5px 11px; cursor: pointer;
      transition: all 0.18s ease; white-space: nowrap;
      &:hover {
        background: rgba(109,40,217,0.3); border-color: rgba(139,92,246,0.7);
        color: #C4B5FD; box-shadow: 0 0 14px rgba(109,40,217,0.3);
      }
    }
    .hw-intro-caution {
      display: flex; align-items: flex-start; gap: 6px;
      background: rgba(251,191,36,0.07); border: 1px solid rgba(251,191,36,0.18);
      border-radius: 10px; padding: 8px 10px; margin-top: 2px;
      font-size: 0.63rem; font-weight: 500; color: rgba(253,230,138,0.75);
      line-height: 1.5; text-align: left;
      mat-icon { font-size: 13px; width: 13px; height: 13px; color: rgba(251,191,36,0.6); flex-shrink: 0; margin-top: 1px; }
    }

    /* ── Message bubbles ── */
    .hw-msg-wrap {
      display: flex; align-items: flex-end; gap: 7px;
      &.user-wrap { flex-direction: row-reverse; }
    }
    .hw-msg-group {
      display: flex; flex-direction: column; gap: 5px; max-width: 80%;
      &.user-group { align-items: flex-end; }
    }
    .hw-bot-avatar {
      font-size: 0.75rem; line-height: 1; font-weight: 900;
      width: 28px; height: 28px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, rgba(109,40,217,0.25), rgba(8,145,178,0.2));
      border: 1px solid rgba(109,40,217,0.35); border-radius: 50%; color: #A78BFA;
    }
    .hw-msg {
      padding: 10px 14px; border-radius: 16px;
      font-size: 0.81rem; line-height: 1.6; white-space: pre-wrap;
    }
    .bot-msg {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      color: #CBD5E1; border-radius: 16px 16px 16px 4px;
      backdrop-filter: blur(8px);
    }
    .user-msg {
      background: linear-gradient(135deg, #6D28D9, #0891B2);
      color: #fff; border-radius: 16px 16px 4px 16px;
      box-shadow: 0 4px 20px rgba(109,40,217,0.4);
    }

    /* ── Deep-link action button ── */
    .hw-action-btn {
      display: inline-flex; align-items: center; gap: 5px;
      background: rgba(109,40,217,0.18);
      border: 1px solid rgba(109,40,217,0.45);
      color: #A78BFA; border-radius: 10px;
      padding: 5px 12px; font-size: 0.68rem; font-weight: 700;
      cursor: pointer; transition: all 0.18s ease;
      font-family: inherit; white-space: nowrap;
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
      &:hover {
        background: rgba(109,40,217,0.35);
        border-color: rgba(139,92,246,0.7);
        color: #C4B5FD;
        box-shadow: 0 0 14px rgba(109,40,217,0.3);
        transform: translateY(-1px);
      }
    }

    /* ── Typing dots ── */
    .hw-typing {
      display: flex; align-items: center; gap: 5px; padding: 12px 16px !important;
      span {
        width: 7px; height: 7px; border-radius: 50%;
        background: rgba(167,139,250,0.6);
        animation: hwBounce 1.4s ease-in-out infinite;
        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
      }
    }
    @keyframes hwBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-7px)} }

    /* ── Disclaimer ── */
    .hw-disclaimer {
      display: flex; align-items: center; gap: 6px;
      background: rgba(0,0,0,0.35); border-top: 1px solid rgba(255,255,255,0.05);
      padding: 6px 12px; flex-shrink: 0;
      font-size: 0.61rem; font-weight: 500; color: rgba(100,116,139,0.8); line-height: 1.4;
      mat-icon { font-size: 12px; width: 12px; height: 12px; color: rgba(100,116,139,0.6); flex-shrink: 0; }
    }

    /* ── Input footer ── */
    .hw-footer {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 12px; border-top: 1px solid rgba(255,255,255,0.06);
      background: rgba(0,0,0,0.25); flex-shrink: 0;
    }
    .hw-input {
      flex: 1; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
      padding: 9px 13px; font-size: 0.82rem; outline: none;
      background: rgba(255,255,255,0.05); color: #E2E8F0; font-family: inherit;
      transition: border-color 0.2s, box-shadow 0.2s;
      &:focus { border-color: rgba(109,40,217,0.6); box-shadow: 0 0 0 3px rgba(109,40,217,0.12); }
      &::placeholder { color: rgba(100,116,139,0.5); }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    }
    .hw-send {
      width: 38px; height: 38px; flex-shrink: 0;
      border: none; border-radius: 11px; cursor: pointer;
      background: linear-gradient(135deg, #6D28D9, #0891B2);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px rgba(109,40,217,0.45);
      transition: transform 0.15s, box-shadow 0.15s;
      mat-icon { color: #fff; font-size: 17px; width: 17px; height: 17px; }
      &:hover:not(:disabled) { transform: scale(1.1); box-shadow: 0 6px 22px rgba(109,40,217,0.6); }
      &:disabled { opacity: 0.3; cursor: not-allowed; transform: none; box-shadow: none; }
    }
  `]
})
export class ChatbotComponent implements OnInit {

  isOpen      = false;
  inputText   = '';
  thinking    = false;
  unreadCount = 0;
  messages: ChatMessage[] = [];

  // User context (loaded from AuthService on init)
  private userId:    number | null = null;
  private userRole:  string | null = null;
  private userName:  string | null = null;
  private userEmail: string | null = null;

  @ViewChild('scrollRef') scrollRef!: ElementRef<HTMLDivElement>;
  @ViewChild('inputRef')  inputRef!:  ElementRef<HTMLInputElement>;

  constructor(
    private api:    ApiService,
    private auth:   AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const u = this.auth.currentUser$.value;
    if (u) {
      this.userId    = u.userId  ?? null;
      this.userRole  = u.role    ?? null;
      this.userName  = u.name    ?? null;
      this.userEmail = u.email   ?? null;
    }
  }

  // ── Computed display helpers ───────────────────────────────────────────

  get firstName(): string {
    return this.userName ? this.userName.split(' ')[0] : '';
  }

  get roleLabel(): string {
    switch (this.userRole?.toUpperCase()) {
      case 'HOSPITAL': return 'Hospital';
      case 'NGO':      return 'NGO';
      case 'ADMIN':    return 'Admin';
      default:         return 'Pet Owner';
    }
  }

  get introSubtitle(): string {
    switch (this.userRole?.toUpperCase()) {
      case 'HOSPITAL':
        return `Ask me anything about PETZ or pets — appointments, today's schedule, animal care tips, and more.`;
      case 'NGO':
        return `Ask me anything about PETZ or pets — your animals, adoption applications, rescues, or animal care advice.`;
      case 'ADMIN':
        return `Ask me anything about PETZ or pets — platform stats, pending approvals, or general animal care queries.`;
      default:
        return `Ask me anything about PETZ or pets — appointments, adoption, animal care tips, and more!`;
    }
  }

  get roleChips(): { label: string; question: string }[] {
    switch (this.userRole?.toUpperCase()) {
      case 'HOSPITAL':
        return [
          { label: "Today's schedule",     question: "Show me today's appointments"                      },
          { label: "Pending confirmations", question: "Show appointments pending confirmation"             },
          { label: "All appointments",      question: "Show all my hospital appointments"                 },
          { label: "Hospital profile",      question: "Show my hospital profile details"                  },
        ];
      case 'NGO':
        return [
          { label: "My animals",            question: "Show me all animals I have listed for adoption"    },
          { label: "Adoption applications", question: "Show me all adoption applications received"        },
          { label: "Rescue reports",        question: "Show rescue reports assigned to my NGO"            },
          { label: "NGO profile",           question: "Show my NGO profile details"                       },
        ];
      case 'ADMIN':
        return [
          { label: "Platform stats",        question: "Show me the PETZ platform statistics"              },
          { label: "Pending approvals",     question: "Who is waiting for account approval?"              },
          { label: "Active rescues",        question: "How many rescues are currently in progress?"       },
          { label: "Total users",           question: "How many users are registered on PETZ?"            },
        ];
      default: // USER / PET_OWNER
        return [
          { label: "My appointments",       question: "Show me my vet appointments"                       },
          { label: "Adoption applications", question: "Show me my pet adoption applications"              },
          { label: "My pets",               question: "Show me my registered pets"                        },
          { label: "Book appointment",      question: "How do I book a vet appointment on PETZ?"          },
        ];
    }
  }

  // ── Chat lifecycle ─────────────────────────────────────────────────────

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.unreadCount = 0;
      setTimeout(() => {
        this.scrollToBottom();
        this.inputRef?.nativeElement?.focus();
      }, 80);
      // Proactive greeting on first open (only if logged in)
      if (this.messages.length === 0 && this.userId) {
        this.sendInit();
      }
    }
  }

  /** Sends a silent __init__ message to get a personalised proactive greeting */
  private sendInit(): void {
    this.thinking = true;
    this.api.post<any>('/chat', { message: '__init__', ...this.userContext }).subscribe({
      next: res => {
        const reply = res?.response ?? `Hi${this.firstName ? ' ' + this.firstName : ''}! 👋 I'm Healio, your PETZ companion. How can I help you today?`;
        this.messages.push({ role: 'assistant', content: reply });
        this.thinking = false;
        this.scrollToBottom();
      },
      error: () => { this.thinking = false; }
    });
  }

  quickAsk(question: string): void {
    this.inputText = question;
    this.send();
  }

  send(): void {
    const msg = this.inputText.trim();
    if (!msg || this.thinking) return;

    this.messages.push({ role: 'user', content: msg });
    this.inputText = '';
    this.thinking  = true;
    this.scrollToBottom();

    // History = everything except the last user message just pushed
    const history = this.messages.slice(0, -1).map(m => ({
      role:    m.role,
      content: m.content
    }));

    this.api.post<any>('/chat', { message: msg, history, ...this.userContext }).subscribe({
      next: res => {
        const reply = res?.response ?? "Hmm, I couldn't get a response. Try again! 🐾";
        const botMsg: ChatMessage = {
          role:        'assistant',
          content:     reply,
          actionRoute: res?.suggestedRoute  ?? undefined,
          actionLabel: res?.suggestedRouteLabel ?? undefined,
        };
        this.messages.push(botMsg);
        this.thinking = false;
        this.scrollToBottom();
        if (!this.isOpen) this.unreadCount++;
      },
      error: () => {
        this.messages.push({
          role:    'assistant',
          content: 'Oops, I dozed off for a second 😴 Please try again!'
        });
        this.thinking = false;
        this.scrollToBottom();
      }
    });
  }

  clearChat(): void {
    this.messages    = [];
    this.unreadCount = 0;
    this.thinking    = false;
  }

  navigate(route: string): void {
    this.isOpen = false;
    this.router.navigate([route]);
  }

  // ── Utilities ─────────────────────────────────────────────────────────

  private get userContext() {
    return {
      userId:    this.userId,
      role:      this.userRole,
      userName:  this.userName,
      userEmail: this.userEmail,
    };
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.scrollRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 60);
  }
}
