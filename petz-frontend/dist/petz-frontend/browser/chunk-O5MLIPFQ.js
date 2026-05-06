import {
  ApiService
} from "./chunk-QYJL6IEQ.js";
import {
  Component,
  DefaultValueAccessor,
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
  MatIconButton,
  MatInput,
  MatLabel,
  MatProgressSpinner,
  MatRow,
  MatRowDef,
  MatSnackBar,
  MatTable,
  NgClass,
  NgControlStatus,
  NgModel,
  NgModule,
  NumberValueAccessor,
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
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate2,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-CNVABIPG.js";

// src/app/features/hospital/hospital-dashboard/hospital-dashboard.component.ts
function HospitalDashboardComponent_Conditional_3_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 6);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275property("src", ctx_r0.hospital.logoUrl, \u0275\u0275sanitizeUrl);
  }
}
function HospitalDashboardComponent_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 1)(1, "div", 5);
    \u0275\u0275conditionalCreate(2, HospitalDashboardComponent_Conditional_3_Conditional_2_Template, 1, 1, "img", 6);
    \u0275\u0275elementStart(3, "div")(4, "h2", 7);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "p", 8);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "p", 9);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r0.hospital.logoUrl ? 2 : -1);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r0.hospital.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("", ctx_r0.hospital.address, ", ", ctx_r0.hospital.city);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r0.hospital.phone);
  }
}
var _HospitalDashboardComponent = class _HospitalDashboardComponent {
  constructor(api) {
    this.api = api;
    this.hospital = null;
  }
  ngOnInit() {
    this.api.get("/hospitals/profile").subscribe({
      next: (res) => {
        this.hospital = res.data;
      },
      error: () => {
      }
    });
  }
};
_HospitalDashboardComponent.\u0275fac = function HospitalDashboardComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _HospitalDashboardComponent)(\u0275\u0275directiveInject(ApiService));
};
_HospitalDashboardComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _HospitalDashboardComponent, selectors: [["app-hospital-dashboard"]], standalone: false, decls: 13, vars: 1, consts: [[1, "page-container"], [1, "card", 2, "margin-bottom", "24px"], [2, "display", "flex", "gap", "12px", "flex-wrap", "wrap"], ["mat-raised-button", "", "color", "primary", "routerLink", "/hospital/appointments"], ["mat-raised-button", "", "routerLink", "/hospital/doctors"], [2, "display", "flex", "gap", "16px", "align-items", "center"], [2, "width", "80px", "height", "80px", "border-radius", "8px", "object-fit", "cover", 3, "src"], [2, "margin", "0"], [2, "color", "#64748B", "margin", "4px 0"], [2, "color", "#64748B", "margin", "0"]], template: function HospitalDashboardComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "h1");
    \u0275\u0275text(2, "Hospital Dashboard");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(3, HospitalDashboardComponent_Conditional_3_Template, 10, 5, "div", 1);
    \u0275\u0275elementStart(4, "div", 2)(5, "button", 3)(6, "mat-icon");
    \u0275\u0275text(7, "event");
    \u0275\u0275elementEnd();
    \u0275\u0275text(8, " Appointments ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "button", 4)(10, "mat-icon");
    \u0275\u0275text(11, "medical_services");
    \u0275\u0275elementEnd();
    \u0275\u0275text(12, " Manage Doctors ");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    \u0275\u0275advance(3);
    \u0275\u0275conditional(ctx.hospital ? 3 : -1);
  }
}, dependencies: [RouterLink, MatButton, MatIcon], encapsulation: 2 });
var HospitalDashboardComponent = _HospitalDashboardComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(HospitalDashboardComponent, [{
    type: Component,
    args: [{
      standalone: false,
      selector: "app-hospital-dashboard",
      template: `
    <div class="page-container">
      <h1>Hospital Dashboard</h1>

      @if (hospital) {
        <div class="card" style="margin-bottom:24px">
          <div style="display:flex;gap:16px;align-items:center">
            @if (hospital.logoUrl) {
              <img [src]="hospital.logoUrl" style="width:80px;height:80px;border-radius:8px;object-fit:cover">
            }
            <div>
              <h2 style="margin:0">{{ hospital.name }}</h2>
              <p style="color:#64748B;margin:4px 0">{{ hospital.address }}, {{ hospital.city }}</p>
              <p style="color:#64748B;margin:0">{{ hospital.phone }}</p>
            </div>
          </div>
        </div>
      }

      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <button mat-raised-button color="primary" routerLink="/hospital/appointments">
          <mat-icon>event</mat-icon> Appointments
        </button>
        <button mat-raised-button routerLink="/hospital/doctors">
          <mat-icon>medical_services</mat-icon> Manage Doctors
        </button>
      </div>
    </div>
  `
    }]
  }], () => [{ type: ApiService }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(HospitalDashboardComponent, { className: "HospitalDashboardComponent", filePath: "src/app/features/hospital/hospital-dashboard/hospital-dashboard.component.ts", lineNumber: 37 });
})();

