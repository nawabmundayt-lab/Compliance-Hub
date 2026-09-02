# Build a Professional Punjab Facilities Compliance & Monitoring Dashboard

I need you to build a complete, professional, interactive dashboard for managing and monitoring **Joylands, Food Courts, and Parking Stands across Punjab**.

I have **3 Excel files** containing my existing Punjab-wide data. These Excel files are the main source of information. The system must automatically import/refresh the data daily and identify records that are approaching expiry or already expired.

The most important objective is to make my manual monitoring work easier and ensure that **renewals, licenses, fitness certificates, and agreements are never missed**.

---

# 1. Main Dashboard

Create a professional dashboard with a Punjab-wide overview.

At the top, show KPI cards for:

### Joylands
- Total Joylands
- Total Large Joylands
- Total Mini Joylands
- Total Rides
- Total Valid Fitness Certificates
- Fitness Certificates Near Expiry
- Expired Fitness Certificates

### Food Courts
- Total Food Courts
- Valid PFA Licenses
- PFA Licenses Near Expiry
- Expired PFA Licenses

### Parking Stands
- Total Parking Stands
- Valid Agreements
- Agreements Near Expiry
- Expired Agreements

The dashboard must update all KPIs automatically after each data refresh.

---

# 2. JOYLAND MODULE

Create a dedicated **Joyland Management & Fitness Certificate** section.

## Joyland Classification

Every Joyland must be classified as either:

- **Large Joyland**
- **Mini Joyland**

Show separate totals:

**Total Joylands = Large Joylands + Mini Joylands**

Create charts showing:

- Large vs Mini Joylands
- Joylands by Division
- Joylands by District
- Joylands by Tehsil

Also allow filtering by Joyland type.

---

# 3. Joyland Details

For every Joyland, maintain:

- Joyland ID
- Joyland Name
- Joyland Type
- Large / Mini
- Division
- District
- Tehsil
- Address
- Total Rides
- Active Rides
- Inactive Rides
- Total Fitness Certificates
- Valid Certificates
- Near Expiry Certificates
- Expired Certificates
- Last Updated
- Remarks

---

# 4. RIDE FITNESS CERTIFICATE MONITORING

This is one of the most important parts of the system.

For every ride, monitor its **Fitness Certificate**.

Required fields:

- Joyland Name
- Joyland Type
- District
- Ride Name
- Ride ID
- Ride Category
- Certificate Number
- Certificate Issue Date
- Certificate Expiry Date
- Days Remaining
- Certificate Status
- Last Inspection Date
- Renewal Date
- Remarks
- Last Updated

## Certificate Expiry Rule

Fitness certificates are normally required to be updated/renewed every **6 months**.

Calculate:

**Expiry Date = Issue Date + 6 Calendar Months**

Use proper calendar-month calculation rather than simply adding 180 days.

Example:

Issue Date: 15-Jan-2026  
Expiry Date: 15-Jul-2026

---

# 5. FITNESS CERTIFICATE STATUS

Automatically calculate the status from today's date.

### EXPIRED
Expiry Date < Today

### CRITICAL
Expiry date is within 0–7 days

### NEAR EXPIRY
Expiry date is within 8–30 days

### UPCOMING
Expiry date is within 31–60 days

### VALID
More than 60 days remaining

Make these thresholds configurable from Settings.

---

# 6. Joyland Compliance Dashboard

Create a Joyland compliance summary showing:

| Metric | Total |
|---|---:|
| Large Joylands | |
| Mini Joylands | |
| Total Joylands | |
| Total Rides | |
| Valid Fitness Certificates | |
| Critical | |
| Near Expiry | |
| Upcoming | |
| Expired | |

Also calculate:

**Fitness Certificate Compliance %**

Formula:

Valid Certificates ÷ Total Certificates × 100

Show this as a progress indicator.

---

# 7. FOOD COURT MODULE

Create a separate **Food Court Compliance** module.

For every Food Court, maintain:

- Food Court ID
- Food Court Name
- Division
- District
- Tehsil
- Location
- PFA License Number
- PFA License Issue Date
- PFA License Expiry Date
- Days Remaining
- PFA License Status
- Last Inspection Date
- Renewal Date
- Remarks
- Last Updated

