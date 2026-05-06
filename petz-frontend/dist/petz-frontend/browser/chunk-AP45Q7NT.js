import {
  ApiService
} from "./chunk-QYJL6IEQ.js";
import {
  Component,
  MatButton,
  MatCard,
  MatCardContent,
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatFormField,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatIcon,
  MatLabel,
  MatOption,
  MatProgressSpinner,
  MatRow,
  MatRowDef,
  MatSelect,
  MatSnackBar,
  MatTable,
  NgClass,
  NgControlStatus,
  NgModel,
  NgModule,
  RouterLink,
  RouterModule,
  SharedModule,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdefineComponent,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-CNVABIPG.js";

// src/app/features/admin/admin-dashboard/admin-dashboard.component.ts
var _forTrack0 = ($index, $item) => $item.route;
function AdminDashboardComponent_For_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-card", 2)(1, "mat-card-content", 3)(2, "mat-icon", 4);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "h3", 5);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "p", 6);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const item_r1 = ctx.$implicit;
    \u0275\u0275property("routerLink", item_r1.route);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(item_r1.icon);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(item_r1.label);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(item_r1.desc);
  }
}
var _AdminDashboardComponent = class _AdminDashboardComponent {
  constructor() {
    this.cards = [
      { icon: "people", label: "Users", desc: "Manage all users", route: "/admin/users" },
      { icon: "business", label: "NGOs", desc: "Verify and manage NGOs", route: "/admin/ngos" },
      { icon: "emergency", label: "Rescues", desc: "Monitor rescue reports", route: "/admin/rescues" },
      { icon: "local_hospital", label: "Hospitals", desc: "Manage hospitals", route: "/admin/hospitals" }
    ];
  }
};
_AdminDashboardComponent.\u0275fac = function AdminDashboardComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _AdminDashboardComponent)();
};
_AdminDashboardComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AdminDashboardComponent, selectors: [["app-admin-dashboard"]], standalone: false, decls: 6, vars: 0, consts: [[1, "page-container"], [2, "display", "grid", "grid-template-columns", "repeat(auto-fill,minmax(200px,1fr))", "gap", "16px"], [2, "cursor", "pointer", 3, "routerLink"], [2, "text-align", "center", "padding", "24px"], [2, "font-size", "40px", "width", "40px", "height", "40px", "color", "#0F766E"], [2, "margin", "12px 0 4px"], [2, "color", "#64748B", "margin", "0", "font-size", "0.85rem"]], template: function AdminDashboardComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "h1");
    \u0275\u0275text(2, "Admin Panel");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 1);
    \u0275\u0275repeaterCreate(4, AdminDashboardComponent_For_5_Template, 8, 4, "mat-card", 2, _forTrack0);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275advance(4);
    \u0275\u0275repeater(ctx.cards);
  }
}, dependencies: [RouterLink, MatCard, MatCardContent, MatIcon], encapsulation: 2 });
var AdminDashboardComponent = _AdminDashboardComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AdminDashboardComponent, [{
    type: Component,
    args: [{
      standalone: false,
      selector: "app-admin-dashboard",
      template: `
    <div class="page-container">
      <h1>Admin Panel</h1>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px">
        @for (item of cards; track item.route) {
          <mat-card [routerLink]="item.route" style="cursor:pointer">
            <mat-card-content style="text-align:center;padding:24px">
              <mat-icon style="font-size:40px;width:40px;height:40px;color:#0F766E">{{ item.icon }}</mat-icon>
              <h3 style="margin:12px 0 4px">{{ item.label }}</h3>
              <p style="color:#64748B;margin:0;font-size:0.85rem">{{ item.desc }}</p>
            </mat-card-content>
          </mat-card>
        }
      </div>
    </div>
  `
    }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AdminDashboardComponent, { className: "AdminDashboardComponent", filePath: "src/app/features/admin/admin-dashboard/admin-dashboard.component.ts", lineNumber: 23 });
})();

