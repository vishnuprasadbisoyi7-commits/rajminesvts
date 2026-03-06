import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
// import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // private apiUrl = `${environment.apiUrl}/auth`;
  private apiUrl = 'http://localhost:8089/api/auth';
  private readonly tokenKey = 'auth_token';
  private readonly roleKey = 'user_role';
  private readonly userNameKey = 'user_name';
  private readonly vendorIdKey = 'vendor_id';

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials, { observe: 'response' }).pipe(
      tap((response) => {
        this.persistAuthSession(response.body, response.headers);
      }),
      map((response) => response.body)
    );
  }

  loginVendor(userId: string, password: string): Observable<any> {
    const payload = {
      userId,
      password
    };
    return this.login(payload);
  }

  changeVendorPassword(userId: string, currentPassword: string, newPassword: string): Observable<any> {
    const payload = {
      userId,
      username: userId,
      currentPassword,
      oldPassword: currentPassword,
      newPassword,
      password: newPassword
    };

    return this.http.post(`${this.apiUrl}/change-password`, payload).pipe(
      catchError((primaryError) => {
        return this.http.post(`${this.apiUrl}/set-password`, payload).pipe(
          catchError(() => throwError(() => primaryError))
        );
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.userNameKey);
    localStorage.removeItem(this.vendorIdKey);
    window.location.href = '/role-selection';
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  getVendorId(): string | null {
    return localStorage.getItem(this.vendorIdKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isPasswordChangeRequiredResponse(res: any): boolean {
    const data = res?.data ?? res ?? {};
    const status = (res?.status ?? data?.status ?? '').toString().toUpperCase();
    const message = (res?.message ?? data?.message ?? '').toString().toUpperCase();
    const code = (res?.code ?? data?.code ?? '').toString().toUpperCase();

    return !!(
      data?.firstLogin ||
      data?.firstTimeLogin ||
      data?.isFirstLogin ||
      data?.passwordChangeRequired ||
      status.includes('PASSWORD_CHANGE') ||
      message.includes('PASSWORD_CHANGE') ||
      message.includes('CHANGE PASSWORD') ||
      code.includes('PASSWORD_CHANGE')
    );
  }

  private persistAuthSession(res: any, headers?: HttpHeaders): void {
    const data = res?.data ?? res?.result ?? res?.payload ?? res ?? {};
    const tokenFromBody =
      this.pickFirstValue(res, ['token', 'jwt', 'accessToken', 'authToken', 'bearerToken', 'o_token']) ||
      this.pickFirstValue(data, ['token', 'jwt', 'accessToken', 'authToken', 'bearerToken', 'o_token']);
    const tokenFromHeader =
      headers?.get('Authorization') ||
      headers?.get('authorization') ||
      headers?.get('X-Auth-Token') ||
      headers?.get('x-auth-token') ||
      headers?.get('Jwt-Token') ||
      headers?.get('jwt-token') ||
      '';
    const normalizedToken = this.normalizeToken(tokenFromBody || tokenFromHeader);
    if (!normalizedToken) {
      return;
    }

    const role =
      this.pickFirstValue(data, ['USER_ROLE', 'userRole', 'role']) || 'GPS_VENDOR';
    const userName =
      this.pickFirstValue(data, ['USERNAME', 'username', 'name', 'vendorName']) || '';
    const vendorId =
      this.pickFirstValue(data, ['vendorId', 'ssoid', 'ssoId', 'vendorID']) || '';

    localStorage.setItem(this.tokenKey, normalizedToken);
    localStorage.setItem(this.roleKey, role);
    localStorage.setItem(this.userNameKey, userName);
    if (vendorId) {
      localStorage.setItem(this.vendorIdKey, vendorId);
    }
  }

  private pickFirstValue(source: any, candidateKeys: string[]): string {
    for (const key of candidateKeys) {
      const value = this.findValueByKey(source, key);
      if (value !== null && value !== undefined && String(value).trim() !== '') {
        return String(value).trim();
      }
    }
    return '';
  }

  private findValueByKey(source: any, candidateKey: string): any {
    if (!source || typeof source !== 'object') {
      return undefined;
    }

    const target = candidateKey.toLowerCase().replace(/[^a-z0-9]/g, '');
    const queue: any[] = [source];
    const seen = new Set<any>();

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || typeof current !== 'object' || seen.has(current)) {
        continue;
      }
      seen.add(current);

      if (Array.isArray(current)) {
        queue.push(...current);
        continue;
      }

      for (const [key, value] of Object.entries(current)) {
        const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normalizedKey === target) {
          return value;
        }
        if (value && typeof value === 'object') {
          queue.push(value);
        }
      }
    }

    return undefined;
  }

  private normalizeToken(rawToken: string): string {
    const value = String(rawToken || '').trim();
    if (!value) {
      return '';
    }

    // Backend may return either raw JWT or "Bearer <JWT>".
    return value.replace(/^Bearer\s+/i, '').trim();
  }
}
