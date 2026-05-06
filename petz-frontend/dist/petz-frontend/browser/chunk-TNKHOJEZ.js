import {
  ApiService
} from "./chunk-QYJL6IEQ.js";
import {
  ActivatedRoute,
  Component,
  DefaultValueAccessor,
  FormBuilder,
  FormControlName,
  FormGroupDirective,
  MatButton,
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardImage,
  MatFormField,
  MatIcon,
  MatInput,
  MatLabel,
  MatOption,
  MatProgressSpinner,
  MatSelect,
  MatSnackBar,
  NgControlStatus,
  NgControlStatusGroup,
  NgModule,
  NumberValueAccessor,
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
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
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
  ɵɵtextInterpolate3
} from "./chunk-CNVABIPG.js";

// src/app/features/pets/pets-list/pets-list.component.ts
var _c0 = (a0) => ["/pets", a0];
var _forTrack0 = ($index, $item) => $item.id;
function PetsListComponent_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 3);
    \u0275\u0275element(1, "mat-spinner", 7);
    \u0275\u0275elementEnd();
  }
}
function PetsListComponent_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 4)(1, "mat-icon", 8);
    \u0275\u0275text(2, "pets");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "p");
    \u0275\u0275text(4, "No pets yet. Add your first pet!");
    \u0275\u0275elementEnd()();
  }
}
function PetsListComponent_For_12_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "mat-card", 6);
    \u0275\u0275element(1, "img", 9);
    \u0275\u0275elementStart(2, "mat-card-content")(3, "h2", 10);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "p", 11);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "mat-card-actions")(8, "button", 12);
    \u0275\u0275text(9, "Edit");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "button", 13);
    \u0275\u0275listener("click", function PetsListComponent_For_12_Template_button_click_10_listener() {
      const pet_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.delete(pet_r2.id));
    });
    \u0275\u0275text(11, "Delete");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const pet_r2 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275property("src", pet_r2.photoUrl || "assets/pet-placeholder.png", \u0275\u0275sanitizeUrl);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(pet_r2.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate3(" ", pet_r2.species, " \u2022 ", pet_r2.breed || "Mixed", " \u2022 ", pet_r2.ageYears, "yr ");
    \u0275\u0275advance(2);
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction1(6, _c0, pet_r2.id));
  }
}
var _PetsListComponent = class _PetsListComponent {
  constructor(api) {
    this.api = api;
    this.pets = [];
    this.loading = true;
  }
  ngOnInit() {
    this.api.get("/pets/my").subscribe({
      next: (res) => {
        this.pets = res.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
  delete(id) {
    if (!confirm("Delete this pet?"))
      return;
    this.api.delete(`/pets/${id}`).subscribe(() => {
      this.pets = this.pets.filter((p) => p.id !== id);
    });
  }
};
_PetsListComponent.\u0275fac = function PetsListComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _PetsListComponent)(\u0275\u0275directiveInject(ApiService));
};
_PetsListComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _PetsListComponent, selectors: [["app-pets-list"]], standalone: false, decls: 13, vars: 2, consts: [[1, "page-container"], [2, "display", "flex", "justify-content", "space-between", "align-items", "center", "margin-bottom", "20px"], ["mat-raised-button", "", "color", "primary", "routerLink", "/pets/new"], [2, "text-align", "center", "padding", "40px"], [1, "card", 2, "text-align", "center", "padding", "40px", "color", "#64748B"], [2, "display", "grid", "grid-template-columns", "repeat(auto-fill,minmax(260px,1fr))", "gap", "16px"], [1, "pet-card"], ["diameter", "40"], [2, "font-size", "48px", "width", "48px", "height", "48px"], ["mat-card-image", "", "alt", "pet photo", 2, "height", "180px", "object-fit", "cover", 3, "src"], [2, "margin", "12px 0 4px"], [2, "color", "#64748B", "margin", "0"], ["mat-button", "", 3, "routerLink"], ["mat-button", "", "color", "warn", 3, "click"]], template: function PetsListComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "h1");
    \u0275\u0275text(3, "My Pets");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "button", 2)(5, "mat-icon");
    \u0275\u0275text(6, "add");
    \u0275\u0275elementEnd();
    \u0275\u0275text(7, " Add Pet ");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(8, PetsListComponent_Conditional_8_Template, 2, 0, "div", 3);
    \u0275\u0275conditionalCreate(9, PetsListComponent_Conditional_9_Template, 5, 0, "div", 4);
    \u0275\u0275elementStart(10, "div", 5);
    \u0275\u0275repeaterCreate(11, PetsListComponent_For_12_Template, 12, 8, "mat-card", 6, _forTrack0);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275advance(8);
    \u0275\u0275conditional(ctx.loading ? 8 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx.loading && ctx.pets.length === 0 ? 9 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx.pets);
  }
}, dependencies: [RouterLink, MatCard, MatCardActions, MatCardContent, MatCardImage, MatButton, MatIcon, MatProgressSpinner], encapsulation: 2 });
var PetsListComponent = _PetsListComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PetsListComponent, [{
    type: Component,
    args: [{
      standalone: false,
      selector: "app-pets-list",
      template: `
    <div class="page-container">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h1>My Pets</h1>
        <button mat-raised-button color="primary" routerLink="/pets/new">
          <mat-icon>add</mat-icon> Add Pet
        </button>
      </div>

      @if (loading) {
        <div style="text-align:center;padding:40px">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }

      @if (!loading && pets.length === 0) {
        <div class="card" style="text-align:center;padding:40px;color:#64748B">
          <mat-icon style="font-size:48px;width:48px;height:48px">pets</mat-icon>
          <p>No pets yet. Add your first pet!</p>
        </div>
      }

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">
        @for (pet of pets; track pet.id) {
          <mat-card class="pet-card">
            <img mat-card-image [src]="pet.photoUrl || 'assets/pet-placeholder.png'"
                 style="height:180px;object-fit:cover" alt="pet photo">
            <mat-card-content>
              <h2 style="margin:12px 0 4px">{{ pet.name }}</h2>
              <p style="color:#64748B; margin:0">
                {{ pet.species }} \u2022 {{ pet.breed || 'Mixed' }} \u2022 {{ pet.ageYears }}yr
              </p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button [routerLink]="['/pets', pet.id]">Edit</button>
              <button mat-button color="warn" (click)="delete(pet.id)">Delete</button>
            </mat-card-actions>
          </mat-card>
        }
      </div>
    </div>
  `
    }]
  }], () => [{ type: ApiService }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(PetsListComponent, { className: "PetsListComponent", filePath: "src/app/features/pets/pets-list/pets-list.component.ts", lineNumber: 51 });
})();

