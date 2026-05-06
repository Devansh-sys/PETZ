import {
  ApiService
} from "./chunk-QYJL6IEQ.js";
import {
  Component,
  DefaultValueAccessor,
  MatButton,
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatFormField,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatIcon,
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
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-CNVABIPG.js";

// src/app/features/ngo/ngo-dashboard/ngo-dashboard.component.ts
var _forTrack0 = ($index, $item) => $item.label;
function NgoDashboardComponent_Conditional_3_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 8);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275property("src", ctx_r0.ngo.logoUrl, \u0275\u0275sanitizeUrl);
  }
}
function NgoDashboardComponent_Conditional_3_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 11);
    \u0275\u0275text(1, "Verified");
    \u0275\u0275elementEnd();
  }
}
function NgoDashboardComponent_Conditional_3_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 12);
    \u0275\u0275text(1, "Pending Verification");
    \u0275\u0275elementEnd();
  }
}
function NgoDashboardComponent_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 1)(1, "div", 7);
    \u0275\u0275conditionalCreate(2, NgoDashboardComponent_Conditional_3_Conditional_2_Template, 1, 1, "img", 8);
    \u0275\u0275elementStart(3, "div")(4, "h2", 9);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "p", 10);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(8, NgoDashboardComponent_Conditional_3_Conditional_8_Template, 2, 0, "span", 11)(9, NgoDashboardComponent_Conditional_3_Conditional_9_Template, 2, 0, "span", 12);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r0.ngo.logoUrl ? 2 : -1);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r0.ngo.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("", ctx_r0.ngo.city, " \u2022 ", ctx_r0.ngo.phone);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r0.ngo.isVerified ? 8 : 9);
  }
}
function NgoDashboardComponent_For_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-card")(1, "mat-card-content", 13)(2, "mat-icon", 14);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "h2", 15);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "p", 16);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const s_r2 = ctx.$implicit;
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(s_r2.icon);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(s_r2.value);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(s_r2.label);
  }
}
var _NgoDashboardComponent = class _NgoDashboardComponent {
  constructor(api) {
    this.api = api;
    this.ngo = null;
    this.stats = [
      { icon: "pets", value: "\u2014", label: "Animals Listed" },
      { icon: "emergency", value: "\u2014", label: "Active Rescues" },
      { icon: "assignment", value: "\u2014", label: "Applications" }
    ];
  }
  ngOnInit() {
    this.api.get("/ngo/profile").subscribe({
      next: (res) => {
        this.ngo = res.data;
      },
      error: () => {
      }
    });
  }
};
_NgoDashboardComponent.\u0275fac = function NgoDashboardComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _NgoDashboardComponent)(\u0275\u0275directiveInject(ApiService));
};
_NgoDashboardComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _NgoDashboardComponent, selectors: [["app-ngo-dashboard"]], standalone: false, decls: 20, vars: 1, consts: [[1, "page-container"], [1, "card", 2, "margin-bottom", "20px"], [2, "display", "grid", "grid-template-columns", "repeat(auto-fill,minmax(200px,1fr))", "gap", "16px", "margin-bottom", "24px"], [2, "display", "flex", "gap", "12px"], ["mat-raised-button", "", "color", "primary", "routerLink", "/ngo/animals"], ["mat-raised-button", "", "routerLink", "/ngo/rescues"], ["mat-raised-button", "", "routerLink", "/ngo/applications"], [2, "display", "flex", "gap", "16px", "align-items", "center"], [2, "width", "80px", "height", "80px", "border-radius", "50%", "object-fit", "cover", 3, "src"], [2, "margin", "0"], [2, "color", "#64748B", "margin", "4px 0"], [1, "chip", "confirmed"], [1, "chip", "pending"], [2, "text-align", "center", "padding", "20px"], [2, "font-size", "36px", "width", "36px", "height", "36px", "color", "#0F766E"], [2, "margin", "8px 0 4px", "color", "#0F766E", "font-size", "1.8rem"], [2, "color", "#64748B", "margin", "0"]], template: function NgoDashboardComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "h1");
    \u0275\u0275text(2, "NGO Dashboard");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(3, NgoDashboardComponent_Conditional_3_Template, 10, 5, "div", 1);
    \u0275\u0275elementStart(4, "div", 2);
    \u0275\u0275repeaterCreate(5, NgoDashboardComponent_For_6_Template, 8, 3, "mat-card", null, _forTrack0);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "div", 3)(8, "button", 4)(9, "mat-icon");
    \u0275\u0275text(10, "pets");
    \u0275\u0275elementEnd();
    \u0275\u0275text(11, " Manage Animals ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "button", 5)(13, "mat-icon");
    \u0275\u0275text(14, "emergency");
    \u0275\u0275elementEnd();
    \u0275\u0275text(15, " Rescue Queue ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "button", 6)(17, "mat-icon");
    \u0275\u0275text(18, "assignment");
    \u0275\u0275elementEnd();
    \u0275\u0275text(19, " Applications ");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    \u0275\u0275advance(3);
    \u0275\u0275conditional(ctx.ngo ? 3 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx.stats);
  }
}, dependencies: [RouterLink, MatCard, MatCardContent, MatButton, MatIcon], encapsulation: 2 });
var NgoDashboardComponent = _NgoDashboardComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NgoDashboardComponent, [{
    type: Component,
    args: [{
      standalone: false,
      selector: "app-ngo-dashboard",
      template: `
    <div class="page-container">
      <h1>NGO Dashboard</h1>

      @if (ngo) {
        <div class="card" style="margin-bottom:20px">
          <div style="display:flex;gap:16px;align-items:center">
            @if (ngo.logoUrl) {
              <img [src]="ngo.logoUrl" style="width:80px;height:80px;border-radius:50%;object-fit:cover">
            }
            <div>
              <h2 style="margin:0">{{ ngo.name }}</h2>
              <p style="color:#64748B;margin:4px 0">{{ ngo.city }} \u2022 {{ ngo.phone }}</p>
              @if (ngo.isVerified) {
                <span class="chip confirmed">Verified</span>
              } @else {
                <span class="chip pending">Pending Verification</span>
              }
            </div>
          </div>
        </div>
      }

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:24px">
        @for (s of stats; track s.label) {
          <mat-card>
            <mat-card-content style="text-align:center;padding:20px">
              <mat-icon style="font-size:36px;width:36px;height:36px;color:#0F766E">{{ s.icon }}</mat-icon>
              <h2 style="margin:8px 0 4px;color:#0F766E;font-size:1.8rem">{{ s.value }}</h2>
              <p style="color:#64748B;margin:0">{{ s.label }}</p>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <div style="display:flex;gap:12px">
        <button mat-raised-button color="primary" routerLink="/ngo/animals">
          <mat-icon>pets</mat-icon> Manage Animals
        </button>
        <button mat-raised-button routerLink="/ngo/rescues">
          <mat-icon>emergency</mat-icon> Rescue Queue
        </button>
        <button mat-raised-button routerLink="/ngo/applications">
          <mat-icon>assignment</mat-icon> Applications
        </button>
      </div>
    </div>
  `
    }]
  }], () => [{ type: ApiService }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(NgoDashboardComponent, { className: "NgoDashboardComponent", filePath: "src/app/features/ngo/ngo-dashboard/ngo-dashboard.component.ts", lineNumber: 56 });
})();