---

# 8. PUNJAB FOOD AUTHORITY LICENSE MONITORING

The Food Court compliance system must specifically monitor the **Punjab Food Authority (PFA) License**.

Do NOT treat a Food Court as compliant merely because the Food Court exists.

Its compliance should depend on its PFA license status.

Monitor:

- PFA License Number
- Issue Date
- Expiry Date
- Days Remaining
- Status

Create dedicated KPIs:

- Total Food Courts
- Valid PFA Licenses
- PFA Licenses Near Expiry
- PFA Licenses Expiring Within 7 Days
- Expired PFA Licenses
- Missing PFA Licenses

---

# 9. PFA LICENSE STATUS

Use the same configurable expiry-warning system:

### EXPIRED
License expired

### CRITICAL
Expires within 7 days

### NEAR EXPIRY
Expires within 30 days

### UPCOMING
Expires within 60 days

### VALID
More than 60 days remaining

Also detect:

**MISSING LICENSE**

when a Food Court has no PFA license number or no license date.

---

# 10. FOOD COURT COMPLIANCE SUMMARY

Create a dashboard such as:

| PFA License Status | Food Courts |
|---|---:|
| Valid | |
| Upcoming | |
| Near Expiry | |
| Critical | |
| Expired | |
| Missing License | |

Also show:

**PFA License Compliance %**

Valid PFA Licenses ÷ Total Food Courts × 100

---

# 11. PARKING STAND MODULE

Create a dedicated **Parking Stand Agreement Monitoring** section.

For every Parking Stand, maintain:

- Parking Stand ID
- Parking Stand Name
- Division
- District
- Tehsil
- Location
- Contractor / Agreement Holder
- Agreement Number
- Agreement Start Date
- Agreement End Date
- Days Remaining
- Agreement Status
- Last Updated
- Remarks

---

# 12. PARKING AGREEMENT MONITORING

The main compliance document for Parking Stands is the **Agreement**.

The system must monitor the agreement start and end dates.

Calculate:

**Days Remaining = Agreement End Date - Today's Date**

Create automatic status:

### EXPIRED
Agreement End Date < Today

### CRITICAL
Agreement expires within 7 days

### NEAR EXPIRY
Agreement expires within 30 days

### UPCOMING
Agreement expires within 60 days

### VALID
More than 60 days remaining

Also detect:

**NO AGREEMENT DATA**

when agreement information is missing.

---

# 13. PARKING COMPLIANCE SUMMARY

Show:

- Total Parking Stands
- Valid Agreements
- Upcoming Agreements
- Near Expiry Agreements
- Critical Agreements
- Expired Agreements
- Missing Agreements

Calculate:

**Parking Agreement Compliance %**

Valid Agreements ÷ Total Parking Stands × 100

---

# 14. MASTER COMPLIANCE DASHBOARD

Create one combined view showing all major compliance items.

### Compliance Categories

**Joyland**
→ Ride Fitness Certificates

**Food Court**
→ Punjab Food Authority Licenses

**Parking Stand**
→ Agreements

Create a master compliance table:

| Facility | Facility Type | District | Compliance Document | Issue Date | Expiry Date | Days Remaining | Status |
|---|---|---|---|---|---|---:|---|
| Joyland A | Large Joyland | Lahore | Ride Fitness Certificate | | | | |
| Food Court A | Food Court | Multan | PFA License | | | | |
| Parking A | Parking Stand | Faisalabad | Agreement | | | | |

This allows me to see all upcoming compliance actions in one place.

---

# 15. PRIORITY ACTION DASHBOARD

Create a section called:

## "ACTION REQUIRED"

This should automatically show the most urgent records.

Priority order:

1. Expired
2. Critical – 7 Days
3. Near Expiry – 30 Days
4. Upcoming – 60 Days

For each record display:

- Facility
- District
- Document Type
- Expiry Date
- Days Remaining
- Status
- Action Required

Sort by urgency.

---

# 16. EXPIRY MONITORING

Create separate monitoring tables for:

### Fitness Certificates Near Expiry
Ride fitness certificates expiring soon.

