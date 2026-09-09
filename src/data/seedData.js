export const teachers = [
  {
    externalId: 1,
    name: 'Vikram Shah',
    classTeacherOf: [
      {
        class: 8,
        division: 'A'
      }
    ],
    assignments: [
      {
        class: 8,
        division: 'A',
        subjects: ['Mathematics', 'Science', 'English']
      },
      {
        class: 8,
        division: 'B',
        subjects: ['Mathematics', 'Science']
      },
      {
        class: 12,
        division: 'A',
        subjects: ['Physics']
      }
    ]
  },
  {
    externalId: 2,
    name: 'Priya Patel',
    classTeacherOf: [
      {
        class: 9,
        division: 'B'
      }
    ],
    assignments: [
      {
        class: 8,
        division: 'A',
        subjects: ['Science']
      },
      {
        class: 9,
        division: 'A',
        subjects: ['Science', 'Biology']
      },
      {
        class: 9,
        division: 'B',
        subjects: ['Science', 'Biology']
      }
    ]
  },
  {
    externalId: 3,
    name: 'Rahul Mehta',
    classTeacherOf: [
      {
        class: 12,
        division: 'A'
      }
    ],
    assignments: [
      {
        class: 10,
        division: 'A',
        subjects: ['Mathematics', 'Science']
      },
      {
        class: 11,
        division: 'A',
        subjects: ['Physics']
      },
      {
        class: 11,
        division: 'B',
        subjects: ['Physics']
      },
      {
        class: 12,
        division: 'A',
        subjects: ['Physics', 'Mathematics']
      }
    ]
  }
];

export const teacherApiData = {
  teachers: teachers.map(({ externalId, ...teacher }) => ({
    id: externalId,
    ...teacher
  }))
};

export const students = [
  { rollNumber: 1, name: 'Aarav Desai', class: 8, division: 'A' },
  { rollNumber: 2, name: 'Meera Joshi', class: 8, division: 'A' },
  { rollNumber: 3, name: 'Dhruv Pandya', class: 8, division: 'A' },
  { rollNumber: 4, name: 'Ira Kulkarni', class: 8, division: 'A' },
  { rollNumber: 5, name: 'Yash Vora', class: 8, division: 'A' },
  { rollNumber: 1, name: 'Kabir Trivedi', class: 8, division: 'B' },
  { rollNumber: 2, name: 'Riya Shah', class: 8, division: 'B' },
  { rollNumber: 3, name: 'Parth Amin', class: 8, division: 'B' },
  { rollNumber: 4, name: 'Kiara Dave', class: 8, division: 'B' },
  { rollNumber: 5, name: 'Arnav Bhatt', class: 8, division: 'B' },
  { rollNumber: 1, name: 'Ishaan Patel', class: 9, division: 'A' },
  { rollNumber: 2, name: 'Myra Jain', class: 9, division: 'A' },
  { rollNumber: 3, name: 'Rudra Modi', class: 9, division: 'A' },
  { rollNumber: 4, name: 'Vanya Iyer', class: 9, division: 'A' },
  { rollNumber: 5, name: 'Neil Soni', class: 9, division: 'A' },
  { rollNumber: 1, name: 'Nisha Mehta', class: 9, division: 'B' },
  { rollNumber: 2, name: 'Aditi Shah', class: 9, division: 'B' },
  { rollNumber: 3, name: 'Kiaan Shah', class: 9, division: 'B' },
  { rollNumber: 4, name: 'Reva Patel', class: 9, division: 'B' },
  { rollNumber: 5, name: 'Harshil Joshi', class: 9, division: 'B' },
  { rollNumber: 1, name: 'Dev Kapoor', class: 10, division: 'A' },
  { rollNumber: 2, name: 'Saanvi Desai', class: 10, division: 'A' },
  { rollNumber: 3, name: 'Aryan Shah', class: 10, division: 'A' },
  { rollNumber: 4, name: 'Tanvi Mehta', class: 10, division: 'A' },
  { rollNumber: 5, name: 'Pranav Patel', class: 10, division: 'A' },
  { rollNumber: 1, name: 'Anaya Rao', class: 11, division: 'A' },
  { rollNumber: 2, name: 'Rohan Iyer', class: 11, division: 'A' },
  { rollNumber: 3, name: 'Diya Nair', class: 11, division: 'A' },
  { rollNumber: 4, name: 'Advik Shah', class: 11, division: 'A' },
  { rollNumber: 5, name: 'Kavya Menon', class: 11, division: 'A' },
  { rollNumber: 1, name: 'Sara Khan', class: 11, division: 'B' },
  { rollNumber: 2, name: 'Ayaan Gupta', class: 11, division: 'B' },
  { rollNumber: 3, name: 'Ishita Rao', class: 11, division: 'B' },
  { rollNumber: 4, name: 'Veer Malhotra', class: 11, division: 'B' },
  { rollNumber: 5, name: 'Niyati Patel', class: 11, division: 'B' },
  { rollNumber: 1, name: 'Vivaan Singh', class: 12, division: 'A' },
  { rollNumber: 2, name: 'Aanya Kapoor', class: 12, division: 'A' },
  { rollNumber: 3, name: 'Reyansh Verma', class: 12, division: 'A' },
  { rollNumber: 4, name: 'Mahi Joshi', class: 12, division: 'A' },
  { rollNumber: 5, name: 'Lakshya Arora', class: 12, division: 'A' }
];
