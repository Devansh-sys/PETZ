import {
  ApiService
} from "./chunk-QYJL6IEQ.js";
import {
  Component,
  DefaultValueAccessor,
  FormBuilder,
  FormControlName,
  FormGroupDirective,
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
  MatOption,
  MatProgressSpinner,
  MatRow,
  MatRowDef,
  MatSelect,
  MatSnackBar,
  MatTable,
  NgClass,
  NgControlStatus,
  NgControlStatusGroup,
  NgModule,
  Router,
  RouterLink,
  RouterModule,
  SharedModule,
  Validators,
  setClassMetadata,
  ɵNgNoValidate,
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
  ɵɵtextInterpolate2
} from "./chunk-CNVABIPG.js";

// src/app/features/appointments/appointments-list/appointments-list.component.ts
function AppointmentsListComponent_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "mat-spinner", 3);
  }
}
function AppointmentsListComponent_Conditional_9_th_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 15);
    \u0275\u0275text(1, "Date");
    \u0275\u0275elementEnd();
  }
}
function AppointmentsListComponent_Conditional_9_td_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 16);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const a_r1 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(a_r1.apptDate);
  }
}
function AppointmentsListComponent_Conditional_9_th_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 15);
    \u0275\u0275text(1, "Time");
    \u0275\u0275elementEnd();
  }
}
function AppointmentsListComponent_Conditional_9_td_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 16);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const a_r2 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(a_r2.apptTime);
  }
}
function AppointmentsListComponent_Conditional_9_th_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 15);
    \u0275\u0275text(1, "Reason");
    \u0275\u0275elementEnd();
  }
}
function AppointmentsListComponent_Conditional_9_td_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 16);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const a_r3 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(a_r3.reason || "\u2014");
  }
}
function AppointmentsListComponent_Conditional_9_th_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 15);
    \u0275\u0275text(1, "Status");
    \u0275\u0275elementEnd();
  }
}
function AppointmentsListComponent_Conditional_9_td_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 16)(1, "span", 17);
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
function AppointmentsListComponent_Conditional_9_th_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "th", 15);
  }
}
function AppointmentsListComponent_Conditional_9_td_16_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 19);
    \u0275\u0275listener("click", function AppointmentsListComponent_Conditional_9_td_16_Conditional_1_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r5);
      const a_r6 = \u0275\u0275nextContext().$implicit;
      const ctx_r6 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r6.cancel(a_r6.id));
    });
    \u0275\u0275elementStart(1, "mat-icon");
    \u0275\u0275text(2, "cancel");
    \u0275\u0275elementEnd()();
  }
}
function AppointmentsListComponent_Conditional_9_td_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 16);
    \u0275\u0275conditionalCreate(1, AppointmentsListComponent_Conditional_9_td_16_Conditional_1_Template, 3, 0, "button", 18);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const a_r6 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275conditional(a_r6.status === "PENDING" || a_r6.status === "CONFIRMED" ? 1 : -1);
  }
}
function AppointmentsListComponent_Conditional_9_tr_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "tr", 20);
  }
}
function AppointmentsListComponent_Conditional_9_tr_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "tr", 21);
  }
}
function AppointmentsListComponent_Conditional_9_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 14);
    \u0275\u0275text(1, " No appointments found. ");
    \u0275\u0275elementEnd();
  }
}
function AppointmentsListComponent_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-card")(1, "table", 4);
    \u0275\u0275elementContainerStart(2, 5);
    \u0275\u0275template(3, AppointmentsListComponent_Conditional_9_th_3_Template, 2, 0, "th", 6)(4, AppointmentsListComponent_Conditional_9_td_4_Template, 2, 1, "td", 7);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(5, 8);
    \u0275\u0275template(6, AppointmentsListComponent_Conditional_9_th_6_Template, 2, 0, "th", 6)(7, AppointmentsListComponent_Conditional_9_td_7_Template, 2, 1, "td", 7);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(8, 9);
    \u0275\u0275template(9, AppointmentsListComponent_Conditional_9_th_9_Template, 2, 0, "th", 6)(10, AppointmentsListComponent_Conditional_9_td_10_Template, 2, 1, "td", 7);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(11, 10);
    \u0275\u0275template(12, AppointmentsListComponent_Conditional_9_th_12_Template, 2, 0, "th", 6)(13, AppointmentsListComponent_Conditional_9_td_13_Template, 3, 2, "td", 7);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(14, 11);
    \u0275\u0275template(15, AppointmentsListComponent_Conditional_9_th_15_Template, 1, 0, "th", 6)(16, AppointmentsListComponent_Conditional_9_td_16_Template, 2, 1, "td", 7);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275template(17, AppointmentsListComponent_Conditional_9_tr_17_Template, 1, 0, "tr", 12)(18, AppointmentsListComponent_Conditional_9_tr_18_Template, 1, 0, "tr", 13);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(19, AppointmentsListComponent_Conditional_9_Conditional_19_Template, 2, 0, "p", 14);
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
var _AppointmentsListComponent = class _AppointmentsListComponent {
  constructor(api) {
    this.api = api;
    this.appointments = [];
    this.loading = true;
    this.cols = ["date", "time", "reason", "status", "actions"];
  }
  ngOnInit() {
    this.api.get("/appointments/my").subscribe({
      next: (res) => {
        this.appointments = res.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
  cancel(id) {
    if (!confirm("Cancel this appointment?"))
      return;
    this.api.delete(`/appointments/${id}`).subscribe(() => {
      const a = this.appointments.find((x) => x.id === id);
      if (a)
        a.status = "CANCELLED";
    });
  }
};
_AppointmentsListComponent.\u0275fac = function AppointmentsListComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _AppointmentsListComponent)(\u0275\u0275directiveInject(ApiService));
};
_AppointmentsListComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AppointmentsListComponent, selectors: [["app-appointments-list"]], standalone: false, decls: 10, vars: 2, consts: [[1, "page-container"], [2, "display", "flex", "justify-content", "space-between", "align-items", "center", "margin-bottom", "20px"], ["mat-raised-button", "", "color", "primary", "routerLink", "/appointments/book"], ["diameter", "40", 2, "margin", "40px auto"], ["mat-table", "", 1, "mat-elevation-z1", 2, "width", "100%", 3, "dataSource"], ["matColumnDef", "date"], ["mat-header-cell", "", 4, "matHeaderCellDef"], ["mat-cell", "", 4, "matCellDef"], ["matColumnDef", "time"], ["matColumnDef", "reason"], ["matColumnDef", "status"], ["matColumnDef", "actions"], ["mat-header-row", "", 4, "matHeaderRowDef"], ["mat-row", "", 4, "matRowDef", "matRowDefColumns"], [2, "text-align", "center", "padding", "24px", "color", "#64748B"], ["mat-header-cell", ""], ["mat-cell", ""], [1, "chip", 3, "ngClass"], ["mat-icon-button", "", "color", "warn", "title", "Cancel"], ["mat-icon-button", "", "color", "warn", "title", "Cancel", 3, "click"], ["mat-header-row", ""], ["mat-row", ""]], template: function AppointmentsListComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "h1");
    \u0275\u0275text(3, "My Appointments");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "button", 2)(5, "mat-icon");
    \u0275\u0275text(6, "add");
    \u0275\u0275elementEnd();
    \u0275\u0275text(7, " Book Appointment ");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(8, AppointmentsListComponent_Conditional_8_Template, 1, 0, "mat-spinner", 3);
    \u0275\u0275conditionalCreate(9, AppointmentsListComponent_Conditional_9_Template, 20, 4, "mat-card");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance(8);
    \u0275\u0275conditional(ctx.loading ? 8 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx.loading ? 9 : -1);
  }
}, dependencies: [NgClass, RouterLink, MatCard, MatButton, MatIconButton, MatIcon, MatTable, MatHeaderCellDef, MatHeaderRowDef, MatColumnDef, MatCellDef, MatRowDef, MatHeaderCell, MatCell, MatHeaderRow, MatRow, MatProgressSpinner], encapsulation: 2 });
var AppointmentsListComponent = _AppointmentsListComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AppointmentsListComponent, [{
    type: Component,
    args: [{
      standalone: false,
      selector: "app-appointments-list",
      template: `
    <div class="page-container">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h1>My Appointments</h1>
        <button mat-raised-button color="primary" routerLink="/appointments/book">
          <mat-icon>add</mat-icon> Book Appointment
        </button>
      </div>

      @if (loading) {
        <mat-spinner diameter="40" style="margin:40px auto"></mat-spinner>
      }

      @if (!loading) {
        <mat-card>
          <table mat-table [dataSource]="appointments" class="mat-elevation-z1" style="width:100%">
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let a">{{ a.apptDate }}</td>
            </ng-container>
            <ng-container matColumnDef="time">
              <th mat-header-cell *matHeaderCellDef>Time</th>
              <td mat-cell *matCellDef="let a">{{ a.apptTime }}</td>
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
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let a">
                @if (a.status === 'PENDING' || a.status === 'CONFIRMED') {
                  <button mat-icon-button color="warn" (click)="cancel(a.id)" title="Cancel">
                    <mat-icon>cancel</mat-icon>
                  </button>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>
          @if (appointments.length === 0) {
            <p style="text-align:center;padding:24px;color:#64748B">
              No appointments found.
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
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AppointmentsListComponent, { className: "AppointmentsListComponent", filePath: "src/app/features/appointments/appointments-list/appointments-list.component.ts", lineNumber: 65 });
})();

// src/app/features/appointments/book-appointment/book-appointment.component.ts
var _forTrack0 = ($index, $item) => $item.id;
function BookAppointmentComponent_For_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-option", 5);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const h_r1 = ctx.$implicit;
    \u0275\u0275property("value", h_r1.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(h_r1.name);
  }
}
function BookAppointmentComponent_For_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-option", 5);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const d_r2 = ctx.$implicit;
    \u0275\u0275property("value", d_r2.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2("", d_r2.name, " \u2014 ", d_r2.specialization);
  }
}
var _BookAppointmentComponent = class _BookAppointmentComponent {
  constructor(fb, api, router, snack) {
    this.fb = fb;
    this.api = api;
    this.router = router;
    this.snack = snack;
    this.hospitals = [];
    this.doctors = [];
    this.loading = false;
    this.form = this.fb.group({
      hospitalId: [null, Validators.required],
      doctorId: [null, Validators.required],
      apptDate: ["", Validators.required],
      apptTime: ["", Validators.required],
      reason: [""]
    });
  }
  ngOnInit() {
    this.api.get("/hospitals/public").subscribe((res) => {
      this.hospitals = res.data ?? [];
    });
  }
  onHospitalChange(hospitalId) {
    this.form.patchValue({ doctorId: null });
    this.api.get(`/hospitals/public/${hospitalId}/doctors`).subscribe((res) => {
      this.doctors = res.data ?? [];
    });
  }
  submit() {
    if (this.form.invalid)
      return;
    this.loading = true;
    this.api.post("/appointments", this.form.value).subscribe({
      next: () => {
        this.snack.open("Appointment booked!", "", { duration: 2e3 });
        this.router.navigate(["/appointments"]);
      },
      error: (err) => {
        this.snack.open(err.error?.message ?? "Booking failed.", "Close", { duration: 3e3 });
        this.loading = false;
      }
    });
  }
};
_BookAppointmentComponent.\u0275fac = function BookAppointmentComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _BookAppointmentComponent)(\u0275\u0275directiveInject(FormBuilder), \u0275\u0275directiveInject(ApiService), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(MatSnackBar));
};
_BookAppointmentComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _BookAppointmentComponent, selectors: [["app-book-appointment"]], standalone: false, decls: 36, vars: 3, consts: [[1, "page-container", 2, "max-width", "680px"], [3, "ngSubmit", "formGroup"], [1, "form-grid"], ["appearance", "outline"], ["formControlName", "hospitalId", 3, "selectionChange"], [3, "value"], ["formControlName", "doctorId"], ["matInput", "", "type", "date", "formControlName", "apptDate"], ["matInput", "", "type", "time", "formControlName", "apptTime"], ["appearance", "outline", 2, "width", "100%"], ["matInput", "", "rows", "2", "formControlName", "reason"], [2, "display", "flex", "gap", "12px", "margin-top", "8px"], ["mat-flat-button", "", "color", "primary", "type", "submit", 3, "disabled"], ["mat-button", "", "type", "button", "routerLink", "/appointments"]], template: function BookAppointmentComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "h1");
    \u0275\u0275text(2, "Book Appointment");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "mat-card")(4, "mat-card-content")(5, "form", 1);
    \u0275\u0275listener("ngSubmit", function BookAppointmentComponent_Template_form_ngSubmit_5_listener() {
      return ctx.submit();
    });
    \u0275\u0275elementStart(6, "div", 2)(7, "mat-form-field", 3)(8, "mat-label");
    \u0275\u0275text(9, "Hospital");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "mat-select", 4);
    \u0275\u0275listener("selectionChange", function BookAppointmentComponent_Template_mat_select_selectionChange_10_listener($event) {
      return ctx.onHospitalChange($event.value);
    });
    \u0275\u0275repeaterCreate(11, BookAppointmentComponent_For_12_Template, 2, 2, "mat-option", 5, _forTrack0);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "mat-form-field", 3)(14, "mat-label");
    \u0275\u0275text(15, "Doctor");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "mat-select", 6);
    \u0275\u0275repeaterCreate(17, BookAppointmentComponent_For_18_Template, 2, 3, "mat-option", 5, _forTrack0);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(19, "mat-form-field", 3)(20, "mat-label");
    \u0275\u0275text(21, "Date");
    \u0275\u0275elementEnd();
    \u0275\u0275element(22, "input", 7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "mat-form-field", 3)(24, "mat-label");
    \u0275\u0275text(25, "Time");
    \u0275\u0275elementEnd();
    \u0275\u0275element(26, "input", 8);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(27, "mat-form-field", 9)(28, "mat-label");
    \u0275\u0275text(29, "Reason for visit");
    \u0275\u0275elementEnd();
    \u0275\u0275element(30, "textarea", 10);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(31, "div", 11)(32, "button", 12);
    \u0275\u0275text(33);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(34, "button", 13);
    \u0275\u0275text(35, "Cancel");
    \u0275\u0275elementEnd()()()()()();
  }
  if (rf & 2) {
    \u0275\u0275advance(5);
    \u0275\u0275property("formGroup", ctx.form);
    \u0275\u0275advance(6);
    \u0275\u0275repeater(ctx.hospitals);
    \u0275\u0275advance(6);
    \u0275\u0275repeater(ctx.doctors);
    \u0275\u0275advance(15);
    \u0275\u0275property("disabled", ctx.form.invalid || ctx.loading);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx.loading ? "Booking..." : "Book Appointment", " ");
  }
}, dependencies: [RouterLink, \u0275NgNoValidate, DefaultValueAccessor, NgControlStatus, NgControlStatusGroup, FormGroupDirective, FormControlName, MatCard, MatCardContent, MatButton, MatInput, MatFormField, MatLabel, MatSelect, MatOption], encapsulation: 2 });
var BookAppointmentComponent = _BookAppointmentComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BookAppointmentComponent, [{
    type: Component,
    args: [{
      standalone: false,
      selector: "app-book-appointment",
      template: `
    <div class="page-container" style="max-width:680px">
      <h1>Book Appointment</h1>
      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Hospital</mat-label>
                <mat-select formControlName="hospitalId" (selectionChange)="onHospitalChange($event.value)">
                  @for (h of hospitals; track h.id) {
                    <mat-option [value]="h.id">{{ h.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Doctor</mat-label>
                <mat-select formControlName="doctorId">
                  @for (d of doctors; track d.id) {
                    <mat-option [value]="d.id">{{ d.name }} \u2014 {{ d.specialization }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Date</mat-label>
                <input matInput type="date" formControlName="apptDate">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Time</mat-label>
                <input matInput type="time" formControlName="apptTime">
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Reason for visit</mat-label>
              <textarea matInput rows="2" formControlName="reason"></textarea>
            </mat-form-field>
            <div style="display:flex;gap:12px;margin-top:8px">
              <button mat-flat-button color="primary" type="submit"
                      [disabled]="form.invalid || loading">
                {{ loading ? 'Booking...' : 'Book Appointment' }}
              </button>
              <button mat-button type="button" routerLink="/appointments">Cancel</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
    }]
  }], () => [{ type: FormBuilder }, { type: ApiService }, { type: Router }, { type: MatSnackBar }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(BookAppointmentComponent, { className: "BookAppointmentComponent", filePath: "src/app/features/appointments/book-appointment/book-appointment.component.ts", lineNumber: 59 });
})();

// src/app/features/appointments/appointments.module.ts
var _AppointmentsModule = class _AppointmentsModule {
};
_AppointmentsModule.\u0275fac = function AppointmentsModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _AppointmentsModule)();
};
_AppointmentsModule.\u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({ type: _AppointmentsModule });
_AppointmentsModule.\u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({ imports: [
  SharedModule,
  RouterModule.forChild([
    { path: "", component: AppointmentsListComponent },
    { path: "book", component: BookAppointmentComponent }
  ])
] });
var AppointmentsModule = _AppointmentsModule;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AppointmentsModule, [{
    type: NgModule,
    args: [{
      declarations: [AppointmentsListComponent, BookAppointmentComponent],
      imports: [
        SharedModule,
        RouterModule.forChild([
          { path: "", component: AppointmentsListComponent },
          { path: "book", component: BookAppointmentComponent }
        ])
      ]
    }]
  }], null, null);
})();
export {
  AppointmentsModule
};
//# sourceMappingURL=chunk-CU7JCXJL.js.map
