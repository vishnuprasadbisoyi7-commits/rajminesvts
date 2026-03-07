import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FunctionMaster {
  id?: number;
  functionName: string;
  functionUrl: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class FunctionMasterService {

  private baseUrl = 'http://localhost:8089/api/function';

  constructor(private http: HttpClient) {}

  // Save Function
  saveFunction(data: FunctionMaster): Observable<FunctionMaster> {
    return this.http.post<FunctionMaster>(`${this.baseUrl}/save`, data);
  }

  // Get All Functions
  getAllFunctions(): Observable<FunctionMaster[]> {
    return this.http.get<FunctionMaster[]>(`${this.baseUrl}/all`);
  }
}
