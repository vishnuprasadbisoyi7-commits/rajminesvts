import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { PrimaryLinkService } from '../../services/primary-link.service';


@Component({
  selector: 'app-primary-link',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `

  <!-- Page Title -->
  <div class="card">
    <h2>Primary Link Registration</h2>
    <small>Add and manage primary links</small>
  </div>

  <div class="card">

    <div class="tabs">
      <div class="tab"
           [class.active]="activeTab === 'add'"
           (click)="setTab('add')">Add</div>

      <div class="tab"
           [class.active]="activeTab === 'view'"
           (click)="setTab('view')">View</div>
    </div>

    <!-- ================= ADD TAB ================= -->
    <div *ngIf="activeTab === 'add'">

      <form #primaryForm="ngForm">

        <div class="form-row">
          <label>Global Link *</label>
          <select name="globalLink"
        [(ngModel)]="primaryLinkData.globalLink.globalId"
        required>

  <option [ngValue]="null">Select Global</option>
  <option *ngFor="let g of globalLinks" [ngValue]="g.globalId">
    {{ g.globalName }}
  </option>

</select>


        </div>

        <div class="form-row">
          <label>Function Master *</label>
          <select name="functionMaster"
        [(ngModel)]="primaryLinkData.functionMaster.functionId"
        required>
  <option [ngValue]="null">Select Function</option>
  <option *ngFor="let f of functionMasters" [ngValue]="f.functionId">
    {{ f.functionName }}
  </option>
</select>

        </div>

        <div class="form-row">
          <label>Primary Link Name *</label>
          <input type="text"
                 name="primaryLinkName"
                 [(ngModel)]="primaryLinkData.primaryName"
                 required />
        </div>

        <div class="form-row">
          <label>Description</label>
          <textarea name="description"
                    [(ngModel)]="primaryLinkData.description"></textarea>
        </div>

        <div class="form-row">
          <label>Order By *</label>
          <input type="number"
                 name="orderBy"
                 [(ngModel)]="primaryLinkData.orderNo"
                 required />
        </div>

        <div style="margin-top:15px;">
          <button type="button"
                  class="btn"
                  (click)="savePrimaryLink(primaryForm)">
            Submit
          </button>

          <button type="button"
                  class="btn ghost"
                  (click)="clearForm(primaryForm)">
            Clear
          </button>
        </div>

      </form>

    </div>

    <!-- ================= VIEW TAB ================= -->
    <div *ngIf="activeTab === 'view'">

      <table class="table" *ngIf="primaryLinkList.length > 0">
        <thead>
          <tr>
            <th>Global Link</th>
            <th>Function Master</th>
            <th>Primary Link</th>
            <th>Description</th>
            <th>Order</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr *ngFor="let item of primaryLinkList">
            <td>{{ item.globalLink?.globalName }}</td>
<td>{{ item.functionMaster?.functionName }}</td>
<td>{{ item.primaryName }}</td>

<td>{{ item.description }}</td>
<td>{{ item.orderNo }}</td>

            <td>
              <span [class]="item.status === 'A' ? 'status-active' : 'status-inactive'">
                {{ item.status === 'A' ? 'Active' : 'Inactive' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="primaryLinkList.length === 0" class="empty">
        No Primary Links Created Yet
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
export class PrimaryLinkComponent implements OnInit {
globalLink: any;


  
clearForm(_t70: NgForm) {
throw new Error('Method not implemented.');
}

  private baseUrl = 'http://localhost:8089/api/primary';

  activeTab = 'add';


  globalLinks: any[] = [];
  functionMasters: any[] = [];
  primaryLinkList: any[] = [];

 primaryLinkData: any = {
  globalLink: { globalId: null },
  functionMaster: { functionId: null },
  primaryName: '',
  description: '',
  orderNo: null,
  status: 'A'
};

 // primaryLinkService: any;

  constructor(private http: HttpClient, private primaryLinkService: PrimaryLinkService) {}
 


  ngOnInit(): void {
    this.loadDropdowns();
    this.loadPrimaryLinks();

  }

  loadDropdowns() {

  this.http.get<any[]>(`${this.baseUrl}/dropdown/globals`)
    .subscribe({
      next: (data) => {
        console.log("Globals API Data:", data);
        this.globalLinks = data;
      },
      error: (err) => {
        console.error("Globals API Error:", err);
      }
    });

  this.http.get<any[]>(`${this.baseUrl}/dropdown/functions`)
    .subscribe({
      next: (data) => {
        console.log("Functions API Data:", data);
        this.functionMasters = data;
      },
      error: (err) => {
        console.error("Functions API Error:", err);
      }
    });

}

  loadPrimaryLinks() {
    this.http.get<any[]>(`${this.baseUrl}/all`)
      .subscribe(data => this.primaryLinkList = data);
  }

  setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'view') {
      this.loadPrimaryLinks();
    }
  }

  savePrimaryLink(form: NgForm) {

  if (!form.valid) {
    Swal.fire('Validation Error', 'Please fill all required fields', 'warning');
    return;
  }

  this.primaryLinkService.savePrimaryLink(this.primaryLinkData)
    .subscribe({
      next: () => {
        Swal.fire('Success', 'Primary Link Saved Successfully', 'success');
        form.resetForm();
        this.setTab('view');
      },
      error: (err: any) => {
        console.error("Backend Error:", err);
        Swal.fire('Error', 'Failed to save data', 'error');
      }
    });
}
}