// src/app/features/ngo/ngo-animals/ngo-animals.component.ts
function NgoAnimalsComponent_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "mat-card", 3)(1, "mat-card-header")(2, "mat-card-title");
    \u0275\u0275text(3, "Add Animal");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "mat-card-content")(5, "div", 14)(6, "mat-form-field", 15)(7, "mat-label");
    \u0275\u0275text(8, "Name *");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "input", 16);
    \u0275\u0275twoWayListener("ngModelChange", function NgoAnimalsComponent_Conditional_8_Template_input_ngModelChange_9_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.newAnimal.name, $event) || (ctx_r1.newAnimal.name = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "mat-form-field", 15)(11, "mat-label");
    \u0275\u0275text(12, "Species");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "input", 16);
    \u0275\u0275twoWayListener("ngModelChange", function NgoAnimalsComponent_Conditional_8_Template_input_ngModelChange_13_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.newAnimal.species, $event) || (ctx_r1.newAnimal.species = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(14, "mat-form-field", 15)(15, "mat-label");
    \u0275\u0275text(16, "Breed");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "input", 16);
    \u0275\u0275twoWayListener("ngModelChange", function NgoAnimalsComponent_Conditional_8_Template_input_ngModelChange_17_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.newAnimal.breed, $event) || (ctx_r1.newAnimal.breed = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(18, "mat-form-field", 15)(19, "mat-label");
    \u0275\u0275text(20, "Age (months)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "input", 17);
    \u0275\u0275twoWayListener("ngModelChange", function NgoAnimalsComponent_Conditional_8_Template_input_ngModelChange_21_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.newAnimal.ageMonths, $event) || (ctx_r1.newAnimal.ageMonths = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(22, "mat-form-field", 15)(23, "mat-label");
    \u0275\u0275text(24, "City");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "input", 16);
    \u0275\u0275twoWayListener("ngModelChange", function NgoAnimalsComponent_Conditional_8_Template_input_ngModelChange_25_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.newAnimal.city, $event) || (ctx_r1.newAnimal.city = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(26, "mat-card-actions")(27, "button", 18);
    \u0275\u0275listener("click", function NgoAnimalsComponent_Conditional_8_Template_button_click_27_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.addAnimal());
    });
    \u0275\u0275text(28, "Save");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(29, "button", 19);
    \u0275\u0275listener("click", function NgoAnimalsComponent_Conditional_8_Template_button_click_29_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.showForm = false);
    });
    \u0275\u0275text(30, "Cancel");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(9);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.newAnimal.name);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.newAnimal.species);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.newAnimal.breed);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.newAnimal.ageMonths);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.newAnimal.city);
  }
}
function NgoAnimalsComponent_th_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 20);
    \u0275\u0275text(1, "Name");
    \u0275\u0275elementEnd();
  }
}
function NgoAnimalsComponent_td_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 21);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const a_r3 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(a_r3.name);
  }
}
function NgoAnimalsComponent_th_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 20);
    \u0275\u0275text(1, "Species");
    \u0275\u0275elementEnd();
  }
}
function NgoAnimalsComponent_td_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 21);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const a_r4 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2("", a_r4.species, " / ", a_r4.breed);
  }
}
function NgoAnimalsComponent_th_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 20);
    \u0275\u0275text(1, "City");
    \u0275\u0275elementEnd();
  }
}
function NgoAnimalsComponent_td_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 21);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const a_r5 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(a_r5.city);
  }
}
function NgoAnimalsComponent_th_21_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "th", 20);
    \u0275\u0275text(1, "Status");
    \u0275\u0275elementEnd();
  }
}
function NgoAnimalsComponent_td_22_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "td", 21)(1, "span", 22);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const a_r6 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", a_r6.status.toLowerCase());
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(a_r6.status);
  }
}
function NgoAnimalsComponent_tr_23_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "tr", 23);
  }
}
function NgoAnimalsComponent_tr_24_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "tr", 24);
  }
}
function NgoAnimalsComponent_Conditional_25_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 13);
    \u0275\u0275text(1, "No animals listed yet.");
    \u0275\u0275elementEnd();
  }
}
var _NgoAnimalsComponent = class _NgoAnimalsComponent {
  constructor(api, snack) {
    this.api = api;
    this.snack = snack;
    this.animals = [];
    this.cols = ["name", "species", "city", "status"];
    this.showForm = false;
    this.newAnimal = {};
  }
  ngOnInit() {
    this.api.get("/adoption/ngo/animals").subscribe({
      next: (res) => {
        this.animals = res.data ?? [];
      },
      error: () => {
      }
    });
  }
  addAnimal() {
    if (!this.newAnimal.name)
      return;
    this.api.post("/adoption/ngo/animals", this.newAnimal).subscribe({
      next: (res) => {
        this.animals.push(res.data);
        this.showForm = false;
        this.newAnimal = {};
        this.snack.open("Animal added!", "", { duration: 2e3 });
      },
      error: (err) => this.snack.open(err.error?.message ?? "Error.", "Close", { duration: 3e3 })
    });
  }
};
_NgoAnimalsComponent.\u0275fac = function NgoAnimalsComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _NgoAnimalsComponent)(\u0275\u0275directiveInject(ApiService), \u0275\u0275directiveInject(MatSnackBar));
};
_NgoAnimalsComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _NgoAnimalsComponent, selectors: [["app-ngo-animals"]], standalone: false, decls: 26, vars: 5, consts: [[1, "page-container"], [2, "display", "flex", "justify-content", "space-between", "align-items", "center", "margin-bottom", "20px"], ["mat-raised-button", "", "color", "primary", 3, "click"], [2, "margin-bottom", "20px"], ["mat-table", "", 2, "width", "100%", 3, "dataSource"], ["matColumnDef", "name"], ["mat-header-cell", "", 4, "matHeaderCellDef"], ["mat-cell", "", 4, "matCellDef"], ["matColumnDef", "species"], ["matColumnDef", "city"], ["matColumnDef", "status"], ["mat-header-row", "", 4, "matHeaderRowDef"], ["mat-row", "", 4, "matRowDef", "matRowDefColumns"], [2, "text-align", "center", "padding", "24px", "color", "#64748B"], [1, "form-grid", 2, "margin-top", "12px"], ["appearance", "outline"], ["matInput", "", 3, "ngModelChange", "ngModel"], ["matInput", "", "type", "number", 3, "ngModelChange", "ngModel"], ["mat-flat-button", "", "color", "primary", 3, "click"], ["mat-button", "", 3, "click"], ["mat-header-cell", ""], ["mat-cell", ""], [1, "chip", 3, "ngClass"], ["mat-header-row", ""], ["mat-row", ""]], template: function NgoAnimalsComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "h1");
    \u0275\u0275text(3, "My Animals");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "button", 2);
    \u0275\u0275listener("click", function NgoAnimalsComponent_Template_button_click_4_listener() {
      return ctx.showForm = true;
    });
    \u0275\u0275elementStart(5, "mat-icon");
    \u0275\u0275text(6, "add");
    \u0275\u0275elementEnd();
    \u0275\u0275text(7, " Add Animal ");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(8, NgoAnimalsComponent_Conditional_8_Template, 31, 5, "mat-card", 3);
    \u0275\u0275elementStart(9, "mat-card")(10, "table", 4);
    \u0275\u0275elementContainerStart(11, 5);
    \u0275\u0275template(12, NgoAnimalsComponent_th_12_Template, 2, 0, "th", 6)(13, NgoAnimalsComponent_td_13_Template, 2, 1, "td", 7);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(14, 8);
    \u0275\u0275template(15, NgoAnimalsComponent_th_15_Template, 2, 0, "th", 6)(16, NgoAnimalsComponent_td_16_Template, 2, 2, "td", 7);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(17, 9);
    \u0275\u0275template(18, NgoAnimalsComponent_th_18_Template, 2, 0, "th", 6)(19, NgoAnimalsComponent_td_19_Template, 2, 1, "td", 7);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275elementContainerStart(20, 10);
    \u0275\u0275template(21, NgoAnimalsComponent_th_21_Template, 2, 0, "th", 6)(22, NgoAnimalsComponent_td_22_Template, 3, 2, "td", 7);
    \u0275\u0275elementContainerEnd();
    \u0275\u0275template(23, NgoAnimalsComponent_tr_23_Template, 1, 0, "tr", 11)(24, NgoAnimalsComponent_tr_24_Template, 1, 0, "tr", 12);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(25, NgoAnimalsComponent_Conditional_25_Template, 2, 0, "p", 13);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275advance(8);
    \u0275\u0275conditional(ctx.showForm ? 8 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275property("dataSource", ctx.animals);
    \u0275\u0275advance(13);
    \u0275\u0275property("matHeaderRowDef", ctx.cols);
    \u0275\u0275advance();
    \u0275\u0275property("matRowDefColumns", ctx.cols);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx.animals.length === 0 ? 25 : -1);
  }
}, dependencies: [NgClass, DefaultValueAccessor, NumberValueAccessor, NgControlStatus, NgModel, MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle, MatButton, MatIcon, MatInput, MatFormField, MatLabel, MatTable, MatHeaderCellDef, MatHeaderRowDef, MatColumnDef, MatCellDef, MatRowDef, MatHeaderCell, MatCell, MatHeaderRow, MatRow], encapsulation: 2 });
var NgoAnimalsComponent = _NgoAnimalsComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NgoAnimalsComponent, [{
    type: Component,
    args: [{
      standalone: false,
      selector: "app-ngo-animals",
      template: `
    <div class="page-container">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h1>My Animals</h1>
        <button mat-raised-button color="primary" (click)="showForm = true">
          <mat-icon>add</mat-icon> Add Animal
        </button>
      </div>

      @if (showForm) {
        <mat-card style="margin-bottom:20px">
          <mat-card-header><mat-card-title>Add Animal</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="form-grid" style="margin-top:12px">
              <mat-form-field appearance="outline">
                <mat-label>Name *</mat-label>
                <input matInput [(ngModel)]="newAnimal.name">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Species</mat-label>
                <input matInput [(ngModel)]="newAnimal.species">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Breed</mat-label>
                <input matInput [(ngModel)]="newAnimal.breed">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Age (months)</mat-label>
                <input matInput type="number" [(ngModel)]="newAnimal.ageMonths">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>City</mat-label>
                <input matInput [(ngModel)]="newAnimal.city">
              </mat-form-field>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-flat-button color="primary" (click)="addAnimal()">Save</button>
            <button mat-button (click)="showForm = false">Cancel</button>
          </mat-card-actions>
        </mat-card>
      }

      <mat-card>
        <table mat-table [dataSource]="animals" style="width:100%">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let a">{{ a.name }}</td>
          </ng-container>
          <ng-container matColumnDef="species">
            <th mat-header-cell *matHeaderCellDef>Species</th>
            <td mat-cell *matCellDef="let a">{{ a.species }} / {{ a.breed }}</td>
          </ng-container>
          <ng-container matColumnDef="city">
            <th mat-header-cell *matHeaderCellDef>City</th>
            <td mat-cell *matCellDef="let a">{{ a.city }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let a">
              <span class="chip" [ngClass]="a.status.toLowerCase()">{{ a.status }}</span>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>
        @if (animals.length === 0) {
          <p style="text-align:center;padding:24px;color:#64748B">No animals listed yet.</p>
        }
      </mat-card>
    </div>
  `
    }]
  }], () => [{ type: ApiService }, { type: MatSnackBar }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(NgoAnimalsComponent, { className: "NgoAnimalsComponent", filePath: "src/app/features/ngo/ngo-animals/ngo-animals.component.ts", lineNumber: 82 });
})();

