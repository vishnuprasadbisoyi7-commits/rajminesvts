import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';
import { Subscription } from 'rxjs';

interface VtsRecord {
  lease: string;
  vendor: string;
  status: string;
  commodity: string;
  trips: number;
  onTime: number;
  delay: number;
  deviations: number;
  delayed: string;
  deviated: string;
  lat: number;
  lng: number;
}

interface ErRawanna {
  no: string;
  lease: string;
  vehicle: string;
  commodity: string;
  qty: number;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- OCC Dashboard -->
    <div *ngIf="userRole === 'occ'" class="occ-dashboard">
      <!-- OCC Home Section -->
      <section *ngIf="activeSection === 'occ'" class="occ-section active">
        <div class="breadcrumb">
          <span>OCC</span> <span>&gt;</span> <span>{{ translate('dashboard.occHome') }}</span>
        </div>
        <div class="page-title">{{ translate('dashboard.occHome') }}</div>
        <div class="section-card">
          <div class="section-header-line">
            <h2>{{ translate('dashboard.availableModuleDashboards') }}</h2>
            <span class="section-subtitle">{{ translate('dashboard.clickModuleToOpen') }}</span>
          </div>
          <div class="occ-grid">
            <div class="occ-card" (click)="setActiveSection('vts')">
              <div class="occ-left">
                <div class="occ-title">{{ translate('dashboard.vtsDashboard') }}</div>
                <div class="occ-sub">{{ translate('dashboard.vehicleTrackingMonitoring') }}</div>
                <div class="occ-meta">{{ translate('dashboard.liveTripsRouteDeviations') }}</div>
              </div>
              <div class="occ-icon-circle"><i class="ri-roadster-fill"></i></div>
            </div>
            <div class="occ-card" (click)="setActiveSection('er')">
              <div class="occ-left">
                <div class="occ-title">{{ translate('dashboard.erawannaDashboard') }}</div>
                <div class="occ-sub">{{ translate('dashboard.rawannaTpMonitoring') }}</div>
                <div class="occ-meta">{{ translate('dashboard.issuePendingApprovals') }}</div>
              </div>
              <div class="occ-icon-circle"><i class="ri-file-list-3-fill"></i></div>
            </div>
          </div>
        </div>
      </section>

      <!-- VTS Dashboard Section -->
      <section *ngIf="activeSection === 'vts'" class="occ-section active">
        <div class="breadcrumb">
          <span style="cursor:pointer;color:#0284c7;" (click)="setActiveSection('occ')">OCC</span> <span>&gt;</span> 
          <span style="cursor:pointer;color:#0284c7;" (click)="setActiveSection('occ')">{{ translate('dashboard.occHome') }}</span> <span>&gt;</span> 
          <span>VTS</span> <span>&gt;</span> <span>{{ translate('dashboard.title') }}</span>
        </div>
        <div class="page-title">{{ translate('dashboard.keyPerformanceIndicators') }}</div>

