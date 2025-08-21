# 🚀 Task Management System

A modern, scalable, and secure platform for managing users, companies, projects, tasks, sprints, labels, and comments.  
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
  - Label and comment support

- **Sprint Management**
  - Create, update, delete sprints
  - Assign tasks to sprints
  - List sprints by project
  - Sprint task management

- **Label Management**
  - Create, update, delete labels
  - Assign labels to tasks
  - List labels with pagination and search

- **Comment Management**
  - Add, update, delete comments on tasks
  - List comments by task
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
  ├── common/         # Shared services (mail, response, logger, etc.)
  ├── user/           # User module (controller, service, DTOs, tests)
  ├── company/        # Company module (controller, service, DTOs, tests)
  ├── project/        # Project & member module (controller, service, DTOs, tests)
  ├── task/           # Task module (controller, service, DTOs, tests)
  ├── sprint/         # Sprint module (controller, service, DTOs, tests)
  ├── label/          # Label module (controller, service, DTOs, tests)
  ├── comment/        # Comment module (controller, service, DTOs, tests)
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

## 📚 API Endpoints

### User APIs
- `POST /user/register` — Register a new user
- `POST /user/login` — Login and get JWT
- `GET /user/profile` — Get user profile
- `PATCH /user/update` — Update user profile
- `PATCH /user/password` — Change password
- `GET /user/company/users` — List users in a company

### Company APIs
- `POST /company` — Create a company
- `GET /company/:id` — Get company by ID
- `PATCH /company/:id` — Update company
- `DELETE /company/:id` — Delete company
- `GET /company` — List companies

### Project APIs
- `POST /project` — Create a project
- `GET /project/:id` — Get project by ID
- `PATCH /project/:id` — Update project
- `DELETE /project/:id` — Delete project
- `GET /project` — List projects (pagination, search)
- `POST /project/member` — Add project member
- `PATCH /project/member/:id` — Update project member
- `DELETE /project/member/:id` — Remove project member

### Task APIs
- `POST /task` — Create a task
- `GET /task/:id` — Get task by ID
- `PATCH /task/:id` — Update task
- `DELETE /task/:id` — Delete task
- `GET /task` — List tasks (pagination, search)
- `GET /task/project/:projectId` — List tasks by project
- `GET /task/parent/:parentId` — List subtasks
- `GET /task/assignee/:userId` — List tasks assigned to user

### Sprint APIs
- `POST /sprint` — Create a sprint
- `GET /sprint/:id` — Get sprint by ID
- `PATCH /sprint/:id` — Update sprint
- `DELETE /sprint/:id` — Delete sprint
- `GET /sprint/project/:projectId` — List sprints for a project (pagination, search)
- `GET /sprint/:id/tasks` — List tasks in a sprint
- `POST /sprint/:id/tasks/:taskId` — Assign task to sprint
- `DELETE /sprint/:id/tasks/:taskId` — Remove task from sprint

### Label APIs
- `POST /label` — Create a label
- `GET /label/:id` — Get label by ID
- `PATCH /label/:id` — Update label
- `DELETE /label/:id` — Delete label
- `GET /label` — List labels (pagination, search)

### Comment APIs
- `POST /comment` — Add a comment to a task
- `GET /comment/:id` — Get comment by ID
- `PATCH /comment/:id` — Update comment
- `DELETE /comment/:id` — Delete comment
- `GET /comment/task/:taskId` — List comments for a task (pagination, search)

### Auth APIs
- `POST /auth/login` — Login and get JWT
- `POST /auth/otp` — Verify OTP

---

## 🧪 Testing

- All modules include unit tests for controllers and services.
- Run all tests with:

  ```bash
  npm run test
  ```

---

## 🎨 API Screenshots

> _Add screenshots of your Swagger UI, registration flow, and project/task dashboard here!_

### User API (Swagger Screenshot)
![User API Swagger Screenshot](./screenshots/user-api.png)

### Project API (Swagger Screenshot)
![Project API Swagger Screenshot](./screenshots/project-api.png)

### Task API (Swagger Screenshot)
![Task API Swagger Screenshot](./screenshots/task-api.png)

### Sprint API (Swagger Screenshot)
![Sprint API Swagger Screenshot](./screenshots/sprint-api.png)

### Label API (Swagger Screenshot)
![Label API Swagger Screenshot](./screenshots/label-api.png)

### Comment API (Swagger Screenshot)
![Comment API Swagger Screenshot](./screenshots/comment-api.png)

---

## 📝 License

MIT © 2025