// src/app/features/hospital/hospital-appointments/hospital-appointments.component.ts
function HospitalAppointmentsComponent_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "mat-spinner", 1);
  }
}
function HospitalAppointmentsComponent_Conditional_4_th_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 13);
    \u0275\u0275text(1, "#");
    \u0275\u0275elementEnd();
  }
}
function HospitalAppointmentsComponent_Conditional_4_td_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 14);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const a_r1 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(a_r1.id);
  }
}
function HospitalAppointmentsComponent_Conditional_4_th_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 13);
    \u0275\u0275text(1, "Date");
    \u0275\u0275elementEnd();
  }
}
function HospitalAppointmentsComponent_Conditional_4_td_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 14);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const a_r2 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2("", a_r2.apptDate, " ", a_r2.apptTime);
  }
}
function HospitalAppointmentsComponent_Conditional_4_th_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 13);
    \u0275\u0275text(1, "Reason");
    \u0275\u0275elementEnd();
  }
}
function HospitalAppointmentsComponent_Conditional_4_td_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 14);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const a_r3 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(a_r3.reason || "\u2014");
  }
}
function HospitalAppointmentsComponent_Conditional_4_th_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 13);
    \u0275\u0275text(1, "Status");
    \u0275\u0275elementEnd();
  }
}
function HospitalAppointmentsComponent_Conditional_4_td_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 14)(1, "span", 15);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const a_r4 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", a_r4.status.toLowerCase());
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(a_r4.status);
  }
}
function HospitalAppointmentsComponent_Conditional_4_th_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 13);
    \u0275\u0275text(1, "Actions");
    \u0275\u0275elementEnd();
  }
}
function HospitalAppointmentsComponent_Conditional_4_td_16_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 18);
    \u0275\u0275listener("click", function HospitalAppointmentsComponent_Conditional_4_td_16_Conditional_1_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r5);
      const a_r6 = \u0275\u0275nextContext().$implicit;
      const ctx_r6 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r6.updateStatus(a_r6.id, "CONFIRMED"));
    });
    \u0275\u0275text(1, "Confirm");
    \u0275\u0275elementEnd();
  }
}
function HospitalAppointmentsComponent_Conditional_4_td_16_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 19);
    \u0275\u0275listener("click", function HospitalAppointmentsComponent_Conditional_4_td_16_Conditional_2_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r8);
      const a_r6 = \u0275\u0275nextContext().$implicit;
      const ctx_r6 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r6.updateStatus(a_r6.id, "COMPLETED"));
    });
    \u0275\u0275text(1, "Complete");
    \u0275\u0275elementEnd();
  }
}
function HospitalAppointmentsComponent_Conditional_4_td_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 14);
    \u0275\u0275conditionalCreate(1, HospitalAppointmentsComponent_Conditional_4_td_16_Conditional_1_Template, 2, 0, "button", 16);
    \u0275\u0275conditionalCreate(2, HospitalAppointmentsComponent_Conditional_4_td_16_Conditional_2_Template, 2, 0, "button", 17);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const a_r6 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275conditional(a_r6.status === "PENDING" ? 1 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(a_r6.status === "CONFIRMED" ? 2 : -1);
  }
}
function HospitalAppointmentsComponent_Conditional_4_tr_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "tr", 20);
  }
}
function HospitalAppointmentsComponent_Conditional_4_tr_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "tr", 21);
  }
}
function HospitalAppointmentsComponent_Conditional_4_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 12);
    \u0275\u0275text(1, " No appointments. ");
    \u0275\u0275elementEnd();
  }
}
function HospitalAppointmentsComponent_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-card")(1, "table", 2);
    \u0275\u0275elementContainerStart(2, 3);
    \u0275\u0275template(3, HospitalAppointmentsComponent_Conditional_4_th_3_Template, 2, 0, "th", 4)(4, HospitalAppointmentsComponent_Conditional_4_td_4_Template, 2, 1, "td", 5);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(5, 6);
    \u0275\u0275template(6, HospitalAppointmentsComponent_Conditional_4_th_6_Template, 2, 0, "th", 4)(7, HospitalAppointmentsComponent_Conditional_4_td_7_Template, 2, 2, "td", 5);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(8, 7);
    \u0275\u0275template(9, HospitalAppointmentsComponent_Conditional_4_th_9_Template, 2, 0, "th", 4)(10, HospitalAppointmentsComponent_Conditional_4_td_10_Template, 2, 1, "td", 5);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(11, 8);
    \u0275\u0275template(12, HospitalAppointmentsComponent_Conditional_4_th_12_Template, 2, 0, "th", 4)(13, HospitalAppointmentsComponent_Conditional_4_td_13_Template, 3, 2, "td", 5);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(14, 9);
    \u0275\u0275template(15, HospitalAppointmentsComponent_Conditional_4_th_15_Template, 2, 0, "th", 4)(16, HospitalAppointmentsComponent_Conditional_4_td_16_Template, 3, 2, "td", 5);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275template(17, HospitalAppointmentsComponent_Conditional_4_tr_17_Template, 1, 0, "tr", 10)(18, HospitalAppointmentsComponent_Conditional_4_tr_18_Template, 1, 0, "tr", 11);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(19, HospitalAppointmentsComponent_Conditional_4_Conditional_19_Template, 2, 0, "p", 12);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r6 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("dataSource", ctx_r6.appointments);
    \u0275\u0275advance(16);
    \u0275\u0275property("matHeaderRowDef", ctx_r6.cols);
    \u0275\u0275advance();
    \u0275\u0275property("matRowDefColumns", ctx_r6.cols);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r6.appointments.length === 0 ? 19 : -1);
  }
}
var _HospitalAppointmentsComponent = class _HospitalAppointmentsComponent {
  constructor(api, snack) {
    this.api = api;
    this.snack = snack;
    this.appointments = [];
    this.cols = ["id", "date", "reason", "status", "actions"];
    this.loading = true;
  }
  ngOnInit() {
    this.api.get("/appointments/hospital").subscribe({
      next: (res) => {
        this.appointments = res.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
  updateStatus(id, status) {
    this.api.patch(`/appointments/${id}/status`, { status }).subscribe({
      next: () => {
        const a = this.appointments.find((x) => x.id === id);
        if (a)
          a.status = status;
        this.snack.open(`Status updated to ${status}`, "", { duration: 2e3 });
      }
    });
  }
};
_HospitalAppointmentsComponent.\u0275fac = function HospitalAppointmentsComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _HospitalAppointmentsComponent)(\u0275\u0275directiveInject(ApiService), \u0275\u0275directiveInject(MatSnackBar));
};
_HospitalAppointmentsComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _HospitalAppointmentsComponent, selectors: [["app-hospital-appointments"]], standalone: false, decls: 5, vars: 2, consts: [[1, "page-container"], ["diameter", "40", 2, "margin", "40px auto"], ["mat-table", "", 2, "width", "100%", 3, "dataSource"], ["matColumnDef", "id"], ["mat-header-cell", "", 4, "matHeaderCellDef"], ["mat-cell", "", 4, "matCellDef"], ["matColumnDef", "date"], ["matColumnDef", "reason"], ["matColumnDef", "status"], ["matColumnDef", "actions"], ["mat-header-row", "", 4, "matHeaderRowDef"], ["mat-row", "", 4, "matRowDef", "matRowDefColumns"], [2, "text-align", "center", "padding", "24px", "color", "#64748B"], ["mat-header-cell", ""], ["mat-cell", ""], [1, "chip", 3, "ngClass"], ["mat-stroked-button", "", "color", "primary"], ["mat-stroked-button", ""], ["mat-stroked-button", "", "color", "primary", 3, "click"], ["mat-stroked-button", "", 3, "click"], ["mat-header-row", ""], ["mat-row", ""]], template: function HospitalAppointmentsComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "h1");
    \u0275\u0275text(2, "Hospital Appointments");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(3, HospitalAppointmentsComponent_Conditional_3_Template, 1, 0, "mat-spinner", 1);
    \u0275\u0275conditionalCreate(4, HospitalAppointmentsComponent_Conditional_4_Template, 20, 4, "mat-card");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance(3);
    \u0275\u0275conditional(ctx.loading ? 3 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx.loading ? 4 : -1);
  }
}, dependencies: [NgClass, MatCard, MatButton, MatTable, MatHeaderCellDef, MatHeaderRowDef, MatColumnDef, MatCellDef, MatRowDef, MatHeaderCell, MatCell, MatHeaderRow, MatRow, MatProgressSpinner], encapsulation: 2 });
var HospitalAppointmentsComponent = _HospitalAppointmentsComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(HospitalAppointmentsComponent, [{
    type: Component,
    args: [{
      standalone: false,
      selector: "app-hospital-appointments",
      template: `
    <div class="page-container">
      <h1>Hospital Appointments</h1>

      @if (loading) {
        <mat-spinner diameter="40" style="margin:40px auto"></mat-spinner>
      }

      @if (!loading) {
        <mat-card>
          <table mat-table [dataSource]="appointments" style="width:100%">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>#</th>
              <td mat-cell *matCellDef="let a">{{ a.id }}</td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let a">{{ a.apptDate }} {{ a.apptTime }}</td>
            </ng-container>
            <ng-container matColumnDef="reason">
              <th mat-header-cell *matHeaderCellDef>Reason</th>
              <td mat-cell *matCellDef="let a">{{ a.reason || '\u2014' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let a">
                <span class="chip" [ngClass]="a.status.toLowerCase()">{{ a.status }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let a">
                @if (a.status === 'PENDING') {
                  <button mat-stroked-button color="primary"
                          (click)="updateStatus(a.id, 'CONFIRMED')">Confirm</button>
                }
                @if (a.status === 'CONFIRMED') {
                  <button mat-stroked-button
                          (click)="updateStatus(a.id, 'COMPLETED')">Complete</button>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>
          @if (appointments.length === 0) {
            <p style="text-align:center;padding:24px;color:#64748B">
              No appointments.
            </p>
          }
        </mat-card>
      }
    </div>
  `
    }]
  }], () => [{ type: ApiService }, { type: MatSnackBar }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(HospitalAppointmentsComponent, { className: "HospitalAppointmentsComponent", filePath: "src/app/features/hospital/hospital-appointments/hospital-appointments.component.ts", lineNumber: 63 });
})();

