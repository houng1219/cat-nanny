# 貓保母會員管理系統 — SPEC.md

## 1. Concept & Vision

一個專為貓保母設計的會員與預約管理平台，讓保母可以管理多位貓主人的資料、排程預約、計算費用、發送通知。雙角色設計（保母視角為主，貓主人可自主預約），介面清新易用，適合小型貓保母工作室或個人接案者。

## 2. Tech Stack

| 層面 | 選擇 |
|------|------|
| 前端 | React 18 + Vite + TailwindCSS |
| 後端 | Node.js + Express |
| 資料庫 | SQLite + Prisma ORM |
| 認證 | JWT（access token 15min + refresh token 7d） |
| 樣式 | TailwindCSS（響應式） |
| 圖標 | Lucide React |

---

## 3. User Roles

| 角色 | 權限 |
|------|------|
| **保母（Nanny）** | 全系統管理者，可管理所有會員、預約、服務項目 |
| **主人（Owner）** | 僅可管理自己與自己貓咪的資料、查看/預約自己的服務 |

---

## 4. Core Features

### 4.1 認證系統
- 註冊（保母 / 主人）
- 登入（JWT）
- 登出
- 密碼雜湊（bcrypt）

### 4.2 會員管理（保母）
- 會員列表（可搜尋/篩選）
- 新增會員（主人資料）
- 編輯會員資料
- 刪除會員（軟刪除）

### 4.3 貓咪資料管理
- 會員下新增貓咪
- 貓咪資料：名字、性別、年齡、品種、健康狀況、特殊習慣、相片
- 編輯/刪除貓咪

### 4.4 服務項目管理（保母）
- 服務類型：到府照顧、寄宿、額外服務
- 定價：每次/每日
- 編輯服務項目

### 4.5 預約管理
- 雙方皆可建立預約（保母可代建）
- 預約狀態：待確認、已確認、已完成、已取消
- 日曆視圖（保母用）
- 詳情：貓咪、服務項目、時間、費用

### 4.6 費用計算
- 根據服務類型與天數自動計算
- 顯示費用明細
- 備註欄位

### 4.7 通知系統（站內）
- 預約建立/修改/取消通知
- 未讀標記

### 4.8 評論與評分
- 主人可對完成的服務留下評分（1-5星）+ 文字評論
- 保母主頁顯示平均評分

---

## 5. Data Model

### User
```
id, email, passwordHash, name, phone, role (NANNY|OWNER), createdAt, updatedAt, deletedAt
```

### Cat
```
id, ownerId, name, gender, breed, age, healthNotes, specialHabits, photoUrl, createdAt, updatedAt, deletedAt
```

### Service
```
id, nannyId, name, description, price, unit (PER_VISIT|PER_DAY), createdAt, updatedAt
```

### Booking
```
id, nannyId, ownerId, catId, serviceId, startDate, endDate, status (PENDING|CONFIRMED|COMPLETED|CANCELLED), totalFee, notes, createdAt, updatedAt
```

### Review
```
id, bookingId, ownerId, rating (1-5), comment, createdAt
```

### Notification
```
id, userId, type, title, message, isRead, bookingId, createdAt
```

---

## 6. API Endpoints

### Auth
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

### Users (Nanny only)
```
GET    /api/users          # list owners
POST   /api/users
GET    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id
```

### Cats
```
GET    /api/cats
POST   /api/cats
GET    /api/cats/:id
PATCH  /api/cats/:id
DELETE /api/cats/:id
```

### Services (Nanny only)
```
GET    /api/services
POST   /api/services
PATCH  /api/services/:id
DELETE /api/services/:id
```

### Bookings
```
GET    /api/bookings
POST   /api/bookings
GET    /api/bookings/:id
PATCH  /api/bookings/:id    # update status
DELETE /api/bookings/:id
```

### Reviews
```
POST /api/reviews
GET  /api/bookings/:id/review
```

### Notifications
```
GET  /api/notifications
PATCH /api/notifications/:id/read
PATCH /api/notifications/read-all
```

---

## 7. Frontend Pages

| 頁面 | 權限 |
|------|------|
| `/login` | 公開 |
| `/register` | 公開 |
| `/dashboard` | 全部 |
| `/members` | Nanny |
| `/members/:id` | Nanny |
| `/cats` | Nanny / Owner（自己的） |
| `/cats/:id` | Nanny / Owner（自己的） |
| `/services` | Nanny |
| `/bookings` | 全部 |
| `/calendar` | Nanny |
| `/reviews` | Nanny |
| `/notifications` | 全部 |

---

## 8. Out of Scope (MVP)

- 金流（收款）
- Email 通知
- 多人保母團隊
- 貓咪相片上傳（可用 URL 代替）
- Mobile App

---

## 9. Next Steps After MVP

- 金流整合（綠界 / 藍新）
- Email / Push 通知
- iOS / Android App
- 貓咪相片上傳（S3 / Cloudinary）
- 多人保母支援
