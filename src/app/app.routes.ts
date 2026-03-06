import { Routes } from '@angular/router';
import { RoleSelectionComponent } from './pages/role-selection/role-selection.component';
import { VendorRegistrationComponent } from './pages/vendor-registration/vendor-registration.component';
import { VendorOTPVerificationComponent } from './pages/vendor-otp-verification/vendor-otp-verification.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TrackingComponent } from './pages/tracking/tracking.component';
import { DeviceComponent } from './pages/device/device.component';
import { GeofenceComponent } from './pages/geofence/geofence.component';
import { VendorComponent } from './pages/vendor/vendor.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { ConfigurationComponent } from './pages/configuration/configuration.component';
import { TripAssignmentComponent } from './pages/trip-assignment/trip-assignment.component';
import { authGuard } from './guards/auth.guard';
import { CreateuserComponent } from './pages/createuser/createuser.component';
import { CreategroupComponent } from './pages/creategroup/creategroup.component';
import { UsermenumappingComponent } from './pages/usermenumapping/usermenumapping.component';

export const routes: Routes = [
  { path: '', redirectTo: '/role-selection', pathMatch: 'full' },
  { path: 'role-selection', component: RoleSelectionComponent },
  { path: 'vendor-registration', component: VendorRegistrationComponent },
  { path: 'vendor-otp-verification', component: VendorOTPVerificationComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'tracking', component: TrackingComponent, canActivate: [authGuard] },
  { path: 'trip-assignment', component: TripAssignmentComponent, canActivate: [authGuard] },
  { path: 'device', component: DeviceComponent, canActivate: [authGuard] },
  { path: 'device/fitment', component: DeviceComponent, canActivate: [authGuard], data: { section: 'fitment' } },
  { path: 'geofence', component: GeofenceComponent, canActivate: [authGuard] },
  { path: 'vendor', component: VendorComponent, canActivate: [authGuard] },
  { path: 'notifications', component: NotificationsComponent, canActivate: [authGuard] },
  { path: 'configuration', component: ConfigurationComponent, canActivate: [authGuard] },
  {path:'create-user', component: CreateuserComponent, canActivate: [authGuard]},
  {path:'create-group',component: CreategroupComponent, canActivate: [authGuard]},
  {path:'user-menu-mapping', component: UsermenumappingComponent, canActivate: [authGuard]
    
  }
];

