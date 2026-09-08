export function normalizeDivision(division) {
  return String(division || '').trim().toUpperCase();
}

export function normalizeSubject(subject) {
  return String(subject || '').trim().toLowerCase();
}

export function canTeachAssignment(teacher, classNumber, division, subject) {
  const normalizedDivision = normalizeDivision(division);
  const normalizedSubject = normalizeSubject(subject);

  return teacher.assignments.some((assignment) => {
    const hasClassDivision =
      Number(assignment.class) === Number(classNumber) &&
      normalizeDivision(assignment.division) === normalizedDivision;

    const hasSubject = assignment.subjects.some(
      (assignedSubject) => normalizeSubject(assignedSubject) === normalizedSubject
    );

    return hasClassDivision && hasSubject;
  });
}