// src/app/features/admin/admin-users/admin-users.component.ts
function AdminUsersComponent_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "mat-spinner", 1);
  }
}
function AdminUsersComponent_Conditional_4_th_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 13);
    \u0275\u0275text(1, "ID");
    \u0275\u0275elementEnd();
  }
}
function AdminUsersComponent_Conditional_4_td_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 14);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const u_r1 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(u_r1.id);
  }
}
function AdminUsersComponent_Conditional_4_th_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 13);
    \u0275\u0275text(1, "Name");
    \u0275\u0275elementEnd();
  }
}
function AdminUsersComponent_Conditional_4_td_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 14);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const u_r2 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(u_r2.name);
  }
}
function AdminUsersComponent_Conditional_4_th_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 13);
    \u0275\u0275text(1, "Email");
    \u0275\u0275elementEnd();
  }
}
function AdminUsersComponent_Conditional_4_td_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 14);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const u_r3 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(u_r3.email);
  }
}
function AdminUsersComponent_Conditional_4_th_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 13);
    \u0275\u0275text(1, "Role");
    \u0275\u0275elementEnd();
  }
}
function AdminUsersComponent_Conditional_4_td_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 14);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const u_r4 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(u_r4.role);
  }
}
function AdminUsersComponent_Conditional_4_th_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 13);
    \u0275\u0275text(1, "Active");
    \u0275\u0275elementEnd();
  }
}
function AdminUsersComponent_Conditional_4_td_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 14)(1, "span", 15);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const u_r5 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", u_r5.isActive ? "confirmed" : "cancelled");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", u_r5.isActive ? "Active" : "Inactive", " ");
  }
}
function AdminUsersComponent_Conditional_4_th_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "th", 13);
  }
}
function AdminUsersComponent_Conditional_4_td_19_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "td", 14)(1, "button", 16);
    \u0275\u0275listener("click", function AdminUsersComponent_Conditional_4_td_19_Template_button_click_1_listener() {
      const u_r7 = \u0275\u0275restoreView(_r6).$implicit;
      const ctx_r7 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r7.toggle(u_r7));
    });
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const u_r7 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", u_r7.isActive ? "Deactivate" : "Activate", " ");
  }
}
function AdminUsersComponent_Conditional_4_tr_20_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "tr", 17);
  }
}
function AdminUsersComponent_Conditional_4_tr_21_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "tr", 18);
  }
}
function AdminUsersComponent_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-card")(1, "table", 2);
    \u0275\u0275elementContainerStart(2, 3);
    \u0275\u0275template(3, AdminUsersComponent_Conditional_4_th_3_Template, 2, 0, "th", 4)(4, AdminUsersComponent_Conditional_4_td_4_Template, 2, 1, "td", 5);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(5, 6);
    \u0275\u0275template(6, AdminUsersComponent_Conditional_4_th_6_Template, 2, 0, "th", 4)(7, AdminUsersComponent_Conditional_4_td_7_Template, 2, 1, "td", 5);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(8, 7);
    \u0275\u0275template(9, AdminUsersComponent_Conditional_4_th_9_Template, 2, 0, "th", 4)(10, AdminUsersComponent_Conditional_4_td_10_Template, 2, 1, "td", 5);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(11, 8);
    \u0275\u0275template(12, AdminUsersComponent_Conditional_4_th_12_Template, 2, 0, "th", 4)(13, AdminUsersComponent_Conditional_4_td_13_Template, 2, 1, "td", 5);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(14, 9);
    \u0275\u0275template(15, AdminUsersComponent_Conditional_4_th_15_Template, 2, 0, "th", 4)(16, AdminUsersComponent_Conditional_4_td_16_Template, 3, 2, "td", 5);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(17, 10);
    \u0275\u0275template(18, AdminUsersComponent_Conditional_4_th_18_Template, 1, 0, "th", 4)(19, AdminUsersComponent_Conditional_4_td_19_Template, 3, 1, "td", 5);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275template(20, AdminUsersComponent_Conditional_4_tr_20_Template, 1, 0, "tr", 11)(21, AdminUsersComponent_Conditional_4_tr_21_Template, 1, 0, "tr", 12);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r7 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("dataSource", ctx_r7.users);
    \u0275\u0275advance(19);
    \u0275\u0275property("matHeaderRowDef", ctx_r7.cols);
    \u0275\u0275advance();
    \u0275\u0275property("matRowDefColumns", ctx_r7.cols);
  }
}
var _AdminUsersComponent = class _AdminUsersComponent {
  constructor(api, snack) {
    this.api = api;
    this.snack = snack;
    this.users = [];
    this.cols = ["id", "name", "email", "role", "status", "actions"];
    this.loading = true;
  }
  ngOnInit() {
    this.api.get("/admin/users").subscribe({
      next: (res) => {
        this.users = res.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
  toggle(user) {
    this.api.patch(`/admin/users/${user.id}/toggle`, { active: !user.isActive }).subscribe({
      next: (res) => {
        user.isActive = res.data.isActive;
        this.snack.open("User status updated.", "", { duration: 2e3 });
      }
    });
  }
};
_AdminUsersComponent.\u0275fac = function AdminUsersComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _AdminUsersComponent)(\u0275\u0275directiveInject(ApiService), \u0275\u0275directiveInject(MatSnackBar));
};
_AdminUsersComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AdminUsersComponent, selectors: [["app-admin-users"]], standalone: false, decls: 5, vars: 2, consts: [[1, "page-container"], ["diameter", "40", 2, "margin", "40px auto"], ["mat-table", "", 2, "width", "100%", 3, "dataSource"], ["matColumnDef", "id"], ["mat-header-cell", "", 4, "matHeaderCellDef"], ["mat-cell", "", 4, "matCellDef"], ["matColumnDef", "name"], ["matColumnDef", "email"], ["matColumnDef", "role"], ["matColumnDef", "status"], ["matColumnDef", "actions"], ["mat-header-row", "", 4, "matHeaderRowDef"], ["mat-row", "", 4, "matRowDef", "matRowDefColumns"], ["mat-header-cell", ""], ["mat-cell", ""], [1, "chip", 3, "ngClass"], ["mat-stroked-button", "", 3, "click"], ["mat-header-row", ""], ["mat-row", ""]], template: function AdminUsersComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "h1");
    \u0275\u0275text(2, "Users");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(3, AdminUsersComponent_Conditional_3_Template, 1, 0, "mat-spinner", 1);
    \u0275\u0275conditionalCreate(4, AdminUsersComponent_Conditional_4_Template, 22, 3, "mat-card");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance(3);
    \u0275\u0275conditional(ctx.loading ? 3 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx.loading ? 4 : -1);
  }
}, dependencies: [NgClass, MatCard, MatButton, MatTable, MatHeaderCellDef, MatHeaderRowDef, MatColumnDef, MatCellDef, MatRowDef, MatHeaderCell, MatCell, MatHeaderRow, MatRow, MatProgressSpinner], encapsulation: 2 });
var AdminUsersComponent = _AdminUsersComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AdminUsersComponent, [{
    type: Component,
    args: [{
      standalone: false,
      selector: "app-admin-users",
      template: `
    <div class="page-container">
      <h1>Users</h1>

      @if (loading) {
        <mat-spinner diameter="40" style="margin:40px auto"></mat-spinner>
      }

      @if (!loading) {
        <mat-card>
          <table mat-table [dataSource]="users" style="width:100%">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let u">{{ u.id }}</td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let u">{{ u.name }}</td>
            </ng-container>
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let u">{{ u.email }}</td>
            </ng-container>
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let u">{{ u.role }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Active</th>
              <td mat-cell *matCellDef="let u">
                <span class="chip" [ngClass]="u.isActive ? 'confirmed' : 'cancelled'">
                  {{ u.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let u">
                <button mat-stroked-button (click)="toggle(u)">
                  {{ u.isActive ? 'Deactivate' : 'Activate' }}
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>
        </mat-card>
      }
    </div>
  `
    }]
  }], () => [{ type: ApiService }, { type: MatSnackBar }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AdminUsersComponent, { className: "AdminUsersComponent", filePath: "src/app/features/admin/admin-users/admin-users.component.ts", lineNumber: 59 });
})();

