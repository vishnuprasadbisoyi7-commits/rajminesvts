# RAJMINES VTS - Database Table Structure Documentation

## Oracle Database Schema for GPS-RFID Vehicle Tracking System

---

## Table Summary

| Table Name | Purpose | Key Columns |
|------------|---------|-------------|
| GPS_VENDOR | Vendor registration and management | VENDOR_ID, EMAIL, GST_NUMBER |
| GPS_VENDOR_DOCUMENTS | Vendor document storage | DOC_ID, VENDOR_ID |
| GPS_DEVICE | GPS device registration | DEVICE_ID, IMEI_SERIAL, VENDOR_ID |
| GPS_DEVICE_TEST | Device testing records | TEST_ID, DEVICE_ID, TEST_RESULT |
| GPS_DEVICE_FITMENT | Device fitment and activation | FITMENT_ID, DEVICE_ID, VEHICLE_REG_NO |
| GPS_DEVICE_FITMENT_PHOTOS | Fitment installation photos | PHOTO_ID, FITMENT_ID |
| GPS_DEVICE_MAINTENANCE | Device maintenance/deactivation | MAINTENANCE_ID, DEVICE_ID |
| GEO_FENCE | Geofence definitions | GEOFENCE_ID, GEOFENCE_TYPE |
| GEO_FENCE_VIOLATION | Geofence violation logs | VIOLATION_ID, GEOFENCE_ID, DEVICE_ID |
| TRIP_MASTER | Trip/transit pass management | TRIP_ID, TRIP_NUMBER, VEHICLE_REG_NO |
| GPS_TRACKING_DATA | Real-time GPS tracking data | TRACKING_ID, DEVICE_ID, TRIP_ID |
| TRIP_ROUTE_DEVIATION | Route deviation records | DEVIATION_ID, TRIP_ID |
| TRIP_STOPS | Vehicle stop records | STOP_ID, TRIP_ID |
| NOTIFICATIONS | System notifications | NOTIFICATION_ID, NOTIFICATION_TYPE |
| AUDIT_LOGS | System audit trail | LOG_ID, USER_ID, ACTION_TYPE |
| SYSTEM_CONFIG | System configuration | CONFIG_ID, CONFIG_KEY |
| ALERT_THRESHOLDS | Alert threshold settings | THRESHOLD_ID, ALERT_TYPE |
| SYSTEM_USERS | User management | USER_ID, USERNAME, USER_ROLE |

---

## Detailed Table Structures

### 1. GPS_VENDOR
**Purpose:** Store GPS vendor registration information

**Key Columns:**
- `VENDOR_ID` (PK): Unique vendor identifier (e.g., VEN-001)
- `VENDOR_NAME`: Company/Organization name
- `EMAIL`: Vendor email (unique)
- `GST_NUMBER`: GST number (unique)
- `PAN_NUMBER`: PAN number (unique)
- `STATUS`: PENDING, ACTIVE, INACTIVE, SUSPENDED
- `OTP`, `OTP_EXPIRY`, `OTP_VERIFIED`: OTP verification fields

**Relationships:**
- One-to-Many with GPS_DEVICE
- One-to-Many with GPS_VENDOR_DOCUMENTS

---

### 2. GPS_DEVICE
**Purpose:** Store GPS device registration details

**Key Columns:**
- `DEVICE_ID` (PK): Auto-generated device ID
- `DEVICE_NAME`: Device name
- `IMEI_SERIAL`: IMEI or Serial number (unique)
- `MODEL`, `FIRMWARE_VERSION`: Device specifications
- `SIM_ICCID`, `SIM_MSISDN`: SIM card details
- `HEALTH_STATUS`: HEALTHY, WARNING, CRITICAL, UNKNOWN
- `DEVICE_STATUS`: REGISTERED, TESTED, FITTED, ACTIVE, INACTIVE, MAINTENANCE, DECOMMISSIONED
- `VENDOR_ID` (FK): Reference to GPS_VENDOR

**Relationships:**
- Many-to-One with GPS_VENDOR
- One-to-Many with GPS_DEVICE_TEST
- One-to-Many with GPS_DEVICE_FITMENT
- One-to-Many with GPS_TRACKING_DATA

---

### 3. GPS_DEVICE_TEST
**Purpose:** Store device testing results before fitment

