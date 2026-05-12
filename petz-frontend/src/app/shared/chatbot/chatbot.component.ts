import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BotOption {
  label: string;
  key: string;
}

interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
  options?: BotOption[];
  steps?: string[];
  isMainMenu?: boolean;
}

interface CommandNode {
  text: string;
  steps?: string[];
  options?: BotOption[];
}

// ─── Command Tree ─────────────────────────────────────────────────────────────

const MAIN_MENU: Record<string, BotOption[]> = {
  USER: [
    { label: '🚨 Report a Rescue',       key: 'rescue_report'    },
    { label: '📋 Track My Rescues',       key: 'my_rescues'       },
    { label: '🐾 Adopt an Animal',        key: 'adopt'            },
    { label: '📅 Book Appointment',       key: 'book_appt'        },
    { label: '🗓️ My Appointments',        key: 'my_appts'         },
    { label: '🐶 Manage My Pets',         key: 'my_pets'          },
    { label: '🔔 Notifications',          key: 'notifications'    },
    { label: '👤 My Profile',             key: 'profile'          },
  ],
  NGO: [
    { label: '🚨 Rescue Queue',           key: 'ngo_rescue_queue' },
    { label: '✅ Accept / Decline Rescue', key: 'ngo_respond'      },
    { label: '🐾 Add Adoptable Animal',   key: 'ngo_add_animal'   },
    { label: '📋 Adoption Applications',  key: 'ngo_applications' },
    { label: '🏢 NGO Profile',            key: 'ngo_profile'      },
    { label: '🔔 Notifications',          key: 'notifications'    },
  ],
  HOSPITAL: [
    { label: '🩺 Manage Doctors',         key: 'hosp_doctors'     },
    { label: '📅 View Appointments',      key: 'hosp_appts'       },
    { label: '🏥 Hospital Profile',       key: 'hosp_profile'     },
    { label: '🔔 Notifications',          key: 'notifications'    },
  ],
  ADMIN: [
    { label: '✅ Approve NGOs/Hospitals', key: 'admin_approve'    },
    { label: '👥 User Management',        key: 'admin_users'      },
    { label: '🏢 Manage NGOs',            key: 'admin_ngos'       },
    { label: '🏥 Manage Hospitals',       key: 'admin_hospitals'  },
    { label: '🚨 All Rescues',            key: 'admin_rescues'    },
  ],
};

