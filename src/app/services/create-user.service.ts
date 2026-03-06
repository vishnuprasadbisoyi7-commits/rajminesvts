import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface GroupListItem {
  group_id: number;
  group_name: string;
  created_date?: string;
  updated_date?: string;
}

export interface GroupListResponse {
  '#result-set-1'?: GroupListItem[];
  '#update-count-1'?: number;
}

export interface CreateUserPayload {
  groupname: string;
  fullname: string;
  username: string;
  mobileno: string;
  email: string;
  role: string;
  isActive: string;
}

export interface CreateUserResultRow {
  status: string;
  user_id?: number;
}

export interface CreateUserResponse {
  '#result-set-1'?: CreateUserResultRow[];
  '#update-count-1'?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CreateUserService {
  private readonly groupApiUrl = 'http://localhost:8089/api/group';
  private readonly adminApiUrl = 'http://localhost:8089/api/admin';

  constructor(private http: HttpClient) {}

  getGroups(): Observable<GroupListResponse> {
    return this.http.get<GroupListResponse>(`${this.groupApiUrl}/get`);
  }

  createUser(payload: CreateUserPayload): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(`${this.adminApiUrl}/createuser`, payload);
  }
}