**Key Columns:**
- `TEST_ID` (PK): Auto-generated test ID
- `DEVICE_ID` (FK): Reference to GPS_DEVICE
- `GPS_SIGNAL_STRENGTH`: EXCELLENT, GOOD, FAIR, POOR, NO_SIGNAL
- `NETWORK_CONNECTIVITY`: CONNECTED, WEAK, DISCONNECTED
- `BATTERY_STATUS`: FULL, GOOD, LOW, CRITICAL
- `DATA_TRANSMISSION`: WORKING, INTERMITTENT, NOT_WORKING
- `TEST_RESULT`: PASSED, FAILED, CONDITIONAL
- `TESTER_NAME`, `TEST_DATE_TIME`: Test details

**Relationships:**
- Many-to-One with GPS_DEVICE

---

### 4. GPS_DEVICE_FITMENT
**Purpose:** Store device fitment and activation details

**Key Columns:**
- `FITMENT_ID` (PK): Auto-generated fitment ID
- `DEVICE_ID` (FK): Reference to GPS_DEVICE
- `VEHICLE_REG_NO`: Vehicle registration number (unique)
- `INSTALLATION_DATE_TIME`: When device was installed
- `INSTALLER_NAME`, `INSTALLER_CONTACT`: Installer details
- `ACTIVATION_STATUS`: PENDING, ACTIVE, INACTIVE
- `FIRST_GPS_PING_DATE`: When first GPS ping received
- `ACTIVATION_DATE`: When device was activated

**Relationships:**
- Many-to-One with GPS_DEVICE
- One-to-Many with GPS_DEVICE_FITMENT_PHOTOS

---

### 5. TRIP_MASTER
**Purpose:** Store trip/transit pass information

**Key Columns:**
- `TRIP_ID` (PK): Auto-generated trip ID
- `TRIP_NUMBER`: Unique trip number
- `ERWANA_TRANSIT_PASS_NO`: eRawana/Transit pass number
- `VEHICLE_REG_NO`: Vehicle registration
- `DEVICE_ID` (FK): Reference to GPS_DEVICE
- `ORIGIN_LEASE_ID` (FK): Reference to GEO_FENCE (lease area)
- `DESTINATION_DEALER_ID` (FK): Reference to GEO_FENCE (dealer location)
- `COMMODITY_TYPE`, `COMMODITY_QUANTITY`: Commodity details
- `DRIVER_NAME`, `DRIVER_CONTACT`: Driver information
- `EXPECTED_DEPARTURE_TIME`, `ACTUAL_DEPARTURE_TIME`: Departure times
- `EXPECTED_ARRIVAL_TIME`, `ACTUAL_ARRIVAL_TIME`: Arrival times
- `TRIP_STATUS`: ASSIGNED, IN_PROGRESS, DELAYED, DEVIATED, COMPLETED, CANCELLED

**Relationships:**
- Many-to-One with GPS_DEVICE
- Many-to-One with GEO_FENCE (origin)
- Many-to-One with GEO_FENCE (destination)
- One-to-Many with GPS_TRACKING_DATA
- One-to-Many with TRIP_ROUTE_DEVIATION
- One-to-Many with TRIP_STOPS

---

### 6. GPS_TRACKING_DATA
**Purpose:** Store real-time GPS tracking data

**Key Columns:**
- `TRACKING_ID` (PK): Auto-generated tracking ID
- `DEVICE_ID` (FK): Reference to GPS_DEVICE
- `TRIP_ID` (FK): Reference to TRIP_MASTER (optional)
- `LATITUDE`, `LONGITUDE`: GPS coordinates
- `SPEED_KMH`: Vehicle speed
- `HEADING`: Direction
- `ALTITUDE`, `GPS_ACCURACY`, `SATELLITE_COUNT`: GPS details
- `BATTERY_LEVEL`, `SIGNAL_STRENGTH`: Device status
- `TRACKING_DATE_TIME`: When GPS data was captured
- `STATUS`: VALID, INVALID, DUPLICATE

**Relationships:**
- Many-to-One with GPS_DEVICE
- Many-to-One with TRIP_MASTER (optional)

**Note:** This table will have high volume of data. Consider partitioning by date.

---

### 7. GEO_FENCE
**Purpose:** Store geofence definitions

