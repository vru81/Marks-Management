import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Loader2,
  LogIn,
  LogOut,
  RefreshCcw,
  Save,
  UserPlus,
  UsersRound
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getAssignableStudents, getCurrentTeacher, getMarks, loginTeacher, registerTeacher, saveMark } from './api.js';

const defaultExam = 'Unit Test 1';
const tokenStorageKey = 'school_marks_teacher_token';

function getAssignmentKey(assignment) {
  return `${assignment.class}-${assignment.division}`;
}

function findFirstSubject(assignment) {
  return assignment?.subjects?.[0] || '';
}

function formatError(error) {
  if (!error) {
    return '';
  }

  if (error.status === 401) {
    return `${error.message}. Please login again.`;
  }

  if (error.status === 403) {
    return `${error.message}. You can only add marks for your assigned class, division, and subject.`;
  }

  if (error.status === 404) {
    return `${error.message}. Check that seed data is loaded and the selected student belongs to this division.`;
  }

  return error.message || 'Unexpected error. Please try again.';
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(tokenStorageKey) || '');
  const [teacher, setTeacher] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ teacherId: '1', email: '', password: '' });
  const [selectedAssignmentKey, setSelectedAssignmentKey] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [exam, setExam] = useState(defaultExam);
  const [scores, setScores] = useState({});
  const [maxMarks, setMaxMarks] = useState(50);
  const [checkingSession, setCheckingSession] = useState(Boolean(token));
  const [submittingAuth, setSubmittingAuth] = useState(false);
  const [loadingScope, setLoadingScope] = useState(false);
  const [savingStudentId, setSavingStudentId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedAssignment = useMemo(
    () => teacher?.assignments.find((assignment) => getAssignmentKey(assignment) === selectedAssignmentKey),
    [selectedAssignmentKey, teacher]
  );

  const markByStudentId = useMemo(() => {
    return marks.reduce((lookup, mark) => {
      lookup[mark.student._id] = mark;
      return lookup;
    }, {});
  }, [marks]);

  function applyTeacherSession(nextToken, nextTeacher) {
    const firstAssignment = nextTeacher?.assignments?.[0];

    localStorage.setItem(tokenStorageKey, nextToken);
    setToken(nextToken);
    setTeacher(nextTeacher);
    setSelectedAssignmentKey(firstAssignment ? getAssignmentKey(firstAssignment) : '');
    setSelectedSubject(findFirstSubject(firstAssignment));
    setStudents([]);
    setMarks([]);
    setScores({});
  }

  function logout() {
    localStorage.removeItem(tokenStorageKey);
    setToken('');
    setTeacher(null);
    setStudents([]);
    setMarks([]);
    setScores({});
    setSuccess('Logged out.');
    setError('');
  }

  useEffect(() => {
    if (!token) {
      setCheckingSession(false);
      return;
    }

    async function restoreSession() {
      setCheckingSession(true);
      setError('');

      try {
        const data = await getCurrentTeacher(token);
        applyTeacherSession(token, data.teacher);
      } catch (sessionError) {
        localStorage.removeItem(tokenStorageKey);
        setToken('');
        setTeacher(null);
        setError(formatError(sessionError));
      } finally {
        setCheckingSession(false);
      }
    }

    restoreSession();
  }, []);

  useEffect(() => {
    if (!teacher || !selectedAssignment) {
      setSelectedSubject('');
      return;
    }

    if (!selectedAssignment.subjects.includes(selectedSubject)) {
      setSelectedSubject(findFirstSubject(selectedAssignment));
    }
  }, [selectedAssignment, selectedSubject, teacher]);

  async function loadScope() {
    if (!token || !selectedAssignment || !selectedSubject) {
      setStudents([]);
      setMarks([]);
      return;
    }

    setLoadingScope(true);
    setError('');
    setSuccess('');

    try {
      const [studentData, markData] = await Promise.all([
        getAssignableStudents(token, selectedAssignment, selectedSubject),
        getMarks(token, selectedAssignment, selectedSubject)
      ]);

      setStudents(studentData.students || []);
      setMarks(markData.marks || []);
      setScores({});
    } catch (scopeError) {
      if (scopeError.status === 401) {
        logout();
      }

      setStudents([]);
      setMarks([]);
      setError(formatError(scopeError));
    } finally {
      setLoadingScope(false);
    }
  }

  useEffect(() => {
    loadScope();
  }, [token, selectedAssignmentKey, selectedSubject]);

  function updateAuthForm(field, value) {
    setAuthForm((current) => ({ ...current, [field]: value }));
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setSubmittingAuth(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        email: authForm.email,
        password: authForm.password
      };

      const data = authMode === 'register'
        ? await registerTeacher({ ...payload, teacherId: authForm.teacherId })
        : await loginTeacher(payload);

      applyTeacherSession(data.token, data.teacher);
      setSuccess(authMode === 'register' ? 'Teacher account created.' : 'Logged in.');
    } catch (authError) {
      setError(formatError(authError));
    } finally {
      setSubmittingAuth(false);
    }
  }

  function validateScore(studentId) {
    const score = scores[studentId];

    if (score === undefined || score === '') {
      return 'Enter marks before saving.';
    }

    if (Number(score) < 0) {
      return 'Marks cannot be negative.';
    }

    if (Number(score) > Number(maxMarks)) {
      return 'Marks cannot be greater than max marks.';
    }

    if (!exam.trim()) {
      return 'Exam name is required.';
    }

    return '';
  }

  async function handleSave(student) {
    const validationError = validateScore(student._id);

    if (validationError) {
      setError(validationError);
      setSuccess('');
      return;
    }

    setSavingStudentId(student._id);
    setError('');
    setSuccess('');

    try {
      await saveMark(token, {
        studentId: student._id,
        class: selectedAssignment.class,
        division: selectedAssignment.division,
        subject: selectedSubject,
        exam,
        marksObtained: Number(scores[student._id]),
        maxMarks: Number(maxMarks)
      });

      setSuccess(`Saved ${selectedSubject} marks for ${student.name}.`);
      await loadScope();
    } catch (saveError) {
      if (saveError.status === 401) {
        logout();
      }

      if (saveError.status === 403) {
        setStudents([]);
        setMarks([]);
      }

      setError(formatError(saveError));
    } finally {
      setSavingStudentId('');
    }
  }

  if (checkingSession) {
    return (
      <main className="app-shell">
        <section className="hero-panel compact-hero">
          <Loader2 className="spin" size={24} />
          <p className="hero-copy">Checking teacher session...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Marks console</p>
          <h1>Teacher-only mark entry</h1>
          <p className="hero-copy">
            Login as one teacher. The backend uses your token to allow marks only for your assigned class, division, and subject.
          </p>
        </div>
        {teacher ? (
          <button className="icon-button" type="button" onClick={logout} aria-label="Logout">
            <LogOut size={18} />
          </button>
        ) : null}
      </section>

      {error ? (
        <div className="alert error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      {success ? (
        <div className="alert success" role="status">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      ) : null}

      {!teacher ? (
        <section className="auth-panel">
          <div className="auth-tabs" aria-label="Authentication mode">
            <button className={authMode === 'login' ? 'active' : ''} type="button" onClick={() => setAuthMode('login')}>
              <LogIn size={16} />
              Login
            </button>
            <button className={authMode === 'register' ? 'active' : ''} type="button" onClick={() => setAuthMode('register')}>
              <UserPlus size={16} />
              Register
            </button>
          </div>

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authMode === 'register' ? (
              <label>
                Teacher ID
                <select value={authForm.teacherId} onChange={(event) => updateAuthForm('teacherId', event.target.value)}>
                  <option value="1">1 - Vikram Shah</option>
                  <option value="2">2 - Priya Patel</option>
                  <option value="3">3 - Rahul Mehta</option>
                </select>
              </label>
            ) : null}

            <label>
              Email
              <input
                autoComplete="email"
                type="email"
                value={authForm.email}
                onChange={(event) => updateAuthForm('email', event.target.value)}
                placeholder="teacher@example.com"
                required
              />
            </label>

            <label>
              Password
              <input
                autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                minLength="6"
                type="password"
                value={authForm.password}
                onChange={(event) => updateAuthForm('password', event.target.value)}
                placeholder="Minimum 6 characters"
                required
              />
            </label>

            <button className="primary-button" type="submit" disabled={submittingAuth}>
              {submittingAuth ? <Loader2 className="spin" size={16} /> : authMode === 'register' ? <UserPlus size={16} /> : <LogIn size={16} />}
              {authMode === 'register' ? 'Create account' : 'Login'}
            </button>
          </form>
        </section>
      ) : (
        <>
          <section className="teacher-strip">
            <strong>{teacher.name}</strong>
            <span>Teacher ID {teacher.id}</span>
          </section>

          <section className="controls-band">
            <label>
              Class and division
              <select
                value={selectedAssignmentKey}
                onChange={(event) => setSelectedAssignmentKey(event.target.value)}
                disabled={!teacher.assignments.length}
              >
                {teacher.assignments.map((assignment) => (
                  <option key={getAssignmentKey(assignment)} value={getAssignmentKey(assignment)}>
                    Class {assignment.class} - Division {assignment.division}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Subject
              <select value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)} disabled={!selectedAssignment}>
                {selectedAssignment?.subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </label>

            <label>
              Exam
              <input value={exam} onChange={(event) => setExam(event.target.value)} placeholder="Unit Test 1" />
            </label>

            <label>
              Max marks
              <input
                min="1"
                type="number"
                value={maxMarks}
                onChange={(event) => setMaxMarks(event.target.value)}
              />
            </label>
          </section>

          <section className="workspace-grid">
            <aside className="teacher-card">
              <div className="section-title">
                <BookOpen size={20} />
                <h2>Your assignments</h2>
              </div>

              {teacher.assignments.length === 0 ? <p className="muted">No assignments found for this teacher.</p> : null}

              {teacher.assignments.map((assignment) => (
                <div className="assignment-pill" key={getAssignmentKey(assignment)}>
                  <strong>Class {assignment.class}-{assignment.division}</strong>
                  <span>{assignment.subjects.join(', ')}</span>
                </div>
              ))}
            </aside>

            <section className="marks-panel">
              <div className="panel-header">
                <div className="section-title">
                  <UsersRound size={20} />
                  <h2>Students</h2>
                </div>
                <button className="text-button" type="button" onClick={loadScope} disabled={loadingScope || !selectedAssignment}>
                  {loadingScope ? <Loader2 className="spin" size={16} /> : <RefreshCcw size={16} />}
                  Refresh
                </button>
              </div>

              {loadingScope ? <p className="muted">Loading students and marks...</p> : null}
              {!loadingScope && selectedAssignment && students.length === 0 ? <p className="muted">No students found for this assigned division.</p> : null}

              {students.length > 0 ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Roll</th>
                        <th>Student</th>
                        <th>Saved</th>
                        <th>New marks</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => {
                        const existingMark = markByStudentId[student._id];
                        const isSaving = savingStudentId === student._id;

                        return (
                          <tr key={student._id}>
                            <td>{student.rollNumber}</td>
                            <td>{student.name}</td>
                            <td>{existingMark ? `${existingMark.marksObtained}/${existingMark.maxMarks}` : 'Not added'}</td>
                            <td>
                              <input
                                className="marks-input"
                                min="0"
                                max={maxMarks}
                                type="number"
                                value={scores[student._id] ?? ''}
                                onChange={(event) => setScores((current) => ({ ...current, [student._id]: event.target.value }))}
                                placeholder="0"
                              />
                            </td>
                            <td>
                              <button className="save-button" type="button" onClick={() => handleSave(student)} disabled={isSaving}>
                                {isSaving ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
                                Save
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </section>
          </section>
        </>
      )}
    </main>
  );
}
