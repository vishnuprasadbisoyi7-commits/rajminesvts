import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../services/translation.service';
import Swal from 'sweetalert2';

interface Trip {
  tripId: string;
  tripNumber: string;
  transitPassNo: string;
  vehicleRegNo: string;
  originLease: string;
  destinationDealer: string;
  route: string;
  commodity: string;
  commodityQuantity: number;
  driverName: string;
  driverContact: string;
  expectedDeparture: string;
  expectedArrival: string;
  weighbridge: string;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-trip-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="page-title">{{ translate('tracking.tripAssignment') }}</div>
      <div class="small">{{ translate('tracking.subtitle') }}</div>
    </div>

    <div class="card">
      <div class="tabs">
        <div class="tab" [class.active]="activeTab === 'assign'" (click)="setActiveTab('assign')">
          {{ translate('tracking.assignVehicleToTrip') }}
        </div>
        <div class="tab" [class.active]="activeTab === 'list'" (click)="setActiveTab('list')">
          {{ translate('tracking.activeTrips') }}
        </div>
      </div>

      <!-- Trip Assignment Form -->
      <div class="tab-content" [class.active]="activeTab === 'assign'">
        <div style="max-width:900px;margin:0 auto;">
          <div style="background:#f8f9fa;padding:16px;border-radius:8px;margin-bottom:20px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
              <i class="ri-file-list-3-line" style="font-size:24px;color:#0284c7;"></i>
              <div>
                <strong style="font-size:16px;color:#111827;">{{ translate('tracking.erawanaTransitPass') }}</strong>
                <div class="small" style="margin-top:4px;">{{ translate('tracking.syncFromErawana') }}</div>
              </div>
            </div>
            <button class="btn primary" (click)="syncFromErawana()" style="width:100%;">
              <i class="ri-refresh-line"></i> {{ translate('tracking.syncFromErawana') }}
            </button>
          </div>