### PFA Licenses Near Expiry
Food Court PFA licenses expiring soon.

### Parking Agreements Near Expiry
Parking agreements expiring soon.

Also create a combined:

### All Expiring Documents

showing all three categories together.

---

# 17. EXPIRY CALENDAR

Create an interactive expiry calendar/timeline.

Show upcoming:

- Fitness Certificate renewals
- PFA License renewals
- Parking Agreement expirations

Allow filtering by document type.

Example:

September 2026
- 8 Fitness Certificates
- 3 PFA Licenses
- 5 Parking Agreements

October 2026
- 12 Fitness Certificates
- 6 PFA Licenses
- 2 Parking Agreements

This should help me plan renewal work in advance.

---

# 18. DISTRICT-WISE ANALYSIS

Create district-level reporting.

For every district, show:

- Large Joylands
- Mini Joylands
- Total Joylands
- Total Rides
- Expired Fitness Certificates
- Near Expiry Fitness Certificates
- Food Courts
- Expired PFA Licenses
- Near Expiry PFA Licenses
- Parking Stands
- Expired Agreements
- Near Expiry Agreements
- Overall Compliance %

Allow clicking a district to drill down into individual records.

---

# 19. DIVISION-WISE ANALYSIS

Create the same type of analysis at Division level.

Show:

- Joylands
- Food Courts
- Parking Stands
- Fitness Certificate compliance
- PFA compliance
- Agreement compliance

---

# 20. OVERALL COMPLIANCE SCORE

Create an overall compliance dashboard.

Calculate separate compliance percentages:

### Joyland Fitness Compliance %
Valid Fitness Certificates / Total Fitness Certificates

### Food Court PFA Compliance %
Valid PFA Licenses / Total Food Courts

### Parking Agreement Compliance %
Valid Agreements / Total Parking Stands

Then calculate an overall compliance indicator.

Clearly show which category has the weakest compliance.

---

# 21. SEARCH

Create global search for:

- Joyland Name
- Ride Name
- Ride ID
- Fitness Certificate Number
- Food Court Name
- PFA License Number
- Parking Stand Name
- Agreement Number
- District
- Tehsil

Results should update immediately.

---

# 22. FILTERS

Create interactive filters for:

- Division
- District
- Tehsil
- Joyland Type
- Facility Type
- Document Type
- Certificate/License/Agreement Status
- Expiry Period
- Date Range

Add:

**Reset Filters**

All KPIs, charts, tables and summaries should respond to the filters.

---

# 23. DAILY AUTO-REFRESH

I have **3 Excel files**.

The system must automatically refresh/import them daily.

Daily process:

1. Read all 3 Excel files.
2. Detect the latest data.
3. Validate data.
4. Merge/normalize records.
5. Detect duplicates.
6. Calculate expiry dates.
7. Calculate days remaining.
8. Calculate compliance status.
9. Update all KPIs.
10. Update charts.
11. Update alert lists.
12. Update the expiry calendar.
13. Store the last successful refresh time.

Display:

**Last Data Refresh: [Date + Time]**

and:

**Data Refresh Status: Successful / Failed**

---

# 24. IMPORTANT: DO NOT HARD-CODE THE DATA

The dashboard must NOT contain manually typed totals such as:

"125 Joylands"

or

"80 Food Courts"

Instead, every number must come dynamically from the Excel data.

When I update the Excel files, the dashboard numbers must change automatically after refresh.

---

# 25. EXCEL DATA NORMALIZATION

Before building the final application, inspect all 3 Excel files and determine their actual structure.

Identify:

- Which file contains Joylands
- Which file contains rides
- Which file contains fitness certificates
- Which file contains Food Courts
- Which file contains PFA license information
- Which file contains Parking Stands
- Which file contains agreements

Do not assume column names.

Create a mapping layer for different possible column names.

For example:

"Certificate Expiry Date"

"Expiry Date"

"Fitness Certificate Expiry"

may all represent the same logical field.

---

# 26. DATA QUALITY CHECKING

Create automatic validation for:

- Missing Joyland type
- Missing Joyland name
- Missing ride name
- Missing certificate number
- Missing certificate dates
- Missing PFA license number
- Missing PFA license dates
- Missing parking agreement number
- Missing agreement dates
- Invalid dates
- Duplicate records
- Unknown districts
- Blank critical fields

