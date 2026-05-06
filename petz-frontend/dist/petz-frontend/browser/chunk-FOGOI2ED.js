import {
  AuthService
} from "./chunk-W525NKGO.js";
import {
  Component,
  DefaultValueAccessor,
  FormBuilder,
  FormControlName,
  FormGroupDirective,
  MatButton,
  MatFormField,
  MatIcon,
  MatInput,
  MatOption,
  MatPrefix,
  MatProgressSpinner,
  MatSelect,
  MatSnackBar,
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
  ɵɵproperty,
  ɵɵtext,
  ɵɵtextInterpolate1
} from "./chunk-CNVABIPG.js";

// src/app/features/auth/login/login.component.ts
function LoginComponent_Conditional_58_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "mat-spinner", 16);
  }
}
var _LoginComponent = class _LoginComponent {
  constructor(fb, auth, router, snack) {
    this.fb = fb;
    this.auth = auth;
    this.router = router;
    this.snack = snack;
    this.loading = false;
    this.form = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required]
    });
  }
  submit() {
    if (this.form.invalid)
      return;
    this.loading = true;
    const { email, password } = this.form.value;
    this.auth.login(email, password).subscribe({
      next: (res) => {
        if (res.success)
          this.router.navigate(["/dashboard"]);
        else
          this.snack.open(res.message, "Close", { duration: 3e3 });
        this.loading = false;
      },
      error: (err) => {
        this.snack.open(err.error?.message ?? "Login failed.", "Close", { duration: 3e3 });
        this.loading = false;
      }
    });
  }
};
_LoginComponent.\u0275fac = function LoginComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _LoginComponent)(\u0275\u0275directiveInject(FormBuilder), \u0275\u0275directiveInject(AuthService), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(MatSnackBar));
};
_LoginComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _LoginComponent, selectors: [["app-login"]], standalone: false, decls: 64, vars: 4, consts: [[1, "auth-wrap"], [1, "auth-left"], [1, "brand"], [1, "features"], [1, "feature-item"], [1, "f-icon"], [1, "auth-right"], [1, "auth-card"], [1, "auth-header"], [3, "ngSubmit", "formGroup"], [1, "field-group"], ["appearance", "outline"], ["matInput", "", "type", "email", "formControlName", "email", "placeholder", "you@example.com"], ["matPrefix", "", 2, "color", "#A8A29E", "margin-right", "6px"], ["matInput", "", "type", "password", "formControlName", "password", "placeholder", "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"], ["mat-raised-button", "", "color", "primary", "type", "submit", 2, "width", "100%", "height", "48px", "font-size", "1rem", "margin-top", "8px", 3, "disabled"], ["diameter", "20", 2, "display", "inline-block", "margin-right", "8px"], [1, "auth-footer"], ["routerLink", "/auth/register"]], template: function LoginComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2);
    \u0275\u0275text(3, "\u{1F43E} PETZ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "h1");
    \u0275\u0275text(5, "Animal Welfare");
    \u0275\u0275element(6, "br");
    \u0275\u0275text(7, "Platform");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "p");
    \u0275\u0275text(9, "Connecting pets, owners, hospitals and rescue organisations \u2014 all in one place.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "div", 3)(11, "div", 4)(12, "div", 5)(13, "mat-icon");
    \u0275\u0275text(14, "pets");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(15, "span");
    \u0275\u0275text(16, "Manage your pets");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(17, "div", 4)(18, "div", 5)(19, "mat-icon");
    \u0275\u0275text(20, "emergency");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(21, "span");
    \u0275\u0275text(22, "Report & track rescues");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(23, "div", 4)(24, "div", 5)(25, "mat-icon");
    \u0275\u0275text(26, "favorite");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(27, "span");
    \u0275\u0275text(28, "Adopt animals");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(29, "div", 4)(30, "div", 5)(31, "mat-icon");
    \u0275\u0275text(32, "local_hospital");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(33, "span");
    \u0275\u0275text(34, "Book vet appointments");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(35, "div", 6)(36, "div", 7)(37, "div", 8)(38, "h2");
    \u0275\u0275text(39, "Welcome back");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(40, "p");
    \u0275\u0275text(41, "Sign in to your account");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(42, "form", 9);
    \u0275\u0275listener("ngSubmit", function LoginComponent_Template_form_ngSubmit_42_listener() {
      return ctx.submit();
    });
    \u0275\u0275elementStart(43, "div", 10)(44, "label");
    \u0275\u0275text(45, "Email address");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(46, "mat-form-field", 11);
    \u0275\u0275element(47, "input", 12);
    \u0275\u0275elementStart(48, "mat-icon", 13);
    \u0275\u0275text(49, "mail_outline");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(50, "div", 10)(51, "label");
    \u0275\u0275text(52, "Password");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(53, "mat-form-field", 11);
    \u0275\u0275element(54, "input", 14);
    \u0275\u0275elementStart(55, "mat-icon", 13);
    \u0275\u0275text(56, "lock_outline");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(57, "button", 15);
    \u0275\u0275conditionalCreate(58, LoginComponent_Conditional_58_Template, 1, 0, "mat-spinner", 16);
    \u0275\u0275text(59);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(60, "p", 17);
    \u0275\u0275text(61, " Don't have an account? ");
    \u0275\u0275elementStart(62, "a", 18);
    \u0275\u0275text(63, "Create one");
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    \u0275\u0275advance(42);
    \u0275\u0275property("formGroup", ctx.form);
    \u0275\u0275advance(15);
    \u0275\u0275property("disabled", ctx.form.invalid || ctx.loading);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx.loading ? 58 : -1);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx.loading ? "Signing in..." : "Sign In", " ");
  }
}, dependencies: [RouterLink, \u0275NgNoValidate, DefaultValueAccessor, NgControlStatus, NgControlStatusGroup, FormGroupDirective, FormControlName, MatButton, MatIcon, MatInput, MatFormField, MatPrefix, MatProgressSpinner], styles: ["\n\n.auth-wrap[_ngcontent-%COMP%] {\n  min-height: 100vh;\n  display: flex;\n}\n.auth-left[_ngcontent-%COMP%] {\n  width: 45%;\n  background:\n    linear-gradient(\n      160deg,\n      #1C0902 0%,\n      #3D1505 60%,\n      #7C2D12 100%);\n  padding: 60px 56px;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  color: #fff;\n}\n@media (max-width: 768px) {\n  .auth-left[_ngcontent-%COMP%] {\n    display: none;\n  }\n}\n.auth-left[_ngcontent-%COMP%]   .brand[_ngcontent-%COMP%] {\n  font-size: 1.4rem;\n  font-weight: 900;\n  color: #F97316;\n  letter-spacing: 2px;\n  text-transform: uppercase;\n  margin-bottom: 48px;\n}\n.auth-left[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  font-size: 2.5rem;\n  font-weight: 900;\n  line-height: 1.2;\n  margin: 0 0 20px;\n  color: #fff;\n}\n.auth-left[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.65);\n  font-size: 1rem;\n  line-height: 1.7;\n  margin: 0 0 40px;\n}\n.features[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n.feature-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 14px;\n  color: rgba(255, 255, 255, 0.85);\n  font-weight: 500;\n  font-size: 0.92rem;\n}\n.f-icon[_ngcontent-%COMP%] {\n  width: 38px;\n  height: 38px;\n  border-radius: 10px;\n  background: rgba(249, 115, 22, 0.2);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n.f-icon[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  color: #F97316;\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n}\n.auth-right[_ngcontent-%COMP%] {\n  flex: 1;\n  background: #FFF8F4;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 40px 24px;\n}\n.auth-card[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 420px;\n  background: #fff;\n  border-radius: 24px;\n  padding: 44px 40px;\n  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);\n  border: 1px solid #F0E0D6;\n}\n.auth-header[_ngcontent-%COMP%] {\n  margin-bottom: 32px;\n}\n.auth-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  font-size: 1.8rem;\n  font-weight: 900;\n  color: #1C0902;\n  margin: 0 0 6px;\n}\n.auth-header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  color: #A8A29E;\n  margin: 0;\n  font-size: 0.9rem;\n}\n.field-group[_ngcontent-%COMP%] {\n  margin-bottom: 18px;\n}\n.field-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: block;\n  font-size: 0.82rem;\n  font-weight: 700;\n  color: #1C0902;\n  margin-bottom: 6px;\n}\n.field-group[_ngcontent-%COMP%]   mat-form-field[_ngcontent-%COMP%] {\n  margin: 0;\n}\n.auth-footer[_ngcontent-%COMP%] {\n  text-align: center;\n  margin: 24px 0 0;\n  color: #A8A29E;\n  font-size: 0.88rem;\n}\n.auth-footer[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\n  color: #F97316;\n  font-weight: 700;\n  text-decoration: none;\n}\n.auth-footer[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover {\n  text-decoration: underline;\n}\n/*# sourceMappingURL=login.component.css.map */"] });
var LoginComponent = _LoginComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(LoginComponent, [{
    type: Component,
    args: [{ standalone: false, selector: "app-login", template: `
    <div class="auth-wrap">

      <!-- Left panel -->
      <div class="auth-left">
        <div class="brand">\u{1F43E} PETZ</div>
        <h1>Animal Welfare<br>Platform</h1>
        <p>Connecting pets, owners, hospitals and rescue organisations \u2014 all in one place.</p>

        <div class="features">
          <div class="feature-item">
            <div class="f-icon"><mat-icon>pets</mat-icon></div>
            <span>Manage your pets</span>
          </div>
          <div class="feature-item">
            <div class="f-icon"><mat-icon>emergency</mat-icon></div>
            <span>Report & track rescues</span>
          </div>
          <div class="feature-item">
            <div class="f-icon"><mat-icon>favorite</mat-icon></div>
            <span>Adopt animals</span>
          </div>
          <div class="feature-item">
            <div class="f-icon"><mat-icon>local_hospital</mat-icon></div>
            <span>Book vet appointments</span>
          </div>
        </div>
      </div>

      <!-- Right panel -->
      <div class="auth-right">
        <div class="auth-card">
          <div class="auth-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="field-group">
              <label>Email address</label>
              <mat-form-field appearance="outline">
                <input matInput type="email" formControlName="email" placeholder="you@example.com">
                <mat-icon matPrefix style="color:#A8A29E;margin-right:6px">mail_outline</mat-icon>
              </mat-form-field>
            </div>

            <div class="field-group">
              <label>Password</label>
              <mat-form-field appearance="outline">
                <input matInput type="password" formControlName="password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022">
                <mat-icon matPrefix style="color:#A8A29E;margin-right:6px">lock_outline</mat-icon>
              </mat-form-field>
            </div>

            <button mat-raised-button color="primary" type="submit"
                    [disabled]="form.invalid || loading"
                    style="width:100%;height:48px;font-size:1rem;margin-top:8px">
              @if (loading) {
                <mat-spinner diameter="20" style="display:inline-block;margin-right:8px"></mat-spinner>
              }
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <p class="auth-footer">
            Don't have an account?
            <a routerLink="/auth/register">Create one</a>
          </p>
        </div>
      </div>
    </div>
  `, styles: ["/* angular:styles/component:css;c4f5ccde825ac77bd4f5e16eded0d6bd9aa294908f2a792cc76d42aba47b6c12;C:/Users/2480002/OneDrive - Cognizant/Desktop/PETZ/petz-platform/petz-frontend/src/app/features/auth/login/login.component.ts */\n.auth-wrap {\n  min-height: 100vh;\n  display: flex;\n}\n.auth-left {\n  width: 45%;\n  background:\n    linear-gradient(\n      160deg,\n      #1C0902 0%,\n      #3D1505 60%,\n      #7C2D12 100%);\n  padding: 60px 56px;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  color: #fff;\n}\n@media (max-width: 768px) {\n  .auth-left {\n    display: none;\n  }\n}\n.auth-left .brand {\n  font-size: 1.4rem;\n  font-weight: 900;\n  color: #F97316;\n  letter-spacing: 2px;\n  text-transform: uppercase;\n  margin-bottom: 48px;\n}\n.auth-left h1 {\n  font-size: 2.5rem;\n  font-weight: 900;\n  line-height: 1.2;\n  margin: 0 0 20px;\n  color: #fff;\n}\n.auth-left p {\n  color: rgba(255, 255, 255, 0.65);\n  font-size: 1rem;\n  line-height: 1.7;\n  margin: 0 0 40px;\n}\n.features {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n.feature-item {\n  display: flex;\n  align-items: center;\n  gap: 14px;\n  color: rgba(255, 255, 255, 0.85);\n  font-weight: 500;\n  font-size: 0.92rem;\n}\n.f-icon {\n  width: 38px;\n  height: 38px;\n  border-radius: 10px;\n  background: rgba(249, 115, 22, 0.2);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n.f-icon mat-icon {\n  color: #F97316;\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n}\n.auth-right {\n  flex: 1;\n  background: #FFF8F4;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 40px 24px;\n}\n.auth-card {\n  width: 100%;\n  max-width: 420px;\n  background: #fff;\n  border-radius: 24px;\n  padding: 44px 40px;\n  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);\n  border: 1px solid #F0E0D6;\n}\n.auth-header {\n  margin-bottom: 32px;\n}\n.auth-header h2 {\n  font-size: 1.8rem;\n  font-weight: 900;\n  color: #1C0902;\n  margin: 0 0 6px;\n}\n.auth-header p {\n  color: #A8A29E;\n  margin: 0;\n  font-size: 0.9rem;\n}\n.field-group {\n  margin-bottom: 18px;\n}\n.field-group label {\n  display: block;\n  font-size: 0.82rem;\n  font-weight: 700;\n  color: #1C0902;\n  margin-bottom: 6px;\n}\n.field-group mat-form-field {\n  margin: 0;\n}\n.auth-footer {\n  text-align: center;\n  margin: 24px 0 0;\n  color: #A8A29E;\n  font-size: 0.88rem;\n}\n.auth-footer a {\n  color: #F97316;\n  font-weight: 700;\n  text-decoration: none;\n}\n.auth-footer a:hover {\n  text-decoration: underline;\n}\n/*# sourceMappingURL=login.component.css.map */\n"] }]
  }], () => [{ type: FormBuilder }, { type: AuthService }, { type: Router }, { type: MatSnackBar }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(LoginComponent, { className: "LoginComponent", filePath: "src/app/features/auth/login/login.component.ts", lineNumber: 191 });
})();