        <div class="section-card" style="padding-bottom:16px;">
          <div class="kpi-row">
            <div class="kpi-card">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">{{ translate('dashboard.activeTrips') }}</div>
                  <div class="kpi-value">{{ vtsKpis.activeTrips }}</div>
                </div>
                <div class="kpi-icon kpi-blue"><i class="ri-truck-line"></i></div>
              </div>
              <div class="kpi-sub">+2 {{ translate('dashboard.fromYesterday') }}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">{{ translate('dashboard.onTimePercentage') }}</div>
                  <div class="kpi-value">{{ vtsKpis.onTime }}%</div>
                </div>
                <div class="kpi-icon kpi-red"><i class="ri-timer-flash-line"></i></div>
              </div>
              <div class="kpi-sub">+3.2% {{ translate('dashboard.fromLastWeek') }}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">{{ translate('dashboard.averageDelay') }}</div>
                  <div class="kpi-value">{{ vtsKpis.avgDelay }} min</div>
                </div>
                <div class="kpi-icon kpi-pink"><i class="ri-time-line"></i></div>
              </div>
              <div class="kpi-sub">-5 min {{ translate('dashboard.fromLastWeek') }}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">{{ translate('dashboard.vehiclesOffline') }}</div>
                  <div class="kpi-value">{{ vtsKpis.vehiclesOffline }}</div>
                </div>
                <div class="kpi-icon kpi-teal"><i class="ri-wifi-off-line"></i></div>
              </div>
              <div class="kpi-sub">{{ translate('dashboard.actionRequired') }}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">{{ translate('dashboard.routeDeviations') }}</div>
                  <div class="kpi-value">{{ vtsKpis.deviations }}</div>
                </div>
                <div class="kpi-icon kpi-orange"><i class="ri-route-line"></i></div>
              </div>
              <div class="kpi-sub">{{ translate('dashboard.needsAttention') }}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">{{ translate('dashboard.stopsAboveThreshold') }}</div>
                  <div class="kpi-value">{{ vtsKpis.stops }}</div>
                </div>
                <div class="kpi-icon kpi-violet"><i class="ri-hand-stop-line"></i></div>
              </div>
              <div class="kpi-sub">{{ translate('dashboard.reviewNeeded') }}</div>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-header-line">
            <h2>{{ translate('dashboard.keyPerformanceIndicators') }}</h2>
            <button class="btn-clear" (click)="clearVtsFilters()">{{ translate('dashboard.clearFilters') }}</button>
          </div>
          <div class="filter-row">
            <div class="filter-group">
              <span class="filter-label">{{ translate('dashboard.lease') }}</span>
              <select [(ngModel)]="vtsFilters.lease" (change)="applyVtsFilters()" class="filter-input">
                <option value="ALL">{{ translate('dashboard.allLeases') }}</option>
                <option *ngFor="let lease of uniqueLeases" [value]="lease">{{ lease }}</option>
              </select>
            </div>
            <div class="filter-group">
              <span class="filter-label">{{ translate('dashboard.vendor') }}</span>
              <select [(ngModel)]="vtsFilters.vendor" (change)="applyVtsFilters()" class="filter-input">
                <option value="ALL">{{ translate('dashboard.allVendors') }}</option>
                <option *ngFor="let vendor of uniqueVendors" [value]="vendor">{{ vendor }}</option>
              </select>
            </div>
            <div class="filter-group">
              <span class="filter-label">{{ translate('common.status') }}</span>
              <select [(ngModel)]="vtsFilters.status" (change)="applyVtsFilters()" class="filter-input">
                <option value="ALL">{{ translate('dashboard.allStatus') }}</option>
                <option *ngFor="let status of uniqueStatuses" [value]="status">{{ status }}</option>
              </select>
            </div>
            <div class="filter-group">
              <span class="filter-label">{{ translate('dashboard.commodity') }}</span>
              <select [(ngModel)]="vtsFilters.commodity" (change)="applyVtsFilters()" class="filter-input">
                <option value="ALL">{{ translate('dashboard.allCommodities') }}</option>
                <option *ngFor="let commodity of uniqueCommodities" [value]="commodity">{{ commodity }}</option>
              </select>
            </div>
            <div class="filter-group">
              <span class="filter-label">{{ translate('dashboard.delayed') }}</span>
              <select [(ngModel)]="vtsFilters.delayed" (change)="applyVtsFilters()" class="filter-input">
                <option value="ALL">{{ translate('common.all') }}</option>
                <option value="Yes">{{ translate('common.yes') }}</option>
                <option value="No">{{ translate('common.no') }}</option>
              </select>
            </div>
            <div class="filter-group">
              <span class="filter-label">{{ translate('dashboard.deviated') }}</span>
              <select [(ngModel)]="vtsFilters.deviated" (change)="applyVtsFilters()" class="filter-input">
                <option value="ALL">{{ translate('common.all') }}</option>
                <option value="Yes">{{ translate('common.yes') }}</option>
                <option value="No">{{ translate('common.no') }}</option>
              </select>
            </div>
          </div>