Create a **Data Quality** page.

---

# 27. UPDATE RECORDS

Provide an easy interface to update:

### Joyland
- Joyland Type
- Ride details
- Fitness Certificate

### Food Court
- PFA License

### Parking Stand
- Agreement

When a record is updated, automatically recalculate:

- Expiry date
- Days remaining
- Status
- Compliance percentage

Store:

- Updated By
- Updated Date
- Remarks

---

# 28. EXPORT

Allow export of:

- Expired Fitness Certificates
- Near Expiry Fitness Certificates
- Expired PFA Licenses
- Near Expiry PFA Licenses
- Expired Parking Agreements
- Near Expiry Parking Agreements
- Complete Joyland Register
- Complete Food Court Register
- Complete Parking Stand Register
- District Summary
- Master Compliance Report

Support Excel and CSV export.

---

# 29. RECOMMENDED DASHBOARD PAGES

Build the application with these pages:

### 1. Executive Dashboard
Punjab-wide KPIs and overall compliance.

### 2. Joylands
Large/Mini Joyland monitoring.

### 3. Fitness Certificates
Ride-level fitness certificate monitoring.

### 4. Food Courts
Punjab Food Authority license monitoring.

### 5. Parking Stands
Agreement monitoring.

### 6. Near Expiry
All upcoming renewals.

### 7. Expired
All expired compliance documents.

### 8. Expiry Calendar
Upcoming expiry schedule.

### 9. District Analysis
District/division comparisons.

### 10. Data Quality
Missing/duplicate/invalid information.

### 11. Settings
Thresholds, Excel source files, and refresh configuration.

---

# 30. PROFESSIONAL UI

Use a professional government/enterprise dashboard design.

Preferred visual identity:

- Dark green
- White
- Gold accents
- Clean cards
- Professional tables
- Status badges
- Interactive charts
- Responsive design
- Desktop optimized
- Mobile friendly

Avoid excessive animations and unnecessary visual clutter.

---

# 31. TECHNICAL REQUIREMENTS

Use a robust modern technology stack such as:

- Next.js / React
- TypeScript
- Excel processing library
- Charting library
- SQLite/PostgreSQL or another appropriate database
- Scheduled refresh mechanism

Keep the architecture modular.

Separate:

**Data Import → Data Validation → Data Processing → Compliance Calculation → Database → Dashboard**

---

# 32. FUTURE-READY DESIGN

Design the system so additional compliance document types can be added later.

For example:

- Fire Safety Certificates
- Building Fitness Certificates
- Lease Agreements
- NOCs
- Other Government Licenses

Do not design the system only for the three current document types.

---

# 33. FINAL OBJECTIVE

When I open the dashboard, I should immediately know:

**How many Large Joylands are in Punjab?**

**How many Mini Joylands are in Punjab?**

**How many total Joylands are there?**

**Which rides have expired fitness certificates?**

**Which fitness certificates expire within 7/30/60 days?**

**How many Food Courts have valid PFA licenses?**

**Which PFA licenses are expiring soon?**

**Which Food Courts have expired or missing licenses?**

**How many Parking Stands have valid agreements?**

**Which agreements are expiring soon?**

**Which agreements have expired?**

**What compliance actions require attention today?**

The system must make this information immediately visible without manually checking multiple Excel sheets.

---

# 34. FINAL DELIVERABLE

Build a complete working application, not merely a UI mockup.

Provide:

- Complete source code
- Working dashboard
- 3 Excel import system
- Daily automatic refresh
- Automatic expiry calculations
- Large/Mini Joyland classification
- Ride Fitness Certificate monitoring
- PFA License monitoring
- Parking Agreement monitoring
- Near-expiry alerts
- Expired alerts
- District/division analysis
- Search and filters
- Export functionality
- Data-quality validation
- Update interface
- Settings
- Error handling
- Installation instructions
- Excel file placement instructions
- Daily refresh/scheduling instructions
- README documentation

First inspect the actual 3 Excel files and understand their structure. Then build the data model and application around the real data rather than making assumptions.