// src/app/features/admin/admin-ngos/admin-ngos.component.ts
function AdminNgosComponent_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "mat-spinner", 1);
  }
}
function AdminNgosComponent_Conditional_4_th_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 12);
    \u0275\u0275text(1, "ID");
    \u0275\u0275elementEnd();
  }
}
function AdminNgosComponent_Conditional_4_td_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 13);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const n_r1 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(n_r1.id);
  }
}
function AdminNgosComponent_Conditional_4_th_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 12);
    \u0275\u0275text(1, "Name");
    \u0275\u0275elementEnd();
  }
}
function AdminNgosComponent_Conditional_4_td_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 13);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const n_r2 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(n_r2.name);
  }
}
function AdminNgosComponent_Conditional_4_th_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 12);
    \u0275\u0275text(1, "City");
    \u0275\u0275elementEnd();
  }
}
function AdminNgosComponent_Conditional_4_td_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 13);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const n_r3 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(n_r3.city);
  }
}
function AdminNgosComponent_Conditional_4_th_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 12);
    \u0275\u0275text(1, "Verified");
    \u0275\u0275elementEnd();
  }
}
function AdminNgosComponent_Conditional_4_td_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 13)(1, "span", 14);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const n_r4 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", n_r4.isVerified ? "confirmed" : "pending");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", n_r4.isVerified ? "Yes" : "Pending", " ");
  }
}
function AdminNgosComponent_Conditional_4_th_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "th", 12);
  }
}
function AdminNgosComponent_Conditional_4_td_16_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 17);
    \u0275\u0275listener("click", function AdminNgosComponent_Conditional_4_td_16_Conditional_1_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r5);
      const n_r6 = \u0275\u0275nextContext().$implicit;
      const ctx_r6 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r6.verify(n_r6));
    });
    \u0275\u0275text(1, "Verify");
    \u0275\u0275elementEnd();
  }
}
function AdminNgosComponent_Conditional_4_td_16_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 18);
    \u0275\u0275listener("click", function AdminNgosComponent_Conditional_4_td_16_Conditional_2_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r8);
      const n_r6 = \u0275\u0275nextContext().$implicit;
      const ctx_r6 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r6.toggle(n_r6));
    });
    \u0275\u0275text(1, "Deactivate");
    \u0275\u0275elementEnd();
  }
}
function AdminNgosComponent_Conditional_4_td_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 13);
    \u0275\u0275conditionalCreate(1, AdminNgosComponent_Conditional_4_td_16_Conditional_1_Template, 2, 0, "button", 15);
    \u0275\u0275conditionalCreate(2, AdminNgosComponent_Conditional_4_td_16_Conditional_2_Template, 2, 0, "button", 16);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const n_r6 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275conditional(!n_r6.isVerified ? 1 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(n_r6.isActive ? 2 : -1);
  }
}
function AdminNgosComponent_Conditional_4_tr_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "tr", 19);
  }
}
function AdminNgosComponent_Conditional_4_tr_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "tr", 20);
  }
}
function AdminNgosComponent_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-card")(1, "table", 2);
    \u0275\u0275elementContainerStart(2, 3);
    \u0275\u0275template(3, AdminNgosComponent_Conditional_4_th_3_Template, 2, 0, "th", 4)(4, AdminNgosComponent_Conditional_4_td_4_Template, 2, 1, "td", 5);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(5, 6);
    \u0275\u0275template(6, AdminNgosComponent_Conditional_4_th_6_Template, 2, 0, "th", 4)(7, AdminNgosComponent_Conditional_4_td_7_Template, 2, 1, "td", 5);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(8, 7);
    \u0275\u0275template(9, AdminNgosComponent_Conditional_4_th_9_Template, 2, 0, "th", 4)(10, AdminNgosComponent_Conditional_4_td_10_Template, 2, 1, "td", 5);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(11, 8);
    \u0275\u0275template(12, AdminNgosComponent_Conditional_4_th_12_Template, 2, 0, "th", 4)(13, AdminNgosComponent_Conditional_4_td_13_Template, 3, 2, "td", 5);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(14, 9);
    \u0275\u0275template(15, AdminNgosComponent_Conditional_4_th_15_Template, 1, 0, "th", 4)(16, AdminNgosComponent_Conditional_4_td_16_Template, 3, 2, "td", 5);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275template(17, AdminNgosComponent_Conditional_4_tr_17_Template, 1, 0, "tr", 10)(18, AdminNgosComponent_Conditional_4_tr_18_Template, 1, 0, "tr", 11);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r6 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("dataSource", ctx_r6.ngos);
    \u0275\u0275advance(16);
    \u0275\u0275property("matHeaderRowDef", ctx_r6.cols);
    \u0275\u0275advance();
    \u0275\u0275property("matRowDefColumns", ctx_r6.cols);
  }
}
var _AdminNgosComponent = class _AdminNgosComponent {
  constructor(api, snack) {
    this.api = api;
    this.snack = snack;
    this.ngos = [];
    this.cols = ["id", "name", "city", "verified", "actions"];
    this.loading = true;
  }
  ngOnInit() {
    this.api.get("/admin/ngos").subscribe({
      next: (res) => {
        this.ngos = res.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
  verify(ngo) {
    this.api.patch(`/admin/ngos/${ngo.id}/verify`, { verified: true }).subscribe({
      next: () => {
        ngo.isVerified = true;
        this.snack.open("NGO verified!", "", { duration: 2e3 });
      }
    });
  }
  toggle(ngo) {
    this.api.patch(`/admin/ngos/${ngo.id}/toggle`, { active: !ngo.isActive }).subscribe({
      next: () => {
        ngo.isActive = !ngo.isActive;
        this.snack.open("NGO status updated.", "", { duration: 2e3 });
      }
    });
  }
};
_AdminNgosComponent.\u0275fac = function AdminNgosComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _AdminNgosComponent)(\u0275\u0275directiveInject(ApiService), \u0275\u0275directiveInject(MatSnackBar));
};
_AdminNgosComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AdminNgosComponent, selectors: [["app-admin-ngos"]], standalone: false, decls: 5, vars: 2, consts: [[1, "page-container"], ["diameter", "40", 2, "margin", "40px auto"], ["mat-table", "", 2, "width", "100%", 3, "dataSource"], ["matColumnDef", "id"], ["mat-header-cell", "", 4, "matHeaderCellDef"], ["mat-cell", "", 4, "matCellDef"], ["matColumnDef", "name"], ["matColumnDef", "city"], ["matColumnDef", "verified"], ["matColumnDef", "actions"], ["mat-header-row", "", 4, "matHeaderRowDef"], ["mat-row", "", 4, "matRowDef", "matRowDefColumns"], ["mat-header-cell", ""], ["mat-cell", ""], [1, "chip", 3, "ngClass"], ["mat-stroked-button", "", "color", "primary"], ["mat-stroked-button", "", "color", "warn"], ["mat-stroked-button", "", "color", "primary", 3, "click"], ["mat-stroked-button", "", "color", "warn", 3, "click"], ["mat-header-row", ""], ["mat-row", ""]], template: function AdminNgosComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "h1");
    \u0275\u0275text(2, "NGO Management");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(3, AdminNgosComponent_Conditional_3_Template, 1, 0, "mat-spinner", 1);
    \u0275\u0275conditionalCreate(4, AdminNgosComponent_Conditional_4_Template, 19, 3, "mat-card");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance(3);
    \u0275\u0275conditional(ctx.loading ? 3 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx.loading ? 4 : -1);
  }
}, dependencies: [NgClass, MatCard, MatButton, MatTable, MatHeaderCellDef, MatHeaderRowDef, MatColumnDef, MatCellDef, MatRowDef, MatHeaderCell, MatCell, MatHeaderRow, MatRow, MatProgressSpinner], encapsulation: 2 });
var AdminNgosComponent = _AdminNgosComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AdminNgosComponent, [{
    type: Component,
    args: [{
      standalone: false,
      selector: "app-admin-ngos",
      template: `
    <div class="page-container">
      <h1>NGO Management</h1>

      @if (loading) {
        <mat-spinner diameter="40" style="margin:40px auto"></mat-spinner>
      }

      @if (!loading) {
        <mat-card>
          <table mat-table [dataSource]="ngos" style="width:100%">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let n">{{ n.id }}</td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let n">{{ n.name }}</td>
            </ng-container>
            <ng-container matColumnDef="city">
              <th mat-header-cell *matHeaderCellDef>City</th>
              <td mat-cell *matCellDef="let n">{{ n.city }}</td>
            </ng-container>
            <ng-container matColumnDef="verified">
              <th mat-header-cell *matHeaderCellDef>Verified</th>
              <td mat-cell *matCellDef="let n">
                <span class="chip" [ngClass]="n.isVerified ? 'confirmed' : 'pending'">
                  {{ n.isVerified ? 'Yes' : 'Pending' }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let n">
                @if (!n.isVerified) {
                  <button mat-stroked-button color="primary" (click)="verify(n)">Verify</button>
                }
                @if (n.isActive) {
                  <button mat-stroked-button color="warn" (click)="toggle(n)">Deactivate</button>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>
        </mat-card>
      }
    </div>
  `
    }]
  }], () => [{ type: ApiService }, { type: MatSnackBar }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AdminNgosComponent, { className: "AdminNgosComponent", filePath: "src/app/features/admin/admin-ngos/admin-ngos.component.ts", lineNumber: 58 });
})();

