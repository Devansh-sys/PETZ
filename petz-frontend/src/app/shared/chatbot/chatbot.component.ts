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
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
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