// src/app/features/pets/pet-form/pet-form.component.ts
var _PetFormComponent = class _PetFormComponent {
  constructor(fb, api, route, router, snack) {
    this.fb = fb;
    this.api = api;
    this.route = route;
    this.router = router;
    this.snack = snack;
    this.isEdit = false;
    this.loading = false;
    this.petId = null;
    this.form = this.fb.group({
      name: ["", Validators.required],
      species: [""],
      breed: [""],
      ageYears: [null],
      gender: [""],
      weightKg: [null],
      notes: [""]
    });
  }
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    if (id && id !== "new") {
      this.isEdit = true;
      this.petId = +id;
      this.api.get(`/pets/${id}`).subscribe((res) => {
        if (res.success)
          this.form.patchValue(res.data);
      });
    }
  }
  submit() {
    if (this.form.invalid)
      return;
    this.loading = true;
    const obs = this.isEdit ? this.api.put(`/pets/${this.petId}`, this.form.value) : this.api.post("/pets", this.form.value);
    obs.subscribe({
      next: (res) => {
        this.snack.open("Pet saved!", "", { duration: 2e3 });
        this.router.navigate(["/pets"]);
      },
      error: (err) => {
        this.snack.open(err.error?.message ?? "Error saving.", "Close", { duration: 3e3 });
        this.loading = false;
      }
    });
  }
};
_PetFormComponent.\u0275fac = function PetFormComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _PetFormComponent)(\u0275\u0275directiveInject(FormBuilder), \u0275\u0275directiveInject(ApiService), \u0275\u0275directiveInject(ActivatedRoute), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(MatSnackBar));
};
_PetFormComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _PetFormComponent, selectors: [["app-pet-form"]], standalone: false, decls: 44, vars: 4, consts: [[1, "page-container", 2, "max-width", "600px"], [3, "ngSubmit", "formGroup"], [1, "form-grid"], ["appearance", "outline"], ["matInput", "", "formControlName", "name"], ["matInput", "", "formControlName", "species", "placeholder", "Dog, Cat, Bird..."], ["matInput", "", "formControlName", "breed"], ["matInput", "", "type", "number", "formControlName", "ageYears"], ["formControlName", "gender"], ["value", "Male"], ["value", "Female"], ["matInput", "", "type", "number", "step", "0.1", "formControlName", "weightKg"], ["appearance", "outline", 2, "width", "100%"], ["matInput", "", "rows", "3", "formControlName", "notes"], [2, "display", "flex", "gap", "12px", "margin-top", "16px"], ["mat-flat-button", "", "color", "primary", "type", "submit", 3, "disabled"], ["mat-button", "", "type", "button", "routerLink", "/pets"]], template: function PetFormComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "h1");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "mat-card")(4, "mat-card-content")(5, "form", 1);
    \u0275\u0275listener("ngSubmit", function PetFormComponent_Template_form_ngSubmit_5_listener() {
      return ctx.submit();
    });
    \u0275\u0275elementStart(6, "div", 2)(7, "mat-form-field", 3)(8, "mat-label");
    \u0275\u0275text(9, "Name *");
    \u0275\u0275elementEnd();
    \u0275\u0275element(10, "input", 4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "mat-form-field", 3)(12, "mat-label");
    \u0275\u0275text(13, "Species");
    \u0275\u0275elementEnd();
    \u0275\u0275element(14, "input", 5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "mat-form-field", 3)(16, "mat-label");
    \u0275\u0275text(17, "Breed");
    \u0275\u0275elementEnd();
    \u0275\u0275element(18, "input", 6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "mat-form-field", 3)(20, "mat-label");
    \u0275\u0275text(21, "Age (years)");
    \u0275\u0275elementEnd();
    \u0275\u0275element(22, "input", 7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "mat-form-field", 3)(24, "mat-label");
    \u0275\u0275text(25, "Gender");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(26, "mat-select", 8)(27, "mat-option", 9);
    \u0275\u0275text(28, "Male");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(29, "mat-option", 10);
    \u0275\u0275text(30, "Female");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(31, "mat-form-field", 3)(32, "mat-label");
    \u0275\u0275text(33, "Weight (kg)");
    \u0275\u0275elementEnd();
    \u0275\u0275element(34, "input", 11);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(35, "mat-form-field", 12)(36, "mat-label");
    \u0275\u0275text(37, "Notes");
    \u0275\u0275elementEnd();
    \u0275\u0275element(38, "textarea", 13);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(39, "div", 14)(40, "button", 15);
    \u0275\u0275text(41);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(42, "button", 16);
    \u0275\u0275text(43, "Cancel");
    \u0275\u0275elementEnd()()()()()();
  }
  if (rf & 2) {
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx.isEdit ? "Edit Pet" : "Add New Pet");
    \u0275\u0275advance(3);
    \u0275\u0275property("formGroup", ctx.form);
    \u0275\u0275advance(35);
    \u0275\u0275property("disabled", ctx.form.invalid || ctx.loading);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx.loading ? "Saving..." : ctx.isEdit ? "Update" : "Add Pet", " ");
  }
}, dependencies: [RouterLink, \u0275NgNoValidate, DefaultValueAccessor, NumberValueAccessor, NgControlStatus, NgControlStatusGroup, FormGroupDirective, FormControlName, MatCard, MatCardContent, MatButton, MatInput, MatFormField, MatLabel, MatSelect, MatOption], encapsulation: 2 });
var PetFormComponent = _PetFormComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PetFormComponent, [{
    type: Component,
    args: [{
      standalone: false,
      selector: "app-pet-form",
      template: `
    <div class="page-container" style="max-width:600px">
      <h1>{{ isEdit ? 'Edit Pet' : 'Add New Pet' }}</h1>
      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Name *</mat-label>
                <input matInput formControlName="name">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Species</mat-label>
                <input matInput formControlName="species" placeholder="Dog, Cat, Bird...">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Breed</mat-label>
                <input matInput formControlName="breed">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Age (years)</mat-label>
                <input matInput type="number" formControlName="ageYears">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Gender</mat-label>
                <mat-select formControlName="gender">
                  <mat-option value="Male">Male</mat-option>
                  <mat-option value="Female">Female</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Weight (kg)</mat-label>
                <input matInput type="number" step="0.1" formControlName="weightKg">
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Notes</mat-label>
              <textarea matInput rows="3" formControlName="notes"></textarea>
            </mat-form-field>
            <div style="display:flex;gap:12px;margin-top:16px">
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading">
                {{ loading ? 'Saving...' : (isEdit ? 'Update' : 'Add Pet') }}
              </button>
              <button mat-button type="button" routerLink="/pets">Cancel</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
    }]
  }], () => [{ type: FormBuilder }, { type: ApiService }, { type: ActivatedRoute }, { type: Router }, { type: MatSnackBar }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(PetFormComponent, { className: "PetFormComponent", filePath: "src/app/features/pets/pet-form/pet-form.component.ts", lineNumber: 61 });
})();

// src/app/features/pets/pets.module.ts
var _PetsModule = class _PetsModule {
};
_PetsModule.\u0275fac = function PetsModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _PetsModule)();
};
_PetsModule.\u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({ type: _PetsModule });
_PetsModule.\u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({ imports: [
  SharedModule,
  RouterModule.forChild([
    { path: "", component: PetsListComponent },
    { path: "new", component: PetFormComponent },
    { path: ":id", component: PetFormComponent }
  ])
] });
var PetsModule = _PetsModule;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PetsModule, [{
    type: NgModule,
    args: [{
      declarations: [PetsListComponent, PetFormComponent],
      imports: [
        SharedModule,
        RouterModule.forChild([
          { path: "", component: PetsListComponent },
          { path: "new", component: PetFormComponent },
          { path: ":id", component: PetFormComponent }
        ])
      ]
    }]
  }], null, null);
})();
export {
  PetsModule
};
//# sourceMappingURL=chunk-TNKHOJEZ.js.map