          <form (ngSubmit)="assignTrip()" #tripForm="ngForm">
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:16px;">
              <div class="form-group">
                <label>{{ translate('tracking.tripNumber') }} <span style="color:#ef4444;">*</span></label>
                <input type="text" [(ngModel)]="tripFormData.tripNumber" name="tripNumber" required 
                       [placeholder]="translate('tracking.tripNumber')" class="form-input">
              </div>
              <div class="form-group">
                <label>{{ translate('tracking.transitPassNo') }}</label>
                <input type="text" [(ngModel)]="tripFormData.transitPassNo" name="transitPassNo"
                       [placeholder]="translate('tracking.transitPassNo')" class="form-input">
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:16px;">
              <div class="form-group">
                <label>{{ translate('tracking.selectVehicle') }} <span style="color:#ef4444;">*</span></label>
                <select [(ngModel)]="tripFormData.vehicleRegNo" name="vehicleRegNo" required class="form-input">
                  <option value="">{{ translate('tracking.selectVehicle') }}</option>
                  <option *ngFor="let vehicle of availableVehicles" [value]="vehicle.regNo">
                    {{ vehicle.regNo }} - {{ vehicle.deviceName }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ translate('tracking.originLease') }} <span style="color:#ef4444;">*</span></label>
                <select [(ngModel)]="tripFormData.originLease" name="originLease" required class="form-input">
                  <option value="">{{ translate('tracking.selectOriginLease') }}</option>
                  <option *ngFor="let lease of leases" [value]="lease.id">{{ lease.name }}</option>
                </select>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:16px;">
              <div class="form-group">
                <label>{{ translate('tracking.destinationDealer') }} <span style="color:#ef4444;">*</span></label>
                <select [(ngModel)]="tripFormData.destinationDealer" name="destinationDealer" required class="form-input">
                  <option value="">{{ translate('tracking.selectDestinationDealer') }}</option>
                  <option *ngFor="let dealer of dealers" [value]="dealer.id">{{ dealer.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ translate('tracking.route') }}</label>
                <input type="text" [(ngModel)]="tripFormData.route" name="route"
                       [placeholder]="translate('tracking.enterRoute')" class="form-input">
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:16px;">
              <div class="form-group">
                <label>{{ translate('tracking.commodity') }} <span style="color:#ef4444;">*</span></label>
                <select [(ngModel)]="tripFormData.commodity" name="commodity" required class="form-input">
                  <option value="">{{ translate('tracking.selectCommodity') }}</option>
                  <option value="limestone">Limestone</option>
                  <option value="marble">Marble</option>
                  <option value="gypsum">Gypsum</option>
                  <option value="sandstone">Sandstone</option>
                  <option value="copper">Copper</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ translate('tracking.commodityQuantity') }}</label>
                <input type="number" step="0.01" [(ngModel)]="tripFormData.commodityQuantity" name="commodityQuantity"
                       [placeholder]="translate('tracking.enterQuantity')" class="form-input">
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:16px;">
              <div class="form-group">
                <label>{{ translate('tracking.driverName') }}</label>
                <input type="text" [(ngModel)]="tripFormData.driverName" name="driverName"
                       [placeholder]="translate('tracking.enterDriverName')" class="form-input">
              </div>
              <div class="form-group">
                <label>{{ translate('tracking.driverContact') }}</label>
                <input type="tel" [(ngModel)]="tripFormData.driverContact" name="driverContact"
                       [placeholder]="translate('tracking.enterDriverContact')" class="form-input">
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:16px;">
              <div class="form-group">
                <label>{{ translate('tracking.expectedDeparture') }} <span style="color:#ef4444;">*</span></label>
                <input type="datetime-local" [(ngModel)]="tripFormData.expectedDeparture" name="expectedDeparture" required
                       class="form-input">
              </div>
              <div class="form-group">
                <label>{{ translate('tracking.expectedArrival') }} <span style="color:#ef4444;">*</span></label>
                <input type="datetime-local" [(ngModel)]="tripFormData.expectedArrival" name="expectedArrival" required
                       class="form-input">
              </div>
            </div>

            <div class="form-group" style="margin-bottom:20px;">
              <label>{{ translate('tracking.weighbridge') }}</label>
              <select [(ngModel)]="tripFormData.weighbridge" name="weighbridge" class="form-input">
                <option value="">{{ translate('tracking.selectWeighbridge') }}</option>
                <option *ngFor="let wb of weighbridges" [value]="wb.id">{{ wb.name }}</option>
              </select>
            </div>

            <div style="display:flex;gap:12px;justify-content:flex-end;">
              <button type="button" class="btn ghost" (click)="resetForm()">{{ translate('common.clear') }}</button>
              <button type="submit" class="btn primary" [disabled]="!tripForm.valid">
                <i class="ri-roadster-line"></i> {{ translate('tracking.assignTrip') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Active Trips List -->
      <div class="tab-content" [class.active]="activeTab === 'list'">
        <div style="margin-bottom:16px;">
          <strong style="font-size:18px;color:var(--title-color);">{{ translate('tracking.tripList') }}</strong>
        </div>
        <div style="overflow-x:auto;">
          <table class="table">
            <thead>
              <tr>
                <th>{{ translate('tracking.tripNumber') }}</th>
                <th>{{ translate('tracking.transitPassNo') }}</th>
                <th>{{ translate('tracking.vehicle') }}</th>
                <th>{{ translate('tracking.originLease') }}</th>
                <th>{{ translate('tracking.destinationDealer') }}</th>
                <th>{{ translate('tracking.commodity') }}</th>
                <th>{{ translate('tracking.expectedDeparture') }}</th>
                <th>{{ translate('tracking.expectedArrival') }}</th>
                <th>{{ translate('tracking.tripStatus') }}</th>
                <th>{{ translate('common.action') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let trip of trips">
                <td>{{ trip.tripNumber }}</td>
                <td>{{ trip.transitPassNo || '-' }}</td>
                <td>{{ trip.vehicleRegNo }}</td>
                <td>{{ trip.originLease }}</td>
                <td>{{ trip.destinationDealer }}</td>
                <td>{{ trip.commodity }}</td>
                <td>{{ formatDateTime(trip.expectedDeparture) }}</td>
                <td>{{ formatDateTime(trip.expectedArrival) }}</td>
                <td>
                  <span [class]="'status-pill status-' + trip.status.toLowerCase().replace('_', '-')">
                    {{ getStatusLabel(trip.status) }}
                  </span>
                </td>
                <td>
                  <div style="display:flex;gap:8px;">
                    <button class="btn-icon" (click)="viewTripDetails(trip)" title="{{ translate('tracking.viewDetails') }}">
                      <i class="ri-eye-line"></i>
                    </button>
                    <button class="btn-icon" (click)="editTrip(trip)" title="{{ translate('tracking.editTrip') }}">
                      <i class="ri-edit-line"></i>
                    </button>
                    <button class="btn-icon danger" (click)="cancelTrip(trip)" title="{{ translate('tracking.cancelTrip') }}" *ngIf="trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED'">
                      <i class="ri-close-line"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="trips.length === 0">
                <td colspan="10" style="text-align:center;padding:40px;color:#6b7280;">
                  {{ translate('tracking.noTripsFound') || 'No trips found' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tabs {
      display: flex;
      gap: 8px;
      border-bottom: 2px solid #e5e7eb;
      margin-bottom: 20px;
    }
    .tab {
      padding: 12px 24px;
      cursor: pointer;
      font-weight: 600;
      color: #6b7280;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: all 0.2s;
    }
    .tab:hover {
      color: #0284c7;
    }
    .tab.active {
      color: #0284c7;
      border-bottom-color: #0284c7;
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
    }
    .form-input {
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s;
    }
    .form-input:focus {
      outline: none;
      border-color: #0284c7;
      box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.1);
    }
    .status-pill {
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      display: inline-block;
    }
    .status-assigned { background: #dbeafe; color: #1e40af; }
    .status-in-progress { background: #d1fae5; color: #065f46; }
    .status-delayed { background: #fef3c7; color: #92400e; }
    .status-deviated { background: #fee2e2; color: #991b1b; }
    .status-completed { background: #dcfce7; color: #15803d; }
    .status-cancelled { background: #f3f4f6; color: #374151; }
    .btn-icon {
      padding: 6px 8px;
      border: none;
      background: #f3f4f6;
      border-radius: 4px;
      cursor: pointer;
      color: #374151;
      transition: all 0.2s;
    }
    .btn-icon:hover {
      background: #e5e7eb;
    }
    .btn-icon.danger {
      color: #dc2626;
    }
    .btn-icon.danger:hover {
      background: #fee2e2;
    }
  `]
})
export class TripAssignmentComponent implements OnInit, OnDestroy {
  activeTab = 'assign';
  tripFormData = {
    tripNumber: '',
    transitPassNo: '',
    vehicleRegNo: '',
    originLease: '',
    destinationDealer: '',
    route: '',
    commodity: '',
    commodityQuantity: null as number | null,
    driverName: '',
    driverContact: '',
    expectedDeparture: '',
    expectedArrival: '',
    weighbridge: ''
  };

  trips: Trip[] = [];
  availableVehicles: any[] = [];
  leases: any[] = [];
  dealers: any[] = [];
  weighbridges: any[] = [];
  private languageSubscription?: Subscription;

  constructor(private translationService: TranslationService) {}

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  ngOnInit(): void {
    this.loadData();
    this.languageSubscription = this.translationService.language$.subscribe(() => {
      // Component will automatically update when language changes
    });
  }

  ngOnDestroy(): void {
    this.languageSubscription?.unsubscribe();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'list') {
      this.loadTrips();
    }
  }

  loadData(): void {
    // Load available vehicles (with active devices)
    this.availableVehicles = [
      { regNo: 'RJ14-1234', deviceName: 'Device-001' },
      { regNo: 'RJ19-5678', deviceName: 'Device-002' },
      { regNo: 'RJ27-3344', deviceName: 'Device-003' },
      { regNo: 'RJ09-9988', deviceName: 'Device-004' }
    ];

    // Load leases (geofences of type LEASE_AREA)
    this.leases = [
      { id: 'lease-01', name: 'Lease-01' },
      { id: 'lease-02', name: 'Lease-02' },
      { id: 'lease-03', name: 'Lease-03' }
    ];

    // Load dealers (geofences of type DEALER_LOCATION)
    this.dealers = [
      { id: 'dealer-01', name: 'Dealer Location A' },
      { id: 'dealer-02', name: 'Dealer Location B' },
      { id: 'dealer-03', name: 'Dealer Location C' }
    ];

    // Load weighbridges (geofences of type WEIGHBRIDGE)
    this.weighbridges = [
      { id: 'wb-01', name: 'Weighbridge A' },
      { id: 'wb-02', name: 'Weighbridge B' }
    ];
  }

  loadTrips(): void {
    // Load active trips
    this.trips = [
      {
        tripId: 'trip-001',
        tripNumber: 'TRIP-2025-001',
        transitPassNo: 'RWN-001',
        vehicleRegNo: 'RJ14-1234',
        originLease: 'Lease-01',
        destinationDealer: 'Dealer Location A',
        route: 'Route via Highway NH-8',
        commodity: 'Limestone',
        commodityQuantity: 18.0,
        driverName: 'Rajesh Kumar',
        driverContact: '9876543210',
        expectedDeparture: '2025-01-20T10:00:00',
        expectedArrival: '2025-01-20T14:00:00',
        weighbridge: 'Weighbridge A',
        status: 'IN_PROGRESS',
        createdAt: '2025-01-20T09:00:00'
      },
      {
        tripId: 'trip-002',
        tripNumber: 'TRIP-2025-002',
        transitPassNo: 'RWN-002',
        vehicleRegNo: 'RJ19-5678',
        originLease: 'Lease-02',
        destinationDealer: 'Dealer Location B',
        route: 'Route via State Highway',
        commodity: 'Marble',
        commodityQuantity: 22.5,
        driverName: 'Suresh Meena',
        driverContact: '9876543211',
        expectedDeparture: '2025-01-20T11:00:00',
        expectedArrival: '2025-01-20T16:00:00',
        weighbridge: 'Weighbridge B',
        status: 'ASSIGNED',
        createdAt: '2025-01-20T10:00:00'
      }
    ];
  }

  syncFromErawana(): void {
    Swal.fire({
      title: this.translate('tracking.syncFromErawana'),
      text: 'Syncing eRawana / Transit Pass data...',
      icon: 'info',
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Simulate API call
    setTimeout(() => {
      // Mock data from eRawana
      this.tripFormData.transitPassNo = 'RWN-003';
      this.tripFormData.commodity = 'Limestone';
      this.tripFormData.commodityQuantity = 20.5;
      this.tripFormData.originLease = 'lease-01';
      this.tripFormData.destinationDealer = 'dealer-01';
      this.tripFormData.route = 'Route via NH-8';
      this.tripFormData.weighbridge = 'wb-01';

      Swal.fire({
        icon: 'success',
        title: 'Synced Successfully',
        text: 'eRawana / Transit Pass data has been synced to VTS',
        confirmButtonColor: '#0284c7',
        timer: 2000
      });
    }, 1500);
  }

  assignTrip(): void {
    if (!this.tripFormData.tripNumber || !this.tripFormData.vehicleRegNo || 
        !this.tripFormData.originLease || !this.tripFormData.destinationDealer ||
        !this.tripFormData.commodity || !this.tripFormData.expectedDeparture ||
        !this.tripFormData.expectedArrival) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill all required fields',
        confirmButtonColor: '#0284c7'
      });
      return;
    }

    Swal.fire({
      title: this.translate('tracking.assignTrip'),
      text: 'Assigning vehicle to trip...',
      icon: 'info',
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Simulate API call
    setTimeout(() => {
      const newTrip: Trip = {
        tripId: 'trip-' + Date.now(),
        tripNumber: this.tripFormData.tripNumber,
        transitPassNo: this.tripFormData.transitPassNo,
        vehicleRegNo: this.tripFormData.vehicleRegNo,
        originLease: this.leases.find(l => l.id === this.tripFormData.originLease)?.name || this.tripFormData.originLease,
        destinationDealer: this.dealers.find(d => d.id === this.tripFormData.destinationDealer)?.name || this.tripFormData.destinationDealer,
        route: this.tripFormData.route,
        commodity: this.tripFormData.commodity,
        commodityQuantity: this.tripFormData.commodityQuantity || 0,
        driverName: this.tripFormData.driverName,
        driverContact: this.tripFormData.driverContact,
        expectedDeparture: this.tripFormData.expectedDeparture,
        expectedArrival: this.tripFormData.expectedArrival,
        weighbridge: this.weighbridges.find(w => w.id === this.tripFormData.weighbridge)?.name || this.tripFormData.weighbridge,
        status: 'ASSIGNED',
        createdAt: new Date().toISOString()
      };

      this.trips.push(newTrip);

      Swal.fire({
        icon: 'success',
        title: 'Trip Assigned',
        text: `Vehicle ${this.tripFormData.vehicleRegNo} has been assigned to trip ${this.tripFormData.tripNumber}`,
        confirmButtonColor: '#0284c7'
      });

      this.resetForm();
      this.setActiveTab('list');
    }, 1500);
  }

  resetForm(): void {
    this.tripFormData = {
      tripNumber: '',
      transitPassNo: '',
      vehicleRegNo: '',
      originLease: '',
      destinationDealer: '',
      route: '',
      commodity: '',
      commodityQuantity: null,
      driverName: '',
      driverContact: '',
      expectedDeparture: '',
      expectedArrival: '',
      weighbridge: ''
    };
  }

  viewTripDetails(trip: Trip): void {
    Swal.fire({
      title: `Trip: ${trip.tripNumber}`,
      html: `
        <div style="text-align:left;padding:10px;">
          <p><strong>Transit Pass:</strong> ${trip.transitPassNo || 'N/A'}</p>
          <p><strong>Vehicle:</strong> ${trip.vehicleRegNo}</p>
          <p><strong>Origin:</strong> ${trip.originLease}</p>
          <p><strong>Destination:</strong> ${trip.destinationDealer}</p>
          <p><strong>Route:</strong> ${trip.route || 'N/A'}</p>
          <p><strong>Commodity:</strong> ${trip.commodity} (${trip.commodityQuantity} MT)</p>
          <p><strong>Driver:</strong> ${trip.driverName || 'N/A'} (${trip.driverContact || 'N/A'})</p>
          <p><strong>Expected Departure:</strong> ${this.formatDateTime(trip.expectedDeparture)}</p>
          <p><strong>Expected Arrival:</strong> ${this.formatDateTime(trip.expectedArrival)}</p>
          <p><strong>Weighbridge:</strong> ${trip.weighbridge || 'N/A'}</p>
          <p><strong>Status:</strong> ${this.getStatusLabel(trip.status)}</p>
        </div>
      `,
      confirmButtonColor: '#0284c7',
      width: '600px'
    });
  }

  editTrip(trip: Trip): void {
    // Load trip data into form
    this.tripFormData.tripNumber = trip.tripNumber;
    this.tripFormData.transitPassNo = trip.transitPassNo;
    this.tripFormData.vehicleRegNo = trip.vehicleRegNo;
    this.tripFormData.originLease = this.leases.find(l => l.name === trip.originLease)?.id || '';
    this.tripFormData.destinationDealer = this.dealers.find(d => d.name === trip.destinationDealer)?.id || '';
    this.tripFormData.route = trip.route;
    this.tripFormData.commodity = trip.commodity;
    this.tripFormData.commodityQuantity = trip.commodityQuantity;
    this.tripFormData.driverName = trip.driverName;
    this.tripFormData.driverContact = trip.driverContact;
    this.tripFormData.expectedDeparture = trip.expectedDeparture.substring(0, 16);
    this.tripFormData.expectedArrival = trip.expectedArrival.substring(0, 16);
    this.tripFormData.weighbridge = this.weighbridges.find(w => w.name === trip.weighbridge)?.id || '';
    
    this.setActiveTab('assign');
  }

  cancelTrip(trip: Trip): void {
    Swal.fire({
      title: this.translate('tracking.cancelTrip'),
      text: `Are you sure you want to cancel trip ${trip.tripNumber}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Cancel Trip',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        trip.status = 'CANCELLED';
        Swal.fire({
          icon: 'success',
          title: 'Trip Cancelled',
          text: `Trip ${trip.tripNumber} has been cancelled`,
          confirmButtonColor: '#0284c7',
          timer: 2000
        });
      }
    });
  }

  formatDateTime(dateTime: string): string {
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ASSIGNED': this.translate('tracking.assigned'),
      'IN_PROGRESS': this.translate('tracking.inProgress'),
      'DELAYED': this.translate('tracking.delayed'),
      'DEVIATED': this.translate('tracking.deviated'),
      'COMPLETED': this.translate('tracking.completed'),
      'CANCELLED': this.translate('tracking.cancelled')
    };
    return statusMap[status] || status;
  }
}

