import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../services/translation.service';
import Swal from 'sweetalert2';

declare var L: any;

@Component({
  selector: 'app-geofence',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="page-title">{{ translate('geofence.title') }}</div>
      <div class="small">{{ translate('geofence.subtitle') }}</div>
    </div>

    <div class="card">
      <div class="tabs">
        <div class="tab" [class.active]="activeTab === 'list'" (click)="setActiveTab('list')">{{ translate('geofence.list') }}</div>
        <div class="tab" [class.active]="activeTab === 'create'" (click)="setActiveTab('create')">{{ translate('geofence.create') }}</div>
      </div>

      <div id="geofence-list" class="tab-content" [class.active]="activeTab === 'list'">
        <table class="table" *ngIf="geofencesList.length > 0">
          <thead>
            <tr>
              <th>Fence Name</th>
              <th>Type</th>
              <th>Coordinate Details</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let fence of geofencesList; let i = index">
              <td><strong>{{ fence.name }}</strong></td>
              <td><span class="badge" [style.background]="getTypeColor(fence.type)">{{ geofenceTypes[fence.type] || fence.type || 'N/A' }}</span></td>
              <td>
                <div style="max-width:400px;">
                  <div *ngIf="fence.coordinates && fence.coordinates.length > 0">
                    <div style="font-size:12px;color:var(--text-color);margin-bottom:8px;">
                      <strong>Total Points:</strong> {{ fence.coordinates.length }}
                    </div>
                    <div style="max-height:120px;overflow-y:auto;background:#f8f9fa;padding:8px;border-radius:4px;font-family:monospace;font-size:11px;">
                      <div *ngFor="let coord of fence.coordinates; let j = index" style="padding:2px 0;color:var(--text-color);">
                        {{ j + 1 }}. {{ coord.lat }}, {{ coord.lng }}
                      </div>
                    </div>
                    <div style="font-size:12px;color:var(--text-color);margin-top:8px;">
                      <strong>Radius:</strong> {{ fence.toleranceRadius ? fence.toleranceRadius + ' m' : 'N/A' }}
                    </div>
                  </div>
                  <div *ngIf="fence.coordinateDetails && (!fence.coordinates || fence.coordinates.length === 0)">
                    <div *ngFor="let detail of fence.coordinateDetails; let j = index" style="margin-bottom:8px;padding:8px;background:#f8f9fa;border-radius:4px;border-left:3px solid var(--teal);">
                      <div style="font-size:12px;font-weight:600;color:var(--title-color);margin-bottom:4px;">Point #{{ j + 1 }}</div>
                      <div style="font-size:12px;color:var(--text-color);"><strong>Coordinates:</strong> {{ formatCoordinates(detail) || 'N/A' }}</div>
                      <div style="font-size:12px;color:var(--text-color);"><strong>Radius:</strong> {{ detail.toleranceRadius ? detail.toleranceRadius + ' m' : 'N/A' }}</div>
                    </div>
                    <div style="font-size:11px;color:#6b7280;margin-top:4px;">Total: {{ (fence.coordinateDetails && fence.coordinateDetails.length) || 0 }} point(s)</div>
                  </div>
                </div>
              </td>
              <td><span [class]="fence.status === 'active' ? 'status-active' : 'status-inactive'">{{ fence.status === 'active' ? 'Active' : 'Inactive' }}</span></td>
              <td>
                <button class="btn ghost" style="padding:4px 8px;font-size:12px;" (click)="viewFenceOnMap(fence)">View</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="geofencesList.length === 0" style="text-align:center;padding:40px;color:#6b7280;">
          <div style="font-size:18px;margin-bottom:8px;">{{ translate('geofence.noGeofencesCreatedYet') }}</div>
          <div class="small">{{ translate('geofence.createYourFirstGeofence') }}</div>
        </div>
      </div>

      <div id="geofence-create" class="tab-content" [class.active]="activeTab === 'create'">
        <form #geoForm="ngForm">
          <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div>
              <label>Fence Name <span style="color:#ef4444">*</span></label>
              <input type="text" placeholder="Enter fence name" name="name" [(ngModel)]="geofenceFormData.name" required />
            </div>
            <div>
              <label>Geofence Type <span style="color:#ef4444">*</span></label>
              <select name="type" [(ngModel)]="geofenceFormData.type" (change)="onTypeChange()" required>
                <option value="">Select geofence type</option>
                <option value="lease-area">Lease Area</option>
                <option value="dealer-location">Dealer Location</option>
                <option value="illegal-mining-area">Illegal Mining Prone Area</option>
                <option value="weighbridge">Empanelled Weighbridge</option>
              </select>
              <div class="small" style="margin-top:4px;">Select the type of geofence to be created</div>
            </div>
          </div>
          
          <!-- Polygon Coordinates Input -->
          <div class="form-row">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <label style="margin:0;">Polygon Coordinates <span style="color:#ef4444">*</span></label>
              <div style="display:flex;gap:8px;">
                <button type="button" class="btn ghost" style="padding:4px 12px;font-size:12px;" (click)="clearDrawing()" *ngIf="parsedCoordinates.length > 0">Clear Map</button>
                <button type="button" class="btn ghost" style="padding:4px 12px;font-size:12px;" (click)="removeLastPoint()" *ngIf="parsedCoordinates.length > 0">Remove Last Point</button>
              </div>
            </div>
            
            <!-- Interactive Map for Drawing -->
            <div style="margin-bottom:16px;border-radius:6px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
              <div id="drawingMap" style="width:100%;height:400px;position:relative;"></div>
              <div style="padding:12px;background:#f8f9fa;border-top:1px solid #e6eef5;font-size:13px;">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:space-between;">
                  <span style="color:var(--text-color);">
                    <strong>Instructions:</strong> Click on the map to draw polygon area. 
                    <span *ngIf="parsedCoordinates.length < 3" style="color:#ef4444;font-weight:600;">
                      Add {{ 3 - parsedCoordinates.length }} more point(s) to complete polygon.
                    </span>
                    <span *ngIf="parsedCoordinates.length >= 3" style="color:var(--teal);font-weight:600;">
                      ✓ Polygon with {{ parsedCoordinates.length }} point(s) - Coordinates captured automatically.
                    </span>
                  </span>
                  <span *ngIf="parsedCoordinates.length > 0" style="color:#6b7280;font-size:12px;">
                    Coordinates are automatically saved below ↓
                  </span>
                </div>
              </div>
            </div>

            <!-- Textarea for displaying captured coordinates -->
            <label style="margin-top:16px;">Polygon Coordinates (Auto-captured from Map Drawing) <span style="color:#6b7280;font-weight:normal;font-size:12px;">*Read-only when drawn from map</span></label>
            <textarea 
              placeholder="Click on the map above to draw polygon area. Coordinates will be automatically captured here..."
              name="coordinates" 
              [(ngModel)]="geofenceFormData.coordinatesText" 
              (input)="parseCoordinates()"
              [readonly]="parsedCoordinates.length > 0"
              [style.background-color]="parsedCoordinates.length > 0 ? '#f0f9ff' : '#fafafa'"
              [style.cursor]="parsedCoordinates.length > 0 ? 'not-allowed' : 'text'"
              style="min-height:100px;font-family:monospace;font-size:13px;border:2px solid var(--teal);"
            ></textarea>
            <div class="small" style="margin-top:4px;">
              <span *ngIf="parsedCoordinates.length > 0" style="color:var(--teal);font-weight:600;">
                ✓ {{ parsedCoordinates.length }} coordinate(s) automatically captured from map drawing.
                <span style="color:#6b7280;font-weight:normal;">Clear map to edit manually.</span>
              </span>
              <span *ngIf="parsedCoordinates.length === 0" style="color:#6b7280;">
                <strong>Instructions:</strong> Click on the map above to draw your polygon area. Coordinates will be automatically saved here.
              </span>
            </div>
            <div *ngIf="parsedCoordinates.length > 0" style="margin-top:12px;padding:12px;background:#f0f9ff;border-radius:6px;border-left:3px solid var(--teal);">
              <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:var(--title-color);">Preview Coordinates:</div>
              <div style="max-height:150px;overflow-y:auto;font-family:monospace;font-size:12px;">
                <div *ngFor="let coord of parsedCoordinates; let i = index" style="padding:4px 0;color:var(--text-color);display:flex;justify-content:space-between;align-items:center;">
                  <span>Point {{ i + 1 }}: {{ coord.lat }}, {{ coord.lng }}</span>
                  <button type="button" class="btn ghost" style="padding:2px 6px;font-size:11px;color:#ef4444;" (click)="removePoint(i)" *ngIf="parsedCoordinates.length > 3">Remove</button>
                </div>
              </div>
            </div>
          </div>

          <div class="form-row">
            <label>Tolerance Radius (meters) <span style="color:#ef4444">*</span></label>
            <input type="number" placeholder="Enter tolerance radius in meters" name="toleranceRadius" [(ngModel)]="geofenceFormData.toleranceRadius" required min="0" step="0.1" />
            <div class="small" style="margin-top:4px;">Tolerance radius for the entire geofence polygon</div>
          </div>

          <div class="form-row">
            <label>Additional Notes</label>
            <textarea placeholder="Enter any additional notes or remarks" name="notes" [(ngModel)]="geofenceFormData.notes" style="min-height:60px;"></textarea>
          </div>
          <div style="display:flex;gap:8px;margin-top:8px;">
            <button class="btn" type="button" (click)="createFence(geoForm)">Create Fence</button>
            <button class="btn ghost" type="button" (click)="clearForm(geoForm)">Clear</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Map View Modal -->
    <div id="geofenceMapModal" class="modal" [class.show]="showMapModal">
      <div class="modal-content" style="max-width:900px;width:95%;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="margin:0;">{{ selectedFence?.name || 'Geofence Location' }}</h3>
          <button class="btn ghost" (click)="closeMapModal()" style="padding:4px 8px;">✕</button>
        </div>
        <div *ngIf="selectedFence">
          <div style="margin-bottom:16px;">
            <div style="margin-bottom:8px;"><strong>Type:</strong> <span class="badge" [style.background]="getTypeColor(selectedFence.type)">{{ geofenceTypes[selectedFence.type] || selectedFence.type }}</span></div>
            <div style="margin-bottom:8px;"><strong>Total Points:</strong> {{ (selectedFence.coordinates?.length || selectedFence.coordinateDetails?.length) || 0 }}</div>
            <div style="margin-bottom:8px;"><strong>Tolerance Radius:</strong> {{ selectedFence.toleranceRadius ? selectedFence.toleranceRadius + ' m' : 'N/A' }}</div>
            <div style="max-height:150px;overflow-y:auto;background:#f8f9fa;padding:12px;border-radius:6px;margin-bottom:12px;">
              <div *ngIf="selectedFence.coordinates && selectedFence.coordinates.length > 0">
                <div *ngFor="let coord of selectedFence.coordinates; let i = index" style="margin-bottom:8px;padding:8px;background:#fff;border-radius:4px;border-left:3px solid var(--teal);">
                  <div style="font-weight:600;margin-bottom:4px;">Point #{{ i + 1 }}</div>
                  <div style="font-size:13px;font-family:monospace;"><strong>Coordinates:</strong> {{ coord.lat }}, {{ coord.lng }}</div>
                </div>
              </div>
              <div *ngIf="selectedFence.coordinateDetails && (!selectedFence.coordinates || selectedFence.coordinates.length === 0)">
                <div *ngFor="let detail of selectedFence.coordinateDetails; let i = index" style="margin-bottom:8px;padding:8px;background:#fff;border-radius:4px;border-left:3px solid var(--teal);">
                  <div style="font-weight:600;margin-bottom:4px;">Point #{{ i + 1 }}</div>
                  <div style="font-size:13px;"><strong>Coordinates:</strong> {{ formatCoordinates(detail) }}</div>
                  <div style="font-size:13px;"><strong>Tolerance Radius:</strong> {{ detail.toleranceRadius }} m</div>
                </div>
              </div>
            </div>
          </div>
          <div style="border-radius:6px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);position:relative;">
            <div #mapContainer id="geofenceMap" style="width:100%;height:500px;border:0;"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class GeofenceComponent implements OnInit, OnDestroy {
  activeTab = 'list';
  showMapModal = false;
  selectedFence: any = null;
  private languageSubscription?: Subscription;
  private map: any = null;
  private polygon: any = null;
  private mapInitialized = false;
  private drawingMap: any = null;
  private drawingPolygon: any = null;
  private drawingMarkers: any[] = [];
  private drawingMapInitialized = false;

  geofenceFormData = {
    name: '',
    type: '',
    coordinatesText: '',
    toleranceRadius: null as number | null,
    notes: ''
  };

  parsedCoordinates: Array<{lat: number, lng: number}> = [];

  geofenceTypes: { [key: string]: string } = {
    'lease-area': 'Lease Area',
    'dealer-location': 'Dealer Location',
    'illegal-mining-area': 'Illegal Mining Prone Area',
    'weighbridge': 'Empanelled Weighbridge'
  };

  geofencesList: Array<{
    id: string;
    name: string;
    type: string;
    coordinates: Array<{lat: number, lng: number}>;
    toleranceRadius: number | null;
    coordinateDetails?: Array<any>; // For backward compatibility
    notes: string;
    status: string;
    createdAt: string;
  }> = [];

  constructor(
    private sanitizer: DomSanitizer,
    private translationService: TranslationService
  ) {}

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  ngOnInit(): void {
    // Subscribe to language changes
    this.languageSubscription = this.translationService.language$.subscribe(() => {
      // Component will automatically update when language changes
    });

    // Clear any invalid records first
    this.clearInvalidRecords();
    
    // Load geofences from sessionStorage (includes sample records if needed)
    this.loadGeofences();

    // Check if this is a fresh navigation
    const isFreshNav = sessionStorage.getItem('freshNav_geofence') === 'true';
    if (isFreshNav) {
      // Remove fresh nav flag and default to 'create' tab
      sessionStorage.removeItem('freshNav_geofence');
      this.activeTab = 'create';
    } else {
      // Restore previous tab state
      const stored = sessionStorage.getItem('tab_geofence');
      if (stored) {
        this.activeTab = stored;
      } else {
        // Default to 'create' if no stored state
        this.activeTab = 'create';
      }
    }

    // Initialize drawing map when create tab is active
    if (this.activeTab === 'create') {
      setTimeout(() => {
        this.initializeDrawingMap();
      }, 300);
    }
  }

  clearInvalidRecords(): void {
    const stored = sessionStorage.getItem('geofences_list');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Filter out invalid records (support both old and new formats)
        const validRecords = parsed.filter((f: any) => {
          // New format: coordinates array
          if (f.coordinates && Array.isArray(f.coordinates) && f.coordinates.length >= 3) {
            return true;
          }
          // Old format: coordinateDetails
          if (f.coordinateDetails && 
              Array.isArray(f.coordinateDetails) && 
              f.coordinateDetails.length > 0 &&
              f.coordinateDetails.some((d: any) => 
                // Old format: coords string
                (d.coords && d.toleranceRadius !== null) ||
                // New format: separate fields
                (d.latitude !== null && d.latitudeDirection && d.longitude !== null && d.longitudeDirection && d.toleranceRadius !== null)
              )
          ) {
            return true;
          }
          return false;
        });
        
        // If no valid records or no sample records, clear and will add samples
        const hasSamples = validRecords.some((f: any) => f.id && f.id.startsWith('GEO-SAMPLE'));
        if (!hasSamples || validRecords.length === 0) {
          sessionStorage.removeItem('geofences_list');
        } else {
          // Save only valid records
          sessionStorage.setItem('geofences_list', JSON.stringify(validRecords));
        }
      } catch (e) {
        sessionStorage.removeItem('geofences_list');
      }
    }
  }

  loadGeofences(): void {
    const stored = sessionStorage.getItem('geofences_list');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Filter out invalid records (support both old and new formats)
        const validRecords = parsed.filter((f: any) => {
          // New format: coordinates array
          if (f.coordinates && Array.isArray(f.coordinates) && f.coordinates.length >= 3) {
            return true;
          }
          // Old format: coordinateDetails
          if (f.coordinateDetails && 
              Array.isArray(f.coordinateDetails) && 
              f.coordinateDetails.length > 0 &&
              f.coordinateDetails.some((d: any) => 
                // Old format: coords string
                (d.coords && d.toleranceRadius !== null) ||
                // New format: separate fields
                (d.latitude !== null && d.latitudeDirection && d.longitude !== null && d.longitudeDirection && d.toleranceRadius !== null)
              )
          ) {
            return true;
          }
          return false;
        });
        
        // Check if sample records exist
        const hasSamples = validRecords.some((f: any) => f.id && f.id.startsWith('GEO-SAMPLE'));
        
        if (!hasSamples) {
          // Clear invalid records and add sample records
          this.geofencesList = [];
          this.addSampleRecords();
        } else {
          // Keep only valid records
          this.geofencesList = validRecords;
        }
      } catch (e) {
        this.geofencesList = [];
        this.addSampleRecords();
      }
    } else {
      // No stored data, add sample records
      this.addSampleRecords();
    }
  }

  saveGeofences(): void {
    sessionStorage.setItem('geofences_list', JSON.stringify(this.geofencesList));
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    sessionStorage.setItem('tab_geofence', tab);
    
    // Initialize drawing map when switching to create tab
    if (tab === 'create') {
      setTimeout(() => {
        this.initializeDrawingMap();
      }, 300);
    } else {
      this.destroyDrawingMap();
    }
  }

  parseCoordinates(): void {
    this.parsedCoordinates = [];
    if (!this.geofenceFormData.coordinatesText || !this.geofenceFormData.coordinatesText.trim()) {
      this.updateDrawingMap();
      return;
    }

    // Split by semicolon and process each coordinate pair
    const coordStrings = this.geofenceFormData.coordinatesText.split(';');
    
    for (const coordString of coordStrings) {
      const trimmed = coordString.trim();
      if (!trimmed) continue;

      // Match lat,long pattern (allowing for spaces)
      const match = trimmed.match(/^\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*$/);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        
        // Validate ranges
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          this.parsedCoordinates.push({ lat, lng });
        }
      }
    }
    
    this.updateDrawingMap();
  }

  initializeDrawingMap(): void {
    if (this.drawingMapInitialized) return;
    
    const mapElement = document.getElementById('drawingMap');
    if (!mapElement) {
      // Retry after a short delay if element not found
      setTimeout(() => this.initializeDrawingMap(), 100);
      return;
    }

    // Destroy existing map if any
    this.destroyDrawingMap();

    // Initialize map centered on Rajasthan state, India
    // Rajasthan center coordinates: approximately 26.9124°N, 75.7873°E
    this.drawingMap = L.map('drawingMap').setView([26.9124, 75.7873], 7);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.drawingMap);

    // Add click handler to add points
    this.drawingMap.on('click', (e: any) => {
      this.addPointToDrawing(e.latlng.lat, e.latlng.lng);
    });

    // Load existing coordinates if any
    if (this.parsedCoordinates.length > 0) {
      this.updateDrawingMap();
    }

    this.drawingMapInitialized = true;
  }

  addPointToDrawing(lat: number, lng: number): void {
    this.parsedCoordinates.push({ lat, lng });
    this.updateCoordinatesText();
    this.updateDrawingMap();
    
    // Show feedback when adding points
    if (this.parsedCoordinates.length === 1) {
      // First point added
    } else if (this.parsedCoordinates.length === 2) {
      // Second point - show hint
    } else if (this.parsedCoordinates.length === 3) {
      // Third point - polygon will be drawn
    }
  }

  removePoint(index: number): void {
    if (this.parsedCoordinates.length > 0 && index >= 0 && index < this.parsedCoordinates.length) {
      this.parsedCoordinates.splice(index, 1);
      this.updateCoordinatesText();
      this.updateDrawingMap();
    }
  }

  removeLastPoint(): void {
    if (this.parsedCoordinates.length > 0) {
      this.parsedCoordinates.pop();
      this.updateCoordinatesText();
      this.updateDrawingMap();
    }
  }

  clearDrawing(): void {
    this.parsedCoordinates = [];
    this.geofenceFormData.coordinatesText = '';
    this.updateDrawingMap();
  }

  updateCoordinatesText(): void {
    this.geofenceFormData.coordinatesText = this.parsedCoordinates
      .map(coord => `${coord.lat}, ${coord.lng}`)
      .join('; ');
  }

  updateDrawingMap(): void {
    if (!this.drawingMap || !this.drawingMapInitialized) return;

    // Remove existing polygon and markers
    if (this.drawingPolygon) {
      this.drawingMap.removeLayer(this.drawingPolygon);
      this.drawingPolygon = null;
    }
    this.drawingMarkers.forEach(marker => {
      this.drawingMap.removeLayer(marker);
    });
    this.drawingMarkers = [];

    if (this.parsedCoordinates.length === 0) {
      // Reset view to Rajasthan if no coordinates
      this.drawingMap.setView([26.9124, 75.7873], 7);
      return;
    }

    // Add markers for each point
    this.parsedCoordinates.forEach((coord: {lat: number, lng: number}, index: number) => {
      const marker = L.marker([coord.lat, coord.lng], {
        draggable: true,
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="background:${this.getTypeColor(this.geofenceFormData.type) || '#3b82f6'};color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:11px;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);">${index + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(this.drawingMap);

      marker.bindPopup(`
        <div style="text-align:center;">
          <strong>Point ${index + 1}</strong><br>
          ${coord.lat.toFixed(6)}, ${coord.lng.toFixed(6)}<br>
          <small style="color:#6b7280;">Drag to adjust position</small>
        </div>
      `);

      // Handle marker drag
      marker.on('dragend', (e: any) => {
        const newLat = e.target.getLatLng().lat;
        const newLng = e.target.getLatLng().lng;
        this.parsedCoordinates[index] = { lat: newLat, lng: newLng };
        this.updateCoordinatesText();
        this.updateDrawingMap();
      });

      this.drawingMarkers.push(marker);
    });

    // Draw polygon if we have at least 3 points
    if (this.parsedCoordinates.length >= 3) {
      const latLngs = this.parsedCoordinates.map(coord => [coord.lat, coord.lng]);
      
      // Get color based on geofence type
      const polygonColor = this.getTypeColor(this.geofenceFormData.type) || '#3b82f6';

      this.drawingPolygon = L.polygon(latLngs, {
        color: polygonColor,
        fillColor: polygonColor,
        fillOpacity: 0.25,
        weight: 3,
        dashArray: '5, 5'
      }).addTo(this.drawingMap);

      // Fit map to polygon bounds with padding
      this.drawingMap.fitBounds(this.drawingPolygon.getBounds(), { padding: [30, 30] });
    } else if (this.parsedCoordinates.length > 0) {
      // If less than 3 points, center on the points but keep Rajasthan in view
      const bounds = L.latLngBounds(this.parsedCoordinates.map((c: {lat: number, lng: number}) => [c.lat, c.lng]));
      // Expand bounds to include Rajasthan center if points are far
      bounds.extend([26.9124, 75.7873]);
      this.drawingMap.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }

  destroyDrawingMap(): void {
    if (this.drawingMap) {
      this.drawingMap.remove();
      this.drawingMap = null;
      this.drawingPolygon = null;
      this.drawingMarkers = [];
      this.drawingMapInitialized = false;
    }
  }

  onTypeChange(): void {
    // Update polygon color when type changes
    if (this.drawingMapInitialized && this.parsedCoordinates.length >= 3) {
      this.updateDrawingMap();
    }
  }


  createFence(form: any): void {
    if (!form.valid || !this.geofenceFormData.name || !this.geofenceFormData.type) {
      Swal.fire({
        icon: 'warning',
        title: 'Required Fields',
        text: 'Please enter fence name and select type',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    // Parse coordinates if not already parsed
    if (this.parsedCoordinates.length === 0) {
      this.parseCoordinates();
    }

    // Validate coordinates
    if (this.parsedCoordinates.length < 3) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Coordinates',
        text: 'Please enter at least 3 coordinate points to form a polygon. Format: lat,long; lat,long; ...',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    // Validate tolerance radius
    if (this.geofenceFormData.toleranceRadius === null || this.geofenceFormData.toleranceRadius <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Tolerance Radius Required',
        text: 'Please enter a valid tolerance radius in meters',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    // Create new geofence
    const newFence = {
      id: 'GEO-' + Date.now(),
      name: this.geofenceFormData.name,
      type: this.geofenceFormData.type,
      coordinates: [...this.parsedCoordinates],
      toleranceRadius: this.geofenceFormData.toleranceRadius,
      notes: this.geofenceFormData.notes || '',
      status: 'active',
      createdAt: new Date().toISOString()
    };

    // Add to list
    this.geofencesList.push(newFence);
    this.saveGeofences();

    // Show success message with option to continue adding
    Swal.fire({
      icon: 'success',
      title: 'Geofence Created',
      html: `Geofence "<strong>${newFence.name}</strong>" has been created successfully.<br><br>Coordinates: <strong>${newFence.coordinates.length}</strong> points<br>Total geofences: <strong>${this.geofencesList.length}</strong>`,
      confirmButtonText: 'Add Another',
      showCancelButton: true,
      cancelButtonText: 'View List',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280'
    }).then((result) => {
      // Clear form for next entry
      this.clearForm(form);
      
      // If user clicks "View List", switch to list tab
      if (result.dismiss === Swal.DismissReason.cancel) {
        this.activeTab = 'list';
      }
      // If user clicks "Add Another" or closes, stay on create tab (form already cleared)
    });
  }

  viewFenceOnMap(fence: any): void {
    this.selectedFence = fence;
    this.showMapModal = true;
    this.mapInitialized = false;
    // Initialize map after view update (wait for modal to render)
    setTimeout(() => {
      this.initializeMap();
    }, 200);
  }

  closeMapModal(): void {
    this.showMapModal = false;
    this.selectedFence = null;
    this.destroyMap();
  }

  initializeMap(): void {
    if (this.mapInitialized || !this.selectedFence) return;
    
    // Destroy existing map if any
    this.destroyMap();

    // Get coordinates
    let coordinates: Array<{lat: number, lng: number}> = [];
    
    if (this.selectedFence.coordinates && this.selectedFence.coordinates.length > 0) {
      coordinates = this.selectedFence.coordinates;
    } else if (this.selectedFence.coordinateDetails && this.selectedFence.coordinateDetails.length > 0) {
      // Convert old format to new format
      coordinates = this.selectedFence.coordinateDetails.map((d: any) => {
        if (d.coords) {
          const coordMatch = d.coords.match(/(\d+\.?\d*)[°\s]*[NS]?[,\s]+(\d+\.?\d*)[°\s]*[EW]?/i);
          if (coordMatch) {
            let lat = parseFloat(coordMatch[1]);
            let lng = parseFloat(coordMatch[2]);
            // Apply direction if present
            if (d.coords.includes('S')) lat = -Math.abs(lat);
            if (d.coords.includes('W')) lng = -Math.abs(lng);
            return { lat, lng };
          }
        } else if (d.latitude !== null && d.longitude !== null) {
          let lat = d.latitude;
          let lng = d.longitude;
          if (d.latitudeDirection === 'S') lat = -Math.abs(lat);
          if (d.longitudeDirection === 'W') lng = -Math.abs(lng);
          return { lat, lng };
        }
        return null;
      }).filter((c: any) => c !== null);
    }

    if (coordinates.length === 0) return;

    // Calculate center point
    let sumLat = 0;
    let sumLng = 0;
    for (const coord of coordinates) {
      sumLat += coord.lat;
      sumLng += coord.lng;
    }
    const centerLat = sumLat / coordinates.length;
    const centerLng = sumLng / coordinates.length;

    // Initialize map
    const mapElement = document.getElementById('geofenceMap');
    if (!mapElement) return;

    this.map = L.map('geofenceMap').setView([centerLat, centerLng], 13);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Convert coordinates to Leaflet format [lat, lng]
    const latLngs = coordinates.map(coord => [coord.lat, coord.lng]);

    // Get color based on geofence type
    const polygonColor = this.getTypeColor(this.selectedFence.type) || '#3b82f6';

    // Draw polygon
    this.polygon = L.polygon(latLngs, {
      color: polygonColor,
      fillColor: polygonColor,
      fillOpacity: 0.3,
      weight: 2
    }).addTo(this.map);

    // Fit map to polygon bounds
    this.map.fitBounds(this.polygon.getBounds(), { padding: [20, 20] });

    // Add markers for each point
    coordinates.forEach((coord: {lat: number, lng: number}, index: number) => {
      L.marker([coord.lat, coord.lng])
        .addTo(this.map)
        .bindPopup(`Point ${index + 1}<br>${coord.lat}, ${coord.lng}`);
    });

    this.mapInitialized = true;
  }

  destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.polygon = null;
      this.mapInitialized = false;
    }
  }

  formatCoordinates(detail: any): string {
    if (!detail) return 'N/A';
    
    // Support both old format (coords string) and new format (separate fields)
    if (detail.coords) {
      return detail.coords;
    }
    
    if (detail.latitude !== null && detail.latitudeDirection && detail.longitude !== null && detail.longitudeDirection) {
      return `${detail.latitude}°${detail.latitudeDirection}, ${detail.longitude}°${detail.longitudeDirection}`;
    }
    
    return 'N/A';
  }

  getMapUrl(fence: any): string {
    if (!fence) {
      // Default location (Jaipur)
      return 'https://www.google.com/maps?q=26.9124,75.7873&hl=en&z=11&output=embed';
    }

    // New format: polygon coordinates
    if (fence.coordinates && fence.coordinates.length > 0) {
      // Calculate center point for map view
      let sumLat = 0;
      let sumLng = 0;
      for (const coord of fence.coordinates) {
        sumLat += coord.lat;
        sumLng += coord.lng;
      }
      const centerLat = sumLat / fence.coordinates.length;
      const centerLng = sumLng / fence.coordinates.length;
      
      // Build polygon path for Google Maps
      const path = fence.coordinates.map((c: {lat: number, lng: number}) => `${c.lat},${c.lng}`).join('|');
      
      // Use Google Maps with polygon path
      return `https://www.google.com/maps?q=${centerLat},${centerLng}&hl=en&z=13&output=embed`;
    }

    // Old format: coordinateDetails
    if (fence.coordinateDetails && fence.coordinateDetails.length > 0) {
      const detail = fence.coordinateDetails[0];
      let lat: number | null = null;
      let lng: number | null = null;

      // Support both old format (coords string) and new format (separate fields)
      if (detail.coords) {
        // Try to extract coordinates from the string (old format)
        const coordMatch = detail.coords.match(/(\d+\.?\d*)[°\s]*[NS]?[,\s]+(\d+\.?\d*)[°\s]*[EW]?/i);
        if (coordMatch) {
          lat = parseFloat(coordMatch[1]);
          lng = parseFloat(coordMatch[2]);
        }
      } else if (detail.latitude !== null && detail.longitude !== null) {
        // New format with separate fields
        let latValue = detail.latitude;
        let lngValue = detail.longitude;
        
        // Apply direction (N/S for lat, E/W for lng)
        if (detail.latitudeDirection === 'S') {
          latValue = -Math.abs(latValue);
        }
        if (detail.longitudeDirection === 'W') {
          lngValue = -Math.abs(lngValue);
        }
        
        lat = latValue;
        lng = lngValue;
      }

      if (lat !== null && lng !== null) {
        return `https://www.google.com/maps?q=${lat},${lng}&hl=en&z=13&output=embed`;
      }
    }

    // If no coordinates found, use default
    return 'https://www.google.com/maps?q=26.9124,75.7873&hl=en&z=11&output=embed';
  }

  getSafeMapUrl(fence: any): SafeResourceUrl {
    const url = this.getMapUrl(fence);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  addSampleRecords(): void {
    // Always replace with fresh sample records using new format
    const sampleGeofences = [
      {
        id: 'GEO-SAMPLE-001',
        name: 'Mine Area A - Lease Zone',
        type: 'lease-area',
        coordinates: [
          { lat: 26.9124, lng: 75.7873 },
          { lat: 26.9150, lng: 75.7900 },
          { lat: 26.9200, lng: 75.7920 },
          { lat: 26.9100, lng: 75.7850 }
        ],
        toleranceRadius: 50,
        notes: 'Primary mining lease area with multiple boundary points',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        id: 'GEO-SAMPLE-002',
        name: 'Dealer Location - Jaipur Main',
        type: 'dealer-location',
        coordinates: [
          { lat: 26.9224, lng: 75.7973 },
          { lat: 26.9250, lng: 75.8000 },
          { lat: 26.9230, lng: 75.8020 },
          { lat: 26.9200, lng: 75.7950 }
        ],
        toleranceRadius: 30,
        notes: 'Main dealer location with entry and exit points',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        id: 'GEO-SAMPLE-003',
        name: 'Illegal Mining Zone - Alert Area',
        type: 'illegal-mining-area',
        coordinates: [
          { lat: 26.9000, lng: 75.7700 },
          { lat: 26.9050, lng: 75.7750 },
          { lat: 26.9100, lng: 75.7800 },
          { lat: 26.8950, lng: 75.7650 },
          { lat: 26.9000, lng: 75.7600 }
        ],
        toleranceRadius: 100,
        notes: 'High alert zone for illegal mining activities',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        id: 'GEO-SAMPLE-004',
        name: 'Weighbridge Station - Highway Entry',
        type: 'weighbridge',
        coordinates: [
          { lat: 26.9300, lng: 75.8100 },
          { lat: 26.9320, lng: 75.8120 },
          { lat: 26.9310, lng: 75.8140 },
          { lat: 26.9290, lng: 75.8080 }
        ],
        toleranceRadius: 25,
        notes: 'Empanelled weighbridge at highway entry point',
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];

    // Replace existing list with sample records
    this.geofencesList = sampleGeofences;
    this.saveGeofences();
  }

  editFence(index: number): void {
    const fence = this.geofencesList[index];
    this.geofenceFormData.name = fence.name;
    this.geofenceFormData.type = fence.type;
    this.geofenceFormData.toleranceRadius = fence.toleranceRadius;
    this.geofenceFormData.notes = fence.notes || '';
    
    // Convert coordinates to text format
    if (fence.coordinates && fence.coordinates.length > 0) {
      // New format: coordinates array
      this.geofenceFormData.coordinatesText = fence.coordinates
        .map((c: {lat: number, lng: number}) => `${c.lat}, ${c.lng}`)
        .join('; ');
      this.parseCoordinates();
    } else if (fence.coordinateDetails && fence.coordinateDetails.length > 0) {
      // Old format: convert to new format
      const coords: string[] = [];
      for (const d of fence.coordinateDetails) {
        if (d.coords) {
          coords.push(d.coords);
        } else if (d.latitude !== null && d.longitude !== null) {
          let lat = d.latitude;
          let lng = d.longitude;
          // Apply direction
          if (d.latitudeDirection === 'S') lat = -Math.abs(lat);
          if (d.longitudeDirection === 'W') lng = -Math.abs(lng);
          coords.push(`${lat}, ${lng}`);
        }
      }
      this.geofenceFormData.coordinatesText = coords.join('; ');
      this.parseCoordinates();
    } else {
      this.geofenceFormData.coordinatesText = '';
      this.parsedCoordinates = [];
    }
    
    this.activeTab = 'create';
    
    // Scroll to top if needed
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    Swal.fire({
      icon: 'info',
      title: 'Edit Mode',
      text: 'Geofence data loaded. Update and create to save changes.',
      confirmButtonColor: '#2563eb'
    });
  }

  toggleFenceStatus(index: number): void {
    const fence = this.geofencesList[index];
    const newStatus = fence.status === 'active' ? 'inactive' : 'active';
    this.geofencesList[index].status = newStatus;
    this.saveGeofences();
    
    Swal.fire({
      icon: 'success',
      title: `Geofence ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
      text: `Geofence "${fence.name}" has been ${newStatus === 'active' ? 'activated' : 'deactivated'}.`,
      confirmButtonColor: '#2563eb'
    });
  }

  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'lease-area': '#3b82f6',
      'dealer-location': '#10b981',
      'illegal-mining-area': '#ef4444',
      'weighbridge': '#f59e0b'
    };
    return colors[type] || '#6b7280';
  }

  clearForm(form: any): void {
    this.geofenceFormData = {
      name: '',
      type: '',
      coordinatesText: '',
      toleranceRadius: null,
      notes: ''
    };
    this.parsedCoordinates = [];
    this.updateDrawingMap();
    form.reset();
  }

  ngOnDestroy(): void {
    this.languageSubscription?.unsubscribe();
    this.destroyMap();
    this.destroyDrawingMap();
  }
}

