# School Marks MERN App

Express + MongoDB backend with a React frontend for teachers, class/division assignments, students, and marks.

The teacher workspace dropdowns show the class, division, and subject combinations present in that teacher's `assignments` list.

## Setup

1. Copy the environment file:

```powershell
Copy-Item .env.example .env
```

2. Update `.env` with your MongoDB connection string.

For MongoDB Atlas or Compass, use this shape:

```powershell
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@cluster0.xikwbei.mongodb.net/Management?retryWrites=true&w=majority
```

Keep the real password only in `.env`. Do not commit it.

You can configure `.env` with a terminal prompt so the password is not shown in chat or command history:

```powershell
npm run configure:atlas
```

3. Install dependencies:

```powershell
npm install
Set-Location client
npm install
Set-Location ..
```

4. Seed teachers and sample students:

```powershell
npm run seed
```

5. Start the backend and frontend together:

```powershell
npm run dev:all
```

The API runs at `http://localhost:5000` by default. The React app runs at `http://127.0.0.1:5173` and proxies `/api` requests to the backend.

You can also run them separately:

```powershell
npm run dev
npm run client:dev
```

## Frontend

The React app is in `client/`. It lets a user:

- Register a teacher account against teacher ID 1, 2, or 3.
- Login as one teacher.
- Select a class/division from the teacher's listed assignments.
- Select a subject listed for that class/division.
- Load students for that exact scope.
- Add or update marks for that exact scope only.

Frontend error handling covers loading failures, missing students, empty data, invalid marks, and save failures.

Build the frontend with:

```powershell
npm run client:build
```

## API

### Health

```http
GET /api/health
```

### Teachers

```http
GET /api/teachers
GET /api/teachers/:teacherId
GET /api/teachers/:teacherId/assignments
```

### Auth

Register links credentials to an existing seeded teacher ID.

```http
POST /api/auth/register
Content-Type: application/json

{
  "teacherId": 1,
  "email": "vikram@example.com",
  "password": "secret123"
}
```

Login returns a token and the logged-in teacher.

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "vikram@example.com",
  "password": "secret123"
}
```

Use the token for current-teacher APIs:

```http
Authorization: Bearer YOUR_TOKEN
```

```http
GET /api/auth/me
GET /api/me/assignments
GET /api/me/students?class=8&division=A&subject=Mathematics
GET /api/me/marks?class=8&division=A&subject=Mathematics
POST /api/me/marks
```

### Students visible for a teacher assignment

Requires the requesting teacher's own token, and `:teacherId` must match the logged-in teacher (`403` otherwise). Only returns students when the teacher is assigned to that exact class, division, and subject.

```http
GET /api/teachers/:teacherId/students?class=8&division=A&subject=Mathematics
Authorization: Bearer YOUR_TOKEN
```

### Add or update marks

Requires the requesting teacher's own token, and `:teacherId` must match the logged-in teacher (`403` otherwise).

```http
POST /api/teachers/:teacherId/marks
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "studentId": "STUDENT_OBJECT_ID",
  "class": 8,
  "division": "A",
  "subject": "Mathematics",
  "exam": "Unit Test 1",
  "marksObtained": 42,
  "maxMarks": 50
}
```

If the teacher is not assigned to class 8, division A, and Mathematics, the API returns `403`.

If the student does not belong to class 8 division A, the API returns `404`.

### View marks for a teacher assignment

Requires the requesting teacher's own token, and `:teacherId` must match the logged-in teacher (`403` otherwise).

```http
GET /api/teachers/:teacherId/marks?class=8&division=A&subject=Mathematics
Authorization: Bearer YOUR_TOKEN
GET /api/teachers/:teacherId/marks?class=8&division=A&subject=Mathematics&exam=Unit%20Test%201
```

## Data Shape

Teacher assignment example:

```json
{
  "name": "Vikram Shah",
  "classTeacherOf": [{ "class": 8, "division": "A" }],
  "assignments": [
    {
      "class": 8,
      "division": "A",
      "subjects": ["Mathematics", "Science", "English"]
    }
  ]
}
```

Marks are stored with teacher, student, class, division, subject, exam, marks obtained, and maximum marks.

## Notes

The frontend uses JWT login and protected `/api/me` routes. The older `/api/teachers/:teacherId/students|marks` and `/assignments` routes are still present for simple testing, but now also require a valid token whose teacher ID matches `:teacherId` — a teacher can never fetch or modify another teacher's students or marks, even by editing the URL.
