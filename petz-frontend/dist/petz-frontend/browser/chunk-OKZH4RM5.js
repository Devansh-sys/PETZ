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
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
  MatFormField,
  MatIcon,
  MatInput,
  MatLabel,
  MatOption,
  MatProgressSpinner,
  MatSelect,
  MatSnackBar,
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
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-CNVABIPG.js";

// src/app/features/rescue/rescue-list/rescue-list.component.ts
var _forTrack0 = ($index, $item) => $item.id;
function RescueListComponent_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "mat-spinner", 3);
  }
}
function RescueListComponent_Conditional_9_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-card")(1, "mat-card-header")(2, "mat-card-title");
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "mat-card-subtitle")(5, "span", 6);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275text(7, " \xA0 ");
    \u0275\u0275elementStart(8, "span", 7);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(10, "mat-card-content")(11, "p", 8);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "p", 9);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const r_r1 = ctx.$implicit;
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(r_r1.animalType || "Unknown animal");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngClass", r_r1.status.toLowerCase());
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(r_r1.status);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(r_r1.criticality);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(r_r1.description);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(r_r1.address);
  }
}
function RescueListComponent_Conditional_9_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 5);
    \u0275\u0275text(1, " No rescue reports yet. ");
    \u0275\u0275elementEnd();
  }
}
function RescueListComponent_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 4);
    \u0275\u0275repeaterCreate(1, RescueListComponent_Conditional_9_For_2_Template, 15, 6, "mat-card", null, _forTrack0);
    \u0275\u0275conditionalCreate(3, RescueListComponent_Conditional_9_Conditional_3_Template, 2, 0, "p", 5);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.rescues);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.rescues.length === 0 ? 3 : -1);
  }
}
var _RescueListComponent = class _RescueListComponent {
  constructor(api) {
    this.api = api;
    this.rescues = [];
    this.loading = true;
  }
  ngOnInit() {
    this.api.get("/rescue/my").subscribe({
      next: (res) => {
        this.rescues = res.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
};
_RescueListComponent.\u0275fac = function RescueListComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _RescueListComponent)(\u0275\u0275directiveInject(ApiService));
};
_RescueListComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _RescueListComponent, selectors: [["app-rescue-list"]], standalone: false, decls: 10, vars: 2, consts: [[1, "page-container"], [2, "display", "flex", "justify-content", "space-between", "align-items", "center", "margin-bottom", "20px"], ["mat-raised-button", "", "color", "primary", "routerLink", "/rescue/report"], ["diameter", "40", 2, "margin", "40px auto"], [2, "display", "grid", "grid-template-columns", "repeat(auto-fill,minmax(300px,1fr))", "gap", "16px"], [2, "text-align", "center", "padding", "24px", "color", "#64748B", "grid-column", "1/-1"], [1, "chip", 3, "ngClass"], [1, "chip", 2, "background", "#EDE9FE", "color", "#5B21B6"], [2, "color", "#64748B", "margin", "12px 0 4px"], [2, "color", "#94A3B8", "font-size", "0.85rem", "margin", "0"]], template: function RescueListComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "h1");
    \u0275\u0275text(3, "Rescue Reports");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "button", 2)(5, "mat-icon");
    \u0275\u0275text(6, "add_alert");
    \u0275\u0275elementEnd();
    \u0275\u0275text(7, " Report Animal ");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(8, RescueListComponent_Conditional_8_Template, 1, 0, "mat-spinner", 3);
    \u0275\u0275conditionalCreate(9, RescueListComponent_Conditional_9_Template, 4, 1, "div", 4);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance(8);
    \u0275\u0275conditional(ctx.loading ? 8 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx.loading ? 9 : -1);
  }
}, dependencies: [NgClass, RouterLink, MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle, MatButton, MatIcon, MatProgressSpinner], encapsulation: 2 });
var RescueListComponent = _RescueListComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(RescueListComponent, [{
    type: Component,
    args: [{
      standalone: false,
      selector: "app-rescue-list",
      template: `
    <div class="page-container">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h1>Rescue Reports</h1>
        <button mat-raised-button color="primary" routerLink="/rescue/report">
          <mat-icon>add_alert</mat-icon> Report Animal
        </button>
      </div>

      @if (loading) {
        <mat-spinner diameter="40" style="margin:40px auto"></mat-spinner>
      }

      @if (!loading) {
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">
          @for (r of rescues; track r.id) {
            <mat-card>
              <mat-card-header>
                <mat-card-title>{{ r.animalType || 'Unknown animal' }}</mat-card-title>
                <mat-card-subtitle>
                  <span class="chip" [ngClass]="r.status.toLowerCase()">{{ r.status }}</span>
                  &nbsp;
                  <span class="chip" style="background:#EDE9FE;color:#5B21B6">{{ r.criticality }}</span>
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p style="color:#64748B;margin:12px 0 4px">{{ r.description }}</p>
                <p style="color:#94A3B8;font-size:0.85rem;margin:0">{{ r.address }}</p>
              </mat-card-content>
            </mat-card>
          }
          @if (rescues.length === 0) {
            <p style="text-align:center;padding:24px;color:#64748B;grid-column:1/-1">
              No rescue reports yet.
            </p>
          }
        </div>
      }
    </div>
  `
    }]
  }], () => [{ type: ApiService }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(RescueListComponent, { className: "RescueListComponent", filePath: "src/app/features/rescue/rescue-list/rescue-list.component.ts", lineNumber: 49 });
})();

