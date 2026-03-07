import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrimaryLinkService {
  getAll() {
    throw new Error('Method not implemented.');
  }

  //  Match your Spring Boot controller
  private baseUrl = 'http://localhost:8089/api/primary';

  constructor(private http: HttpClient) {}

  // SAVE   
  savePrimaryLink(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/save`, data);
  }

  // GET ALL
  getAllPrimaryLinks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/all`);
  }

  // ================= GLOBAL LINK DROPDOWN =================
  getActiveGlobals() {
  return this.http.get<any[]>(`${this.baseUrl}/dropdown/globals`);
  }

  // ================= FUNCTION MASTER DROPDOWN =================
  getFunctionDropdown(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dropdown/functions`);
  }
}