// src/app/features/auth/register/register.component.ts
var _RegisterComponent = class _RegisterComponent {
  constructor(fb, auth, router, snack) {
    this.fb = fb;
    this.auth = auth;
    this.router = router;
    this.snack = snack;
    this.loading = false;
    this.form = this.fb.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      phone: [""],
      role: ["USER"]
    });
  }
  submit() {
    if (this.form.invalid)
      return;
    this.loading = true;
    this.auth.register(this.form.value).subscribe({
      next: (res) => {
        if (res.success)
          this.router.navigate(["/dashboard"]);
        else
          this.snack.open(res.message, "Close", { duration: 3e3 });
        this.loading = false;
      },
      error: (err) => {
        this.snack.open(err.error?.message ?? "Registration failed.", "Close", { duration: 3e3 });
        this.loading = false;
      }
    });
  }
};
_RegisterComponent.\u0275fac = function RegisterComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _RegisterComponent)(\u0275\u0275directiveInject(FormBuilder), \u0275\u0275directiveInject(AuthService), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(MatSnackBar));
};
_RegisterComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _RegisterComponent, selectors: [["app-register"]], standalone: false, decls: 75, vars: 3, consts: [[1, "auth-wrap"], [1, "auth-left"], [1, "brand"], [1, "features"], [1, "feature-item"], [1, "f-icon"], [1, "auth-right"], [1, "auth-card"], [1, "auth-header"], [3, "ngSubmit", "formGroup"], [1, "fields-grid"], [1, "field-group"], ["appearance", "outline"], ["matInput", "", "formControlName", "name", "placeholder", "John Doe"], ["matInput", "", "formControlName", "phone", "placeholder", "+91 00000 00000"], ["matInput", "", "type", "email", "formControlName", "email", "placeholder", "you@example.com"], ["matInput", "", "type", "password", "formControlName", "password", "placeholder", "min. 6 characters"], ["formControlName", "role"], ["value", "USER"], ["value", "NGO"], ["value", "HOSPITAL"], ["mat-raised-button", "", "color", "primary", "type", "submit", 2, "width", "100%", "height", "48px", "font-size", "1rem", "margin-top", "4px", 3, "disabled"], [1, "auth-footer"], ["routerLink", "/auth/login"]], template: function RegisterComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2);
    \u0275\u0275text(3, "\u{1F43E} PETZ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "h1");
    \u0275\u0275text(5, "Join the");
    \u0275\u0275element(6, "br");
    \u0275\u0275text(7, "PETZ Community");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "p");
    \u0275\u0275text(9, "Create your free account and start making a difference for animals in need.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "div", 3)(11, "div", 4)(12, "div", 5)(13, "mat-icon");
    \u0275\u0275text(14, "pets");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(15, "span");
    \u0275\u0275text(16, "Register as pet owner");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(17, "div", 4)(18, "div", 5)(19, "mat-icon");
    \u0275\u0275text(20, "business");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(21, "span");
    \u0275\u0275text(22, "NGO / Rescue organisations");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(23, "div", 4)(24, "div", 5)(25, "mat-icon");
    \u0275\u0275text(26, "local_hospital");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(27, "span");
    \u0275\u0275text(28, "Veterinary hospitals");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(29, "div", 6)(30, "div", 7)(31, "div", 8)(32, "h2");
    \u0275\u0275text(33, "Create account");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(34, "p");
    \u0275\u0275text(35, "Fill in the details to get started");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(36, "form", 9);
    \u0275\u0275listener("ngSubmit", function RegisterComponent_Template_form_ngSubmit_36_listener() {
      return ctx.submit();
    });
    \u0275\u0275elementStart(37, "div", 10)(38, "div", 11)(39, "label");
    \u0275\u0275text(40, "Full Name");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(41, "mat-form-field", 12);
    \u0275\u0275element(42, "input", 13);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(43, "div", 11)(44, "label");
    \u0275\u0275text(45, "Phone");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(46, "mat-form-field", 12);
    \u0275\u0275element(47, "input", 14);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(48, "div", 11)(49, "label");
    \u0275\u0275text(50, "Email address");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(51, "mat-form-field", 12);
    \u0275\u0275element(52, "input", 15);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(53, "div", 11)(54, "label");
    \u0275\u0275text(55, "Password");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(56, "mat-form-field", 12);
    \u0275\u0275element(57, "input", 16);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(58, "div", 11)(59, "label");
    \u0275\u0275text(60, "Account Type");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(61, "mat-form-field", 12)(62, "mat-select", 17)(63, "mat-option", 18);
    \u0275\u0275text(64, "\u{1F43E} \xA0Pet Owner");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(65, "mat-option", 19);
    \u0275\u0275text(66, "\u{1F3E2} \xA0NGO / Rescue Organisation");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(67, "mat-option", 20);
    \u0275\u0275text(68, "\u{1F3E5} \xA0Veterinary Hospital");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(69, "button", 21);
    \u0275\u0275text(70);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(71, "p", 22);
    \u0275\u0275text(72, " Already have an account? ");
    \u0275\u0275elementStart(73, "a", 23);
    \u0275\u0275text(74, "Sign in");
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    \u0275\u0275advance(36);
    \u0275\u0275property("formGroup", ctx.form);
    \u0275\u0275advance(33);
    \u0275\u0275property("disabled", ctx.form.invalid || ctx.loading);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx.loading ? "Creating account..." : "Create Account", " ");
  }
}, dependencies: [RouterLink, \u0275NgNoValidate, DefaultValueAccessor, NgControlStatus, NgControlStatusGroup, FormGroupDirective, FormControlName, MatButton, MatIcon, MatInput, MatFormField, MatSelect, MatOption], styles: ["\n\n.auth-wrap[_ngcontent-%COMP%] {\n  min-height: 100vh;\n  display: flex;\n}\n.auth-left[_ngcontent-%COMP%] {\n  width: 40%;\n  background:\n    linear-gradient(\n      160deg,\n      #1C0902 0%,\n      #3D1505 60%,\n      #7C2D12 100%);\n  padding: 60px 48px;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  color: #fff;\n}\n@media (max-width: 768px) {\n  .auth-left[_ngcontent-%COMP%] {\n    display: none;\n  }\n}\n.auth-left[_ngcontent-%COMP%]   .brand[_ngcontent-%COMP%] {\n  font-size: 1.4rem;\n  font-weight: 900;\n  color: #F97316;\n  letter-spacing: 2px;\n  text-transform: uppercase;\n  margin-bottom: 48px;\n}\n.auth-left[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  font-size: 2.2rem;\n  font-weight: 900;\n  line-height: 1.2;\n  margin: 0 0 20px;\n}\n.auth-left[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.65);\n  font-size: 0.95rem;\n  line-height: 1.7;\n  margin: 0 0 36px;\n}\n.features[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 14px;\n}\n.feature-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  color: rgba(255, 255, 255, 0.85);\n  font-weight: 500;\n  font-size: 0.9rem;\n}\n.f-icon[_ngcontent-%COMP%] {\n  width: 36px;\n  height: 36px;\n  border-radius: 10px;\n  background: rgba(249, 115, 22, 0.2);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n.f-icon[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  color: #F97316;\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n}\n.auth-right[_ngcontent-%COMP%] {\n  flex: 1;\n  background: #FFF8F4;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 40px 24px;\n  overflow-y: auto;\n}\n.auth-card[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 460px;\n  background: #fff;\n  border-radius: 24px;\n  padding: 40px;\n  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);\n  border: 1px solid #F0E0D6;\n}\n.auth-header[_ngcontent-%COMP%] {\n  margin-bottom: 28px;\n}\n.auth-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  font-size: 1.7rem;\n  font-weight: 900;\n  color: #1C0902;\n  margin: 0 0 6px;\n}\n.auth-header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  color: #A8A29E;\n  margin: 0;\n  font-size: 0.88rem;\n}\n.fields-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 0 14px;\n}\n.field-group[_ngcontent-%COMP%] {\n  margin-bottom: 14px;\n}\n.field-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: block;\n  font-size: 0.8rem;\n  font-weight: 700;\n  color: #1C0902;\n  margin-bottom: 5px;\n}\n.auth-footer[_ngcontent-%COMP%] {\n  text-align: center;\n  margin: 20px 0 0;\n  color: #A8A29E;\n  font-size: 0.88rem;\n}\n.auth-footer[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\n  color: #F97316;\n  font-weight: 700;\n  text-decoration: none;\n}\n.auth-footer[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover {\n  text-decoration: underline;\n}\n/*# sourceMappingURL=register.component.css.map */"] });
var RegisterComponent = _RegisterComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(RegisterComponent, [{
    type: Component,
    args: [{ standalone: false, selector: "app-register", template: `
    <div class="auth-wrap">

      <!-- Left panel -->
      <div class="auth-left">
        <div class="brand">\u{1F43E} PETZ</div>
        <h1>Join the<br>PETZ Community</h1>
        <p>Create your free account and start making a difference for animals in need.</p>
        <div class="features">
          <div class="feature-item">
            <div class="f-icon"><mat-icon>pets</mat-icon></div>
            <span>Register as pet owner</span>
          </div>
          <div class="feature-item">
            <div class="f-icon"><mat-icon>business</mat-icon></div>
            <span>NGO / Rescue organisations</span>
          </div>
          <div class="feature-item">
            <div class="f-icon"><mat-icon>local_hospital</mat-icon></div>
            <span>Veterinary hospitals</span>
          </div>
        </div>
      </div>

      <!-- Right panel -->
      <div class="auth-right">
        <div class="auth-card">
          <div class="auth-header">
            <h2>Create account</h2>
            <p>Fill in the details to get started</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="fields-grid">
              <div class="field-group">
                <label>Full Name</label>
                <mat-form-field appearance="outline">
                  <input matInput formControlName="name" placeholder="John Doe">
                </mat-form-field>
              </div>
              <div class="field-group">
                <label>Phone</label>
                <mat-form-field appearance="outline">
                  <input matInput formControlName="phone" placeholder="+91 00000 00000">
                </mat-form-field>
              </div>
            </div>

            <div class="field-group">
              <label>Email address</label>
              <mat-form-field appearance="outline">
                <input matInput type="email" formControlName="email" placeholder="you@example.com">
              </mat-form-field>
            </div>

            <div class="field-group">
              <label>Password</label>
              <mat-form-field appearance="outline">
                <input matInput type="password" formControlName="password" placeholder="min. 6 characters">
              </mat-form-field>
            </div>

            <div class="field-group">
              <label>Account Type</label>
              <mat-form-field appearance="outline">
                <mat-select formControlName="role">
                  <mat-option value="USER">\u{1F43E} &nbsp;Pet Owner</mat-option>
                  <mat-option value="NGO">\u{1F3E2} &nbsp;NGO / Rescue Organisation</mat-option>
                  <mat-option value="HOSPITAL">\u{1F3E5} &nbsp;Veterinary Hospital</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <button mat-raised-button color="primary" type="submit"
                    [disabled]="form.invalid || loading"
                    style="width:100%;height:48px;font-size:1rem;margin-top:4px">
              {{ loading ? 'Creating account...' : 'Create Account' }}
            </button>
          </form>

          <p class="auth-footer">
            Already have an account?
            <a routerLink="/auth/login">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `, styles: ["/* angular:styles/component:css;2d60aa17cae2ad870b6661e697e334761bf8a28e05ad936c00485b2b03d87429;C:/Users/2480002/OneDrive - Cognizant/Desktop/PETZ/petz-platform/petz-frontend/src/app/features/auth/register/register.component.ts */\n.auth-wrap {\n  min-height: 100vh;\n  display: flex;\n}\n.auth-left {\n  width: 40%;\n  background:\n    linear-gradient(\n      160deg,\n      #1C0902 0%,\n      #3D1505 60%,\n      #7C2D12 100%);\n  padding: 60px 48px;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  color: #fff;\n}\n@media (max-width: 768px) {\n  .auth-left {\n    display: none;\n  }\n}\n.auth-left .brand {\n  font-size: 1.4rem;\n  font-weight: 900;\n  color: #F97316;\n  letter-spacing: 2px;\n  text-transform: uppercase;\n  margin-bottom: 48px;\n}\n.auth-left h1 {\n  font-size: 2.2rem;\n  font-weight: 900;\n  line-height: 1.2;\n  margin: 0 0 20px;\n}\n.auth-left p {\n  color: rgba(255, 255, 255, 0.65);\n  font-size: 0.95rem;\n  line-height: 1.7;\n  margin: 0 0 36px;\n}\n.features {\n  display: flex;\n  flex-direction: column;\n  gap: 14px;\n}\n.feature-item {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  color: rgba(255, 255, 255, 0.85);\n  font-weight: 500;\n  font-size: 0.9rem;\n}\n.f-icon {\n  width: 36px;\n  height: 36px;\n  border-radius: 10px;\n  background: rgba(249, 115, 22, 0.2);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n.f-icon mat-icon {\n  color: #F97316;\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n}\n.auth-right {\n  flex: 1;\n  background: #FFF8F4;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 40px 24px;\n  overflow-y: auto;\n}\n.auth-card {\n  width: 100%;\n  max-width: 460px;\n  background: #fff;\n  border-radius: 24px;\n  padding: 40px;\n  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);\n  border: 1px solid #F0E0D6;\n}\n.auth-header {\n  margin-bottom: 28px;\n}\n.auth-header h2 {\n  font-size: 1.7rem;\n  font-weight: 900;\n  color: #1C0902;\n  margin: 0 0 6px;\n}\n.auth-header p {\n  color: #A8A29E;\n  margin: 0;\n  font-size: 0.88rem;\n}\n.fields-grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 0 14px;\n}\n.field-group {\n  margin-bottom: 14px;\n}\n.field-group label {\n  display: block;\n  font-size: 0.8rem;\n  font-weight: 700;\n  color: #1C0902;\n  margin-bottom: 5px;\n}\n.auth-footer {\n  text-align: center;\n  margin: 20px 0 0;\n  color: #A8A29E;\n  font-size: 0.88rem;\n}\n.auth-footer a {\n  color: #F97316;\n  font-weight: 700;\n  text-decoration: none;\n}\n.auth-footer a:hover {\n  text-decoration: underline;\n}\n/*# sourceMappingURL=register.component.css.map */\n"] }]
  }], () => [{ type: FormBuilder }, { type: AuthService }, { type: Router }, { type: MatSnackBar }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(RegisterComponent, { className: "RegisterComponent", filePath: "src/app/features/auth/register/register.component.ts", lineNumber: 154 });
})();

// src/app/features/auth/auth.module.ts
var _AuthModule = class _AuthModule {
};
_AuthModule.\u0275fac = function AuthModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _AuthModule)();
};
_AuthModule.\u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({ type: _AuthModule });
_AuthModule.\u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({ imports: [
  SharedModule,
  RouterModule.forChild([
    { path: "login", component: LoginComponent },
    { path: "register", component: RegisterComponent },
    { path: "", redirectTo: "login", pathMatch: "full" }
  ])
] });
var AuthModule = _AuthModule;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AuthModule, [{
    type: NgModule,
    args: [{
      declarations: [LoginComponent, RegisterComponent],
      imports: [
        SharedModule,
        RouterModule.forChild([
          { path: "login", component: LoginComponent },
          { path: "register", component: RegisterComponent },
          { path: "", redirectTo: "login", pathMatch: "full" }
        ])
      ]
    }]
  }], null, null);
})();
export {
  AuthModule
};
//# sourceMappingURL=chunk-FOGOI2ED.js.map
