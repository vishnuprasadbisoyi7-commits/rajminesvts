import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface GroupSavePayload {
  groupName: string;
}

export interface GroupSaveResultRow {
  status: string;
  message: string;
  group_id?: number;
}

export interface GroupSaveResponse {
  '#result-set-1'?: GroupSaveResultRow[];
  '#update-count-1'?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private readonly apiUrl = 'http://localhost:8089/api/group';

  constructor(private http: HttpClient) {}

  createGroup(payload: GroupSavePayload): Observable<GroupSaveResponse> {
    return this.http.post<GroupSaveResponse>(`${this.apiUrl}/save`, payload);
  }
}