const COMMANDS: Record<string, CommandNode> = {

  // ── USER ──────────────────────────────────────────────────────────────────

  rescue_report: {
    text: '🚨 Here\'s how to report an animal rescue:',
    steps: [
      'Click "Rescue" in the left sidebar',
      'Click the orange "Report Rescue" button at the top right',
      'Select the animal type (Dog, Cat, Cow, etc.)',
      'Enter your contact number and a description of the situation',
      'Pin the location on the map or type the address',
      'Optionally upload a photo of the animal',
      'Set criticality — LOW, MEDIUM, HIGH, or CRITICAL',
      'Click Submit — an NGO will be assigned to you automatically',
    ],
  },

  my_rescues: {
    text: '📋 Here\'s how to track your rescue reports:',
    steps: [
      'Click "Rescue" in the left sidebar',
      'You will see all your submitted rescue reports listed',
      'Each card shows the status: PENDING → ASSIGNED → IN PROGRESS → COMPLETED',
      'PENDING: queued, waiting for NGO assignment',
      'ASSIGNED: an NGO has been notified and will respond shortly',
      'IN PROGRESS: NGO accepted and is on the way',
      'COMPLETED: animal has been rescued',
      'Click any card to see full details including the assigned NGO',
    ],
  },

  adopt: {
    text: '🐾 Here\'s how to adopt an animal:',
    steps: [
      'Click "Browse Animals" in the left sidebar',
      'Browse the available animals — filter by species, city, or vaccination status',
      'Click on an animal card to view full details',
      'Click the "Apply to Adopt" button',
      'Fill in your reason for adoption, experience with pets, and housing type',
      'Submit your application — the NGO will review it',
      'Track your application status in "My Adoptions" in the sidebar',
      'Status moves: PENDING → UNDER REVIEW → APPROVED or REJECTED',
    ],
  },

  book_appt: {
    text: '📅 Here\'s how to book a vet appointment:',
    steps: [
      'Click "Appointments" in the left sidebar',
      'Click the "Book Appointment" button',
      'Select a hospital from the dropdown list',
      'Select a doctor from that hospital',
      'Choose your pet (or type the pet name if not registered)',
      'Pick a date — available slots will be shown based on the doctor\'s schedule',
      'Select a time slot',
      'Enter the reason for the visit and click Confirm',
      'You\'ll receive a notification once the hospital confirms',
    ],
  },

  my_appts: {
    text: '🗓️ Here\'s how to view and manage your appointments:',
    steps: [
      'Click "Appointments" in the left sidebar',
      'All your upcoming and past appointments are listed here',
      'Each card shows: hospital, doctor, date, time, and status',
      'Status can be: PENDING, CONFIRMED, COMPLETED, or CANCELLED',
      'To cancel an appointment, click the cancel button on the card',
      'Past appointments are automatically marked as COMPLETED',
    ],
  },

  my_pets: {
    text: '🐶 Here\'s how to manage your pets:',
    steps: [
      'Click "Dashboard" in the left sidebar',
      'Scroll to the "My Pets" section',
      'Click "Add Pet" to register a new pet',
      'Fill in: name, species, breed, age, gender, and weight',
      'Add any health notes or special requirements',
      'Click Save — your pet is now registered',
      'Your registered pets will appear in appointment booking dropdowns',
      'To edit a pet, click the edit icon on the pet card',
    ],
  },

  notifications: {
    text: '🔔 Here\'s how to use notifications:',
    steps: [
      'The bell icon at the top right shows your unread notification count',
      'Click the bell icon to go to the Notifications page',
      'All notifications are listed — newest first',
      'Click "Mark as Read" on individual notifications',
      'Or click "Mark All Read" to clear all at once',
      'You receive real-time notifications for: rescue updates, appointment confirmations, and adoption status changes',
    ],
  },

  profile: {
    text: '👤 Here\'s how to update your profile:',
    steps: [
      'Click your avatar or name at the bottom of the sidebar',
      'Select "My Profile" from the menu',
      'You can update your name, phone number, and profile details',
      'Click Save to apply changes',
      'To change your password, use the Change Password section on the same page',
    ],
  },

  // ── NGO ───────────────────────────────────────────────────────────────────

  ngo_rescue_queue: {
    text: '🚨 Here\'s how the rescue queue works:',
    steps: [
      'Click "Rescue Queue" in the left sidebar',
      'You will see all rescues assigned to your NGO',
      'Each card shows: animal type, location, criticality, and reporter\'s phone',
      'New assignments appear with an ASSIGNED badge',
      'Use the filter chips to view by status: ASSIGNED, IN PROGRESS, COMPLETED',
      'Click a card to expand and see full details including the map location',
    ],
  },

  ngo_respond: {
    text: '✅ Here\'s how to accept or decline a rescue:',
    steps: [
      'Go to "Rescue Queue" in the sidebar',
      'Find the rescue card with status ASSIGNED',
      'Click "Accept" to take charge — status changes to IN PROGRESS',
      'You\'ll be shown the reporter\'s phone number to coordinate',
      'Click "Decline" if your team cannot handle it — it will be assigned to the next available NGO',
      'Once the animal is rescued, click "Mark as Completed" and add resolution notes',
    ],
  },

  ngo_add_animal: {
    text: '🐾 Here\'s how to add an animal for adoption:',
    steps: [
      'Click "My Animals" in the left sidebar',
      'Click the "Add Animal" button',
      'Fill in: name, species, breed, age (in months), gender',
      'Add a description — health status, temperament, special needs',
      'Toggle vaccinated / neutered status',
      'Upload a photo of the animal',
      'Click Save — the animal is now listed publicly for adoption',
      'To update availability, click the edit icon on the animal card',
    ],
  },

  ngo_applications: {
    text: '📋 Here\'s how to manage adoption applications:',
    steps: [
      'Click "Applications" in the left sidebar',
      'All adoption applications for your NGO\'s animals are listed here',
      'Each card shows: applicant name, animal, housing type, and experience',
      'Click an application to read the full details',
      'Use the status buttons to move it: PENDING → UNDER REVIEW → APPROVED or REJECTED',
      'Add admin notes to give the applicant feedback on your decision',
      'Applicants are notified automatically when you update the status',
    ],
  },

  ngo_profile: {
    text: '🏢 Here\'s how to update your NGO profile:',
    steps: [
      'Click "NGO Dashboard" in the sidebar',
      'Click the "Edit Profile" button on your NGO card',
      'Update: organisation name, address, city, phone, email, and description',
      'Upload your NGO logo using the logo upload button',
      'Add your registration number for verification',
      'Click Save — changes are reflected immediately on your public profile',
    ],
  },

  // ── HOSPITAL ──────────────────────────────────────────────────────────────

  hosp_doctors: {
    text: '🩺 Here\'s how to manage doctors:',
    steps: [
      'Click "Doctors" in the left sidebar',
      'All your registered doctors are shown as cards',
      'Click "Add Doctor" to register a new doctor',
      'Fill in: name, specialization, phone, schedule start/end time, and slot duration (in minutes)',
      'The slot duration determines how many appointments can be booked per day',
      'Click the pencil ✏️ icon on a doctor card to edit their details',
      'Click the eye 👁️ icon to view their full schedule',
      'To deactivate a doctor, toggle the active switch on the card',
    ],
  },

  hosp_appts: {
    text: '📅 Here\'s how to view and manage appointments:',
    steps: [
      'Click "Appointments" in the left sidebar',
      'All appointments booked at your hospital are listed',
      'Filter by date, doctor, or status using the filter bar',
      'Status can be: PENDING, CONFIRMED, COMPLETED, or CANCELLED',
      'Click "Confirm" to confirm a pending appointment',
      'Click "Complete" once the appointment is done',
      'You can add notes when completing an appointment',
    ],
  },

  hosp_profile: {
    text: '🏥 Here\'s how to update your hospital profile:',
    steps: [
      'Click "Hospital Dashboard" in the sidebar',
      'Click the "Edit Profile" button',
      'Update: hospital name, address, city, phone, email',
      'Pin your location on the map for accurate directions',
      'Upload your hospital logo',
      'Click Save — your updated profile is visible to users booking appointments',
    ],
  },

  // ── ADMIN ─────────────────────────────────────────────────────────────────

  admin_approve: {
    text: '✅ Here\'s how to approve pending NGOs and Hospitals:',
    steps: [
      'Click "Admin Panel" in the sidebar',
      'Go to the "User Management" tab',
      'Filter by status "Pending" to see accounts awaiting approval',
      'Click on a user row to expand their details',
      'Review their information — name, email, role, registration details',
      'Click "Approve" to activate their account — they can now login',
      'Click "Reject" to deny — they will be notified',
      'Approved NGOs also need to be Verified separately in the NGO Management tab',
    ],
  },

  admin_users: {
    text: '👥 Here\'s how to manage users:',
    steps: [
      'Click "Admin Panel" in the sidebar',
      'The "User Management" tab shows all registered users',
      'Use the search bar to find a specific user by name or email',
      'Filter by role: USER, NGO, HOSPITAL, or ADMIN',
      'Filter by status: Active or Inactive',
      'Click the toggle switch to activate or deactivate any account',
      'Deactivating an account blocks that user from logging in immediately',
    ],
  },

  admin_ngos: {
    text: '🏢 Here\'s how to manage NGOs:',
    steps: [
      'Click "Admin Panel" in the sidebar',
      'Go to the "NGO Management" tab',
      'All registered NGOs are listed — active and inactive',
      'Click the Active/Inactive toggle to enable or disable an NGO',
      'Disabling an NGO also blocks their owner account from logging in',
      'Click "Verify" to mark an NGO as verified — verified NGOs receive rescue assignments',
      'Unverified NGOs will not be assigned rescues even if active',
    ],
  },

  admin_hospitals: {
    text: '🏥 Here\'s how to manage hospitals:',
    steps: [
      'Click "Admin Panel" in the sidebar',
      'Go to the "Hospital Management" tab',
      'All registered hospitals are listed',
      'Toggle Active/Inactive to control whether they appear in appointment booking',
      'Deactivating a hospital blocks their owner from logging in',
      'Click on a hospital row to see its details and assigned doctors',
    ],
  },

  admin_rescues: {
    text: '🚨 Here\'s how to monitor all rescues:',
    steps: [
      'Click "Admin Panel" in the sidebar',
      'Go to the "Rescue Reports" tab',
      'All rescue reports across the platform are listed here',
      'Filter by status: PENDING, ASSIGNED, IN PROGRESS, COMPLETED',
      'Each row shows: reporter, animal type, assigned NGO, criticality, and date',
      'Click a row to see full details including location and resolution notes',
    ],
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  standalone: false,
  selector: 'app-chatbot',
  template: `
    <!-- FAB Toggle Button -->
    <button class="fab" (click)="toggle()" [title]="open ? 'Close assistant' : 'Open PETZ Assistant'">
      <span class="material-icons">{{ open ? 'close' : 'support_agent' }}</span>
    </button>

    <!-- Chat Window -->
    <div class="chat-window" [class.visible]="open">
      <!-- Header -->
      <div class="chat-header">
        <span class="material-icons header-icon">support_agent</span>
        <div class="header-text">
          <span class="header-title">PETZ Assistant</span>
          <span class="header-sub">Command Guide</span>
        </div>
        <button class="close-btn" (click)="toggle()">
          <span class="material-icons">close</span>
        </button>
      </div>

      <!-- Messages -->
      <div class="chat-body" #chatBody>
        <div *ngFor="let msg of messages" class="message-block">

          <!-- Bot message -->
          <div *ngIf="msg.from === 'bot'" class="bot-row">
            <span class="material-icons bot-avatar">support_agent</span>
            <div class="bot-bubble">
              <p class="msg-text">{{ msg.text }}</p>

              <!-- Step list -->
              <ol *ngIf="msg.steps && msg.steps.length" class="steps-list">
                <li *ngFor="let step of msg.steps">{{ step }}</li>
              </ol>

              <!-- Option buttons -->
              <div *ngIf="msg.options && msg.options.length" class="options-grid">
                <button
                  *ngFor="let opt of msg.options"
                  class="opt-btn"
                  (click)="handleOption(opt)">
                  {{ opt.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- User message -->
          <div *ngIf="msg.from === 'user'" class="user-row">
            <div class="user-bubble">{{ msg.text }}</div>
          </div>

        </div>
      </div>

      <!-- Footer back button -->
      <div class="chat-footer">
        <button class="back-btn" (click)="goHome()">
          <span class="material-icons" style="font-size:16px;vertical-align:middle">home</span>
          Main Menu
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* ── FAB ── */
    .fab {
      position: fixed;
      bottom: 28px;
      right: 28px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #FF8C42, #e67a30);
      color: #fff;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(255,140,66,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1100;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .fab:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(255,140,66,0.55); }
    .fab .material-icons { font-size: 26px; }

    /* ── Chat Window ── */
    .chat-window {
      position: fixed;
      bottom: 96px;
      right: 28px;
      width: 340px;
      max-height: 560px;
      background: #fff;
      border-radius: 18px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
      display: flex;
      flex-direction: column;
      z-index: 1099;
      opacity: 0;
      pointer-events: none;
      transform: translateY(16px) scale(0.97);
      transition: opacity 0.22s ease, transform 0.22s ease;
      overflow: hidden;
    }
    .chat-window.visible {
      opacity: 1;
      pointer-events: all;
      transform: translateY(0) scale(1);
    }

    /* ── Header ── */
    .chat-header {
      background: linear-gradient(135deg, #FF8C42, #e67a30);
      color: #fff;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .header-icon { font-size: 28px; opacity: 0.92; }
    .header-text { flex: 1; }
    .header-title { display: block; font-weight: 700; font-size: 0.95rem; font-family: 'Quicksand', sans-serif; }
    .header-sub   { display: block; font-size: 0.72rem; opacity: 0.82; }
    .close-btn {
      background: rgba(255,255,255,0.18);
      border: none;
      color: #fff;
      border-radius: 50%;
      width: 30px; height: 30px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    }
    .close-btn:hover { background: rgba(255,255,255,0.3); }
    .close-btn .material-icons { font-size: 18px; }

    /* ── Body ── */
    .chat-body {
      flex: 1;
      overflow-y: auto;
      padding: 14px 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #f7f9fc;
    }
    .chat-body::-webkit-scrollbar { width: 4px; }
    .chat-body::-webkit-scrollbar-thumb { background: #dde4ec; border-radius: 4px; }

    /* ── Messages ── */
    .bot-row {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    .bot-avatar {
      font-size: 22px;
      color: #FF8C42;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .bot-bubble {
      background: #fff;
      border-radius: 4px 14px 14px 14px;
      padding: 10px 12px;
      box-shadow: 0 1px 6px rgba(0,0,0,0.08);
      max-width: 260px;
    }
    .msg-text {
      margin: 0 0 6px;
      font-size: 0.85rem;
      color: #1A3547;
      line-height: 1.45;
      font-weight: 600;
    }

    /* ── Steps ── */
    .steps-list {
      margin: 6px 0 0 0;
      padding-left: 18px;
    }
    .steps-list li {
      font-size: 0.8rem;
      color: #3a5568;
      line-height: 1.5;
      margin-bottom: 4px;
    }

    /* ── Options ── */
    .options-grid {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 8px;
    }
    .opt-btn {
      background: #fff;
      border: 1.5px solid #FF8C42;
      color: #FF8C42;
      border-radius: 20px;
      padding: 6px 12px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s, color 0.15s;
      font-family: 'Quicksand', sans-serif;
    }
    .opt-btn:hover {
      background: #FF8C42;
      color: #fff;
    }

    /* ── User bubble ── */
    .user-row {
      display: flex;
      justify-content: flex-end;
    }
    .user-bubble {
      background: linear-gradient(135deg, #FF8C42, #e67a30);
      color: #fff;
      border-radius: 14px 4px 14px 14px;
      padding: 8px 14px;
      font-size: 0.82rem;
      font-weight: 600;
      max-width: 220px;
    }

    /* ── Footer ── */
    .chat-footer {
      padding: 10px 12px;
      border-top: 1px solid #eef1f5;
      background: #fff;
      flex-shrink: 0;
    }
    .back-btn {
      width: 100%;
      background: #f0f4f8;
      border: none;
      border-radius: 20px;
      padding: 7px 14px;
      font-size: 0.8rem;
      font-weight: 700;
      color: #1A3547;
      cursor: pointer;
      font-family: 'Quicksand', sans-serif;
      transition: background 0.15s;
    }
    .back-btn:hover { background: #e2e8f0; }
  `]
})
export class ChatbotComponent implements OnInit, AfterViewChecked {

