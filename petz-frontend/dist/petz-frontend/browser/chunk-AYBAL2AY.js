import {
  AuthService
} from "./chunk-W525NKGO.js";
import {
  Component,
  MatCard,
  MatCardContent,
  MatIcon,
  NgModule,
  RouterLink,
  RouterModule,
  SharedModule,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵdefineComponent,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate2
} from "./chunk-CNVABIPG.js";

// src/app/features/dashboard/dashboard.component.ts
var _DashboardComponent = class _DashboardComponent {
  constructor(auth) {
    this.auth = auth;
    this.firstName = "";
    this.greeting = "";
    this.today = "";
    this.stats = [
      { value: "\u2014", label: "My Pets" },
      { value: "\u2014", label: "Appointments" },
      { value: "\u2014", label: "Rescue Reports" },
      { value: "\u2014", label: "Adoptions" }
    ];
  }
  ngOnInit() {
    const user = this.auth.currentUser$.value;
    const fullName = user?.name ?? "User";
    this.firstName = fullName.split(" ")[0];
    this.greeting = this.getGreeting();
    this.today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }
  getGreeting() {
    const hour = (/* @__PURE__ */ new Date()).getHours();
    if (hour < 12)
      return "Good Morning";
    if (hour < 17)
      return "Good Afternoon";
    return "Good Evening";
  }
};
_DashboardComponent.\u0275fac = function DashboardComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _DashboardComponent)(\u0275\u0275directiveInject(AuthService));
};
_DashboardComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _DashboardComponent, selectors: [["app-dashboard"]], standalone: false, decls: 97, vars: 11, consts: [[1, "page-container"], [1, "greeting-row"], [1, "greeting-text"], [1, "page-subtitle"], [1, "date-badge"], [2, "font-size", "16px", "width", "16px", "height", "16px", "color", "#F97316"], [1, "stats-grid"], [1, "stat-card", "orange"], [1, "stat-icon"], [1, "stat-value"], [1, "stat-label"], [1, "stat-card", "purple"], [1, "stat-card", "pink"], [1, "stat-card", "green"], [1, "section-header"], [1, "actions-grid"], ["routerLink", "/rescue", 1, "action-card"], [1, "action-icon", "red"], [1, "action-title"], [1, "action-desc"], [1, "action-arrow"], ["routerLink", "/adoption/animals", 1, "action-card"], [1, "action-icon", "orange"], ["routerLink", "/appointments/book", 1, "action-card"], [1, "action-icon", "purple"], ["routerLink", "/pets", 1, "action-card"], [1, "action-icon", "green"]], template: function DashboardComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div")(3, "h1", 2);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "p", 3);
    \u0275\u0275text(6, "Here's today's overview of the platform.");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "div", 4)(8, "mat-icon", 5);
    \u0275\u0275text(9, "calendar_today");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "span");
    \u0275\u0275text(11);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(12, "div", 6)(13, "mat-card", 7)(14, "mat-card-content")(15, "div", 8)(16, "mat-icon");
    \u0275\u0275text(17, "pets");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(18, "p", 9);
    \u0275\u0275text(19);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "p", 10);
    \u0275\u0275text(21);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(22, "mat-card", 11)(23, "mat-card-content")(24, "div", 8)(25, "mat-icon");
    \u0275\u0275text(26, "event");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(27, "p", 9);
    \u0275\u0275text(28);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(29, "p", 10);
    \u0275\u0275text(30);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(31, "mat-card", 12)(32, "mat-card-content")(33, "div", 8)(34, "mat-icon");
    \u0275\u0275text(35, "emergency");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(36, "p", 9);
    \u0275\u0275text(37);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(38, "p", 10);
    \u0275\u0275text(39);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(40, "mat-card", 13)(41, "mat-card-content")(42, "div", 8)(43, "mat-icon");
    \u0275\u0275text(44, "favorite");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(45, "p", 9);
    \u0275\u0275text(46);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(47, "p", 10);
    \u0275\u0275text(48);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(49, "div", 14)(50, "h2");
    \u0275\u0275text(51, "Quick Actions");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(52, "div", 15)(53, "div", 16)(54, "div", 17)(55, "mat-icon");
    \u0275\u0275text(56, "emergency");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(57, "div")(58, "p", 18);
    \u0275\u0275text(59, "Report Rescue");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(60, "p", 19);
    \u0275\u0275text(61, "Submit a new animal rescue report");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(62, "mat-icon", 20);
    \u0275\u0275text(63, "chevron_right");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(64, "div", 21)(65, "div", 22)(66, "mat-icon");
    \u0275\u0275text(67, "favorite");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(68, "div")(69, "p", 18);
    \u0275\u0275text(70, "Browse Adoptions");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(71, "p", 19);
    \u0275\u0275text(72, "Find animals looking for a home");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(73, "mat-icon", 20);
    \u0275\u0275text(74, "chevron_right");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(75, "div", 23)(76, "div", 24)(77, "mat-icon");
    \u0275\u0275text(78, "event");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(79, "div")(80, "p", 18);
    \u0275\u0275text(81, "Book Appointment");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(82, "p", 19);
    \u0275\u0275text(83, "Schedule a vet visit for your pet");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(84, "mat-icon", 20);
    \u0275\u0275text(85, "chevron_right");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(86, "div", 25)(87, "div", 26)(88, "mat-icon");
    \u0275\u0275text(89, "pets");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(90, "div")(91, "p", 18);
    \u0275\u0275text(92, "My Pets");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(93, "p", 19);
    \u0275\u0275text(94, "Manage your registered pets");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(95, "mat-icon", 20);
    \u0275\u0275text(96, "chevron_right");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate2("", ctx.greeting, ", ", ctx.firstName, "! \u{1F43E}");
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate(ctx.today);
    \u0275\u0275advance(8);
    \u0275\u0275textInterpolate(ctx.stats[0].value);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx.stats[0].label);
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate(ctx.stats[1].value);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx.stats[1].label);
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate(ctx.stats[2].value);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx.stats[2].label);
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate(ctx.stats[3].value);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx.stats[3].label);
  }
}, dependencies: [RouterLink, MatCard, MatCardContent, MatIcon], styles: ["\n\n.greeting-row[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  margin-bottom: 28px;\n}\n.greeting-text[_ngcontent-%COMP%] {\n  font-size: 1.9rem;\n  font-weight: 900;\n  color: #F97316;\n  margin: 0 0 4px;\n}\n.date-badge[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  background: #fff;\n  border: 1px solid #F0E0D6;\n  border-radius: 10px;\n  padding: 8px 14px;\n  font-size: 0.82rem;\n  font-weight: 600;\n  color: #78716C;\n  white-space: nowrap;\n}\n.stats-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));\n  gap: 20px;\n  margin-bottom: 36px;\n}\n.section-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  margin-bottom: 16px;\n}\n.section-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #1C0902;\n}\n.actions-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));\n  gap: 14px;\n}\n.action-card[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n  background: #fff;\n  border: 1px solid #F0E0D6;\n  border-radius: 16px;\n  padding: 18px 20px;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.action-card[_ngcontent-%COMP%]:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);\n  border-color: #FDBF8A;\n}\n.action-icon[_ngcontent-%COMP%] {\n  width: 48px;\n  height: 48px;\n  border-radius: 14px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n.action-icon[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  font-size: 22px;\n  width: 22px;\n  height: 22px;\n  color: #fff;\n}\n.action-icon.red[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #F87171,\n      #DC2626);\n}\n.action-icon.orange[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #FF9748,\n      #F97316);\n}\n.action-icon.purple[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #B97AFB,\n      #7C3AED);\n}\n.action-icon.green[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #34D399,\n      #059669);\n}\n.action-title[_ngcontent-%COMP%] {\n  margin: 0 0 3px;\n  font-weight: 700;\n  font-size: 0.92rem;\n  color: #1C0902;\n}\n.action-desc[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.78rem;\n  color: #A8A29E;\n}\n.action-arrow[_ngcontent-%COMP%] {\n  margin-left: auto;\n  color: #D6C4BB !important;\n  font-size: 20px !important;\n}\n/*# sourceMappingURL=dashboard.component.css.map */"] });
var DashboardComponent = _DashboardComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DashboardComponent, [{
    type: Component,
    args: [{ standalone: false, selector: "app-dashboard", template: `
    <div class="page-container">

      <!-- \u2500\u2500 Greeting \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->
      <div class="greeting-row">
        <div>
          <h1 class="greeting-text">{{ greeting }}, {{ firstName }}! \u{1F43E}</h1>
          <p class="page-subtitle">Here's today's overview of the platform.</p>
        </div>
        <div class="date-badge">
          <mat-icon style="font-size:16px;width:16px;height:16px;color:#F97316">calendar_today</mat-icon>
          <span>{{ today }}</span>
        </div>
      </div>

      <!-- \u2500\u2500 Stat cards \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->
      <div class="stats-grid">

        <mat-card class="stat-card orange">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>pets</mat-icon></div>
            <p class="stat-value">{{ stats[0].value }}</p>
            <p class="stat-label">{{ stats[0].label }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card purple">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>event</mat-icon></div>
            <p class="stat-value">{{ stats[1].value }}</p>
            <p class="stat-label">{{ stats[1].label }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card pink">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>emergency</mat-icon></div>
            <p class="stat-value">{{ stats[2].value }}</p>
            <p class="stat-label">{{ stats[2].label }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card green">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>favorite</mat-icon></div>
            <p class="stat-value">{{ stats[3].value }}</p>
            <p class="stat-label">{{ stats[3].label }}</p>
          </mat-card-content>
        </mat-card>

      </div>

      <!-- \u2500\u2500 Quick actions \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->
      <div class="section-header">
        <h2>Quick Actions</h2>
      </div>

      <div class="actions-grid">
        <div class="action-card" routerLink="/rescue">
          <div class="action-icon red"><mat-icon>emergency</mat-icon></div>
          <div>
            <p class="action-title">Report Rescue</p>
            <p class="action-desc">Submit a new animal rescue report</p>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card" routerLink="/adoption/animals">
          <div class="action-icon orange"><mat-icon>favorite</mat-icon></div>
          <div>
            <p class="action-title">Browse Adoptions</p>
            <p class="action-desc">Find animals looking for a home</p>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card" routerLink="/appointments/book">
          <div class="action-icon purple"><mat-icon>event</mat-icon></div>
          <div>
            <p class="action-title">Book Appointment</p>
            <p class="action-desc">Schedule a vet visit for your pet</p>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card" routerLink="/pets">
          <div class="action-icon green"><mat-icon>pets</mat-icon></div>
          <div>
            <p class="action-title">My Pets</p>
            <p class="action-desc">Manage your registered pets</p>
          </div>
          <mat-icon class="action-arrow">chevron_right</mat-icon>
        </div>
      </div>

    </div>
  `, styles: ["/* angular:styles/component:css;dac74fed6e86b8d59558b9c3514f7a45839b3d1176374bf89a0f8247633e5dee;C:/Users/2480002/OneDrive - Cognizant/Desktop/PETZ/petz-platform/petz-frontend/src/app/features/dashboard/dashboard.component.ts */\n.greeting-row {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  margin-bottom: 28px;\n}\n.greeting-text {\n  font-size: 1.9rem;\n  font-weight: 900;\n  color: #F97316;\n  margin: 0 0 4px;\n}\n.date-badge {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  background: #fff;\n  border: 1px solid #F0E0D6;\n  border-radius: 10px;\n  padding: 8px 14px;\n  font-size: 0.82rem;\n  font-weight: 600;\n  color: #78716C;\n  white-space: nowrap;\n}\n.stats-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));\n  gap: 20px;\n  margin-bottom: 36px;\n}\n.section-header {\n  display: flex;\n  align-items: center;\n  margin-bottom: 16px;\n}\n.section-header h2 {\n  margin: 0;\n  color: #1C0902;\n}\n.actions-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));\n  gap: 14px;\n}\n.action-card {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n  background: #fff;\n  border: 1px solid #F0E0D6;\n  border-radius: 16px;\n  padding: 18px 20px;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.action-card:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);\n  border-color: #FDBF8A;\n}\n.action-icon {\n  width: 48px;\n  height: 48px;\n  border-radius: 14px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n.action-icon mat-icon {\n  font-size: 22px;\n  width: 22px;\n  height: 22px;\n  color: #fff;\n}\n.action-icon.red {\n  background:\n    linear-gradient(\n      135deg,\n      #F87171,\n      #DC2626);\n}\n.action-icon.orange {\n  background:\n    linear-gradient(\n      135deg,\n      #FF9748,\n      #F97316);\n}\n.action-icon.purple {\n  background:\n    linear-gradient(\n      135deg,\n      #B97AFB,\n      #7C3AED);\n}\n.action-icon.green {\n  background:\n    linear-gradient(\n      135deg,\n      #34D399,\n      #059669);\n}\n.action-title {\n  margin: 0 0 3px;\n  font-weight: 700;\n  font-size: 0.92rem;\n  color: #1C0902;\n}\n.action-desc {\n  margin: 0;\n  font-size: 0.78rem;\n  color: #A8A29E;\n}\n.action-arrow {\n  margin-left: auto;\n  color: #D6C4BB !important;\n  font-size: 20px !important;\n}\n/*# sourceMappingURL=dashboard.component.css.map */\n"] }]
  }], () => [{ type: AuthService }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(DashboardComponent, { className: "DashboardComponent", filePath: "src/app/features/dashboard/dashboard.component.ts", lineNumber: 192 });
})();

// src/app/features/dashboard/dashboard.module.ts
var _DashboardModule = class _DashboardModule {
};
_DashboardModule.\u0275fac = function DashboardModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _DashboardModule)();
};
_DashboardModule.\u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({ type: _DashboardModule });
_DashboardModule.\u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({ imports: [
  SharedModule,
  RouterModule.forChild([
    { path: "", component: DashboardComponent }
  ])
] });
var DashboardModule = _DashboardModule;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DashboardModule, [{
    type: NgModule,
    args: [{
      declarations: [DashboardComponent],
      imports: [
        SharedModule,
        RouterModule.forChild([
          { path: "", component: DashboardComponent }
        ])
      ]
    }]
  }], null, null);
})();
export {
  DashboardModule
};
//# sourceMappingURL=chunk-AYBAL2AY.js.map
