// user-menu-mapping.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface PrimaryLink {
  id: number;
  name: string;
  checked: boolean;
  route?: string | null;
}

export interface GlobalLink {
  id: number;
  name: string;
  checked: boolean;
  expanded: boolean;
  indeterminate: boolean;
  route?: string | null;
  primaryLinks: PrimaryLink[];
}

export interface UserSearchResult {
  id: number;
  name: string;
  username?: string;
  email?: string;
  displayName?: string;
}

interface ApiMenuNode {
  checked: boolean;
  children: ApiMenuNode[];
  global: boolean;
  icon: string | null;
  id: number;
  name: string;
  route: string;
}

interface ApiUser {
  id: number;
  username: string;
  displayName: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UserMenuMappingService {
  private readonly baseUrl = 'http://localhost:8089/api/user-menu-mapping';

  constructor(private http: HttpClient) {}

  getUserLinks(userId: number): Observable<GlobalLink[]> {
    return this.http
      .get<ApiMenuNode[]>(`${this.baseUrl}/links/${userId}`)
      .pipe(map((nodes) => this.normalizeTree(nodes.map((node) => this.mapGlobal(node)))));
  }

  getSidebarLinks(userId: number): Observable<GlobalLink[]> {
    return this.http
      .get<ApiMenuNode[]>(`${this.baseUrl}/sidebar/${userId}`)
      .pipe(map((nodes) => this.normalizeTree(nodes.map((node) => this.mapGlobal(node)))));
  }

  searchUsers(query: string): Observable<UserSearchResult[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<ApiUser[]>(`${this.baseUrl}/users/search`, { params }).pipe(
      map((users) =>
        users.map((u) => {
          const baseName = (u.displayName || u.username || '').trim();
          const name =
            u.email && baseName ? `${baseName} (${u.email})` : baseName || u.email || `User ${u.id}`;
          return {
            id: u.id,
            name,
            username: u.username,
            displayName: u.displayName,
            email: u.email
          };
        })
      )
    );
  }

  copyMappings(fromUserId: number, toUserId: number): Observable<void> {
    const params = new HttpParams()
      .set('fromUserId', String(fromUserId))
      .set('toUserId', String(toUserId));
    return this.http.post<void>(`${this.baseUrl}/copy`, null, { params });
  }

  // Collect all checked IDs (global + primary) for saving
  collectCheckedIds(links: GlobalLink[]): number[] {
    const ids: number[] = [];
    links.forEach((g) => {
      if (g.checked || g.indeterminate) ids.push(g.id);
      g.primaryLinks.forEach((p) => {
        if (p.checked) ids.push(p.id);
      });
    });
    return ids;
  }

  saveMappings(userId: number, selectedIds: number[]): Observable<void> {
    const payload = {
      userId,
      selectedLinkIds: selectedIds
    };
    return this.http.post<void>(`${this.baseUrl}/save`, payload);
  }

  private mapGlobal(node: ApiMenuNode): GlobalLink {
    return {
      id: node.id,
      name: node.name,
      checked: node.checked,
      expanded: false,
      indeterminate: false,
      route: node.route,
      primaryLinks: (node.children || []).map((child) => ({
        id: child.id,
        name: child.name,
        checked: child.checked,
        route: child.route
      }))
    };
  }

  private normalizeTree(links: GlobalLink[]): GlobalLink[] {
    return links.map((g) => {
      const children = g.primaryLinks.map((p) => ({ ...p }));
      const total = children.length;
      const checkedCount = children.filter((p) => p.checked).length;
      const allChecked = total > 0 && checkedCount === total;
      const anyChecked = checkedCount > 0;
      const checked = g.checked || allChecked;
      const indeterminate = (checked && !allChecked) || (!checked && anyChecked);

      return {
        ...g,
        primaryLinks: children,
        checked,
        indeterminate,
        expanded: anyChecked || checked
      };
    });
  }
}