// src/app/features/admin/admin-rescues/admin-rescues.component.ts
function AdminRescuesComponent_Conditional_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "mat-spinner", 8);
  }
}
function AdminRescuesComponent_Conditional_18_th_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 20);
    \u0275\u0275text(1, "ID");
    \u0275\u0275elementEnd();
  }
}
function AdminRescuesComponent_Conditional_18_td_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 21);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const r_r1 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(r_r1.id);
  }
}
function AdminRescuesComponent_Conditional_18_th_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 20);
    \u0275\u0275text(1, "Animal");
    \u0275\u0275elementEnd();
  }
}
function AdminRescuesComponent_Conditional_18_td_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 21);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const r_r2 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(r_r2.animalType);
  }
}
function AdminRescuesComponent_Conditional_18_th_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 20);
    \u0275\u0275text(1, "Criticality");
    \u0275\u0275elementEnd();
  }
}
function AdminRescuesComponent_Conditional_18_td_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 21);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const r_r3 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(r_r3.criticality);
  }
}
function AdminRescuesComponent_Conditional_18_th_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 20);
    \u0275\u0275text(1, "Address");
    \u0275\u0275elementEnd();
  }
}
function AdminRescuesComponent_Conditional_18_td_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 21);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const r_r4 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(r_r4.address);
  }
}
function AdminRescuesComponent_Conditional_18_th_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 20);
    \u0275\u0275text(1, "Status");
    \u0275\u0275elementEnd();
  }
}
function AdminRescuesComponent_Conditional_18_td_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 21)(1, "span", 22);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const r_r5 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", r_r5.status.toLowerCase());
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(r_r5.status);
  }
}
function AdminRescuesComponent_Conditional_18_tr_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "tr", 23);
  }
}
function AdminRescuesComponent_Conditional_18_tr_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "tr", 24);
  }
}
function AdminRescuesComponent_Conditional_18_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 19);
    \u0275\u0275text(1, " No rescues found. ");
    \u0275\u0275elementEnd();
  }
}
function AdminRescuesComponent_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-card")(1, "table", 9);
    \u0275\u0275elementContainerStart(2, 10);
    \u0275\u0275template(3, AdminRescuesComponent_Conditional_18_th_3_Template, 2, 0, "th", 11)(4, AdminRescuesComponent_Conditional_18_td_4_Template, 2, 1, "td", 12);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(5, 13);
    \u0275\u0275template(6, AdminRescuesComponent_Conditional_18_th_6_Template, 2, 0, "th", 11)(7, AdminRescuesComponent_Conditional_18_td_7_Template, 2, 1, "td", 12);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(8, 14);
    \u0275\u0275template(9, AdminRescuesComponent_Conditional_18_th_9_Template, 2, 0, "th", 11)(10, AdminRescuesComponent_Conditional_18_td_10_Template, 2, 1, "td", 12);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(11, 15);
    \u0275\u0275template(12, AdminRescuesComponent_Conditional_18_th_12_Template, 2, 0, "th", 11)(13, AdminRescuesComponent_Conditional_18_td_13_Template, 2, 1, "td", 12);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(14, 16);
    \u0275\u0275template(15, AdminRescuesComponent_Conditional_18_th_15_Template, 2, 0, "th", 11)(16, AdminRescuesComponent_Conditional_18_td_16_Template, 3, 2, "td", 12);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275template(17, AdminRescuesComponent_Conditional_18_tr_17_Template, 1, 0, "tr", 17)(18, AdminRescuesComponent_Conditional_18_tr_18_Template, 1, 0, "tr", 18);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(19, AdminRescuesComponent_Conditional_18_Conditional_19_Template, 2, 0, "p", 19);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r5 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("dataSource", ctx_r5.filtered);
    \u0275\u0275advance(16);
    \u0275\u0275property("matHeaderRowDef", ctx_r5.cols);
    \u0275\u0275advance();
    \u0275\u0275property("matRowDefColumns", ctx_r5.cols);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r5.filtered.length === 0 ? 19 : -1);
  }
}
var _AdminRescuesComponent = class _AdminRescuesComponent {
  constructor(api) {
    this.api = api;
    this.all = [];
    this.filtered = [];
    this.cols = ["id", "type", "crit", "address", "status"];
    this.loading = true;
    this.statusFilter = "";
  }
  ngOnInit() {
    this.api.get("/admin/rescues").subscribe({
      next: (res) => {
        this.all = res.data ?? [];
        this.filtered = this.all;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
  filter() {
    this.filtered = this.statusFilter ? this.all.filter((r) => r.status === this.statusFilter) : this.all;
  }
};
_AdminRescuesComponent.\u0275fac = function AdminRescuesComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _AdminRescuesComponent)(\u0275\u0275directiveInject(ApiService));
};
_AdminRescuesComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AdminRescuesComponent, selectors: [["app-admin-rescues"]], standalone: false, decls: 19, vars: 3, consts: [[1, "page-container"], ["appearance", "outline", 2, "margin-bottom", "12px"], [3, "ngModelChange", "ngModel"], ["value", ""], ["value", "PENDING"], ["value", "ASSIGNED"], ["value", "IN_PROGRESS"], ["value", "COMPLETED"], ["diameter", "40", 2, "margin", "40px auto"], ["mat-table", "", 2, "width", "100%", 3, "dataSource"], ["matColumnDef", "id"], ["mat-header-cell", "", 4, "matHeaderCellDef"], ["mat-cell", "", 4, "matCellDef"], ["matColumnDef", "type"], ["matColumnDef", "crit"], ["matColumnDef", "address"], ["matColumnDef", "status"], ["mat-header-row", "", 4, "matHeaderRowDef"], ["mat-row", "", 4, "matRowDef", "matRowDefColumns"], [2, "text-align", "center", "padding", "24px", "color", "#64748B"], ["mat-header-cell", ""], ["mat-cell", ""], [1, "chip", 3, "ngClass"], ["mat-header-row", ""], ["mat-row", ""]], template: function AdminRescuesComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "h1");
    \u0275\u0275text(2, "All Rescue Reports");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "mat-form-field", 1)(4, "mat-label");
    \u0275\u0275text(5, "Filter by status");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "mat-select", 2);
    \u0275\u0275twoWayListener("ngModelChange", function AdminRescuesComponent_Template_mat_select_ngModelChange_6_listener($event) {
      \u0275\u0275twoWayBindingSet(ctx.statusFilter, $event) || (ctx.statusFilter = $event);
      return $event;
    });
    \u0275\u0275listener("ngModelChange", function AdminRescuesComponent_Template_mat_select_ngModelChange_6_listener() {
      return ctx.filter();
    });
    \u0275\u0275elementStart(7, "mat-option", 3);
    \u0275\u0275text(8, "All");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "mat-option", 4);
    \u0275\u0275text(10, "Pending");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "mat-option", 5);
    \u0275\u0275text(12, "Assigned");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "mat-option", 6);
    \u0275\u0275text(14, "In Progress");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "mat-option", 7);
    \u0275\u0275text(16, "Completed");
    \u0275\u0275elementEnd()()();
    \u0275\u0275conditionalCreate(17, AdminRescuesComponent_Conditional_17_Template, 1, 0, "mat-spinner", 8);
    \u0275\u0275conditionalCreate(18, AdminRescuesComponent_Conditional_18_Template, 20, 4, "mat-card");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance(6);
    \u0275\u0275twoWayProperty("ngModel", ctx.statusFilter);
    \u0275\u0275advance(11);
    \u0275\u0275conditional(ctx.loading ? 17 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx.loading ? 18 : -1);
  }
}, dependencies: [NgClass, NgControlStatus, NgModel, MatCard, MatFormField, MatLabel, MatTable, MatHeaderCellDef, MatHeaderRowDef, MatColumnDef, MatCellDef, MatRowDef, MatHeaderCell, MatCell, MatHeaderRow, MatRow, MatProgressSpinner, MatSelect, MatOption], encapsulation: 2 });
var AdminRescuesComponent = _AdminRescuesComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AdminRescuesComponent, [{
    type: Component,
    args: [{
      standalone: false,
      selector: "app-admin-rescues",
      template: `
    <div class="page-container">
      <h1>All Rescue Reports</h1>
      <mat-form-field appearance="outline" style="margin-bottom:12px">
        <mat-label>Filter by status</mat-label>
        <mat-select [(ngModel)]="statusFilter" (ngModelChange)="filter()">
          <mat-option value="">All</mat-option>
          <mat-option value="PENDING">Pending</mat-option>
          <mat-option value="ASSIGNED">Assigned</mat-option>
          <mat-option value="IN_PROGRESS">In Progress</mat-option>
          <mat-option value="COMPLETED">Completed</mat-option>
        </mat-select>
      </mat-form-field>

      @if (loading) {
        <mat-spinner diameter="40" style="margin:40px auto"></mat-spinner>
      }

      @if (!loading) {
        <mat-card>
          <table mat-table [dataSource]="filtered" style="width:100%">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let r">{{ r.id }}</td>
            </ng-container>
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Animal</th>
              <td mat-cell *matCellDef="let r">{{ r.animalType }}</td>
            </ng-container>
            <ng-container matColumnDef="crit">
              <th mat-header-cell *matHeaderCellDef>Criticality</th>
              <td mat-cell *matCellDef="let r">{{ r.criticality }}</td>
            </ng-container>
            <ng-container matColumnDef="address">
              <th mat-header-cell *matHeaderCellDef>Address</th>
              <td mat-cell *matCellDef="let r">{{ r.address }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let r">
                <span class="chip" [ngClass]="r.status.toLowerCase()">{{ r.status }}</span>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>
          @if (filtered.length === 0) {
            <p style="text-align:center;padding:24px;color:#64748B">
              No rescues found.
            </p>
          }
        </mat-card>
      }
    </div>
  `
    }]
  }], () => [{ type: ApiService }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AdminRescuesComponent, { className: "AdminRescuesComponent", filePath: "src/app/features/admin/admin-rescues/admin-rescues.component.ts", lineNumber: 63 });
})();

// src/app/features/admin/admin.module.ts
var _AdminModule = class _AdminModule {
};
_AdminModule.\u0275fac = function AdminModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _AdminModule)();
};
_AdminModule.\u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({ type: _AdminModule });
_AdminModule.\u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({ imports: [
  SharedModule,
  RouterModule.forChild([
    { path: "", component: AdminDashboardComponent },
    { path: "users", component: AdminUsersComponent },
    { path: "ngos", component: AdminNgosComponent },
    { path: "rescues", component: AdminRescuesComponent }
  ])
] });
var AdminModule = _AdminModule;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AdminModule, [{
    type: NgModule,
    args: [{
      declarations: [AdminDashboardComponent, AdminUsersComponent, AdminNgosComponent, AdminRescuesComponent],
      imports: [
        SharedModule,
        RouterModule.forChild([
          { path: "", component: AdminDashboardComponent },
          { path: "users", component: AdminUsersComponent },
          { path: "ngos", component: AdminNgosComponent },
          { path: "rescues", component: AdminRescuesComponent }
        ])
      ]
    }]
  }], null, null);
})();
export {
  AdminModule
};
//# sourceMappingURL=chunk-AP45Q7NT.js.map