// src/app/features/hospital/doctors-manage/doctors-manage.component.ts
function DoctorsManageComponent_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "mat-card", 3)(1, "mat-card-content")(2, "div", 15)(3, "mat-form-field", 16)(4, "mat-label");
    \u0275\u0275text(5, "Name *");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "input", 17);
    \u0275\u0275twoWayListener("ngModelChange", function DoctorsManageComponent_Conditional_8_Template_input_ngModelChange_6_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.newDoc.name, $event) || (ctx_r1.newDoc.name = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "mat-form-field", 16)(8, "mat-label");
    \u0275\u0275text(9, "Specialization");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "input", 17);
    \u0275\u0275twoWayListener("ngModelChange", function DoctorsManageComponent_Conditional_8_Template_input_ngModelChange_10_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.newDoc.specialization, $event) || (ctx_r1.newDoc.specialization = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(11, "mat-form-field", 16)(12, "mat-label");
    \u0275\u0275text(13, "Schedule Start (HH:mm)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "input", 18);
    \u0275\u0275twoWayListener("ngModelChange", function DoctorsManageComponent_Conditional_8_Template_input_ngModelChange_14_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.newDoc.scheduleStart, $event) || (ctx_r1.newDoc.scheduleStart = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(15, "mat-form-field", 16)(16, "mat-label");
    \u0275\u0275text(17, "Schedule End (HH:mm)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "input", 18);
    \u0275\u0275twoWayListener("ngModelChange", function DoctorsManageComponent_Conditional_8_Template_input_ngModelChange_18_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.newDoc.scheduleEnd, $event) || (ctx_r1.newDoc.scheduleEnd = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(19, "mat-form-field", 16)(20, "mat-label");
    \u0275\u0275text(21, "Slot Duration (min)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "input", 19);
    \u0275\u0275twoWayListener("ngModelChange", function DoctorsManageComponent_Conditional_8_Template_input_ngModelChange_22_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.newDoc.slotDuration, $event) || (ctx_r1.newDoc.slotDuration = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(23, "button", 20);
    \u0275\u0275listener("click", function DoctorsManageComponent_Conditional_8_Template_button_click_23_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.addDoctor());
    });
    \u0275\u0275text(24, "Save");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "button", 21);
    \u0275\u0275listener("click", function DoctorsManageComponent_Conditional_8_Template_button_click_25_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.showForm = false);
    });
    \u0275\u0275text(26, "Cancel");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(6);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.newDoc.name);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.newDoc.specialization);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.newDoc.scheduleStart);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.newDoc.scheduleEnd);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.newDoc.slotDuration);
  }
}
function DoctorsManageComponent_th_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 22);
    \u0275\u0275text(1, "Name");
    \u0275\u0275elementEnd();
  }
}
function DoctorsManageComponent_td_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 23);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const d_r3 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(d_r3.name);
  }
}
function DoctorsManageComponent_th_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 22);
    \u0275\u0275text(1, "Specialization");
    \u0275\u0275elementEnd();
  }
}
function DoctorsManageComponent_td_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 23);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const d_r4 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(d_r4.specialization || "\u2014");
  }
}
function DoctorsManageComponent_th_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 22);
    \u0275\u0275text(1, "Schedule");
    \u0275\u0275elementEnd();
  }
}
function DoctorsManageComponent_td_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 23);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const d_r5 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2("", d_r5.scheduleStart, " \u2013 ", d_r5.scheduleEnd);
  }
}
function DoctorsManageComponent_th_21_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 22);
    \u0275\u0275text(1, "Slot (min)");
    \u0275\u0275elementEnd();
  }
}
function DoctorsManageComponent_td_22_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 23);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const d_r6 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(d_r6.slotDuration);
  }
}
function DoctorsManageComponent_th_24_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "th", 22);
  }
}
function DoctorsManageComponent_td_25_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "td", 23)(1, "button", 24);
    \u0275\u0275listener("click", function DoctorsManageComponent_td_25_Template_button_click_1_listener() {
      const d_r8 = \u0275\u0275restoreView(_r7).$implicit;
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.deleteDoctor(d_r8.id));
    });
    \u0275\u0275elementStart(2, "mat-icon");
    \u0275\u0275text(3, "delete");
    \u0275\u0275elementEnd()()();
  }
}
function DoctorsManageComponent_tr_26_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "tr", 25);
  }
}
function DoctorsManageComponent_tr_27_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "tr", 26);
  }
}
function DoctorsManageComponent_Conditional_28_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 14);
    \u0275\u0275text(1, " No doctors added yet. ");
    \u0275\u0275elementEnd();
  }
}
var _DoctorsManageComponent = class _DoctorsManageComponent {
  constructor(api, snack) {
    this.api = api;
    this.snack = snack;
    this.doctors = [];
    this.cols = ["name", "spec", "schedule", "slot", "actions"];
    this.showForm = false;
    this.newDoc = { slotDuration: 30 };
    this.hospitalId = null;
  }
  ngOnInit() {
    this.api.get("/hospitals/profile").subscribe({
      next: (res) => {
        this.hospitalId = res.data?.id;
        if (this.hospitalId) {
          this.api.get(`/hospitals/public/${this.hospitalId}/doctors`).subscribe((r) => {
            this.doctors = r.data ?? [];
          });
        }
      }
    });
  }
  addDoctor() {
    if (!this.newDoc.name)
      return;
    this.api.post("/hospitals/profile/doctors", this.newDoc).subscribe({
      next: (res) => {
        this.doctors.push(res.data);
        this.showForm = false;
        this.newDoc = { slotDuration: 30 };
        this.snack.open("Doctor added!", "", { duration: 2e3 });
      },
      error: (err) => this.snack.open(err.error?.message ?? "Error.", "Close", { duration: 3e3 })
    });
  }
  deleteDoctor(id) {
    if (!confirm("Remove this doctor?"))
      return;
    this.api.delete(`/hospitals/profile/doctors/${id}`).subscribe(() => {
      this.doctors = this.doctors.filter((d) => d.id !== id);
      this.snack.open("Doctor removed.", "", { duration: 2e3 });
    });
  }
};
_DoctorsManageComponent.\u0275fac = function DoctorsManageComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _DoctorsManageComponent)(\u0275\u0275directiveInject(ApiService), \u0275\u0275directiveInject(MatSnackBar));
};
_DoctorsManageComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _DoctorsManageComponent, selectors: [["app-doctors-manage"]], standalone: false, decls: 29, vars: 5, consts: [[1, "page-container"], [2, "display", "flex", "justify-content", "space-between", "align-items", "center", "margin-bottom", "20px"], ["mat-raised-button", "", "color", "primary", 3, "click"], [2, "margin-bottom", "20px"], ["mat-table", "", 2, "width", "100%", 3, "dataSource"], ["matColumnDef", "name"], ["mat-header-cell", "", 4, "matHeaderCellDef"], ["mat-cell", "", 4, "matCellDef"], ["matColumnDef", "spec"], ["matColumnDef", "schedule"], ["matColumnDef", "slot"], ["matColumnDef", "actions"], ["mat-header-row", "", 4, "matHeaderRowDef"], ["mat-row", "", 4, "matRowDef", "matRowDefColumns"], [2, "text-align", "center", "padding", "24px", "color", "#64748B"], [1, "form-grid", 2, "margin-top", "12px"], ["appearance", "outline"], ["matInput", "", 3, "ngModelChange", "ngModel"], ["matInput", "", "type", "time", 3, "ngModelChange", "ngModel"], ["matInput", "", "type", "number", 3, "ngModelChange", "ngModel"], ["mat-flat-button", "", "color", "primary", 3, "click"], ["mat-button", "", 3, "click"], ["mat-header-cell", ""], ["mat-cell", ""], ["mat-icon-button", "", "color", "warn", 3, "click"], ["mat-header-row", ""], ["mat-row", ""]], template: function DoctorsManageComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "h1");
    \u0275\u0275text(3, "Manage Doctors");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "button", 2);
    \u0275\u0275listener("click", function DoctorsManageComponent_Template_button_click_4_listener() {
      return ctx.showForm = !ctx.showForm;
    });
    \u0275\u0275elementStart(5, "mat-icon");
    \u0275\u0275text(6, "add");
    \u0275\u0275elementEnd();
    \u0275\u0275text(7, " Add Doctor ");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(8, DoctorsManageComponent_Conditional_8_Template, 27, 5, "mat-card", 3);
    \u0275\u0275elementStart(9, "mat-card")(10, "table", 4);
    \u0275\u0275elementContainerStart(11, 5);
    \u0275\u0275template(12, DoctorsManageComponent_th_12_Template, 2, 0, "th", 6)(13, DoctorsManageComponent_td_13_Template, 2, 1, "td", 7);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(14, 8);
    \u0275\u0275template(15, DoctorsManageComponent_th_15_Template, 2, 0, "th", 6)(16, DoctorsManageComponent_td_16_Template, 2, 1, "td", 7);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(17, 9);
    \u0275\u0275template(18, DoctorsManageComponent_th_18_Template, 2, 0, "th", 6)(19, DoctorsManageComponent_td_19_Template, 2, 2, "td", 7);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(20, 10);
    \u0275\u0275template(21, DoctorsManageComponent_th_21_Template, 2, 0, "th", 6)(22, DoctorsManageComponent_td_22_Template, 2, 1, "td", 7);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(23, 11);
    \u0275\u0275template(24, DoctorsManageComponent_th_24_Template, 1, 0, "th", 6)(25, DoctorsManageComponent_td_25_Template, 4, 0, "td", 7);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275template(26, DoctorsManageComponent_tr_26_Template, 1, 0, "tr", 12)(27, DoctorsManageComponent_tr_27_Template, 1, 0, "tr", 13);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(28, DoctorsManageComponent_Conditional_28_Template, 2, 0, "p", 14);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275advance(8);
    \u0275\u0275conditional(ctx.showForm ? 8 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275property("dataSource", ctx.doctors);
    \u0275\u0275advance(16);
    \u0275\u0275property("matHeaderRowDef", ctx.cols);
    \u0275\u0275advance();
    \u0275\u0275property("matRowDefColumns", ctx.cols);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx.doctors.length === 0 ? 28 : -1);
  }
}, dependencies: [DefaultValueAccessor, NumberValueAccessor, NgControlStatus, NgModel, MatCard, MatCardContent, MatButton, MatIconButton, MatIcon, MatInput, MatFormField, MatLabel, MatTable, MatHeaderCellDef, MatHeaderRowDef, MatColumnDef, MatCellDef, MatRowDef, MatHeaderCell, MatCell, MatHeaderRow, MatRow], encapsulation: 2 });
var DoctorsManageComponent = _DoctorsManageComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DoctorsManageComponent, [{
    type: Component,
    args: [{
      standalone: false,
      selector: "app-doctors-manage",
      template: `
    <div class="page-container">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h1>Manage Doctors</h1>
        <button mat-raised-button color="primary" (click)="showForm = !showForm">
          <mat-icon>add</mat-icon> Add Doctor
        </button>
      </div>

      @if (showForm) {
        <mat-card style="margin-bottom:20px">
          <mat-card-content>
            <div class="form-grid" style="margin-top:12px">
              <mat-form-field appearance="outline">
                <mat-label>Name *</mat-label>
                <input matInput [(ngModel)]="newDoc.name">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Specialization</mat-label>
                <input matInput [(ngModel)]="newDoc.specialization">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Schedule Start (HH:mm)</mat-label>
                <input matInput type="time" [(ngModel)]="newDoc.scheduleStart">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Schedule End (HH:mm)</mat-label>
                <input matInput type="time" [(ngModel)]="newDoc.scheduleEnd">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Slot Duration (min)</mat-label>
                <input matInput type="number" [(ngModel)]="newDoc.slotDuration">
              </mat-form-field>
            </div>
            <button mat-flat-button color="primary" (click)="addDoctor()">Save</button>
            <button mat-button (click)="showForm = false">Cancel</button>
          </mat-card-content>
        </mat-card>
      }

      <mat-card>
        <table mat-table [dataSource]="doctors" style="width:100%">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let d">{{ d.name }}</td>
          </ng-container>
          <ng-container matColumnDef="spec">
            <th mat-header-cell *matHeaderCellDef>Specialization</th>
            <td mat-cell *matCellDef="let d">{{ d.specialization || '\u2014' }}</td>
          </ng-container>
          <ng-container matColumnDef="schedule">
            <th mat-header-cell *matHeaderCellDef>Schedule</th>
            <td mat-cell *matCellDef="let d">{{ d.scheduleStart }} \u2013 {{ d.scheduleEnd }}</td>
          </ng-container>
          <ng-container matColumnDef="slot">
            <th mat-header-cell *matHeaderCellDef>Slot (min)</th>
            <td mat-cell *matCellDef="let d">{{ d.slotDuration }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let d">
              <button mat-icon-button color="warn" (click)="deleteDoctor(d.id)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>
        @if (doctors.length === 0) {
          <p style="text-align:center;padding:24px;color:#64748B">
            No doctors added yet.
          </p>
        }
      </mat-card>
    </div>
  `
    }]
  }], () => [{ type: ApiService }, { type: MatSnackBar }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(DoctorsManageComponent, { className: "DoctorsManageComponent", filePath: "src/app/features/hospital/doctors-manage/doctors-manage.component.ts", lineNumber: 86 });
})();

// src/app/features/hospital/hospital.module.ts
var _HospitalModule = class _HospitalModule {
};
_HospitalModule.\u0275fac = function HospitalModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _HospitalModule)();
};
_HospitalModule.\u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({ type: _HospitalModule });
_HospitalModule.\u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({ imports: [
  SharedModule,
  RouterModule.forChild([
    { path: "", component: HospitalDashboardComponent },
    { path: "appointments", component: HospitalAppointmentsComponent },
    { path: "doctors", component: DoctorsManageComponent }
  ])
] });
var HospitalModule = _HospitalModule;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(HospitalModule, [{
    type: NgModule,
    args: [{
      declarations: [HospitalDashboardComponent, HospitalAppointmentsComponent, DoctorsManageComponent],
      imports: [
        SharedModule,
        RouterModule.forChild([
          { path: "", component: HospitalDashboardComponent },
          { path: "appointments", component: HospitalAppointmentsComponent },
          { path: "doctors", component: DoctorsManageComponent }
        ])
      ]
    }]
  }], null, null);
})();
export {
  HospitalModule
};
//# sourceMappingURL=chunk-O5MLIPFQ.js.map