**Key Columns:**
- `GEOFENCE_ID` (PK): Auto-generated geofence ID
- `GEOFENCE_NAME`: Name of geofence
- `GEOFENCE_TYPE`: LEASE_AREA, DEALER_LOCATION, ILLEGAL_MINING_AREA, WEIGHBRIDGE, OTHER
- `LATITUDE`, `LONGITUDE`: Center coordinates
- `RADIUS_METERS`: Geofence radius
- `TOLERANCE_RADIUS_METERS`: Tolerance for alerts
- `STATUS`: ACTIVE, INACTIVE

**Relationships:**
- One-to-Many with GEO_FENCE_VIOLATION
- Referenced by TRIP_MASTER (origin/destination)

---

### 8. NOTIFICATIONS
**Purpose:** Store system notifications

**Key Columns:**
- `NOTIFICATION_ID` (PK): Auto-generated notification ID
- `NOTIFICATION_TYPE`: DELAY, ROUTE_DEVIATION, DEVICE_STATUS, GEOFENCE_VIOLATION, DEVICE_OFFLINE, TRIP_ALERT, SYSTEM_ALERT
- `TITLE`, `MESSAGE`: Notification content
- `PRIORITY`: LOW, MEDIUM, HIGH, CRITICAL
- `RECIPIENT_TYPE`: SYSTEM_ADMIN, GPS_VENDOR, MINING_OPERATOR, ALL
- `RECIPIENT_ID`: Specific user/role ID
- `RELATED_ENTITY_TYPE`, `RELATED_ENTITY_ID`: Related entity reference
- `STATUS`: PENDING, SENT, READ, ACKNOWLEDGED
- `EMAIL_SENT`, `IN_APP_SENT`: Delivery status

---

### 9. AUDIT_LOGS
**Purpose:** Store system audit trail

**Key Columns:**
- `LOG_ID` (PK): Auto-generated log ID
- `USER_ID`, `USER_ROLE`: User information
- `ACTION_TYPE`: CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT
- `ENTITY_TYPE`: VENDOR, DEVICE, TRIP, GEOFENCE, etc.
- `ENTITY_ID`: ID of affected entity
- `OLD_VALUES`, `NEW_VALUES`: Change tracking (JSON/CLOB)
- `IP_ADDRESS`, `SESSION_ID`: Session tracking
- `ACTION_DATE_TIME`: When action occurred

---

## Data Types Used

- **VARCHAR2(n)**: Variable length strings
- **NUMBER(p,s)**: Numeric values with precision and scale
- **TIMESTAMP**: Date and time values
- **CLOB**: Large text data (for notes, descriptions)
- **CHAR(1)**: Single character flags (Y/N)

## Constraints

- **PRIMARY KEY**: Unique identifier for each table
- **FOREIGN KEY**: Referential integrity between tables
- **UNIQUE**: Ensures unique values (e.g., IMEI, email)
- **CHECK**: Validates allowed values (e.g., STATUS values)
- **NOT NULL**: Required fields

## Indexes

Indexes are created on:
- Foreign key columns
- Frequently queried columns (STATUS, DATE_TIME)
- Search columns (EMAIL, IMEI, VEHICLE_REG_NO)

## Performance Considerations

1. **GPS_TRACKING_DATA**: High volume table - consider partitioning by date
2. **AUDIT_LOGS**: High volume - consider archiving old records
3. **NOTIFICATIONS**: Index on STATUS and CREATED_DATE for quick retrieval
4. **Regular maintenance**: Archive old tracking data and audit logs

## Sample Queries

### Get active devices for a vendor
```sql
SELECT * FROM GPS_DEVICE 
WHERE VENDOR_ID = 'VEN-001' 
AND DEVICE_STATUS = 'ACTIVE';
```

### Get current trip status
```sql
SELECT t.*, d.DEVICE_NAME, v.VEHICLE_REG_NO 
FROM TRIP_MASTER t
JOIN GPS_DEVICE d ON t.DEVICE_ID = d.DEVICE_ID
JOIN GPS_DEVICE_FITMENT v ON d.DEVICE_ID = v.DEVICE_ID
WHERE t.TRIP_STATUS = 'IN_PROGRESS';
```

### Get unread notifications
```sql
SELECT * FROM NOTIFICATIONS 
WHERE RECIPIENT_TYPE = 'GPS_VENDOR' 
AND STATUS = 'PENDING'
ORDER BY CREATED_DATE DESC;
```

---

## Version History

- **Version 1.0**: Initial schema creation
- **Date**: 2025-01-XX
- **Database**: Oracle 12c+

