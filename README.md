# 🚀 Task Management System

A modern, scalable, and secure platform for managing users, companies, projects, and tasks.  
Built with **NestJS**, **Prisma**, and **PostgreSQL** for enterprise-grade reliability.

---

## ✨ Features

- **User Registration & Authentication**

  - JWT-based login
  - Email OTP verification
  - Password update & profile management

- **Company Management**

  - Register and manage companies
  - Company-user association

- **Project Management**

  - Create, update, delete projects
  - Assign projects to companies
  - Pagination, filtering, and search

- **Project Member Management**

  - Add, update, remove project members
  - Company-based member validation

- **Task Management**

  - Create, update, delete tasks
  - Assign tasks to users
  - List tasks by project, parent, assignee
  - Pagination and search support

- **Role-Based Access**

  - Manager, User, and custom roles
  - Guards and decorators for secure endpoints

- **Swagger API Docs**

  - Auto-generated, interactive API documentation

- **Unit Testing**
  - Comprehensive tests for controllers and services

---

## 🛠️ Tech Stack

- **Backend:** [NestJS](https://nestjs.com/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Validation:** [class-validator](https://github.com/typestack/class-validator)
- **Authentication:** JWT, Guards, Decorators
- **API Docs:** [Swagger](https://swagger.io/)
- **Testing:** [Jest](https://jestjs.io/)

---

## 📦 Project Structure

```
src/
  ├── common/         # Shared services (mail, response, etc.)
  ├── user/           # User module (controller, service, DTOs, tests)
  ├── project/        # Project & member module (controller, service, DTOs, tests)
  ├── task/           # Task module (controller, service, DTOs, tests)
  ├── database/       # Prisma client & config
  ├── auth/           # Auth module (JWT, guards, decorators)
  └── prisma/         # Prisma schema
```

---

## 🚦 Getting Started

1. **Clone the repo**

   ```bash
   git clone https://github.com/your-username/task-management.git
   cd task-management
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   - Copy `.env.example` to `.env` and set your DB and mail credentials.

4. **Run migrations**

   ```bash
   npx prisma migrate dev
   ```

5. **Start the server**

   ```bash
   npm run start:dev
   ```

6. **Run tests**

   ```bash
   npm run test
   ```

7. **Access Swagger Docs**
   - Visit [http://localhost:3000/api](http://localhost:3000/api) for interactive API documentation.

---

## 📚 API Highlights

- **User Registration:** `/user/register`
- **Login & Auth:** `/auth/login`
- **Project CRUD:** `/project`
- **Project Members:** `/project/member`
- **Task CRUD & Listing:** `/task`
- **Company Users:** `/user/company/users`

---

## 🧪 Testing

- All modules include unit tests for controllers and services.
- Run all tests with:

  ```bash
  npm run test
  ```

---

## 🎨 Screenshots

> _Add screenshots of your Swagger UI, registration flow, and project/task dashboard here!_

---

## 📝
