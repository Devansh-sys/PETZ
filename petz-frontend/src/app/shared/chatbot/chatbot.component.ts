import { Component, ElementRef, ViewChild } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  standalone: false,
  selector: 'app-chatbot',
  template: `
    <!-- Floating bubble -->
    <div class="healio-bubble" (click)="toggle()" [class.open]="isOpen" title="Chat with Healio">
      @if (!isOpen) {
        <svg viewBox="0 0 40 40" fill="none" width="26" height="26">
          <ellipse cx="13" cy="8"  rx="3.5" ry="4.2" fill="white" opacity="0.9"/>
          <ellipse cx="27" cy="8"  rx="3.5" ry="4.2" fill="white" opacity="0.9"/>
          <ellipse cx="6"  cy="18" rx="3"   ry="3.8" fill="white" opacity="0.9"/>
          <ellipse cx="34" cy="18" rx="3"   ry="3.8" fill="white" opacity="0.9"/>
          <path d="M20 14C14.5 14 10 18.5 10 23.5C10 27.5 12.5 30.5 16 31.5H24C27.5 30.5 30 27.5 30 23.5C30 18.5 25.5 14 20 14Z" fill="white"/>
        </svg>
      } @else {
        <mat-icon style="color:#fff;font-size:22px;width:22px;height:22px">close</mat-icon>
      }
      @if (!isOpen && unreadCount > 0) {
        <span class="bubble-badge">{{ unreadCount }}</span>
      }
    </div>

    <!-- Chat window -->
    @if (isOpen) {
      <div class="healio-window">

        <!-- Header -->
        <div class="hw-header">
          <div class="hw-avatar">
            <svg viewBox="0 0 40 40" fill="none" width="28" height="28">
              <ellipse cx="13" cy="8"  rx="3.5" ry="4.2" fill="white" opacity="0.9"/>
              <ellipse cx="27" cy="8"  rx="3.5" ry="4.2" fill="white" opacity="0.9"/>
              <ellipse cx="6"  cy="18" rx="3"   ry="3.8" fill="white" opacity="0.9"/>
              <ellipse cx="34" cy="18" rx="3"   ry="3.8" fill="white" opacity="0.9"/>
              <path d="M20 14C14.5 14 10 18.5 10 23.5C10 27.5 12.5 30.5 16 31.5H24C27.5 30.5 30 27.5 30 23.5C30 18.5 25.5 14 20 14Z" fill="white"/>
            </svg>
          </div>
          <div class="hw-title-wrap">
            <span class="hw-name">Healio</span>
            <span class="hw-status"><span class="hw-dot"></span>Online</span>
          </div>
          <button class="hw-clear" (click)="clearChat()" title="Clear chat">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>

        <!-- Messages -->
        <div class="hw-body" #scrollRef>
          @if (messages.length === 0) {
            <div class="hw-intro">
              <div class="hw-intro-icon">🐾</div>
              <p class="hw-intro-title">Hey there! I'm <strong>Healio</strong></p>
              <p class="hw-intro-sub">Your friendly animal care companion. Ask me anything about pets, animal health, or how PETZ works!</p>
              <div class="hw-chips">
                <button class="hw-chip" (click)="quickAsk('How do I book a vet appointment?')">Book appointment</button>
                <button class="hw-chip" (click)="quickAsk('What food is good for dogs?')">Dog nutrition</button>
                <button class="hw-chip" (click)="quickAsk('How does pet adoption work on PETZ?')">Pet adoption</button>
                <button class="hw-chip" (click)="quickAsk('My cat is not eating, what should I do?')">Cat not eating</button>
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
                <div class="hw-bot-avatar">🐾</div>
              }
              <div class="hw-msg" [class.user-msg]="msg.role === 'user'" [class.bot-msg]="msg.role === 'assistant'">
                {{ msg.content }}
              </div>
            </div>
          }

          @if (thinking) {
            <div class="hw-msg-wrap">
              <div class="hw-bot-avatar">🐾</div>
              <div class="hw-msg bot-msg hw-typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          }
        </div>

        <!-- Caution disclaimer -->
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
            placeholder="Ask about pets or PETZ…"
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
    /* ── Floating bubble ── */
    .healio-bubble {
      position: fixed; bottom: 28px; right: 28px; z-index: 9999;
      width: 58px; height: 58px; border-radius: 50%;
      background: linear-gradient(135deg, #FF8C42, #E07030);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; box-shadow: 0 6px 24px rgba(255,140,66,0.45);
      transition: transform 0.22s ease, box-shadow 0.22s ease;
      user-select: none;
      &:hover { transform: scale(1.1); box-shadow: 0 10px 32px rgba(255,140,66,0.55); }
      &.open { background: linear-gradient(135deg, #4A6478, #1A3547); box-shadow: 0 6px 24px rgba(26,53,71,0.35); }
    }
    .bubble-badge {
      position: absolute; top: -2px; right: -2px;
      background: #E05858; color: #fff;
      font-size: 0.6rem; font-weight: 800;
      width: 18px; height: 18px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid #fff;
    }

    /* ── Chat window ── */
    .healio-window {
      position: fixed; bottom: 100px; right: 28px; z-index: 9998;
      width: 340px; height: 480px;
      background: #fff; border-radius: 22px;
      box-shadow: 0 20px 60px rgba(26,53,71,0.22);
      display: flex; flex-direction: column; overflow: hidden;
      animation: hwSlide 0.22s cubic-bezier(0.4,0,0.2,1);
    }
    @keyframes hwSlide {
      from { opacity: 0; transform: translateY(18px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)   scale(1); }
    }

    /* Header */
    .hw-header {
      display: flex; align-items: center; gap: 10px;
      background: linear-gradient(135deg, #FF8C42 0%, #E07030 100%);
      padding: 14px 14px 12px; flex-shrink: 0;
    }
    .hw-avatar {
      width: 40px; height: 40px; border-radius: 12px;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .hw-title-wrap { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .hw-name   { font-size: 0.95rem; font-weight: 800; color: #fff; line-height: 1; }
    .hw-status { display: flex; align-items: center; gap: 5px; font-size: 0.65rem; color: rgba(255,255,255,0.8); }
    .hw-dot    {
      width: 6px; height: 6px; border-radius: 50%; background: #A8FFCA; flex-shrink: 0;
      animation: hwBlink 2s ease-in-out infinite;
    }
    @keyframes hwBlink { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .hw-clear {
      background: rgba(255,255,255,0.15) !important; border: none !important;
      color: #fff !important; border-radius: 8px !important;
      width: 30px !important; height: 30px !important;
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &:hover { background: rgba(255,255,255,0.28) !important; }
    }

    /* Messages area */
    .hw-body {
      flex: 1; overflow-y: auto; padding: 14px 12px;
      display: flex; flex-direction: column; gap: 10px;
      &::-webkit-scrollbar { width: 3px; }
      &::-webkit-scrollbar-thumb { background: #E0EBF2; border-radius: 999px; }
    }

    /* Intro state */
    .hw-intro {
      display: flex; flex-direction: column; align-items: center;
      text-align: center; padding: 8px 4px; gap: 6px;
    }
    .hw-intro-icon { font-size: 2rem; line-height: 1; margin-bottom: 4px; }
    .hw-intro-title { font-size: 0.88rem; font-weight: 700; color: #1A3547; margin: 0; }
    .hw-intro-sub   { font-size: 0.75rem; color: #8BA3B5; line-height: 1.5; margin: 0; }
    .hw-chips { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-top: 8px; }
    .hw-chip {
      font-size: 0.68rem; font-weight: 600; color: #E07030;
      background: #FFF3E8; border: 1.5px solid #FFD4A8;
      border-radius: 999px; padding: 4px 10px; cursor: pointer;
      transition: all 0.15s ease;
      &:hover { background: #FF8C42; color: #fff; border-color: #FF8C42; }
    }

    .hw-intro-caution {
      display: flex; align-items: flex-start; gap: 6px;
      background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px;
      padding: 8px 10px; margin-top: 6px;
      font-size: 0.65rem; font-weight: 600; color: #92400E; line-height: 1.45; text-align: left;
      mat-icon { font-size: 13px; width: 13px; height: 13px; color: #D97706; flex-shrink: 0; margin-top: 1px; }
    }

    /* Message bubbles */
    .hw-msg-wrap {
      display: flex; align-items: flex-end; gap: 7px;
      &.user-wrap { flex-direction: row-reverse; }
    }
    .hw-bot-avatar {
      font-size: 1.1rem; line-height: 1;
      width: 26px; height: 26px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      background: #FFF3E8; border-radius: 50%;
    }
    .hw-msg {
      max-width: 78%; padding: 9px 13px; border-radius: 16px;
      font-size: 0.81rem; line-height: 1.55; white-space: pre-wrap;
    }
    .bot-msg  {
      background: #F4F7FA; color: #1A3547;
      border-radius: 16px 16px 16px 4px;
    }
    .user-msg {
      background: linear-gradient(135deg, #FF8C42, #E07030);
      color: #fff; border-radius: 16px 16px 4px 16px;
    }

    /* Typing dots */
    .hw-typing {
      display: flex; align-items: center; gap: 5px;
      padding: 12px 16px !important;
      span {
        width: 7px; height: 7px; border-radius: 50%; background: #8BA3B5;
        animation: hwBounce 1.3s ease-in-out infinite;
        &:nth-child(2) { animation-delay: 0.18s; }
        &:nth-child(3) { animation-delay: 0.36s; }
      }
    }
    @keyframes hwBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-7px)} }

    /* Disclaimer strip */
    .hw-disclaimer {
      display: flex; align-items: center; gap: 6px;
      background: #FFFBEB; border-top: 1px solid #FDE68A;
      padding: 6px 12px; flex-shrink: 0;
      font-size: 0.62rem; font-weight: 600; color: #92400E;
      line-height: 1.4;
      mat-icon { font-size: 13px; width: 13px; height: 13px; color: #D97706; flex-shrink: 0; }
    }

    /* Footer input */
    .hw-footer {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 12px; border-top: 1px solid #F0F4F8; flex-shrink: 0;
    }
    .hw-input {
      flex: 1; border: 1.5px solid #E0EBF2; border-radius: 12px;
      padding: 8px 12px; font-size: 0.82rem; outline: none;
      color: #1A3547; font-family: inherit;
      transition: border-color 0.15s;
      &:focus { border-color: #FF8C42; }
      &::placeholder { color: #B0C4D4; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .hw-send {
      width: 38px; height: 38px; flex-shrink: 0;
      border: none; border-radius: 11px; cursor: pointer;
      background: linear-gradient(135deg, #FF8C42, #E07030);
      display: flex; align-items: center; justify-content: center;
      transition: opacity 0.15s, transform 0.15s;
      mat-icon { color: #fff; font-size: 18px; width: 18px; height: 18px; }
      &:hover:not(:disabled) { transform: scale(1.08); }
      &:disabled { opacity: 0.38; cursor: not-allowed; transform: none; }
    }
  `]
})
export class ChatbotComponent {

  isOpen      = false;
  inputText   = '';
  thinking    = false;
  unreadCount = 0;
  messages: ChatMessage[] = [];

  @ViewChild('scrollRef') scrollRef!: ElementRef<HTMLDivElement>;
  @ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement>;

  constructor(private api: ApiService) {}

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.unreadCount = 0;
      setTimeout(() => {
        this.scrollToBottom();
        this.inputRef?.nativeElement?.focus();
      }, 80);
    }
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

    // Send everything except the last user message as history
    const history = this.messages.slice(0, -1).map(m => ({
      role:    m.role,
      content: m.content
    }));

    this.api.post<any>('/chat', { message: msg, history }).subscribe({
      next: res => {
        const reply = res?.response ?? 'Hmm, I couldn\'t get a response. Try again! 🐾';
        this.messages.push({ role: 'assistant', content: reply });
        this.thinking = false;
        this.scrollToBottom();
        if (!this.isOpen) this.unreadCount++;
      },
      error: () => {
        this.messages.push({
          role: 'assistant',
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

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.scrollRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 60);
  }
}
