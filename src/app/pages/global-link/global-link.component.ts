import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { GlobalLinkService } from '../../services/global-link.service';


@Component({
  selector: 'app-global-link',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `

  <!-- Page Title -->
  <div class="card">
    <h2>Global Link Master</h2>
    <small>Register and manage global links</small>
  </div>

  <div class="card">

    <!-- Tabs -->
    <div class="tabs">
      <div class="tab"
           [class.active]="activeTab === 'add'"
           (click)="setTab('add')">
        Register
      </div>

      <div class="tab"
           [class.active]="activeTab === 'view'"
           (click)="setTab('view')">
        View
      </div>
    </div>

    <!-- ================= REGISTER TAB ================= -->
    <div *ngIf="activeTab === 'add'">

      <form #glForm="ngForm">

        <div class="form-row">
          <label>Global Link Name *</label>
          <input type="text"
                 name="globalName"
                 [(ngModel)]="globalLinkData.globalName"
                 required />
        </div>

        <div class="form-row">
          <label>Description *</label>
          <textarea name="description"
                    [(ngModel)]="globalLinkData.description"
                    required></textarea>
        </div>

        <div class="form-row">
          <label>Order No *</label>
          <input type="number"
                 name="orderNo"
                 [(ngModel)]="globalLinkData.orderNo"
                 required />
        </div>

        <div class="form-row">
          <label>Status *</label>
          <select name="status"
                  [(ngModel)]="globalLinkData.status"
                  required>
            <option value="A">Active</option>
            <option value="I">Inactive</option>
          </select>
        </div>

        <div style="margin-top:15px;">
          <button type="button"
                  class="btn"
                  (click)="saveGlobalLink(glForm)">
            Submit
          </button>

          <button type="button"
                  class="btn ghost"
                  (click)="clearForm(glForm)">
            Clear
          </button>
        </div>

      </form>

    </div>

    <!-- ================= VIEW TAB ================= -->
    <div *ngIf="activeTab === 'view'">

      <table class="table" *ngIf="globalLinkList.length > 0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Order</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr *ngFor="let link of globalLinkList">
            <td>{{ link.globalName }}</td>
            <td>{{ link.description }}</td>
            <td>{{ link.orderNo }}</td>
            <td>
              <span [class]="link.status === 'A' ? 'status-active' : 'status-inactive'">
                {{ link.status === 'A' ? 'Active' : 'Inactive' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="globalLinkList.length === 0" class="empty">
        No Global Links Created Yet
      </div>

    </div>

  </div>
  `,
  styles: [`
    .card { background:#fff;padding:20px;border-radius:8px;margin-bottom:15px;box-shadow:0 2px 6px rgba(0,0,0,0.1);}
    .tabs { display:flex; gap:15px; margin-bottom:20px; }
    .tab { cursor:pointer; padding:8px 15px; border-radius:4px; }
    .tab.active { background:#008080; color:#fff; }
    .form-row { margin-bottom:15px; display:flex; flex-direction:column; }
    input, select, textarea { padding:8px;border:1px solid #ccc;border-radius:4px;}
    .btn { background:#008080;color:white;padding:8px 15px;border:none;border-radius:4px;cursor:pointer;margin-right:10px;}
    .btn.ghost { background:#ccc;color:black; }
    .table { width:100%; border-collapse:collapse;}
    .table th, .table td { border:1px solid #ddd;padding:8px;}
    .table th { background:#f4f4f4;}
    .status-active { color:green;font-weight:600; }
    .status-inactive { color:red;font-weight:600; }
    .empty { text-align:center;padding:30px;color:#777; }
  `]
})
export class GlobalLinkComponent implements OnInit {

  private baseUrl = 'http://localhost:8089/api/global';

  activeTab = 'add';

  globalLinkList: any[] = [];

  globalLinkData: any = {
    globalName: '',
    description: '',
    orderNo: null,
    status: 'A'
  };

 constructor(private globalLinkService: GlobalLinkService) {}


  ngOnInit(): void {
    this.loadGlobalLinks();
  }

  setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'view') {
      this.loadGlobalLinks();
    }
  }

  loadGlobalLinks() {
    this.globalLinkService.getAllGlobalLinks()
  .subscribe({
    next: (data) => this.globalLinkList = data,
    error: (err) => {
      console.error(err);
      Swal.fire('Error', 'Failed to load data', 'error');
    }
  });

  }

  saveGlobalLink(form: NgForm) {

    if (!form.valid) {
      Swal.fire('Validation Error', 'Please fill all required fields', 'warning');
      return;
    }
this.globalLinkService.saveGlobalLink(this.globalLinkData)
  .subscribe({
    next: () => {
      Swal.fire('Success', 'Global Link Saved Successfully', 'success');
      form.resetForm({ status: 'A' });
      this.setTab('view');
    },
    error: (err) => {
      console.error(err);
      Swal.fire('Error', 'Failed to save data', 'error');
    }
  });

  }

  clearForm(form: NgForm) {
    form.resetForm({ status: 'A' });
  }

}