  @ViewChild('chatBody') chatBody!: ElementRef;

  open = false;
  messages: ChatMessage[] = [];
  private role: string = 'USER';
  private userName: string = '';
  private shouldScroll = false;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(user => {
      this.role     = user?.role ?? 'USER';
      this.userName = user?.name ?? 'there';
    });
    this.showWelcome();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  toggle(): void {
    this.open = !this.open;
    if (this.open) this.shouldScroll = true;
  }

  goHome(): void {
    this.showWelcome();
  }

  handleOption(opt: BotOption): void {
    // Show user's selection as a message
    this.pushUser(opt.label);

    const node = COMMANDS[opt.key];
    if (!node) return;

    const msg: ChatMessage = {
      from: 'bot',
      text: node.text,
      steps: node.steps ?? [],
      options: node.options ?? [],
    };
    this.pushBot(msg);
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private showWelcome(): void {
    this.messages = [];
    const firstName = this.userName.split(' ')[0];
    const options   = MAIN_MENU[this.role] ?? MAIN_MENU['USER'];

    this.pushBot({
      from: 'bot',
      text: `Hi ${firstName}! 👋 I\'m your PETZ Assistant. What would you like help with today?`,
      options,
      isMainMenu: true,
    });
  }

  private pushBot(msg: ChatMessage): void {
    this.messages.push({ ...msg, from: 'bot' });
    this.shouldScroll = true;
  }

  private pushUser(text: string): void {
    this.messages.push({ from: 'user', text });
    this.shouldScroll = true;
  }

  private scrollToBottom(): void {
    try {
      const el = this.chatBody?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