          <div class="flex-row">
            <div class="map-card" #mapCard>
              <div class="map-placeholder-layer">
                26°54'44.6"N, 75°47'14.3"E – GIS map placeholder for VTS vehicles
              </div>
              <div *ngFor="let record of filteredVtsRecords" 
                   class="vts-dot"
                   [style.left.px]="getMapDotX(record)"
                   [style.top.px]="getMapDotY(record)"
                   [title]="record.lease + ' / ' + record.vendor + ' – ' + record.trips + ' trips'">
              </div>
            </div>
            <div class="table-card">
              <div class="table-title">Filtered Trip Summary</div>
              <div class="table-summary">
                <span class="pill" *ngIf="filteredVtsRecords.length > 0">
                  <strong>{{ getTotalTrips() }}</strong> Trips
                </span>
                <span class="pill" *ngIf="filteredVtsRecords.length > 0">
                  On-time <strong>{{ getAvgOnTime().toFixed(1) }}%</strong>
                </span>
                <span class="pill" *ngIf="filteredVtsRecords.length > 0">
                  Avg delay <strong>{{ getAvgDelay().toFixed(1) }} min</strong>
                </span>
                <span class="pill" *ngIf="filteredVtsRecords.length > 0">
                  Route deviations <strong>{{ getTotalDeviations() }}</strong>
                </span>
                <span *ngIf="filteredVtsRecords.length === 0">No trips for selected filters.</span>
              </div>
              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>{{ translate('dashboard.lease') }}</th>
                      <th>{{ translate('dashboard.vendor') }}</th>
                      <th>{{ translate('common.status') }}</th>
                      <th>{{ translate('dashboard.commodity') }}</th>
                      <th class="text-right">Trips</th>
                      <th class="text-right">On-time %</th>
                      <th class="text-right">Avg Delay (min)</th>
                      <th class="text-right">Deviations</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let record of filteredVtsRecords">
                      <td>{{ record.lease }}</td>
                      <td>{{ record.vendor }}</td>
                      <td>{{ record.status }}</td>
                      <td>{{ record.commodity }}</td>
                      <td class="text-right">{{ record.trips }}</td>
                      <td class="text-right">{{ record.onTime.toFixed(1) }}%</td>
                      <td class="text-right">{{ record.delay }}</td>
                      <td class="text-right">{{ record.deviations }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- eRawanna Dashboard Section -->
      <section *ngIf="activeSection === 'er'" class="occ-section active">
        <div class="breadcrumb">
          <span style="cursor:pointer;color:#0284c7;" (click)="setActiveSection('occ')">OCC</span> <span>&gt;</span> 
          <span style="cursor:pointer;color:#0284c7;" (click)="setActiveSection('occ')">{{ translate('dashboard.occHome') }}</span> <span>&gt;</span> 
          <span>eRawanna</span> <span>&gt;</span> <span>{{ translate('dashboard.title') }}</span>
        </div>
        <div class="page-title">Rawanna / TP KPIs</div>

        <div class="section-card" style="padding-bottom:16px;">
          <div class="kpi-row er-kpi-row">
            <div class="kpi-card">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">{{ translate('dashboard.rawannasIssued') }}</div>
                  <div class="kpi-value">{{ erKpis.issued }}</div>
                </div>
                <div class="kpi-icon kpi-blue"><i class="ri-file-check-line"></i></div>
              </div>
              <div class="kpi-sub">Today</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">{{ translate('dashboard.pendingApproval') }}</div>
                  <div class="kpi-value">{{ erKpis.pending }}</div>
                </div>
                <div class="kpi-icon kpi-orange"><i class="ri-timer-line"></i></div>
              </div>
              <div class="kpi-sub">{{ translate('dashboard.awaitingOccOfficer') }}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">{{ translate('dashboard.rejected') }}</div>
                  <div class="kpi-value">{{ erKpis.rejected }}</div>
                </div>
                <div class="kpi-icon kpi-red"><i class="ri-close-circle-line"></i></div>
              </div>
              <div class="kpi-sub">Today</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">{{ translate('dashboard.avgProcessingTime') }}</div>
                  <div class="kpi-value">{{ erKpis.avgTime }} min</div>
                </div>
                <div class="kpi-icon kpi-teal"><i class="ri-time-line"></i></div>
              </div>
              <div class="kpi-sub">{{ translate('dashboard.requestToIssue') }}</div>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-header-line">
            <h2>{{ translate('dashboard.rawannaTpSummary') }}</h2>
          </div>
          <div class="flex-row er-summary-row">
            <div class="table-card er-table-card">
              <div class="table-title">{{ translate('dashboard.rawannaList') }}</div>
              <div class="table-wrapper er-table-wrapper">
                <table class="er-table">
                  <thead>
                    <tr>
                      <th>{{ translate('dashboard.rawannaNo') }}</th>
                      <th>{{ translate('dashboard.lease') }}</th>
                      <th>Vehicle</th>
                      <th>{{ translate('dashboard.commodity') }}</th>
                      <th>{{ translate('common.status') }}</th>
                      <th class="text-right">{{ translate('dashboard.quantityMt') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let rawanna of erRawannas">
                      <td>{{ rawanna.no }}</td>
                      <td>{{ rawanna.lease }}</td>
                      <td>{{ rawanna.vehicle }}</td>
                      <td>{{ rawanna.commodity }}</td>
                      <td>
                        <span [class]="'status-pill status-' + rawanna.status.toLowerCase()">
                          {{ rawanna.status === 'APPROVED' ? translate('dashboard.approved') : 
                             rawanna.status === 'PENDING' ? translate('dashboard.pending') : 
                             translate('dashboard.rejected') }}
                        </span>
                      </td>
                      <td class="text-right">{{ rawanna.qty.toFixed(1) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="table-card er-notes-card">
              <div class="table-title">{{ translate('dashboard.todaysActivityNotes') }}</div>
              <div class="er-notes-wrapper">
                <ul class="er-notes-list">
                  <li *ngFor="let note of erNotes">{{ note }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Standard Dashboard (for other roles) -->
    <div *ngIf="userRole !== 'occ'">
      <div class="card">
        <div class="page-title">{{ translate('dashboard.title') }}</div>
        <div class="small">{{ translate('dashboard.subtitle') }}</div>
      </div>

      <!-- KPIs Section -->
      <div class="card">
        <div style="margin-bottom:16px;">
          <strong style="font-size:18px;color:var(--title-color);">{{ translate('dashboard.keyPerformanceIndicators') }}</strong>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
          <div class="kpi-card">
            <div class="kpi-label">{{ translate('dashboard.activeTrips') }}</div>
            <div class="kpi-value">{{ kpis.activeTrips }}</div>
            <div class="kpi-change positive">+2 {{ translate('dashboard.fromYesterday') }}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">{{ translate('dashboard.onTimePercentage') }}</div>
            <div class="kpi-value">{{ kpis.onTimePercentage }}%</div>
            <div class="kpi-change positive">+3.2% {{ translate('dashboard.fromLastWeek') }}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">{{ translate('dashboard.averageDelay') }}</div>
            <div class="kpi-value">{{ kpis.averageDelay }} min</div>
            <div class="kpi-change negative">-5 min {{ translate('dashboard.fromLastWeek') }}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">{{ translate('dashboard.vehiclesOffline') }}</div>
            <div class="kpi-value" [style.color]="kpis.vehiclesOffline > 0 ? '#ef4444' : '#10b981'">{{ kpis.vehiclesOffline }}</div>
            <div class="kpi-change" [class.negative]="kpis.vehiclesOffline > 0" [class.positive]="kpis.vehiclesOffline === 0">
              {{ kpis.vehiclesOffline > 0 ? translate('dashboard.actionRequired') : translate('dashboard.allOnline') }}
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">{{ translate('dashboard.routeDeviations') }}</div>
            <div class="kpi-value">{{ kpis.routeDeviations }}</div>
            <div class="kpi-change" [class.negative]="kpis.routeDeviations > 0" [class.positive]="kpis.routeDeviations === 0">
              {{ kpis.routeDeviations > 0 ? translate('dashboard.needsAttention') : translate('dashboard.noDeviations') }}
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">{{ translate('dashboard.stopsAboveThreshold') }}</div>
            <div class="kpi-value">{{ kpis.stopsAboveThreshold }}</div>
            <div class="kpi-change" [class.negative]="kpis.stopsAboveThreshold > 0" [class.positive]="kpis.stopsAboveThreshold === 0">
              {{ kpis.stopsAboveThreshold > 0 ? translate('dashboard.reviewNeeded') : translate('dashboard.withinLimits') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Map with Filters Section -->
      <div class="card">
        <div style="margin-bottom:16px;">
          <strong style="font-size:18px;color:var(--title-color);">{{ translate('dashboard.vehicleTrackingMap') }}</strong>
        </div>
        
        <!-- Filters -->
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding:12px;background:#f8f9fa;border-radius:6px;">
          <div style="display:flex;flex-direction:column;gap:4px;min-width:150px;">
            <label style="font-size:12px;font-weight:600;color:var(--title-color);">{{ translate('dashboard.lease') }}</label>
              <select [(ngModel)]="filters.lease" (change)="applyFilters()" style="font-size:13px;padding:6px;">
                <option value="">{{ translate('dashboard.allLeases') }}</option>
                <option value="lease-a">Lease Area A</option>
                <option value="lease-b">Lease Area B</option>
                <option value="lease-c">Lease Area C</option>
              </select>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;min-width:150px;">
            <label style="font-size:12px;font-weight:600;color:var(--title-color);">{{ translate('dashboard.vendor') }}</label>
              <select [(ngModel)]="filters.vendor" (change)="applyFilters()" style="font-size:13px;padding:6px;">
                <option value="">{{ translate('dashboard.allVendors') }}</option>
                <option value="ven-001">TrackPro Pvt Ltd</option>
                <option value="ven-002">SmartTrack Solutions</option>
              </select>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;min-width:150px;">
            <label style="font-size:12px;font-weight:600;color:var(--title-color);">{{ translate('common.status') }}</label>
              <select [(ngModel)]="filters.status" (change)="applyFilters()" style="font-size:13px;padding:6px;">
                <option value="">{{ translate('dashboard.allStatus') }}</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;min-width:150px;">
            <label style="font-size:12px;font-weight:600;color:var(--title-color);">{{ translate('dashboard.commodity') }}</label>
              <select [(ngModel)]="filters.commodity" (change)="applyFilters()" style="font-size:13px;padding:6px;">
                <option value="">{{ translate('dashboard.allCommodities') }}</option>
                <option value="limestone">Limestone</option>
                <option value="marble">Marble</option>
                <option value="sandstone">Sandstone</option>
                <option value="gypsum">Gypsum</option>
              </select>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;min-width:150px;">
            <label style="font-size:12px;font-weight:600;color:var(--title-color);">{{ translate('dashboard.delayed') }}</label>
              <select [(ngModel)]="filters.delayed" (change)="applyFilters()" style="font-size:13px;padding:6px;">
                <option value="">{{ translate('common.all') }}</option>
                <option value="yes">{{ translate('common.yes') }}</option>
                <option value="no">{{ translate('common.no') }}</option>
              </select>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;min-width:150px;">
            <label style="font-size:12px;font-weight:600;color:var(--title-color);">{{ translate('dashboard.deviated') }}</label>
              <select [(ngModel)]="filters.deviated" (change)="applyFilters()" style="font-size:13px;padding:6px;">
                <option value="">{{ translate('common.all') }}</option>
                <option value="yes">{{ translate('common.yes') }}</option>
                <option value="no">{{ translate('common.no') }}</option>
              </select>
          </div>
          <div style="display:flex;align-items:flex-end;">
            <button class="btn ghost" (click)="clearFilters()" style="padding:6px 12px;font-size:13px;height:fit-content;">{{ translate('dashboard.clearFilters') }}</button>
          </div>
        </div>

        <!-- Map -->
        <div style="border-radius:6px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);position:relative;margin-bottom:12px;">
          <iframe
            [src]="getSafeMapUrl()"
            width="100%"
            height="500"
            style="border:0;display:block;pointer-events:auto;"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
          <!-- Vehicle Markers Overlay -->
          <div style="position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;">
            <div *ngFor="let vehicle of filteredVehicles" 
                 [style.position]="'absolute'"
                 [style.top]="vehicle.position.top + '%'"
                 [style.left]="vehicle.position.left + '%'"
                 [style.transform]="'translate(-50%, -50%)'">
              <div style="font-size:32px;filter:drop-shadow(2px 2px 4px rgba(0,0,0,0.3));">🚛</div>
              <div [style.background]="getVehicleColor(vehicle)" 
                   style="color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:700;margin-top:2px;white-space:nowrap;">
                {{ vehicle.regNo }}
              </div>
            </div>
            <!-- DMG Logo Watermark -->
            <div style="position:absolute;bottom:80px;right:16px;background:rgba(255,255,255,0.95);padding:8px 12px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);pointer-events:auto;">
              <img src="https://mines.rajasthan.gov.in/dmgcms/Static/website/images/logo_img.png" alt="DMG Logo" style="height:40px;display:block;">
            </div>
          </div>
          <div style="padding:12px;background:#f8f9fa;border-top:1px solid #e6eef5;">
            <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:13px;">
              <div *ngFor="let vehicle of filteredVehicles" style="display:flex;align-items:center;gap:6px;">
                <span [style.background]="getVehicleColor(vehicle)" 
                      style="width:16px;height:16px;border-radius:50%;display:inline-block;"></span>
                {{ vehicle.regNo }} ({{ vehicle.status }})
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Summary -->
        <div style="font-size:12px;color:#6b7280;padding:8px;background:#f8f9fa;border-radius:4px;">
          {{ translate('dashboard.showing') }} <strong>{{ filteredVehicles.length }}</strong> {{ filteredVehicles.length === 1 ? translate('dashboard.vehicle') : translate('dashboard.vehicles') }} 
          <span *ngIf="hasActiveFilters()">
            ({{ translate('dashboard.filteredBy') }}: 
            <span *ngIf="filters.lease">{{ translate('dashboard.lease') }}, </span>
            <span *ngIf="filters.vendor">{{ translate('dashboard.vendor') }}, </span>
            <span *ngIf="filters.status">{{ translate('common.status') }}, </span>
            <span *ngIf="filters.commodity">{{ translate('dashboard.commodity') }}, </span>
            <span *ngIf="filters.delayed">{{ translate('dashboard.delayed') }}, </span>
            <span *ngIf="filters.deviated">{{ translate('dashboard.deviated') }}</span>)
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* OCC Dashboard Styles */
    .occ-dashboard {
      width: 100%;
      min-height: calc(100vh - 120px);
    }

    .occ-section {
      background: #f5f7fb;
      padding: 18px 28px 32px 28px;
      overflow-y: auto;
      display: none;
    }

    .occ-section.active {
      display: block;
    }

    .breadcrumb {
      font-size: 12px;
      color: #9ca3af;
      margin-bottom: 8px;
    }

    .breadcrumb span {
      margin: 0 4px;
    }

    .page-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #111827;
    }

    .section-card {
      background: #ffffff;
      border-radius: 18px;
      padding: 18px;
      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
      border: 1px solid #e5e7eb;
      margin-bottom: 18px;
    }

    .section-header-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }

    .section-header-line h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }

    .section-subtitle {
      font-size: 12px;
      color: #6b7280;
    }

    .occ-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 18px;
      margin-top: 10px;
    }

    .occ-card {
      border-radius: 18px;
      padding: 22px 18px;
      background: linear-gradient(135deg, #ffffff, #f1f5f9);
      border: 1px solid #e5e7eb;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      transition: box-shadow 0.18s ease, transform 0.12s ease, background 0.18s ease;
    }

    .occ-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 25px rgba(15, 23, 42, 0.18);
      background: linear-gradient(135deg, #e0f2fe, #f9fafb);
    }

    .occ-left {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .occ-title {
      font-size: 17px;
      font-weight: 600;
      color: #111827;
    }

    .occ-sub {
      font-size: 13px;
      color: #6b7280;
    }

    .occ-meta {
      font-size: 11px;
      color: #4b5563;
    }

    .occ-icon-circle {
      width: 52px;
      height: 52px;
      border-radius: 18px;
      background: #e0f2fe;
      color: #0284c7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
    }

    .kpi-row {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 16px;
    }

    .er-kpi-row {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    @media (max-width: 1200px) {
      .kpi-row {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .er-kpi-row {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 800px) {
      .kpi-row {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .er-kpi-row {
        grid-template-columns: repeat(1, minmax(0, 1fr));
      }
    }

    .kpi-card {
      border-radius: 18px;
      background: #ffffff;
      padding: 16px 14px 12px 14px;
      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
      border: 1px solid #f3f4f6;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .kpi-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .kpi-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .kpi-value {
      font-size: 22px;
      font-weight: 700;
      color: #111827;
    }

    .kpi-sub {
      font-size: 11px;
      color: #6b7280;
    }

    .kpi-icon {
      width: 42px;
      height: 42px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .kpi-blue { background: #e0f2fe; color: #0284c7; }
    .kpi-red { background: #fee2e2; color: #b91c1c; }
    .kpi-pink { background: #fce7f3; color: #be185d; }
    .kpi-teal { background: #ccfbf1; color: #0f766e; }
    .kpi-orange { background: #ffedd5; color: #c2410c; }
    .kpi-violet { background: #e9d5ff; color: #7e22ce; }

    .filter-row {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 14px;
      font-size: 12px;
    }

    @media (max-width: 1150px) {
      .filter-row {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    @media (max-width: 720px) {
      .filter-row {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .filter-label {
      color: #6b7280;
      font-size: 12px;
    }

    .filter-input {
      border-radius: 10px;
      border: 1px solid #e5e7eb;
      padding: 7px 10px;
      background: #f9fafb;
      font-size: 12px;
      outline: none;
    }

    .btn-clear {
      border-radius: 10px;
      border: none;
      background: #06b6d4;
      color: #ffffff;
      padding: 8px 20px;
      font-size: 12px;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(8, 145, 178, 0.4);
      transition: background 0.2s;
    }

    .btn-clear:hover {
      background: #0891b2;
    }

    .flex-row {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
      gap: 16px;
    }

    @media (max-width: 1050px) {
      .flex-row {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    .map-card {
      border-radius: 16px;
      border: 1px solid #e5e7eb;
      overflow: hidden;
      background: #e5e7eb;
      height: 260px;
      position: relative;
    }

    .map-placeholder-layer {
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        45deg,
        #f9fafb,
        #f9fafb 12px,
        #e5e7eb 12px,
        #e5e7eb 24px
      );
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      color: #6b7280;
    }

    .vts-dot {
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #0ea5e9;
      box-shadow: 0 0 0 3px rgba(14,165,233,0.35);
      z-index: 10;
    }

    .table-card {
      border-radius: 16px;
      border: 1px solid #e5e7eb;
      background: #f9fafb;
      padding: 10px 12px;
      font-size: 12px;
    }

    .er-table-card {
      background: #ffffff;
      padding: 14px 16px;
    }

    .er-notes-card {
      background: #f9fafb;
      padding: 14px 16px;
    }

    .table-title {
      font-weight: 600;
      margin-bottom: 10px;
      color: #111827;
      font-size: 13px;
    }

    .table-summary {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 6px;
      font-size: 11px;
    }

    .pill {
      border-radius: 999px;
      padding: 3px 8px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
    }

    .table-wrapper {
      max-height: 180px;
      overflow: auto;
    }

    .er-table-wrapper {
      overflow-x: auto;
    }

    .er-notes-wrapper {
      overflow: visible;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }

    .er-table {
      font-size: 12px;
    }

    .er-table th,
    .er-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #e5e7eb;
    }

    .er-table th {
      background: #f8fafc;
      font-weight: 600;
      color: #475569;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      position: sticky;
      top: 0;
      z-index: 1;
    }

    .er-table tbody tr:hover {
      background: #f8fafc;
    }

    .er-table tbody tr:last-child td {
      border-bottom: none;
    }

    th, td {
      padding: 5px 6px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
      white-space: nowrap;
    }

    th {
      position: sticky;
      top: 0;
      background: #eef2ff;
      z-index: 1;
      font-weight: 600;
    }

    .text-right {
      text-align: right;
    }

    .status-pill {
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      display: inline-block;
      white-space: nowrap;
    }

    .status-approved { 
      background: #dcfce7; 
      color: #15803d; 
    }
    .status-pending { 
      background: #fef9c3; 
      color: #a16207; 
    }
    .status-rejected { 
      background: #fee2e2; 
      color: #b91c1c; 
    }

    .er-notes-list {
      padding-left: 20px;
      margin: 0;
      font-size: 12px;
      color: #475569;
      line-height: 1.6;
    }

    .er-notes-list li {
      margin-bottom: 10px;
    }

    .er-notes-list li:last-child {
      margin-bottom: 0;
    }

    .er-summary-row {
      gap: 18px;
    }

    /* Standard Dashboard Styles */
    .kpi-card {
      background: #fff;
      border: 1px solid #dbe7ea;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .kpi-label {
      font-size: 12px;
      color: #6b7280;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .kpi-value {
      font-size: 28px;
      font-weight: 800;
      color: var(--title-color);
      margin-bottom: 4px;
    }
    .kpi-change {
      font-size: 11px;
      color: #6b7280;
    }
    .kpi-change.positive {
      color: #10b981;
    }
    .kpi-change.negative {
      color: #ef4444;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  userRole = '';
  activeSection = 'occ';

  // VTS Data
  vtsKpis = {
    activeTrips: 52,
    onTime: 87.5,
    avgDelay: 12,
    vehiclesOffline: 21,
    deviations: 11,
    stops: 20
  };

  vtsRecords: VtsRecord[] = [
    { lease: "Lease-01", vendor: "Vendor A", status: "Active", commodity: "Limestone", trips: 18, onTime: 90.5, delay: 9, deviations: 2, delayed: "Yes", deviated: "Yes", lat: 26.92, lng: 75.79 },
    { lease: "Lease-01", vendor: "Vendor B", status: "Active", commodity: "Marble", trips: 10, onTime: 85.0, delay: 14, deviations: 1, delayed: "Yes", deviated: "No", lat: 26.94, lng: 75.75 },
    { lease: "Lease-02", vendor: "Vendor C", status: "Completed", commodity: "Gypsum", trips: 12, onTime: 92.3, delay: 8, deviations: 0, delayed: "No", deviated: "No", lat: 26.89, lng: 75.83 },
    { lease: "Lease-03", vendor: "Vendor D", status: "Active", commodity: "Copper", trips: 6, onTime: 80.2, delay: 18, deviations: 3, delayed: "Yes", deviated: "Yes", lat: 26.96, lng: 75.81 },
    { lease: "Lease-03", vendor: "Vendor A", status: "Delayed", commodity: "Limestone", trips: 6, onTime: 70.0, delay: 26, deviations: 5, delayed: "Yes", deviated: "Yes", lat: 26.98, lng: 75.79 }
  ];

  filteredVtsRecords: VtsRecord[] = [];
  vtsFilters = {
    lease: 'ALL',
    vendor: 'ALL',
    status: 'ALL',
    commodity: 'ALL',
    delayed: 'ALL',
    deviated: 'ALL'
  };

  get uniqueLeases(): string[] {
    return [...new Set(this.vtsRecords.map(r => r.lease))].sort();
  }

  get uniqueVendors(): string[] {
    return [...new Set(this.vtsRecords.map(r => r.vendor))].sort();
  }

  get uniqueStatuses(): string[] {
    return [...new Set(this.vtsRecords.map(r => r.status))].sort();
  }

  get uniqueCommodities(): string[] {
    return [...new Set(this.vtsRecords.map(r => r.commodity))].sort();
  }

  // eRawanna Data
  erKpis = {
    issued: 34,
    pending: 5,
    rejected: 3,
    avgTime: 26
  };

  erRawannas: ErRawanna[] = [
    { no: "RWN-001", lease: "Lease-01", vehicle: "RJ14-1234", commodity: "Limestone", qty: 18.0, status: "APPROVED" },
    { no: "RWN-002", lease: "Lease-02", vehicle: "RJ19-5678", commodity: "Marble", qty: 22.5, status: "PENDING" },
    { no: "RWN-003", lease: "Lease-03", vehicle: "RJ27-3344", commodity: "Gypsum", qty: 16.0, status: "APPROVED" },
    { no: "RWN-004", lease: "Lease-01", vehicle: "RJ09-9988", commodity: "Limestone", qty: 20.3, status: "REJECTED" }
  ];

  erNotes = [
    "2 Rawannas pending for Lease-02 due to quantity clarification.",
    "System flagged 1 Rawanna for duplicate vehicle within same shift.",
    "No offline Rawanna entries received from field offices so far."
  ];

  // Standard Dashboard Data
  kpis = {
    activeTrips: 24,
    onTimePercentage: 87.5,
    averageDelay: 12,
    vehiclesOffline: 2,
    routeDeviations: 3,
    stopsAboveThreshold: 5
  };

  filters = {
    lease: '',
    vendor: '',
    status: '',
    commodity: '',
    delayed: '',
    deviated: ''
  };

  vehicles = [
    {
      regNo: 'OD02AB1234',
      lease: 'lease-a',
      vendor: 'ven-001',
      status: 'active',
      commodity: 'limestone',
      delayed: 'no',
      deviated: 'no',
      position: { top: 35, left: 48 }
    },
    {
      regNo: 'RJ14CD5678',
      lease: 'lease-b',
      vendor: 'ven-002',
      status: 'active',
      commodity: 'marble',
      delayed: 'yes',
      deviated: 'no',
      position: { top: 45, left: 52 }
    },
    {
      regNo: 'RJ19EF9012',
      lease: 'lease-a',
      vendor: 'ven-001',
      status: 'active',
      commodity: 'limestone',
      delayed: 'no',
      deviated: 'yes',
      position: { top: 55, left: 46 }
    },
    {
      regNo: 'OD05GH3456',
      lease: 'lease-c',
      vendor: 'ven-001',
      status: 'inactive',
      commodity: 'sandstone',
      delayed: 'yes',
      deviated: 'yes',
      position: { top: 40, left: 50 }
    },
    {
      regNo: 'RJ22IJ7890',
      lease: 'lease-b',
      vendor: 'ven-002',
      status: 'active',
      commodity: 'gypsum',
      delayed: 'no',
      deviated: 'no',
      position: { top: 50, left: 54 }
    }
  ];

  filteredVehicles: any[] = [];
  private languageSubscription?: Subscription;

  constructor(
    private sanitizer: DomSanitizer,
    private translationService: TranslationService
  ) {}

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  ngOnInit(): void {
    this.userRole = sessionStorage.getItem('role') || '';
    if (this.userRole === 'occ') {
      // Always show OCC Home as default when navigating to dashboard
      this.activeSection = 'occ';
      this.applyVtsFilters();
    } else {
      this.applyFilters();
    }
    this.languageSubscription = this.translationService.language$.subscribe(() => {
      // Component will automatically update when language changes
    });
  }

  ngOnDestroy(): void {
    this.languageSubscription?.unsubscribe();
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  // VTS Methods
  applyVtsFilters(): void {
    this.filteredVtsRecords = this.vtsRecords.filter(record => {
      if (this.vtsFilters.lease !== 'ALL' && record.lease !== this.vtsFilters.lease) return false;
      if (this.vtsFilters.vendor !== 'ALL' && record.vendor !== this.vtsFilters.vendor) return false;
      if (this.vtsFilters.status !== 'ALL' && record.status !== this.vtsFilters.status) return false;
      if (this.vtsFilters.commodity !== 'ALL' && record.commodity !== this.vtsFilters.commodity) return false;
      if (this.vtsFilters.delayed !== 'ALL' && record.delayed !== this.vtsFilters.delayed) return false;
      if (this.vtsFilters.deviated !== 'ALL' && record.deviated !== this.vtsFilters.deviated) return false;
      return true;
    });
  }

  clearVtsFilters(): void {
    this.vtsFilters = {
      lease: 'ALL',
      vendor: 'ALL',
      status: 'ALL',
      commodity: 'ALL',
      delayed: 'ALL',
      deviated: 'ALL'
    };
    this.applyVtsFilters();
  }

  getMapDotX(record: VtsRecord): number {
    const rect = document.querySelector('.map-card')?.getBoundingClientRect();
    if (!rect) return 0;
    const x = ((record.lng - 75.75) / 0.35) * rect.width;
    return Math.min(Math.max(x, 12), rect.width - 12);
  }

  getMapDotY(record: VtsRecord): number {
    const rect = document.querySelector('.map-card')?.getBoundingClientRect();
    if (!rect) return 0;
    const y = ((26.99 - record.lat) / 0.14) * rect.height;
    return Math.min(Math.max(y, 24), rect.height - 12);
  }

  getTotalTrips(): number {
    return this.filteredVtsRecords.reduce((sum, r) => sum + r.trips, 0);
  }

  getAvgOnTime(): number {
    const totalTrips = this.getTotalTrips();
    if (totalTrips === 0) return 0;
    return this.filteredVtsRecords.reduce((sum, r) => sum + r.onTime * r.trips, 0) / totalTrips;
  }

  getAvgDelay(): number {
    const totalTrips = this.getTotalTrips();
    if (totalTrips === 0) return 0;
    return this.filteredVtsRecords.reduce((sum, r) => sum + r.delay * r.trips, 0) / totalTrips;
  }

  getTotalDeviations(): number {
    return this.filteredVtsRecords.reduce((sum, r) => sum + r.deviations, 0);
  }

  // Standard Dashboard Methods
  applyFilters(): void {
    this.filteredVehicles = this.vehicles.filter(vehicle => {
      if (this.filters.lease && vehicle.lease !== this.filters.lease) return false;
      if (this.filters.vendor && vehicle.vendor !== this.filters.vendor) return false;
      if (this.filters.status && vehicle.status !== this.filters.status) return false;
      if (this.filters.commodity && vehicle.commodity !== this.filters.commodity) return false;
      if (this.filters.delayed && vehicle.delayed !== this.filters.delayed) return false;
      if (this.filters.deviated && vehicle.deviated !== this.filters.deviated) return false;
      return true;
    });
  }

  clearFilters(): void {
    this.filters = {
      lease: '',
      vendor: '',
      status: '',
      commodity: '',
      delayed: '',
      deviated: ''
    };
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.lease || this.filters.vendor || this.filters.status || 
              this.filters.commodity || this.filters.delayed || this.filters.deviated);
  }

  getVehicleColor(vehicle: any): string {
    if (vehicle.deviated === 'yes') return '#ef4444';
    if (vehicle.delayed === 'yes') return '#f59e0b';
    if (vehicle.status === 'inactive') return '#6b7280';
    return '#34a853';
  }

  getSafeMapUrl(): SafeResourceUrl {
    const url = 'https://www.google.com/maps?q=26.9124,75.7873&hl=en&z=11&output=embed';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
