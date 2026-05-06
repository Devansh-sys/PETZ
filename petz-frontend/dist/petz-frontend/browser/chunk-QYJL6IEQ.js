import {
  HttpClient,
  HttpParams,
  Injectable,
  environment,
  setClassMetadata,
  ɵɵdefineInjectable,
  ɵɵinject
} from "./chunk-CNVABIPG.js";

// src/app/core/services/api.service.ts
var _ApiService = class _ApiService {
  constructor(http) {
    this.http = http;
    this.base = environment.apiUrl;
  }
  get(path, params) {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v != null)
          httpParams = httpParams.set(k, v);
      });
    }
    return this.http.get(`${this.base}${path}`, { params: httpParams });
  }
  post(path, body) {
    return this.http.post(`${this.base}${path}`, body);
  }
  put(path, body) {
    return this.http.put(`${this.base}${path}`, body);
  }
  patch(path, body) {
    return this.http.patch(`${this.base}${path}`, body);
  }
  delete(path) {
    return this.http.delete(`${this.base}${path}`);
  }
  postFormData(path, formData) {
    return this.http.post(`${this.base}${path}`, formData);
  }
};
_ApiService.\u0275fac = function ApiService_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _ApiService)(\u0275\u0275inject(HttpClient));
};
_ApiService.\u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _ApiService, factory: _ApiService.\u0275fac, providedIn: "root" });
var ApiService = _ApiService;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ApiService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], () => [{ type: HttpClient }], null);
})();

export {
  ApiService
};
//# sourceMappingURL=chunk-QYJL6IEQ.js.map