// src/app/features/rescue/report-rescue/report-rescue.component.ts
var _ReportRescueComponent = class _ReportRescueComponent {
  constructor(fb, api, router, snack) {
    this.fb = fb;
    this.api = api;
    this.router = router;
    this.snack = snack;
    this.loading = false;
    this.form = this.fb.group({
      animalType: ["", Validators.required],
      description: ["", Validators.required],
      address: [""],
      criticality: ["MEDIUM"]
    });
  }
  submit() {
    if (this.form.invalid)
      return;
    this.loading = true;
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(this.form.value)], { type: "application/json" }));
    this.api.postFormData("/rescue", formData).subscribe({
      next: (res) => {
        this.snack.open("Rescue reported! NGO will be assigned.", "", { duration: 3e3 });
        this.router.navigate(["/rescue"]);
      },
      error: (err) => {
        this.snack.open(err.error?.message ?? "Error submitting.", "Close", { duration: 3e3 });
        this.loading = false;
      }
    });
  }
};
_ReportRescueComponent.\u0275fac = function ReportRescueComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _ReportRescueComponent)(\u0275\u0275directiveInject(FormBuilder), \u0275\u0275directiveInject(ApiService), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(MatSnackBar));
};
_ReportRescueComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ReportRescueComponent, selectors: [["app-report-rescue"]], standalone: false, decls: 36, vars: 3, consts: [[1, "page-container", 2, "max-width", "640px"], [3, "ngSubmit", "formGroup"], [1, "form-grid"], ["appearance", "outline"], ["matInput", "", "formControlName", "animalType", "placeholder", "Dog, Cat, Bird..."], ["formControlName", "criticality"], ["value", "LOW"], ["value", "MEDIUM"], ["value", "HIGH"], ["value", "CRITICAL"], ["appearance", "outline", 2, "width", "100%"], ["matInput", "", "formControlName", "address"], ["matInput", "", "rows", "4", "formControlName", "description", "placeholder", "Describe the animal's condition..."], [2, "display", "flex", "gap", "12px", "margin-top", "8px"], ["mat-flat-button", "", "color", "primary", "type", "submit", 3, "disabled"], ["mat-button", "", "type", "button", "routerLink", "/rescue"]], template: function ReportRescueComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "h1");
    \u0275\u0275text(2, "Report an Animal in Need");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "mat-card")(4, "mat-card-content")(5, "form", 1);
    \u0275\u0275listener("ngSubmit", function ReportRescueComponent_Template_form_ngSubmit_5_listener() {
      return ctx.submit();
    });
    \u0275\u0275elementStart(6, "div", 2)(7, "mat-form-field", 3)(8, "mat-label");
    \u0275\u0275text(9, "Animal Type");
    \u0275\u0275elementEnd();
    \u0275\u0275element(10, "input", 4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "mat-form-field", 3)(12, "mat-label");
    \u0275\u0275text(13, "Criticality");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "mat-select", 5)(15, "mat-option", 6);
    \u0275\u0275text(16, "Low");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "mat-option", 7);
    \u0275\u0275text(18, "Medium");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "mat-option", 8);
    \u0275\u0275text(20, "High");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "mat-option", 9);
    \u0275\u0275text(22, "Critical");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(23, "mat-form-field", 10)(24, "mat-label");
    \u0275\u0275text(25, "Address / Location Description");
    \u0275\u0275elementEnd();
    \u0275\u0275element(26, "input", 11);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(27, "mat-form-field", 10)(28, "mat-label");
    \u0275\u0275text(29, "Description");
    \u0275\u0275elementEnd();
    \u0275\u0275element(30, "textarea", 12);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(31, "div", 13)(32, "button", 14);
    \u0275\u0275text(33);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(34, "button", 15);
    \u0275\u0275text(35, "Cancel");
    \u0275\u0275elementEnd()()()()()();
  }
  if (rf & 2) {
    \u0275\u0275advance(5);
    \u0275\u0275property("formGroup", ctx.form);
    \u0275\u0275advance(27);
    \u0275\u0275property("disabled", ctx.form.invalid || ctx.loading);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx.loading ? "Submitting..." : "Submit Report", " ");
  }
}, dependencies: [RouterLink, \u0275NgNoValidate, DefaultValueAccessor, NgControlStatus, NgControlStatusGroup, FormGroupDirective, FormControlName, MatCard, MatCardContent, MatButton, MatInput, MatFormField, MatLabel, MatSelect, MatOption], encapsulation: 2 });
var ReportRescueComponent = _ReportRescueComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ReportRescueComponent, [{
    type: Component,
    args: [{
      standalone: false,
      selector: "app-report-rescue",
      template: `
    <div class="page-container" style="max-width:640px">
      <h1>Report an Animal in Need</h1>
      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Animal Type</mat-label>
                <input matInput formControlName="animalType" placeholder="Dog, Cat, Bird...">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Criticality</mat-label>
                <mat-select formControlName="criticality">
                  <mat-option value="LOW">Low</mat-option>
                  <mat-option value="MEDIUM">Medium</mat-option>
                  <mat-option value="HIGH">High</mat-option>
                  <mat-option value="CRITICAL">Critical</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Address / Location Description</mat-label>
              <input matInput formControlName="address">
            </mat-form-field>
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Description</mat-label>
              <textarea matInput rows="4" formControlName="description"
                        placeholder="Describe the animal's condition..."></textarea>
            </mat-form-field>
            <div style="display:flex;gap:12px;margin-top:8px">
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading">
                {{ loading ? 'Submitting...' : 'Submit Report' }}
              </button>
              <button mat-button type="button" routerLink="/rescue">Cancel</button>
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
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ReportRescueComponent, { className: "ReportRescueComponent", filePath: "src/app/features/rescue/report-rescue/report-rescue.component.ts", lineNumber: 52 });
})();

// src/app/features/rescue/rescue.module.ts
var _RescueModule = class _RescueModule {
};
_RescueModule.\u0275fac = function RescueModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _RescueModule)();
};
_RescueModule.\u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({ type: _RescueModule });
_RescueModule.\u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({ imports: [
  SharedModule,
  RouterModule.forChild([
    { path: "", component: RescueListComponent },
    { path: "report", component: ReportRescueComponent }
  ])
] });
var RescueModule = _RescueModule;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(RescueModule, [{
    type: NgModule,
    args: [{
      declarations: [RescueListComponent, ReportRescueComponent],
      imports: [
        SharedModule,
        RouterModule.forChild([
          { path: "", component: RescueListComponent },
          { path: "report", component: ReportRescueComponent }
        ])
      ]
    }]
  }], null, null);
})();
export {
  RescueModule
};
//# sourceMappingURL=chunk-OKZH4RM5.js.map
