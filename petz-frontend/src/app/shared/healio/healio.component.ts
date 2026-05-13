import {
  Component, OnInit, AfterViewChecked,
  OnDestroy, ElementRef, ViewChild
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HealioService } from '../../core/services/healio.service';
import { AuthService }   from '../../core/services/auth.service';

export interface HealioMsg {
  role:    'user' | 'healio';
  text:    string;
  time:    string;
  typing?: boolean;
  html?:   SafeHtml;
}

@Component({
  standalone: false,
  selector: 'app-healio',
  templateUrl: './healio.component.html',
  styleUrls: ['./healio.component.scss']
})
export class HealioComponent implements OnInit, AfterViewChecked, OnDestroy {

  @ViewChild('chatBody') chatBody!: ElementRef;

  open        = false;
  messages: HealioMsg[] = [];
  inputText   = '';
  loading     = false;
  initialized = false;
  userName    = '';

  private shouldScroll = false;

  constructor(
    private healio:    HealioService,
    private auth:      AuthService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(u => {
      this.userName = u?.name?.split(' ')[0] ?? 'there';
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.healio.resetSession();
  }

  // ─────────────────────────────────────────────────────────────

  async toggle(): Promise<void> {
    this.open = !this.open;
    if (this.open && !this.initialized) {
      await this.initialize();
    }
    if (this.open) this.shouldScroll = true;
  }

  close(): void { this.open = false; }

  async send(): Promise<void> {
    const text = this.inputText.trim();
    if (!text || this.loading) return;

    this.inputText = '';
    this.pushUser(text);
    this.loading = true;

    // Show animated typing indicator
    const typingMsg: HealioMsg = {
      role: 'healio', text: '', time: this.now(), typing: true,
    };
    this.messages.push(typingMsg);
    this.shouldScroll = true;

    try {
      const reply = await this.healio.sendMessage(text);
      this.messages = this.messages.filter(m => !m.typing);
      this.pushHealio(reply);
    } catch (err: any) {
      this.messages = this.messages.filter(m => !m.typing);
      const is429 = err?.message?.includes('429') || err?.status === 429
                 || JSON.stringify(err).includes('429');
      if (is429) {
        this.pushHealio("I'm getting too many requests right now 🐾 — the free tier allows 30/min. Please wait a moment and try again!");
      } else {
        this.pushHealio("Sorry, I couldn't reach my brain right now 🐾 — please try again in a moment!");
      }
    } finally {
      this.loading = false;
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────

  private async initialize(): Promise<void> {
    this.initialized = true;
    this.loading = true;
    try {
      await this.healio.initSession();
      this.pushHealio(
        `Hi ${this.userName}! 🐾 I'm **Healio**, your PETZ AI assistant.\n\n`
        + `I already know about your pets and appointments. `
        + `Ask me anything — pet health tips, how to use the platform, or just chat!`
      );
    } catch {
      this.pushHealio(
        `Hi ${this.userName}! I'm Healio 🐾 — your PETZ assistant.\n\n`
        + `I'm having a little trouble connecting right now. `
        + `Please check your Gemini API key in environment.ts and try again.`
      );
    } finally {
      this.loading = false;
    }
  }

  private pushUser(text: string): void {
    this.messages.push({ role: 'user', text, time: this.now() });
    this.shouldScroll = true;
  }

  private pushHealio(text: string): void {
    this.messages.push({
      role: 'healio',
      text,
      time: this.now(),
      html: this.renderMarkdown(text),
    });
    this.shouldScroll = true;
  }

  /** Very light Markdown → safe HTML (bold, italic, bullet lists, line-breaks) */
  renderMarkdown(text: string): SafeHtml {
    let html = text
      // Escape HTML entities first
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      // Bold **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic *text*
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Bullet list items that start with "- "
      .replace(/(?:^|\n)- (.+)/g, '\n<li>$1</li>')
      // Wrap consecutive <li> in <ul>
      .replace(/(<li>.*?<\/li>(\n|$))+/gs, match => `<ul>${match}</ul>`)
      // Line breaks
      .replace(/\n/g, '<br>');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private scrollBottom(): void {
    try {
      const el = this.chatBody?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch { /* noop */ }
  }

  private now(): string {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
}
