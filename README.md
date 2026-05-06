# 🐾 PETZ Platform

A full-stack Animal Welfare Platform built with **Spring Boot 3.2 + Angular 15 + MySQL 8**.

---

## 📦 Project Structure

```
petz-platform/
├── petz-backend/          ← Spring Boot REST API
│   ├── src/main/java/com/petz/
│   │   ├── config/        ← JWT, Security, WebSocket, File Storage
│   │   ├── controller/    ← 8 controllers (Auth, User, Hospital, NGO, Pet, Rescue, Adoption, Admin)
│   │   ├── service/       ← 9 services
│   │   ├── entity/        ← 13 JPA entities
│   │   ├── repository/    ← 13 Spring Data repos
│   │   ├── dto/           ← Request + Response DTOs
│   │   ├── enums/         ← 8 enums (Role, Status, etc.)
│   │   ├── scheduler/     ← Rescue queue timeout job (60s)
│   │   ├── websocket/     ← STOMP WebSocket controller
│   │   └── exception/     ← Global exception handler
│   └── src/main/resources/
│       ├── application.properties
│       └── schema.sql     ← 13 tables + seed data
│
└── petz-frontend/         ← Angular 15 SPA
    └── src/app/
        ├── core/          ← Services, guards, interceptors, models
        ├── shared/        ← Material module
        └── features/      ← auth, dashboard, pets, appointments,
                              rescue, adoption, ngo, hospital, admin
```

---

## 🚀 Quick Start

### Prerequisites
- Java 17+, Maven 3.8+
- Node.js 18+, Angular CLI 15
- MySQL 8

### 1. Database Setup
```sql
-- Create and run schema
mysql -u root -p < petz-backend/src/main/resources/schema.sql
```

### 2. Configure Database
Edit `petz-backend/src/main/resources/application.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### 3. Run Backend
```bash
cd petz-backend
mvn spring-boot:run
# Starts on http://localhost:8080/api/v1
```

### 4. Run Frontend
```bash
cd petz-frontend
npm install
ng serve
# Opens on http://localhost:4200
```

---

## 🔑 Default Accounts

| Role     | Email                  | Password      |
|----------|------------------------|---------------|
| Admin    | admin@petz.com         | admin@petz123 |
| NGO      | ngo@petz.com           | admin@petz123 |
| Hospital | hospital@petz.com      | admin@petz123 |
| User     | user@petz.com          | admin@petz123 |

---

## 🗄️ API Overview

Base URL: `http://localhost:8080/api/v1`

| Module        | Endpoints                                     |
|---------------|-----------------------------------------------|
| Auth          | POST /auth/register, /auth/login              |
| Users         | GET/PUT /users/me, POST /users/me/photo       |
| Pets          | CRUD /pets, GET /pets/my                      |
| Hospitals     | GET /hospitals/public, POST /hospitals/profile|
| Appointments  | POST /appointments, GET /appointments/my      |
| Rescue        | POST /rescue, GET /rescue/my, /rescue/ngo     |
| Adoption      | GET /adoption/animals, POST /adoption/apply   |
| NGO           | GET/POST /ngo/profile                         |
| Admin         | /admin/users, /admin/ngos, /admin/rescues     |
| Notifications | GET /notifications, PATCH /notifications/:id  |

---

## 🔌 WebSocket

Connect to: `ws://localhost:8080/api/v1/ws` (SockJS)

Subscribe to: `/user/{userId}/queue/notifications` for real-time push

---

## 🏗️ Architecture

- **JWT Stateless Auth** — Bearer token, roles in claims
- **Role-based access** — `@PreAuthorize` on controllers
- **Rescue Queue Algorithm** — Top-5 NGOs sorted by active rescue count, 5-min timeout scheduler
- **File uploads** — `/uploads/{subfolder}/{uuid}_filename`, served as static resource
- **WebSocket notifications** — STOMP over SockJS, user-specific queues
