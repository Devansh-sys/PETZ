import {
  BehaviorSubject,
  HttpClient,
  Injectable,
  Router,
  environment,
  setClassMetadata,
  tap,
  ɵɵdefineInjectable,
  ɵɵinject
} from "./chunk-CNVABIPG.js";

// src/app/core/services/auth.service.ts
var _AuthService = class _AuthService {
  constructor(http, router) {
    this.http = http;
    this.router = router;
    this.TOKEN_KEY = "petz_token";
    this.USER_KEY = "petz_user";
    this.currentUser$ = new BehaviorSubject(this.getStoredUser());
  }
  register(data) {
    return this.http.post(`${environment.apiUrl}/auth/register`, data).pipe(tap((res) => {
      if (res.success)
        this.storeAuth(res.data);
    }));
  }
  login(email, password) {
    return this.http.post(`${environment.apiUrl}/auth/login`, { email, password }).pipe(tap((res) => {
      if (res.success)
        this.storeAuth(res.data);
    }));
  }
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser$.next(null);
    this.router.navigate(["/auth/login"]);
  }
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  isLoggedIn() {
    return !!this.getToken();
  }
  getRole() {
    return this.currentUser$.value?.role ?? null;
  }
  getUserId() {
    return this.currentUser$.value?.userId ?? null;
  }
  storeAuth(data) {
    localStorage.setItem(this.TOKEN_KEY, data.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(data));
    this.currentUser$.next(data);
  }
  getStoredUser() {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
};
_AuthService.\u0275fac = function AuthService_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _AuthService)(\u0275\u0275inject(HttpClient), \u0275\u0275inject(Router));
};
_AuthService.\u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _AuthService, factory: _AuthService.\u0275fac, providedIn: "root" });
var AuthService = _AuthService;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AuthService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], () => [{ type: HttpClient }, { type: Router }], null);
})();

export {
  AuthService
};
//# sourceMappingURL=chunk-W525NKGO.js.map
