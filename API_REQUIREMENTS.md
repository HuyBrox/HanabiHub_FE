# 📋 API Requirements for Content & Notifications Management

## 🎯 Overview
Frontend UI đã hoàn thành 100%. Cần BE team implement các API endpoints sau để kết nối với frontend.

---

## 🔔 **NOTIFICATIONS APIs**

### **1. Send System Notification**
```
POST /api/notifications/send-system
```
**Request Body:**
```json
{
  "title": "string",
  "message": "string",
  "type": "system"
}
```

### **2. Send Specific Notification**
```
POST /api/notifications/send-specific
```
**Request Body:**
```json
{
  "title": "string", 
  "message": "string",
  "recipientIds": ["string"],
  "type": "personal"
}
```

### **3. Schedule Notification**
```
POST /api/notifications/schedule
```
**Request Body:**
```json
{
  "title": "string",
  "message": "string", 
  "scheduledDate": "2024-01-25T10:00:00Z",
  "recipients": "all" | "specific",
  "recipientIds": ["string"] // if recipients = "specific"
}
```

### **4. Get Notification History**
```
GET /api/notifications/history?page=1&limit=10&search=&type=
```

### **5. Get Notification Statistics**
```
GET /api/notifications/stats
```

---

## 📰 **NEWS APIs**

### **1. Create News**
```
POST /api/news
```
**Request Body:**
```json
{
  "title": "string",
  "content": "string", // HTML content
  "category": "string",
  "tags": ["string"],
  "images": ["string"] // image URLs
}
```

### **2. Get News List**
```
GET /api/news?page=1&limit=10&search=&status=&category=
```

### **3. Get News by ID**
```
GET /api/news/:id
```

### **4. Update News**
```
PUT /api/news/:id
```

### **5. Delete News**
```
DELETE /api/news/:id
```

### **6. Get News Statistics**
```
GET /api/news/stats
```

### **7. Export News**
```
GET /api/news/export?format=excel
```

---

## 🚨 **REPORTS APIs**

### **1. Get Reports List**
```
GET /api/reports?page=1&limit=10&search=&status=&priority=
```

### **2. Approve Report**
```
PUT /api/reports/:id/approve
```
**Request Body:**
```json
{
  "adminNote": "string"
}
```

### **3. Reject Report**
```
PUT /api/reports/:id/reject
```
**Request Body:**
```json
{
  "adminNote": "string"
}
```

### **4. Get Report Statistics**
```
GET /api/reports/stats
```

### **5. Export Reports**
```
GET /api/reports/export?format=excel
```

---

## 📝 **TEMPLATES APIs**

### **1. Create Template**
```
POST /api/templates
```
**Request Body:**
```json
{
  "name": "string",
  "title": "string", 
  "message": "string",
  "type": "system" | "personal" | "maintenance" | "security" | "course" | "contest"
}
```

### **2. Get Templates List**
```
GET /api/templates?page=1&limit=10&search=&type=
```

### **3. Update Template**
```
PUT /api/templates/:id
```

### **4. Delete Template**
```
DELETE /api/templates/:id
```

### **5. Use Template**
```
POST /api/templates/:id/use
```

### **6. Get Template Statistics**
```
GET /api/templates/stats
```

### **7. Export Templates**
```
GET /api/templates/export?format=excel
```

---

## 👥 **USERS APIs**

### **1. Get Users for Notification**
```
GET /api/users?page=1&limit=10&search=&role=&status=
```

### **2. Get User Statistics**
```
GET /api/users/stats
```

---

## 📊 **ANALYTICS APIs**

### **1. Get Notification Analytics**
```
GET /api/analytics/notifications?period=7d
```

### **2. Get Content Analytics**
```
GET /api/analytics/content?period=7d
```

### **3. Get User Engagement**
```
GET /api/analytics/engagement?period=7d
```

---

## 🔐 **AUTHENTICATION**

### **Headers Required:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 📝 **RESPONSE FORMAT**

### **Success Response:**
```json
{
  "success": true,
  "data": {},
  "message": "string"
}
```

### **Error Response:**
```json
{
  "success": false,
  "error": "string",
  "message": "string"
}
```

### **Pagination Response:**
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## 🎯 **PRIORITY ORDER**

1. **HIGH PRIORITY** - Notifications APIs (core functionality)
2. **MEDIUM PRIORITY** - News APIs (content management)  
3. **MEDIUM PRIORITY** - Reports APIs (admin functions)
4. **LOW PRIORITY** - Templates APIs (nice to have)
5. **LOW PRIORITY** - Analytics APIs (dashboard)

---

## 📞 **CONTACT**

Frontend Developer: [Your Name]  
Email: [Your Email]  
Slack: [Your Slack]  

**Ready for API integration!** 🚀

