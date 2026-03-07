import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalLinkService {

  private baseUrl = 'http://localhost:8089/api/global';

  constructor(private http: HttpClient) {}

  // ✅ Save Global Link
  saveGlobalLink(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/save`, data);
  }

  // ✅ Get All Global Links
  getAllGlobalLinks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/list`);
  }

}