// src/app/features/ngo/ngo-rescues/ngo-rescues.component.ts
var _forTrack02 = ($index, $item) => $item.id;
function NgoRescuesComponent_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "mat-spinner", 1);
  }
}
function NgoRescuesComponent_Conditional_4_For_1_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 10)(1, "button", 12);
    \u0275\u0275listener("click", function NgoRescuesComponent_Conditional_4_For_1_Conditional_12_Template_button_click_1_listener() {
      \u0275\u0275restoreView(_r1);
      const r_r2 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.respond(r_r2.id, "ACCEPT"));
    });
    \u0275\u0275text(2, "Accept");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 13);
    \u0275\u0275listener("click", function NgoRescuesComponent_Conditional_4_For_1_Conditional_12_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r1);
      const r_r2 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.respond(r_r2.id, "DECLINE"));
    });
    \u0275\u0275text(4, "Decline");
    \u0275\u0275elementEnd()();
  }
}
function NgoRescuesComponent_Conditional_4_For_1_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 11)(1, "button", 14);
    \u0275\u0275listener("click", function NgoRescuesComponent_Conditional_4_For_1_Conditional_13_Template_button_click_1_listener() {
      \u0275\u0275restoreView(_r4);
      const r_r2 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.complete(r_r2.id));
    });
    \u0275\u0275text(2, "Mark Complete");
    \u0275\u0275elementEnd()();
  }
}
function NgoRescuesComponent_Conditional_4_For_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-card", 2)(1, "mat-card-content", 4)(2, "div", 5)(3, "div")(4, "h3", 6);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "p", 7);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "p", 8);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "span", 9);
    \u0275\u0275text(11);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(12, NgoRescuesComponent_Conditional_4_For_1_Conditional_12_Template, 5, 0, "div", 10);
    \u0275\u0275conditionalCreate(13, NgoRescuesComponent_Conditional_4_For_1_Conditional_13_Template, 3, 0, "div", 11);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const r_r2 = ctx.$implicit;
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate2("", r_r2.animalType || "Unknown", " \u2014 ", r_r2.criticality);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(r_r2.address);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(r_r2.description);
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", r_r2.status.toLowerCase());
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(r_r2.status);
    \u0275\u0275advance();
    \u0275\u0275conditional(r_r2.status === "ASSIGNED" ? 12 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(r_r2.status === "IN_PROGRESS" ? 13 : -1);
  }
}
function NgoRescuesComponent_Conditional_4_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 3);
    \u0275\u0275text(1, " No rescue assignments. ");
    \u0275\u0275elementEnd();
  }
}
function NgoRescuesComponent_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, NgoRescuesComponent_Conditional_4_For_1_Template, 14, 8, "mat-card", 2, _forTrack02);
    \u0275\u0275conditionalCreate(2, NgoRescuesComponent_Conditional_4_Conditional_2_Template, 2, 0, "p", 3);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275repeater(ctx_r2.rescues);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r2.rescues.length === 0 ? 2 : -1);
  }
}
var _NgoRescuesComponent = class _NgoRescuesComponent {
  constructor(api, snack) {
    this.api = api;
    this.snack = snack;
    this.rescues = [];
    this.loading = true;
  }
  ngOnInit() {
    this.api.get("/rescue/ngo").subscribe({
      next: (res) => {
        this.rescues = res.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
  respond(id, response) {
    this.api.post(`/rescue/${id}/respond`, { response }).subscribe({
      next: (res) => {
        const r = this.rescues.find((x) => x.id === id);
        if (r)
          r.status = res.data.status;
        this.snack.open(`Response recorded: ${response}`, "", { duration: 2e3 });
      },
      error: (err) => this.snack.open(err.error?.message ?? "Error.", "Close", { duration: 3e3 })
    });
  }
  complete(id) {
    this.api.post(`/rescue/${id}/complete`, { notes: "Rescue completed successfully." }).subscribe({
      next: () => {
        const r = this.rescues.find((x) => x.id === id);
        if (r)
          r.status = "COMPLETED";
        this.snack.open("Rescue marked complete!", "", { duration: 2e3 });
      }
    });
  }
};
_NgoRescuesComponent.\u0275fac = function NgoRescuesComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _NgoRescuesComponent)(\u0275\u0275directiveInject(ApiService), \u0275\u0275directiveInject(MatSnackBar));
};
_NgoRescuesComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _NgoRescuesComponent, selectors: [["app-ngo-rescues"]], standalone: false, decls: 5, vars: 2, consts: [[1, "page-container"], ["diameter", "40", 2, "margin", "40px auto"], [2, "margin-bottom", "12px"], [2, "text-align", "center", "padding", "32px", "color", "#64748B"], [2, "padding", "16px"], [2, "display", "flex", "justify-content", "space-between", "align-items", "flex-start"], [2, "margin", "0"], [2, "color", "#64748B", "margin", "4px 0"], [2, "color", "#475569", "margin", "0"], [1, "chip", 3, "ngClass"], [2, "margin-top", "12px", "display", "flex", "gap", "8px"], [2, "margin-top", "12px"], ["mat-raised-button", "", "color", "primary", 3, "click"], ["mat-raised-button", "", "color", "warn", 3, "click"], ["mat-raised-button", "", 3, "click"]], template: function NgoRescuesComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "h1");
    \u0275\u0275text(2, "Rescue Queue");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(3, NgoRescuesComponent_Conditional_3_Template, 1, 0, "mat-spinner", 1);
    \u0275\u0275conditionalCreate(4, NgoRescuesComponent_Conditional_4_Template, 3, 1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance(3);
    \u0275\u0275conditional(ctx.loading ? 3 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx.loading ? 4 : -1);
  }
}, dependencies: [NgClass, MatCard, MatCardContent, MatButton, MatProgressSpinner], encapsulation: 2 });
var NgoRescuesComponent = _NgoRescuesComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NgoRescuesComponent, [{
    type: Component,
    args: [{
      standalone: false,
      selector: "app-ngo-rescues",
      template: `
    <div class="page-container">
      <h1>Rescue Queue</h1>

      @if (loading) {
        <mat-spinner diameter="40" style="margin:40px auto"></mat-spinner>
      }

      @if (!loading) {
        @for (r of rescues; track r.id) {
          <mat-card style="margin-bottom:12px">
            <mat-card-content style="padding:16px">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div>
                  <h3 style="margin:0">{{ r.animalType || 'Unknown' }} \u2014 {{ r.criticality }}</h3>
                  <p style="color:#64748B;margin:4px 0">{{ r.address }}</p>
                  <p style="color:#475569;margin:0">{{ r.description }}</p>
                </div>
                <span class="chip" [ngClass]="r.status.toLowerCase()">{{ r.status }}</span>
              </div>
              @if (r.status === 'ASSIGNED') {
                <div style="margin-top:12px;display:flex;gap:8px">
                  <button mat-raised-button color="primary" (click)="respond(r.id, 'ACCEPT')">Accept</button>
                  <button mat-raised-button color="warn"    (click)="respond(r.id, 'DECLINE')">Decline</button>
                </div>
              }
              @if (r.status === 'IN_PROGRESS') {
                <div style="margin-top:12px">
                  <button mat-raised-button (click)="complete(r.id)">Mark Complete</button>
                </div>
              }
            </mat-card-content>
          </mat-card>
        }
        @if (rescues.length === 0) {
          <p style="text-align:center;padding:32px;color:#64748B">
            No rescue assignments.
          </p>
        }
      }
    </div>
  `
    }]
  }], () => [{ type: ApiService }, { type: MatSnackBar }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(NgoRescuesComponent, { className: "NgoRescuesComponent", filePath: "src/app/features/ngo/ngo-rescues/ngo-rescues.component.ts", lineNumber: 51 });
})();

