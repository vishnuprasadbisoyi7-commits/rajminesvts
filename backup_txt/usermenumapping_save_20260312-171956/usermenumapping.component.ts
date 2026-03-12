// user-menu-mapping.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { GlobalLink, UserMenuMappingService, UserSearchResult } from '../../services/usermenumapping.service';


@Component({
  selector: 'app-usermenumapping',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    
    <div class="tab-bar">
      <span class="tab active">User Menu Mapping</span>
    </div>

    <div class="mapping-body">
    
      <div class="top-row">
        <div class="field-col">
          <label class="field-label"
            >User Name <span class="req">*</span></label
          >
          <div class="typeahead-wrap">
            <input
              class="field-input"
              placeholder="Search user..."
              [(ngModel)]="userQuery"
              (input)="onUserSearch()"
              (blur)="hideUserDropdown()"
              autocomplete="off"
            />
            <ul class="dropdown" *ngIf="userResults.length && showUserDropdown">
              <li
                *ngFor="let u of userResults"
                (mousedown)="selectUser(u)"
                class="dropdown-item"
              >
                {{ u.name }}
              </li>
            </ul>
          </div>
        </div>

        <div class="field-col copy-col">
          <label class="field-label">Copy From</label>
          <div class="typeahead-wrap">
            <input
              class="field-input"
              placeholder="Search user..."
              [(ngModel)]="copyQuery"
              (input)="onCopySearch()"
              (blur)="hideCopyDropdown()"
              autocomplete="off"
            />
            <ul class="dropdown" *ngIf="copyResults.length && showCopyDropdown">
              <li
                *ngFor="let u of copyResults"
                (mousedown)="selectCopyUser(u)"
                class="dropdown-item"
              >
                {{ u.name }}
              </li>
            </ul>
          </div>
          <p class="copy-hint">
            Select a user to copy their assigned primary links into the list
            below.
          </p>
        </div>
      </div>


      <div class="links-section">
        <p class="links-label">Add Primary Links:</p>

        <div class="status-row" *ngIf="loadingLinks">Loading links...</div>
        <div class="status-row error" *ngIf="errorMessage">{{ errorMessage }}</div>

        <div class="link-tree">
          <div class="global-row" *ngFor="let g of globalLinks; let i = index">
            <!-- global link row -->
            <div class="row-line">
              <button
                class="arrow-btn"
                (click)="toggleExpand(g)"
                [attr.aria-label]="g.expanded ? 'Collapse' : 'Expand'"
              >
                <svg
                  class="arrow-icon"
                  [class.open]="g.expanded"
                  viewBox="0 0 24 24"
                  width="11"
                  height="11"
                >
                  <path
                    d="M9 18l6-6-6-6"
                    stroke="currentColor"
                    stroke-width="2.5"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>

              <label class="cb-label">
                <input
                  type="checkbox"
                  class="cb"
                  [checked]="g.checked"
                  [indeterminate]="g.indeterminate"
                  (change)="toggleGlobal(g)"
                />
                <span class="cb-box"></span>
                <span
                  class="cb-text"
                  [class.bold]="g.checked || g.indeterminate"
                >
                  {{ g.name }}
                </span>
                <span class="route-text" *ngIf="g.route">{{ g.route }}</span>
              </label>
            </div>

            <!-- primary links (children) --> 
            <div class="children" *ngIf="g.expanded">
              <div class="child-row" *ngFor="let p of g.primaryLinks">
                <label class="cb-label child-label">
                  <input
                    type="checkbox"
                    class="cb"
                    [checked]="p.checked"
                    (change)="togglePrimary(g, p)"
                  />
                  <span class="cb-box teal-box"></span>
                  <span class="cb-text child-text">{{ p.name }}</span>
                  <span class="route-text" *ngIf="p.route">{{ p.route }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Actions ──────────────────────────────────────────────────── -->
      <div class="actions">
        <button class="btn-save" (click)="save()" [disabled]="saving">
          <span *ngIf="!saving">Save</span>
          <span *ngIf="saving" class="spinner"></span>
        </button>
        <button class="btn-reset" (click)="reset()">Reset</button>
        <span class="success-msg" *ngIf="saved">✓ Saved successfully</span>
      </div>
    </div>
  `,
  styles: [
    `
      /* ── Host ──────────────────────────────────────────────────────────── */
      :host {
        display: block;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 14px;
        color: #333;
        background: #fff;
      }

      /* ── Tab bar ────────────────────────────────────────────────────────── */
      .tab-bar {
        border-bottom: 2px solid #e0e0e0;
        padding: 0 24px;
        margin-bottom: 0;
      }
      .tab {
        display: inline-block;
        padding: 12px 4px;
        font-size: 14px;
        font-weight: 600;
        color: #999;
        cursor: pointer;
        border-bottom: 3px solid transparent;
        margin-bottom: -2px;
      }
      .tab.active {
        color: #00838f;
        border-bottom-color: #00838f;
      }

      /* ── Body ───────────────────────────────────────────────────────────── */
      .mapping-body {
        padding: 24px 28px 28px;
      }

      /* ── Top row ────────────────────────────────────────────────────────── */
      .top-row {
        display: flex;
        gap: 100px;
        align-items: flex-start;
        margin-bottom: 28px;
      }
      .field-col {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 260px;
      }
      .copy-col {
        flex: 1;
        max-width: 400px;
      }

      .field-label {
        font-size: 13px;
        font-weight: 500;
        color: #444;
      }
      .req {
        color: #e53935;
      }

      .field-input {
        height: 34px;
        padding: 0 10px;
        border: 1px solid #ccc;
        border-radius: 3px;
        font-size: 13px;
        color: #333;
        outline: none;
        background: #fafafa;
        width: 100%;
        box-sizing: border-box;
        transition: border-color 0.15s;
      }
      .field-input:focus {
        border-color: #00838f;
        background: #fff;
      }
      .field-input[readonly] {
        background: #f5f5f5;
        cursor: default;
      }

      .copy-hint {
        font-size: 12px;
        color: #777;
        margin: 4px 0 0;
        line-height: 1.5;
      }

      /* ── Typeahead ──────────────────────────────────────────────────────── */
      .typeahead-wrap {
        position: relative;
      }
      .dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #fff;
        border: 1px solid #ccc;
        border-top: none;
        border-radius: 0 0 4px 4px;
        list-style: none;
        margin: 0;
        padding: 0;
        z-index: 100;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
        max-height: 180px;
        overflow-y: auto;
      }
      .dropdown-item {
        padding: 7px 12px;
        font-size: 13px;
        cursor: pointer;
        color: #333;
      }
      .dropdown-item:hover {
        background: #e0f7f8;
      }

      /* ── Links section ──────────────────────────────────────────────────── */
      .links-section {
        margin-top: 4px;
      }
      .links-label {
        font-size: 13.5px;
        font-weight: 600;
        color: #444;
        margin: 0 0 14px;
      }
      .status-row {
        font-size: 12.5px;
        color: #666;
        margin: -6px 0 10px;
      }
      .status-row.error {
        color: #c62828;
      }

      /* ── Tree ───────────────────────────────────────────────────────────── */
      .link-tree {
        display: flex;
        flex-direction: column;
      }
      .global-row {
        border-bottom: 1px solid #f2f2f2;
        &:last-child {
          border-bottom: none;
        }
      }
      .row-line {
        display: flex;
        align-items: center;
        padding: 7px 0;
        gap: 4px;
      }

      /* ── Arrow button ───────────────────────────────────────────────────── */
      .arrow-btn {
        width: 22px;
        height: 22px;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #777;
        flex-shrink: 0;
        border-radius: 3px;
        transition: background 0.12s;
      }
      .arrow-btn:hover {
        background: #f0f0f0;
      }
      .arrow-icon {
        transition: transform 0.18s ease;
        transform: rotate(0deg);
      }
      .arrow-icon.open {
        transform: rotate(90deg);
      }

      /* ── Checkbox label ─────────────────────────────────────────────────── */
      .cb-label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        user-select: none;
      }
      .cb {
        display: none;
      } /* hide native */

      /* custom checkbox box */
      .cb-box {
        width: 15px;
        height: 15px;
        border: 2px solid #aaa;
        border-radius: 2px;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition:
          border-color 0.12s,
          background 0.12s;
        position: relative;
      }

      /* checked state */
      .cb:checked ~ .cb-box {
        border-color: #1565c0;
        background: #1565c0;
      }
      .cb:checked ~ .cb-box::after {
        content: '';
        width: 4px;
        height: 7px;
        border: 2px solid #fff;
        border-top: none;
        border-left: none;
        transform: rotate(45deg) translate(-1px, -1px);
        display: block;
      }

      /* indeterminate */
      .cb:indeterminate ~ .cb-box {
        border-color: #1565c0;
        background: #1565c0;
      }
      .cb:indeterminate ~ .cb-box::after {
        content: '';
        width: 8px;
        height: 2px;
        background: #fff;
        display: block;
        border-radius: 1px;
      }

      /* teal checkbox for primary links */
      .cb:checked ~ .teal-box {
        border-color: #00838f;
        background: #00838f;
      }
      .cb:checked ~ .teal-box::after {
        content: '';
        width: 4px;
        height: 7px;
        border: 2px solid #fff;
        border-top: none;
        border-left: none;
        transform: rotate(45deg) translate(-1px, -1px);
        display: block;
      }

      .cb-text {
        font-size: 13.5px;
        color: #333;
      }
      .route-text {
        font-size: 12px;
        color: #7a7a7a;
        margin-left: 6px;
      }
      .cb-text.bold {
        font-weight: 600;
      }

      /* ── Children ───────────────────────────────────────────────────────── */
      .children {
        padding: 2px 0 6px 52px;
        animation: fadeIn 0.15s ease;
      }
      .child-row {
        padding: 5px 0;
      }
      .child-label {
        gap: 8px;
      }
      .child-text {
        font-size: 13px;
        color: #00838f;
        font-weight: 500;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-3px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* ── Actions ────────────────────────────────────────────────────────── */
      .actions {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 24px;
        padding-top: 18px;
        border-top: 1px solid #eee;
      }
      .btn-save {
        background: #00838f;
        color: #fff;
        border: none;
        border-radius: 4px;
        padding: 8px 30px;
        font-size: 13.5px;
        font-weight: 600;
        cursor: pointer;
        min-width: 80px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s;
      }
      .btn-save:hover:not(:disabled) {
        background: #006064;
      }
      .btn-save:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-reset {
        background: #fff;
        color: #555;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 7px 22px;
        font-size: 13.5px;
        font-weight: 500;
        cursor: pointer;
        height: 34px;
        transition: border-color 0.15s;
      }
      .btn-reset:hover {
        border-color: #00838f;
        color: #00838f;
      }

      .success-msg {
        font-size: 13px;
        color: #2e7d32;
        font-weight: 500;
      }

      .spinner {
        width: 15px;
        height: 15px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.65s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* ── Responsive ─────────────────────────────────────────────────────── */
      @media (max-width: 640px) {
        .top-row {
          flex-direction: column;
          gap: 18px;
        }
        .copy-col {
          max-width: 100%;
        }
        .mapping-body {
          padding: 16px;
        }
      }
    `,
  ],
})
export class UsermenumappingComponent implements OnInit {
  userName = '';
  userQuery = '';
  userResults: UserSearchResult[] = [];
  showUserDropdown = false;
  globalLinks: GlobalLink[] = [];

  copyQuery = '';
  copyResults: UserSearchResult[] = [];
  showCopyDropdown = false;

  saving = false;
  saved = false;
  loadingLinks = false;
  copying = false;
  errorMessage = '';

  private userId = 1;
  private userSearchTimer?: ReturnType<typeof setTimeout>;
  private copySearchTimer?: ReturnType<typeof setTimeout>;

  constructor(private svc: UserMenuMappingService) {}

  ngOnInit(): void {
    const storedId =
      sessionStorage.getItem('adminUserId') ||
      sessionStorage.getItem('vendorUserId') ||
      '';
    const parsed = Number(storedId);
    if (Number.isFinite(parsed) && parsed > 0) {
      this.userId = parsed;
      this.userName = `User ${parsed}`;
      this.userQuery = this.userName;
      this.loadLinksForUser(this.userId);
      return;
    }

    this.userId = 1;
    this.userName = 'User 1';
    this.userQuery = this.userName;
    this.loadLinksForUser(this.userId);
  }

  // ── Expand / Collapse ───────────────────────────────────────────────────
  toggleExpand(g: GlobalLink): void {
    g.expanded = !g.expanded;
  }

  // ── Toggle global (parent) checkbox ────────────────────────────────────
  toggleGlobal(g: GlobalLink): void {
    g.checked = !g.checked;
    g.indeterminate = false;
    g.primaryLinks.forEach((p) => (p.checked = g.checked));
    if (g.checked) g.expanded = true;
  }

  // ── Toggle primary (child) checkbox ────────────────────────────────────
  togglePrimary(g: GlobalLink, p: { checked: boolean }): void {
    p.checked = !p.checked;
    this.syncParent(g);
  }

  private syncParent(g: GlobalLink): void {
    const total = g.primaryLinks.length;
    const checked = g.primaryLinks.filter((p) => p.checked).length;
    g.checked = checked === total && total > 0;
    g.indeterminate = checked > 0 && checked < total;
  }

  private loadLinksForUser(userId: number): void {
    this.loadingLinks = true;
    this.errorMessage = '';
    this.svc
      .getUserLinks(userId)
      .pipe(finalize(() => (this.loadingLinks = false)))
      .subscribe({
        next: (links) => {
          this.globalLinks = links;
        },
        error: () => {
          this.globalLinks = [];
          this.errorMessage = 'Failed to load user menu links.';
        }
      });
  }

  // User selection
  onUserSearch(): void {
    const query = this.userQuery.trim();
    if (query.length < 1) {
      this.userResults = [];
      this.showUserDropdown = false;
      return;
    }

    if (this.userSearchTimer) {
      clearTimeout(this.userSearchTimer);
    }
    this.userSearchTimer = setTimeout(() => {
      this.svc.searchUsers(query).subscribe({
        next: (results) => {
          this.userResults = results;
          this.showUserDropdown = results.length > 0;
        },
        error: () => {
          this.userResults = [];
          this.showUserDropdown = false;
          this.errorMessage = 'Failed to search users.';
        }
      });
    }, 250);
  }

  selectUser(u: UserSearchResult): void {
    this.userId = u.id;
    this.userName = u.name;
    this.userQuery = u.name;
    this.showUserDropdown = false;
    this.loadLinksForUser(this.userId);
  }

  hideUserDropdown(): void {
    setTimeout(() => (this.showUserDropdown = false), 180);
  }

  // ── Copy from another user ──────────────────────────────────────────────
  onCopySearch(): void {
    const query = this.copyQuery.trim();
    if (query.length < 1) {
      this.copyResults = [];
      this.showCopyDropdown = false;
      return;
    }

    if (this.copySearchTimer) {
      clearTimeout(this.copySearchTimer);
    }
    this.copySearchTimer = setTimeout(() => {
      this.svc.searchUsers(query).subscribe({
        next: (results) => {
          this.copyResults = results;
          this.showCopyDropdown = results.length > 0;
        },
        error: () => {
          this.copyResults = [];
          this.showCopyDropdown = false;
          this.errorMessage = 'Failed to search users for copy.';
        }
      });
    }, 250);
  }

  selectCopyUser(u: UserSearchResult): void {
    this.copyQuery = u.name;
    this.showCopyDropdown = false;
    this.copying = true;
    this.errorMessage = '';

    this.svc
      .copyMappings(u.id, this.userId)
      .pipe(finalize(() => (this.copying = false)))
      .subscribe({
        next: () => this.loadLinksForUser(this.userId),
        error: () => {
          this.errorMessage = 'Failed to copy user menu mappings.';
        }
      });
  }

  hideCopyDropdown(): void {
    setTimeout(() => (this.showCopyDropdown = false), 180);
  }

  // ── Save ────────────────────────────────────────────────────────────────
  save(): void {
    this.saving = true;
    const ids = this.svc.collectCheckedIds(this.globalLinks);
    this.svc
      .saveMappings(this.userId, ids)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.saved = true;
          setTimeout(() => (this.saved = false), 3000);
        },
        error: () => {
          this.errorMessage = 'Failed to save user menu mappings.';
        }
      });
  }

  // ── Reset ───────────────────────────────────────────────────────────────
  reset(): void {
    this.copyQuery = '';
    this.loadLinksForUser(this.userId);
  }
}
