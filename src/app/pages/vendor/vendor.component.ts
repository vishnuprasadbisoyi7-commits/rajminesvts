import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../services/translation.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vendor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="page-title">{{ translate('vendor.title') }}</div>
      <div class="small">{{ translate('vendor.subtitle') }}</div>
    </div>

    <div class="card">
      <div class="tabs">
        <div class="tab" [class.active]="activeTab === 'list'" (click)="setActiveTab('list')">View Vendor List</div>
      </div>

      <div id="vendor-list" class="tab-content" [class.active]="activeTab === 'list'">
        <div *ngIf="vendorsList.length > 0">
          <table class="table">
            <thead>
              <tr>
                <th>Vendor ID</th>
                <th>{{ translate('vendor.vendorOrgName') }}</th>
                <th>{{ translate('vendor.email') }}</th>
                <th>{{ translate('vendor.mobileNo') }}</th>
                <th>{{ translate('vendor.gst') }}</th>
                <th>{{ translate('vendor.pan') }}</th>
                <th>{{ translate('common.status') }}</th>
                <th>{{ translate('common.action') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let vendor of vendorsList; let i = index">
                <td><strong>{{ vendor.vendorId || 'N/A' }}</strong></td>
                <td>{{ vendor.vendorName || 'N/A' }}</td>
                <td>{{ vendor.email || 'N/A' }}</td>
                <td>{{ vendor.mobile || vendor.contact || 'N/A' }}</td>
                <td>{{ vendor.gst || 'N/A' }}</td>
                <td>{{ vendor.pan || 'N/A' }}</td>
                <td>
                  <span [class]="vendor.status === 'active' ? 'status-active' : 'status-inactive'">
                    {{ vendor.status === 'active' ? translate('common.active') : translate('common.inactive') }}
                  </span>
                </td>
                <td>
                  <button 
                    class="btn ghost" 
                    style="padding:4px 8px;font-size:12px;margin-right:4px;" 
                    (click)="viewVendorDetails(vendor)">
                    View
                  </button>
                  <button 
                    *ngIf="userRole === 'system-admin'"
                    class="btn ghost" 
                    style="padding:4px 8px;font-size:12px;" 
                    (click)="toggleVendorStatus(i)">
                    {{ vendor.status === 'active' ? translate('device.deactivate') : translate('device.activate') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div *ngIf="vendorsList.length === 0" style="text-align:center;padding:40px;color:#6b7280;">
          <div style="font-size:18px;margin-bottom:8px;">No Vendors Found</div>
          <div class="small">No vendors have been registered yet.</div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class VendorComponent implements OnInit, OnDestroy {
  activeTab = 'list';
  userRole = '';
  vendorsList: Array<{
    vendorId?: string;
    vendorName?: string;
    email?: string;
    mobile?: string;
    contact?: string;
    gst?: string;
    pan?: string;
    status?: string;
    ssoId?: string;
    registrationDate?: string;
    [key: string]: any;
  }> = [];
  private languageSubscription?: Subscription;

  constructor(private translationService: TranslationService) {}

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  ngOnInit(): void {
    // Subscribe to language changes
    this.languageSubscription = this.translationService.language$.subscribe(() => {
      // Component will automatically update when language changes
    });

    // Get user role
    this.userRole = sessionStorage.getItem('role') || '';
    
    // Load vendors list
    this.loadVendorsList();
    
    // Set active tab
    this.activeTab = 'list';
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab; 
  }

  loadVendorsList(): void {
    // Load vendors from sessionStorage
    // In production, this would be an API call
    const storedVendors = sessionStorage.getItem('vendors_list');
    
    if (storedVendors) {
      try {
        this.vendorsList = JSON.parse(storedVendors);
      } catch (e) {
        console.error('Error parsing vendors list:', e);
        this.vendorsList = [];
      }
    } else {
      // Check for individual vendor data (from registration)
      const vendorData = sessionStorage.getItem('vendorData');
      if (vendorData) {
        try {
          const data = JSON.parse(vendorData);
          this.vendorsList = [data];
        } catch (e) {
          console.error('Error parsing vendor data:', e);
        }
      }
      
      // Add sample vendors if list is empty
      if (this.vendorsList.length === 0) {
        this.addSampleVendors();
      }
    }
  }

  addSampleVendors(): void {
    // Add sample vendors for demonstration
    this.vendorsList = [
      {
        vendorId: 'VEN-001',
        vendorName: 'TrackPro Pvt Ltd',
        email: 'info@trackpro.in',
        mobile: '9876543210',
        gst: '29ABCDE1234F1Z5',
        pan: 'ABCDE1234F',
        status: 'active',
        registrationDate: new Date().toISOString()
      },
      {
        vendorId: 'VEN-002',
        vendorName: 'SmartTrack Solutions',
        email: 'admin@smarttrack.com',
        mobile: '9090909090',
        gst: '29FGHIJ5678K2Z6',
        pan: 'FGHIJ5678K',
        status: 'inactive',
        registrationDate: new Date().toISOString()
      }
    ];
    this.saveVendorsList();
  }

  saveVendorsList(): void {
    sessionStorage.setItem('vendors_list', JSON.stringify(this.vendorsList));
  }

  viewVendorDetails(vendor: any): void {
    Swal.fire({
      icon: 'info',
      title: vendor.vendorName || 'Vendor Details',
      html: `
        <div style="text-align:left;">
          <p><strong>Vendor ID:</strong> ${vendor.vendorId || 'N/A'}</p>
          <p><strong>Email:</strong> ${vendor.email || 'N/A'}</p>
          <p><strong>Mobile:</strong> ${vendor.mobile || vendor.contact || 'N/A'}</p>
          <p><strong>GST:</strong> ${vendor.gst || 'N/A'}</p>
          <p><strong>PAN:</strong> ${vendor.pan || 'N/A'}</p>
          <p><strong>SSO ID:</strong> ${vendor.ssoId || 'N/A'}</p>
          <p><strong>Status:</strong> ${vendor.status || 'N/A'}</p>
          <p><strong>Registration Date:</strong> ${vendor.registrationDate ? new Date(vendor.registrationDate).toLocaleDateString() : 'N/A'}</p>
        </div>
      `,
      confirmButtonColor: '#2563eb',
      width: '500px'
    });
  }

  toggleVendorStatus(index: number): void {
    const vendor = this.vendorsList[index];
    const newStatus = vendor.status === 'active' ? 'inactive' : 'active';
    this.vendorsList[index].status = newStatus;
    this.saveVendorsList();
    
    Swal.fire({
      icon: 'success',
      title: `Vendor ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
      text: `Vendor "${vendor.vendorName}" has been ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`,
      confirmButtonColor: '#2563eb'
    });
  }


  ngOnDestroy(): void {
    this.languageSubscription?.unsubscribe();
  }
}

