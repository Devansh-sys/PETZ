import {
  AuthService
} from "./chunk-W525NKGO.js";
import {
  ApiService
} from "./chunk-QYJL6IEQ.js";
import {
  ActivatedRoute,
  Component,
  DatePipe,
  DefaultValueAccessor,
  FormBuilder,
  FormControlName,
  FormGroupDirective,
  MatButton,
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardImage,
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
  NgModel,
  NgModule,
  Router,
  RouterLink,
  RouterModule,
  SharedModule,
  __spreadProps,
  __spreadValues,
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
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵproperty,
  ɵɵpureFunction1,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵtextInterpolate3,
  ɵɵtextInterpolate4,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-CNVABIPG.js";

// src/app/features/adoption/animals-list/animals-list.component.ts
var _c0 = (a0) => ["/adoption/animals", a0];
var _forTrack0 = ($index, $item) => $item.id;
function AnimalsListComponent_Conditional_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "mat-spinner", 7);
  }
}
function AnimalsListComponent_Conditional_18_For_2_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 16);
    \u0275\u0275text(1, "Vaccinated");
    \u0275\u0275elementEnd();
  }
}
function AnimalsListComponent_Conditional_18_For_2_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 17);
    \u0275\u0275text(1, "Neutered");
    \u0275\u0275elementEnd();
  }
}
function AnimalsListComponent_Conditional_18_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-card", 9);
    \u0275\u0275element(1, "img", 11);
    \u0275\u0275elementStart(2, "mat-card-content")(3, "h2", 12);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "p", 13);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "p", 14);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "div", 15);
    \u0275\u0275conditionalCreate(10, AnimalsListComponent_Conditional_18_For_2_Conditional_10_Template, 2, 0, "span", 16);
    \u0275\u0275conditionalCreate(11, AnimalsListComponent_Conditional_18_For_2_Conditional_11_Template, 2, 0, "span", 17);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const a_r1 = ctx.$implicit;
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction1(10, _c0, a_r1.id));
    \u0275\u0275advance();
    \u0275\u0275property("src", a_r1.photoUrl || "assets/animal-placeholder.png", \u0275\u0275sanitizeUrl)("alt", a_r1.name);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(a_r1.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate3("", a_r1.species, " \u2022 ", a_r1.breed || "Mixed", " \u2022 ", a_r1.ageMonths, "mo");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(a_r1.city);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(a_r1.isVaccinated ? 10 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(a_r1.isNeutered ? 11 : -1);
  }
}
function AnimalsListComponent_Conditional_18_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 10);
    \u0275\u0275text(1, " No animals found. ");
    \u0275\u0275elementEnd();
  }
}
function AnimalsListComponent_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 8);
    \u0275\u0275repeaterCreate(1, AnimalsListComponent_Conditional_18_For_2_Template, 12, 12, "mat-card", 9, _forTrack0);
    \u0275\u0275conditionalCreate(3, AnimalsListComponent_Conditional_18_Conditional_3_Template, 2, 0, "p", 10);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.animals);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.animals.length === 0 ? 3 : -1);
  }
}
var _AnimalsListComponent = class _AnimalsListComponent {
  constructor(api) {
    this.api = api;
    this.animals = [];
    this.loading = true;
    this.filters = { species: "", city: "" };
  }
  ngOnInit() {
    this.search();
  }
  search() {
    this.loading = true;
    const params = {};
    if (this.filters.species)
      params["species"] = this.filters.species;
    if (this.filters.city)
      params["city"] = this.filters.city;
    this.api.get("/adoption/animals", params).subscribe({
      next: (res) => {
        this.animals = res.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
};
_AnimalsListComponent.\u0275fac = function AnimalsListComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _AnimalsListComponent)(\u0275\u0275directiveInject(ApiService));
};
_AnimalsListComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AnimalsListComponent, selectors: [["app-animals-list"]], standalone: false, decls: 19, vars: 4, consts: [[1, "page-container"], [2, "margin-bottom", "20px"], [2, "display", "flex", "gap", "12px", "flex-wrap", "wrap", "padding-top", "12px"], ["appearance", "outline", 2, "width", "200px"], ["matInput", "", "placeholder", "Dog, Cat...", 3, "ngModelChange", "ngModel"], ["matInput", "", 3, "ngModelChange", "ngModel"], ["mat-raised-button", "", "color", "primary", 2, "height", "56px", 3, "click"], ["diameter", "40", 2, "margin", "40px auto"], [2, "display", "grid", "grid-template-columns", "repeat(auto-fill,minmax(260px,1fr))", "gap", "16px"], [2, "cursor", "pointer", 3, "routerLink"], [2, "text-align", "center", "padding", "40px", "color", "#64748B", "grid-column", "1/-1"], ["mat-card-image", "", 2, "height", "180px", "object-fit", "cover", 3, "src", "alt"], [2, "margin", "12px 0 4px"], [2, "color", "#64748B", "margin", "0"], [2, "color", "#94A3B8", "margin", "4px 0 0", "font-size", "0.85rem"], [2, "margin-top", "8px"], [1, "chip", "confirmed", 2, "margin-right", "4px"], [1, "chip", "approved", 2, "margin-right", "4px"]], template: function AnimalsListComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "h1");
    \u0275\u0275text(2, "Adoptable Animals");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "mat-card", 1)(4, "mat-card-content", 2)(5, "mat-form-field", 3)(6, "mat-label");
    \u0275\u0275text(7, "Species");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "input", 4);
    \u0275\u0275twoWayListener("ngModelChange", function AnimalsListComponent_Template_input_ngModelChange_8_listener($event) {
      \u0275\u0275twoWayBindingSet(ctx.filters.species, $event) || (ctx.filters.species = $event);
      return $event;
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "mat-form-field", 3)(10, "mat-label");
    \u0275\u0275text(11, "City");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "input", 5);
    \u0275\u0275twoWayListener("ngModelChange", function AnimalsListComponent_Template_input_ngModelChange_12_listener($event) {
      \u0275\u0275twoWayBindingSet(ctx.filters.city, $event) || (ctx.filters.city = $event);
      return $event;
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "button", 6);
    \u0275\u0275listener("click", function AnimalsListComponent_Template_button_click_13_listener() {
      return ctx.search();
    });
    \u0275\u0275elementStart(14, "mat-icon");
    \u0275\u0275text(15, "search");
    \u0275\u0275elementEnd();
    \u0275\u0275text(16, " Search ");
    \u0275\u0275elementEnd()()();
    \u0275\u0275conditionalCreate(17, AnimalsListComponent_Conditional_17_Template, 1, 0, "mat-spinner", 7);
    \u0275\u0275conditionalCreate(18, AnimalsListComponent_Conditional_18_Template, 4, 1, "div", 8);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance(8);
    \u0275\u0275twoWayProperty("ngModel", ctx.filters.species);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx.filters.city);
    \u0275\u0275advance(5);
    \u0275\u0275conditional(ctx.loading ? 17 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx.loading ? 18 : -1);
  }
}, dependencies: [RouterLink, DefaultValueAccessor, NgControlStatus, NgModel, MatCard, MatCardContent, MatCardImage, MatButton, MatIcon, MatInput, MatFormField, MatLabel, MatProgressSpinner], encapsulation: 2 });
var AnimalsListComponent = _AnimalsListComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AnimalsListComponent, [{
    type: Component,
    args: [{
      standalone: false,
      selector: "app-animals-list",
      template: `
    <div class="page-container">
      <h1>Adoptable Animals</h1>

      <!-- Filters -->
      <mat-card style="margin-bottom:20px">
        <mat-card-content style="display:flex;gap:12px;flex-wrap:wrap;padding-top:12px">
          <mat-form-field appearance="outline" style="width:200px">
            <mat-label>Species</mat-label>
            <input matInput [(ngModel)]="filters.species" placeholder="Dog, Cat...">
          </mat-form-field>
          <mat-form-field appearance="outline" style="width:200px">
            <mat-label>City</mat-label>
            <input matInput [(ngModel)]="filters.city">
          </mat-form-field>
          <button mat-raised-button color="primary" (click)="search()" style="height:56px">
            <mat-icon>search</mat-icon> Search
          </button>
        </mat-card-content>
      </mat-card>

      @if (loading) {
        <mat-spinner diameter="40" style="margin:40px auto"></mat-spinner>
      }

      @if (!loading) {
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">
          @for (a of animals; track a.id) {
            <mat-card style="cursor:pointer" [routerLink]="['/adoption/animals', a.id]">
              <img mat-card-image [src]="a.photoUrl || 'assets/animal-placeholder.png'"
                   style="height:180px;object-fit:cover" [alt]="a.name">
              <mat-card-content>
                <h2 style="margin:12px 0 4px">{{ a.name }}</h2>
                <p style="color:#64748B;margin:0">{{ a.species }} \u2022 {{ a.breed || 'Mixed' }} \u2022 {{ a.ageMonths }}mo</p>
                <p style="color:#94A3B8;margin:4px 0 0;font-size:0.85rem">{{ a.city }}</p>
                <div style="margin-top:8px">
                  @if (a.isVaccinated) {
                    <span class="chip confirmed" style="margin-right:4px">Vaccinated</span>
                  }
                  @if (a.isNeutered) {
                    <span class="chip approved" style="margin-right:4px">Neutered</span>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }
          @if (animals.length === 0) {
            <p style="text-align:center;padding:40px;color:#64748B;grid-column:1/-1">
              No animals found.
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
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AnimalsListComponent, { className: "AnimalsListComponent", filePath: "src/app/features/adoption/animals-list/animals-list.component.ts", lineNumber: 64 });
})();

// src/app/features/adoption/animal-detail/animal-detail.component.ts
function AnimalDetailComponent_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 2);
    \u0275\u0275element(1, "mat-spinner", 3);
    \u0275\u0275elementEnd();
  }
}
function AnimalDetailComponent_Conditional_6_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 8);
    \u0275\u0275text(1, "\u2713 Vaccinated");
    \u0275\u0275elementEnd();
  }
}
function AnimalDetailComponent_Conditional_6_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 9);
    \u0275\u0275text(1, "\u2713 Neutered");
    \u0275\u0275elementEnd();
  }
}
function AnimalDetailComponent_Conditional_6_Conditional_17_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "mat-card", 12)(1, "mat-card-header")(2, "mat-card-title");
    \u0275\u0275text(3, "Apply to Adopt");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "mat-card-content")(5, "form", 13);
    \u0275\u0275listener("ngSubmit", function AnimalDetailComponent_Conditional_6_Conditional_17_Template_form_ngSubmit_5_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.apply());
    });
    \u0275\u0275elementStart(6, "mat-form-field", 14)(7, "mat-label");
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275element(9, "textarea", 15);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "mat-form-field", 16)(11, "mat-label");
    \u0275\u0275text(12, "Pet ownership experience");
    \u0275\u0275elementEnd();
    \u0275\u0275element(13, "textarea", 17);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "mat-form-field", 18)(15, "mat-label");
    \u0275\u0275text(16, "Housing type");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "mat-select", 19)(18, "mat-option", 20);
    \u0275\u0275text(19, "House");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "mat-option", 21);
    \u0275\u0275text(21, "Apartment");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "mat-option", 22);
    \u0275\u0275text(23, "Flat");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(24, "button", 23);
    \u0275\u0275text(25);
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(5);
    \u0275\u0275property("formGroup", ctx_r1.applyForm);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("Why do you want to adopt ", ctx_r1.animal.name, "?");
    \u0275\u0275advance(16);
    \u0275\u0275property("disabled", ctx_r1.applying);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.applying ? "Submitting..." : "Submit Application", " ");
  }
}
function AnimalDetailComponent_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-card");
    \u0275\u0275element(1, "img", 4);
    \u0275\u0275elementStart(2, "mat-card-header", 5)(3, "mat-card-title", 6);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "mat-card-subtitle");
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "mat-card-content", 5)(8, "p");
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "div", 7);
    \u0275\u0275conditionalCreate(11, AnimalDetailComponent_Conditional_6_Conditional_11_Template, 2, 0, "span", 8);
    \u0275\u0275conditionalCreate(12, AnimalDetailComponent_Conditional_6_Conditional_12_Template, 2, 0, "span", 9);
    \u0275\u0275elementStart(13, "span", 10);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(15, "p", 11);
    \u0275\u0275text(16);
    \u0275\u0275elementEnd()()();
    \u0275\u0275conditionalCreate(17, AnimalDetailComponent_Conditional_6_Conditional_17_Template, 26, 4, "mat-card", 12);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("src", ctx_r1.animal.photoUrl || "assets/animal-placeholder.png", \u0275\u0275sanitizeUrl)("alt", ctx_r1.animal.name);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.animal.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate4(" ", ctx_r1.animal.species, " \u2022 ", ctx_r1.animal.breed, " \u2022 ", ctx_r1.animal.ageMonths, " months \u2022 ", ctx_r1.animal.gender, " ");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.animal.description);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.animal.isVaccinated ? 11 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.animal.isNeutered ? 12 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.animal.status);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("\u{1F4CD} ", ctx_r1.animal.city);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.animal.status === "AVAILABLE" && ctx_r1.isLoggedIn ? 17 : -1);
  }
}
var _AnimalDetailComponent = class _AnimalDetailComponent {
  constructor(route, api, fb, snack, router, auth) {
    this.route = route;
    this.api = api;
    this.fb = fb;
    this.snack = snack;
    this.router = router;
    this.auth = auth;
    this.animal = null;
    this.loading = true;
    this.applying = false;
    this.isLoggedIn = false;
    this.applyForm = this.fb.group({
      reason: [""],
      experience: [""],
      housingType: ["HOUSE"],
      hasOtherPets: [false]
    });
  }
  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn();
    const id = this.route.snapshot.paramMap.get("id");
    this.api.get(`/adoption/animals/${id}`).subscribe({
      next: (res) => {
        this.animal = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
  apply() {
    if (!this.animal)
      return;
    this.applying = true;
    const body = __spreadProps(__spreadValues({}, this.applyForm.value), { animalId: this.animal.id });
    this.api.post("/adoption/apply", body).subscribe({
      next: () => {
        this.snack.open("Application submitted!", "", { duration: 3e3 });
        this.router.navigate(["/adoption/my"]);
      },
      error: (err) => {
        this.snack.open(err.error?.message ?? "Error.", "Close", { duration: 3e3 });
        this.applying = false;
      }
    });
  }
};
_AnimalDetailComponent.\u0275fac = function AnimalDetailComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _AnimalDetailComponent)(\u0275\u0275directiveInject(ActivatedRoute), \u0275\u0275directiveInject(ApiService), \u0275\u0275directiveInject(FormBuilder), \u0275\u0275directiveInject(MatSnackBar), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(AuthService));
};
_AnimalDetailComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AnimalDetailComponent, selectors: [["app-animal-detail"]], standalone: false, decls: 7, vars: 2, consts: [[1, "page-container", 2, "max-width", "760px"], ["mat-button", "", "routerLink", "/adoption/animals", 2, "margin-bottom", "16px"], [2, "text-align", "center", "padding", "40px"], ["diameter", "40"], ["mat-card-image", "", 2, "max-height", "340px", "object-fit", "cover", 3, "src", "alt"], [2, "padding", "16px"], [2, "font-size", "1.6rem"], [2, "margin", "12px 0"], [1, "chip", "confirmed", 2, "margin-right", "6px"], [1, "chip", "approved", 2, "margin-right", "6px"], [1, "chip", "available"], [2, "color", "#64748B"], [2, "margin-top", "20px"], [3, "ngSubmit", "formGroup"], ["appearance", "outline", 2, "width", "100%", "margin-top", "12px"], ["matInput", "", "rows", "3", "formControlName", "reason"], ["appearance", "outline", 2, "width", "100%"], ["matInput", "", "rows", "2", "formControlName", "experience"], ["appearance", "outline"], ["formControlName", "housingType"], ["value", "HOUSE"], ["value", "APARTMENT"], ["value", "FLAT"], ["mat-flat-button", "", "color", "primary", "type", "submit", 3, "disabled"]], template: function AnimalDetailComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "button", 1)(2, "mat-icon");
    \u0275\u0275text(3, "arrow_back");
    \u0275\u0275elementEnd();
    \u0275\u0275text(4, " Back ");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(5, AnimalDetailComponent_Conditional_5_Template, 2, 0, "div", 2);
    \u0275\u0275conditionalCreate(6, AnimalDetailComponent_Conditional_6_Template, 18, 13);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance(5);
    \u0275\u0275conditional(ctx.loading ? 5 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx.loading && ctx.animal ? 6 : -1);
  }
}, dependencies: [RouterLink, \u0275NgNoValidate, DefaultValueAccessor, NgControlStatus, NgControlStatusGroup, FormGroupDirective, FormControlName, MatCard, MatCardContent, MatCardHeader, MatCardImage, MatCardSubtitle, MatCardTitle, MatButton, MatIcon, MatInput, MatFormField, MatLabel, MatProgressSpinner, MatSelect, MatOption], encapsulation: 2 });
var AnimalDetailComponent = _AnimalDetailComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AnimalDetailComponent, [{
    type: Component,
    args: [{
      standalone: false,
      selector: "app-animal-detail",
      template: `
    <div class="page-container" style="max-width:760px">
      <button mat-button routerLink="/adoption/animals" style="margin-bottom:16px">
        <mat-icon>arrow_back</mat-icon> Back
      </button>

      @if (loading) {
        <div style="text-align:center;padding:40px">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }

      @if (!loading && animal) {
        <mat-card>
          <img mat-card-image [src]="animal.photoUrl || 'assets/animal-placeholder.png'"
               style="max-height:340px;object-fit:cover" [alt]="animal.name">
          <mat-card-header style="padding:16px">
            <mat-card-title style="font-size:1.6rem">{{ animal.name }}</mat-card-title>
            <mat-card-subtitle>
              {{ animal.species }} \u2022 {{ animal.breed }} \u2022 {{ animal.ageMonths }} months \u2022 {{ animal.gender }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content style="padding:16px">
            <p>{{ animal.description }}</p>
            <div style="margin:12px 0">
              @if (animal.isVaccinated) {
                <span class="chip confirmed" style="margin-right:6px">\u2713 Vaccinated</span>
              }
              @if (animal.isNeutered) {
                <span class="chip approved" style="margin-right:6px">\u2713 Neutered</span>
              }
              <span class="chip available">{{ animal.status }}</span>
            </div>
            <p style="color:#64748B">\u{1F4CD} {{ animal.city }}</p>
          </mat-card-content>
        </mat-card>

        @if (animal.status === 'AVAILABLE' && isLoggedIn) {
          <mat-card style="margin-top:20px">
            <mat-card-header>
              <mat-card-title>Apply to Adopt</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="applyForm" (ngSubmit)="apply()">
                <mat-form-field appearance="outline" style="width:100%;margin-top:12px">
                  <mat-label>Why do you want to adopt {{ animal.name }}?</mat-label>
                  <textarea matInput rows="3" formControlName="reason"></textarea>
                </mat-form-field>
                <mat-form-field appearance="outline" style="width:100%">
                  <mat-label>Pet ownership experience</mat-label>
                  <textarea matInput rows="2" formControlName="experience"></textarea>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Housing type</mat-label>
                  <mat-select formControlName="housingType">
                    <mat-option value="HOUSE">House</mat-option>
                    <mat-option value="APARTMENT">Apartment</mat-option>
                    <mat-option value="FLAT">Flat</mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-flat-button color="primary" type="submit" [disabled]="applying">
                  {{ applying ? 'Submitting...' : 'Submit Application' }}
                </button>
              </form>
            </mat-card-content>
          </mat-card>
        }
      }
    </div>
  `
    }]
  }], () => [{ type: ActivatedRoute }, { type: ApiService }, { type: FormBuilder }, { type: MatSnackBar }, { type: Router }, { type: AuthService }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AnimalDetailComponent, { className: "AnimalDetailComponent", filePath: "src/app/features/adoption/animal-detail/animal-detail.component.ts", lineNumber: 83 });
})();

// src/app/features/adoption/my-applications/my-applications.component.ts
var _forTrack02 = ($index, $item) => $item.id;
function MyApplicationsComponent_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "mat-spinner", 1);
  }
}
function MyApplicationsComponent_Conditional_4_For_1_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 7);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const app_r1 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" Note: ", app_r1.adminNotes, " ");
  }
}
function MyApplicationsComponent_Conditional_4_For_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-card", 2)(1, "mat-card-content", 4)(2, "div")(3, "h3", 5);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "p", 6);
    \u0275\u0275text(6);
    \u0275\u0275pipe(7, "date");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(8, MyApplicationsComponent_Conditional_4_For_1_Conditional_8_Template, 2, 1, "p", 7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "span", 8);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const app_r1 = ctx.$implicit;
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("Application #", app_r1.id);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("Animal ID: ", app_r1.animalId, " \u2022 Applied: ", \u0275\u0275pipeBind1(7, 6, app_r1.appliedAt));
    \u0275\u0275advance(2);
    \u0275\u0275conditional(app_r1.adminNotes ? 8 : -1);
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", app_r1.status.toLowerCase());
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(app_r1.status);
  }
}
function MyApplicationsComponent_Conditional_4_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 3);
    \u0275\u0275text(1, " No applications yet. ");
    \u0275\u0275elementStart(2, "a", 9);
    \u0275\u0275text(3, "Browse animals");
    \u0275\u0275elementEnd()();
  }
}
function MyApplicationsComponent_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, MyApplicationsComponent_Conditional_4_For_1_Template, 11, 8, "mat-card", 2, _forTrack02);
    \u0275\u0275conditionalCreate(2, MyApplicationsComponent_Conditional_4_Conditional_2_Template, 4, 0, "p", 3);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275repeater(ctx_r1.applications);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.applications.length === 0 ? 2 : -1);
  }
}
var _MyApplicationsComponent = class _MyApplicationsComponent {
  constructor(api) {
    this.api = api;
    this.applications = [];
    this.loading = true;
  }
  ngOnInit() {
    this.api.get("/adoption/my-applications").subscribe({
      next: (res) => {
        this.applications = res.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
};
_MyApplicationsComponent.\u0275fac = function MyApplicationsComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _MyApplicationsComponent)(\u0275\u0275directiveInject(ApiService));
};
_MyApplicationsComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _MyApplicationsComponent, selectors: [["app-my-applications"]], standalone: false, decls: 5, vars: 2, consts: [[1, "page-container"], ["diameter", "40", 2, "margin", "40px auto"], [2, "margin-bottom", "12px"], [2, "text-align", "center", "padding", "32px", "color", "#64748B"], [2, "display", "flex", "justify-content", "space-between", "align-items", "center", "padding", "16px"], [2, "margin", "0"], [2, "color", "#64748B", "margin", "4px 0 0"], [2, "color", "#475569", "margin-top", "6px", "font-style", "italic"], [1, "chip", 3, "ngClass"], ["routerLink", "/adoption/animals"]], template: function MyApplicationsComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "h1");
    \u0275\u0275text(2, "My Adoption Applications");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(3, MyApplicationsComponent_Conditional_3_Template, 1, 0, "mat-spinner", 1);
    \u0275\u0275conditionalCreate(4, MyApplicationsComponent_Conditional_4_Template, 3, 1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance(3);
    \u0275\u0275conditional(ctx.loading ? 3 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx.loading ? 4 : -1);
  }
}, dependencies: [NgClass, RouterLink, MatCard, MatCardContent, MatProgressSpinner, DatePipe], encapsulation: 2 });
var MyApplicationsComponent = _MyApplicationsComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MyApplicationsComponent, [{
    type: Component,
    args: [{
      standalone: false,
      selector: "app-my-applications",
      template: `
    <div class="page-container">
      <h1>My Adoption Applications</h1>

      @if (loading) {
        <mat-spinner diameter="40" style="margin:40px auto"></mat-spinner>
      }

      @if (!loading) {
        @for (app of applications; track app.id) {
          <mat-card style="margin-bottom:12px">
            <mat-card-content style="display:flex;justify-content:space-between;align-items:center;padding:16px">
              <div>
                <h3 style="margin:0">Application #{{ app.id }}</h3>
                <p style="color:#64748B;margin:4px 0 0">Animal ID: {{ app.animalId }} \u2022 Applied: {{ app.appliedAt | date }}</p>
                @if (app.adminNotes) {
                  <p style="color:#475569;margin-top:6px;font-style:italic">
                    Note: {{ app.adminNotes }}
                  </p>
                }
              </div>
              <span class="chip" [ngClass]="app.status.toLowerCase()">{{ app.status }}</span>
            </mat-card-content>
          </mat-card>
        }
        @if (applications.length === 0) {
          <p style="text-align:center;padding:32px;color:#64748B">
            No applications yet. <a routerLink="/adoption/animals">Browse animals</a>
          </p>
        }
      }
    </div>
  `
    }]
  }], () => [{ type: ApiService }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(MyApplicationsComponent, { className: "MyApplicationsComponent", filePath: "src/app/features/adoption/my-applications/my-applications.component.ts", lineNumber: 42 });
})();

// src/app/features/adoption/adoption.module.ts
var _AdoptionModule = class _AdoptionModule {
};
_AdoptionModule.\u0275fac = function AdoptionModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _AdoptionModule)();
};
_AdoptionModule.\u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({ type: _AdoptionModule });
_AdoptionModule.\u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({ imports: [
  SharedModule,
  RouterModule.forChild([
    { path: "", redirectTo: "animals", pathMatch: "full" },
    { path: "animals", component: AnimalsListComponent },
    { path: "animals/:id", component: AnimalDetailComponent },
    { path: "my", component: MyApplicationsComponent }
  ])
] });
var AdoptionModule = _AdoptionModule;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AdoptionModule, [{
    type: NgModule,
    args: [{
      declarations: [AnimalsListComponent, AnimalDetailComponent, MyApplicationsComponent],
      imports: [
        SharedModule,
        RouterModule.forChild([
          { path: "", redirectTo: "animals", pathMatch: "full" },
          { path: "animals", component: AnimalsListComponent },
          { path: "animals/:id", component: AnimalDetailComponent },
          { path: "my", component: MyApplicationsComponent }
        ])
      ]
    }]
  }], null, null);
})();
export {
  AdoptionModule
};
//# sourceMappingURL=chunk-7TIX3I6U.js.map