// src/app/features/ngo/ngo-applications/ngo-applications.component.ts
var _forTrack03 = ($index, $item) => $item.id;
function NgoApplicationsComponent_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "mat-spinner", 1);
  }
}
function NgoApplicationsComponent_Conditional_4_For_1_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 8);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const app_r1 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(app_r1.reason);
  }
}
function NgoApplicationsComponent_Conditional_4_For_1_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 10)(1, "button", 11);
    \u0275\u0275listener("click", function NgoApplicationsComponent_Conditional_4_For_1_Conditional_11_Template_button_click_1_listener() {
      \u0275\u0275restoreView(_r2);
      const app_r1 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.review(app_r1.id, "APPROVED"));
    });
    \u0275\u0275text(2, "Approve");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 12);
    \u0275\u0275listener("click", function NgoApplicationsComponent_Conditional_4_For_1_Conditional_11_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r2);
      const app_r1 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.review(app_r1.id, "REJECTED"));
    });
    \u0275\u0275text(4, "Reject");
    \u0275\u0275elementEnd()();
  }
}
function NgoApplicationsComponent_Conditional_4_For_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-card", 2)(1, "mat-card-content", 4)(2, "div", 5)(3, "div")(4, "h3", 6);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "p", 7);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(8, NgoApplicationsComponent_Conditional_4_For_1_Conditional_8_Template, 2, 1, "p", 8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "span", 9);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(11, NgoApplicationsComponent_Conditional_4_For_1_Conditional_11_Template, 5, 0, "div", 10);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const app_r1 = ctx.$implicit;
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate2("Application #", app_r1.id, " \u2014 Animal #", app_r1.animalId);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("Applicant ID: ", app_r1.applicantId);
    \u0275\u0275advance();
    \u0275\u0275conditional(app_r1.reason ? 8 : -1);
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", app_r1.status.toLowerCase());
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(app_r1.status);
    \u0275\u0275advance();
    \u0275\u0275conditional(app_r1.status === "PENDING" ? 11 : -1);
  }
}
function NgoApplicationsComponent_Conditional_4_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 3);
    \u0275\u0275text(1, " No applications yet. ");
    \u0275\u0275elementEnd();
  }
}
function NgoApplicationsComponent_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, NgoApplicationsComponent_Conditional_4_For_1_Template, 12, 7, "mat-card", 2, _forTrack03);
    \u0275\u0275conditionalCreate(2, NgoApplicationsComponent_Conditional_4_Conditional_2_Template, 2, 0, "p", 3);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275repeater(ctx_r2.applications);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r2.applications.length === 0 ? 2 : -1);
  }
}
var _NgoApplicationsComponent = class _NgoApplicationsComponent {
  constructor(api, snack) {
    this.api = api;
    this.snack = snack;
    this.applications = [];
    this.loading = true;
  }
  ngOnInit() {
    this.api.get("/adoption/ngo/applications").subscribe({
      next: (res) => {
        this.applications = res.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
  review(id, status) {
    this.api.patch(`/adoption/ngo/applications/${id}/review`, { status }).subscribe({
      next: () => {
        const a = this.applications.find((x) => x.id === id);
        if (a)
          a.status = status;
        this.snack.open(`Application ${status.toLowerCase()}`, "", { duration: 2e3 });
      },
      error: (err) => this.snack.open(err.error?.message ?? "Error.", "Close", { duration: 3e3 })
    });
  }
};
_NgoApplicationsComponent.\u0275fac = function NgoApplicationsComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _NgoApplicationsComponent)(\u0275\u0275directiveInject(ApiService), \u0275\u0275directiveInject(MatSnackBar));
};
_NgoApplicationsComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _NgoApplicationsComponent, selectors: [["app-ngo-applications"]], standalone: false, decls: 5, vars: 2, consts: [[1, "page-container"], ["diameter", "40", 2, "margin", "40px auto"], [2, "margin-bottom", "12px"], [2, "text-align", "center", "padding", "32px", "color", "#64748B"], [2, "padding", "16px"], [2, "display", "flex", "justify-content", "space-between", "align-items", "flex-start"], [2, "margin", "0"], [2, "color", "#64748B", "margin", "4px 0 0"], [2, "margin", "6px 0 0", "color", "#475569"], [1, "chip", 3, "ngClass"], [2, "margin-top", "12px", "display", "flex", "gap", "8px"], ["mat-raised-button", "", "color", "primary", 3, "click"], ["mat-raised-button", "", "color", "warn", 3, "click"]], template: function NgoApplicationsComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "h1");
    \u0275\u0275text(2, "Adoption Applications");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(3, NgoApplicationsComponent_Conditional_3_Template, 1, 0, "mat-spinner", 1);
    \u0275\u0275conditionalCreate(4, NgoApplicationsComponent_Conditional_4_Template, 3, 1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance(3);
    \u0275\u0275conditional(ctx.loading ? 3 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx.loading ? 4 : -1);
  }
}, dependencies: [NgClass, MatCard, MatCardContent, MatButton, MatProgressSpinner], encapsulation: 2 });
var NgoApplicationsComponent = _NgoApplicationsComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NgoApplicationsComponent, [{
    type: Component,
    args: [{
      standalone: false,
      selector: "app-ngo-applications",
      template: `
    <div class="page-container">
      <h1>Adoption Applications</h1>

      @if (loading) {
        <mat-spinner diameter="40" style="margin:40px auto"></mat-spinner>
      }

      @if (!loading) {
        @for (app of applications; track app.id) {
          <mat-card style="margin-bottom:12px">
            <mat-card-content style="padding:16px">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div>
                  <h3 style="margin:0">Application #{{ app.id }} \u2014 Animal #{{ app.animalId }}</h3>
                  <p style="color:#64748B;margin:4px 0 0">Applicant ID: {{ app.applicantId }}</p>
                  @if (app.reason) {
                    <p style="margin:6px 0 0;color:#475569">{{ app.reason }}</p>
                  }
                </div>
                <span class="chip" [ngClass]="app.status.toLowerCase()">{{ app.status }}</span>
              </div>
              @if (app.status === 'PENDING') {
                <div style="margin-top:12px;display:flex;gap:8px">
                  <button mat-raised-button color="primary" (click)="review(app.id,'APPROVED')">Approve</button>
                  <button mat-raised-button color="warn"    (click)="review(app.id,'REJECTED')">Reject</button>
                </div>
              }
            </mat-card-content>
          </mat-card>
        }
        @if (applications.length === 0) {
          <p style="text-align:center;padding:32px;color:#64748B">
            No applications yet.
          </p>
        }
      }
    </div>
  `
    }]
  }], () => [{ type: ApiService }, { type: MatSnackBar }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(NgoApplicationsComponent, { className: "NgoApplicationsComponent", filePath: "src/app/features/ngo/ngo-applications/ngo-applications.component.ts", lineNumber: 48 });
})();

// src/app/features/ngo/ngo.module.ts
var _NgoModule = class _NgoModule {
};
_NgoModule.\u0275fac = function NgoModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _NgoModule)();
};
_NgoModule.\u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({ type: _NgoModule });
_NgoModule.\u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({ imports: [
  SharedModule,
  RouterModule.forChild([
    { path: "", component: NgoDashboardComponent },
    { path: "animals", component: NgoAnimalsComponent },
    { path: "rescues", component: NgoRescuesComponent },
    { path: "applications", component: NgoApplicationsComponent }
  ])
] });
var NgoModule = _NgoModule;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NgoModule, [{
    type: NgModule,
    args: [{
      declarations: [NgoDashboardComponent, NgoAnimalsComponent, NgoRescuesComponent, NgoApplicationsComponent],
      imports: [
        SharedModule,
        RouterModule.forChild([
          { path: "", component: NgoDashboardComponent },
          { path: "animals", component: NgoAnimalsComponent },
          { path: "rescues", component: NgoRescuesComponent },
          { path: "applications", component: NgoApplicationsComponent }
        ])
      ]
    }]
  }], null, null);
})();
export {
  NgoModule
};
//# sourceMappingURL=chunk-RTMJJNSF.js.map
