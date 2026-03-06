import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  

  private baseUrl = 'http://localhost:8089/api/device'; // change if needed

  constructor(private http: HttpClient) {}

  registerDevice(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, payload);
  }

  listDevices(): Observable<any> {
    return this.http.get(`${this.baseUrl}/list`);
  }

   getVendors() {
    return this.http.get<any>(`http://localhost:8089/api/vendor/list`);
  }

}
