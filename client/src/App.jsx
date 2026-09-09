import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Layers3,
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
const examOptions = ['Unit Test 1', 'Unit Test 2', 'Midterm Exam', 'Final Exam', 'Practical', 'Other'];

function getAssignmentKey(assignment) {
  return `${assignment.class}-${assignment.division}`;
}

function findFirstSubject(assignment) {
  return assignment?.subjects?.[0] || '';
}

function getClasses(assignments) {
  return [...new Set(assignments.map((assignment) => assignment.class))].sort((firstClass, secondClass) => firstClass - secondClass);
}

function formatError(error) {
  if (!error) {
    return '';
  }

  if (error.status === 401) {
    return `${error.message}. Please login again.`;
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
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedAssignmentKey, setSelectedAssignmentKey] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [exam, setExam] = useState(defaultExam);
  const [selectedExamOption, setSelectedExamOption] = useState(defaultExam);
  const [scores, setScores] = useState({});
  const [maxMarks, setMaxMarks] = useState(50);
  const [checkingSession, setCheckingSession] = useState(Boolean(token));
  const [submittingAuth, setSubmittingAuth] = useState(false);
  const [loadingScope, setLoadingScope] = useState(false);
  const [savingStudentId, setSavingStudentId] = useState('');
  const [inputErrors, setInputErrors] = useState({});
  const [validationToast, setValidationToast] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedAssignment = useMemo(
    () => teacher?.assignments.find((assignment) => getAssignmentKey(assignment) === selectedAssignmentKey),
    [selectedAssignmentKey, teacher]
  );

  const availableClasses = useMemo(() => getClasses(teacher?.assignments || []), [teacher]);
  const availableDivisions = useMemo(
    () => teacher?.assignments.filter((assignment) => String(assignment.class) === selectedClass) || [],
    [selectedClass, teacher]
  );

  const markByStudentId = useMemo(() => {
    return marks.reduce((lookup, mark) => {
      lookup[mark.student._id] = mark;
      return lookup;
    }, {});
  }, [marks]);

  function applyTeacherSession(nextToken, nextTeacher) {
    localStorage.setItem(tokenStorageKey, nextToken);
    setToken(nextToken);
    setTeacher(nextTeacher);
    setSelectedClass('');
    setSelectedAssignmentKey('');
    setSelectedSubject('');
    setStudents([]);
    setMarks([]);
    setScores({});
    setInputErrors({});
  }

  function logout() {
    localStorage.removeItem(tokenStorageKey);
    setToken('');
    setTeacher(null);
    setSelectedClass('');
    setSelectedAssignmentKey('');
    setSelectedSubject('');
    setStudents([]);
    setMarks([]);
    setScores({});
    setInputErrors({});
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
      setInputErrors({});
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

  useEffect(() => {
    if (!validationToast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setValidationToast(''), 4000);
    return () => window.clearTimeout(timer);
  }, [validationToast]);

  function updateAuthForm(field, value) {
    setAuthForm((current) => ({ ...current, [field]: value }));
  }

  function selectClass(classNumber) {
    setSelectedClass(String(classNumber));
    setSelectedAssignmentKey('');
    setSelectedSubject('');
  }

  function selectDivision(assignment) {
    setSelectedAssignmentKey(getAssignmentKey(assignment));
    setSelectedSubject('');
  }

  function selectExam(examOption) {
    setSelectedExamOption(examOption);
    setExam(examOption === 'Other' ? '' : examOption);
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
      setInputErrors((current) => ({ ...current, [student._id]: validationError }));
      setValidationToast(validationError);
      setSuccess('');
      return;
    }

    setInputErrors((current) => {
      const { [student._id]: removedError, ...remainingErrors } = current;
      return remainingErrors;
    });
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
            Login as one teacher and choose an assigned class, division, and subject.
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

      {validationToast ? (
        <div className="toast error-toast" role="alert">
          <AlertCircle size={18} />
          <span>{validationToast}</span>
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
          <section className="selection-flow" aria-label="Mark entry selection flow">
            <article className="step-card completed-step">
              <div className="step-heading">
                <span className="step-number">1</span>
                <GraduationCap size={20} />
                <div><p>Teacher</p><h2>{teacher.name}</h2></div>
              </div>
              <span className="step-detail">Teacher ID {teacher.id}</span>
            </article>

            <article className="step-card">
              <div className="step-heading"><span className="step-number">2</span><Layers3 size={20} /><div><p>Class</p><h2>Choose a class</h2></div></div>
              <div className="choice-grid">
                {availableClasses.map((classNumber) => <button className={`choice-card ${selectedClass === String(classNumber) ? 'selected' : ''}`} type="button" key={classNumber} onClick={() => selectClass(classNumber)}>Class {classNumber}</button>)}
              </div>
            </article>

            {selectedClass ? <article className="step-card">
              <div className="step-heading"><span className="step-number">3</span><UsersRound size={20} /><div><p>Division</p><h2>Choose a division</h2></div></div>
              <div className="choice-grid">
                {availableDivisions.map((assignment) => <button className={`choice-card ${selectedAssignmentKey === getAssignmentKey(assignment) ? 'selected' : ''}`} type="button" key={getAssignmentKey(assignment)} onClick={() => selectDivision(assignment)}>Division {assignment.division}</button>)}
              </div>
            </article> : null}

            {selectedAssignment ? <article className="step-card">
              <div className="step-heading"><span className="step-number">4</span><BookOpen size={20} /><div><p>Subject</p><h2>Choose a subject</h2></div></div>
              <div className="choice-grid">
                {selectedAssignment.subjects.map((subject) => <button className={`choice-card ${selectedSubject === subject ? 'selected' : ''}`} type="button" key={subject} onClick={() => setSelectedSubject(subject)}>{subject}</button>)}
              </div>
            </article> : null}

            {selectedSubject ? <article className="step-card exam-step">
              <div className="step-heading"><span className="step-number">5</span><ClipboardList size={20} /><div><p>Exam</p><h2>Name this assessment</h2></div></div>
              <div className="exam-fields">
                <label>Exam name
                  <select value={selectedExamOption} onChange={(event) => selectExam(event.target.value)}>
                    {examOptions.map((examOption) => <option key={examOption} value={examOption}>{examOption}</option>)}
                  </select>
                </label>
                {selectedExamOption === 'Other' ? <label>Custom exam name<input value={exam} onChange={(event) => setExam(event.target.value)} placeholder="Enter exam name" required /></label> : null}
                <label>Maximum marks<input min="1" type="number" value={maxMarks} onChange={(event) => setMaxMarks(event.target.value)} /></label>
              </div>
            </article> : null}
          </section>

          {selectedAssignment && selectedSubject && exam.trim() ? <section className="marks-panel">
              <div className="panel-header">
                <div className="section-title">
                  <UsersRound size={20} />
                  <div><p className="eyebrow">Student entry sheet</p><h2>{selectedSubject} - {exam.trim()}</h2><p className="sheet-context">Class {selectedAssignment.class} / Division {selectedAssignment.division}</p></div>
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
                        const inputError = inputErrors[student._id];

                        return (
                          <tr key={student._id}>
                            <td>{student.rollNumber}</td>
                            <td>{student.name}</td>
                            <td>{existingMark ? `${existingMark.marksObtained}/${existingMark.maxMarks}` : 'Not added'}</td>
                            <td>
                              <input
                                aria-invalid={Boolean(inputError)}
                                className={`marks-input ${inputError ? 'invalid' : ''}`}
                                min="0"
                                max={maxMarks}
                                type="number"
                                value={scores[student._id] ?? ''}
                                onChange={(event) => {
                                  setScores((current) => ({ ...current, [student._id]: event.target.value }));
                                  setInputErrors((current) => {
                                    const { [student._id]: removedError, ...remainingErrors } = current;
                                    return remainingErrors;
                                  });
                                }}
                                placeholder="0"
                              />
                              {inputError ? <span className="input-error">{inputError}</span> : null}
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
            </section> : null}
        </>
      )}
    </main>
  );
}
