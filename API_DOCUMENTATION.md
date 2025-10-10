# Time Tracking API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "role": "employee",
  "department": "Engineering",
  "position": "Developer",
  "hourlyRate": 75
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

### Login
**POST** `/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "Password@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

### Get Current User
**GET** `/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

---

## User Endpoints (Admin Only)

### Get All Users
**GET** `/users`

**Query Parameters:**
- `role` - Filter by role (admin/employee)
- `department` - Filter by department
- `isActive` - Filter by status (true/false)
- `search` - Search by name or email

### Get User by ID
**GET** `/users/:id`

### Update User
**PUT** `/users/:id`

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "department": "Engineering",
  "position": "Senior Developer",
  "hourlyRate": 85,
  "isActive": true
}
```

### Delete User
**DELETE** `/users/:id`

### Assign Project to User
**POST** `/users/:id/assign-project`

**Body:**
```json
{
  "projectId": "project_id_here"
}
```

### Remove Project from User
**DELETE** `/users/:id/remove-project/:projectId`

---

## Project Endpoints

### Get All Projects
**GET** `/projects`

**Query Parameters:**
- `status` - Filter by status
- `costCenter` - Filter by cost center
- `search` - Search by name or code

### Get Project by ID
**GET** `/projects/:id`

### Create Project (Admin Only)
**POST** `/projects`

**Body:**
```json
{
  "name": "E-Commerce Platform",
  "code": "PROJ-ECOM",
  "description": "Building a modern e-commerce platform",
  "costCenter": "cost_center_id",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "budget": 200000,
  "status": "active",
  "assignedEmployees": ["employee_id_1", "employee_id_2"]
}
```

### Update Project (Admin Only)
**PUT** `/projects/:id`

### Delete Project (Admin Only)
**DELETE** `/projects/:id`

---

## Cost Center Endpoints

### Get All Cost Centers
**GET** `/cost-centers`

**Query Parameters:**
- `department` - Filter by department
- `isActive` - Filter by status
- `search` - Search by name or code

### Get Cost Center by ID
**GET** `/cost-centers/:id`

### Create Cost Center (Admin Only)
**POST** `/cost-centers`

**Body:**
```json
{
  "name": "Product Development",
  "code": "CC-PROD",
  "description": "Product development and innovation",
  "budget": 500000,
  "department": "Engineering",
  "manager": "user_id"
}
```

### Update Cost Center (Admin Only)
**PUT** `/cost-centers/:id`

### Delete Cost Center (Admin Only)
**DELETE** `/cost-centers/:id`

---

## Timesheet Endpoints

### Get All Timesheets
**GET** `/timesheets`

**Query Parameters:**
- `employee` - Filter by employee ID
- `project` - Filter by project ID
- `status` - Filter by status
- `startDate` - Filter by start date
- `endDate` - Filter by end date

### Get Timesheet by ID
**GET** `/timesheets/:id`

### Create Timesheet
**POST** `/timesheets`

**Body:**
```json
{
  "project": "project_id",
  "date": "2024-01-15",
  "hours": 8,
  "description": "Working on backend API development",
  "status": "draft"
}
```

### Update Timesheet
**PUT** `/timesheets/:id`

**Body:**
```json
{
  "hours": 7.5,
  "description": "Updated description",
  "status": "submitted"
}
```

### Delete Timesheet
**DELETE** `/timesheets/:id`

### Bulk Approve Timesheets (Admin Only)
**POST** `/timesheets/bulk-approve`

**Body:**
```json
{
  "timesheetIds": ["id1", "id2", "id3"]
}
```

---

## Analytics Endpoints (Admin Only)

### Get Employee Hours Summary
**GET** `/analytics/employee-hours`

**Query Parameters:**
- `startDate` - Start date for analysis
- `endDate` - End date for analysis
- `status` - Filter by timesheet status (default: approved)

**Response:**
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "employeeName": "John Doe",
        "email": "john@example.com",
        "department": "Engineering",
        "totalHours": 160,
        "hourlyRate": 75,
        "totalCost": 12000
      }
    ],
    "summary": {
      "totalHours": 500,
      "totalCost": 37500,
      "employeeCount": 5
    }
  }
}
```

### Get Project Allocation
**GET** `/analytics/project-allocation`

**Query Parameters:**
- `startDate` - Start date for analysis
- `endDate` - End date for analysis
- `status` - Filter by timesheet status

### Get Cost Center Summary
**GET** `/analytics/cost-center-summary`

**Query Parameters:**
- `startDate` - Start date for analysis
- `endDate` - End date for analysis
- `status` - Filter by timesheet status

### Get Dashboard Statistics
**GET** `/analytics/dashboard-stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEmployees": 25,
    "totalProjects": 10,
    "totalCostCenters": 4,
    "pendingTimesheets": 15,
    "monthlyHours": 1200,
    "weeklyHours": 280
  }
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting
API requests are limited to 100 requests per 10 minutes per IP address.

## CORS
CORS is enabled for all origins in development mode. Configure appropriately for production.
