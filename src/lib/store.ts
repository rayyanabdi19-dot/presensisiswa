export interface Student {
  id: string;
  name: string;
  class: string;
  nisn: string;
  parentPhone?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  time: string;
  status: "hadir" | "izin" | "sakit" | "alpha";
  keterangan?: string;
}

const STUDENTS_KEY = "attendance_students";
const RECORDS_KEY = "attendance_records";

export function getStudents(): Student[] {
  const data = localStorage.getItem(STUDENTS_KEY);
  return data ? JSON.parse(data) : defaultStudents;
}

export function saveStudents(students: Student[]) {
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
}

export function addStudent(student: Omit<Student, "id">): Student {
  const students = getStudents();
  const newStudent: Student = { ...student, id: crypto.randomUUID() };
  students.push(newStudent);
  saveStudents(students);
  return newStudent;
}

export function deleteStudent(id: string) {
  const students = getStudents().filter((s) => s.id !== id);
  saveStudents(students);
}

export function updateStudent(id: string, data: Partial<Omit<Student, "id">>) {
  const students = getStudents().map((s) => (s.id === id ? { ...s, ...data } : s));
  saveStudents(students);
}

export function getRecords(): AttendanceRecord[] {
  const data = localStorage.getItem(RECORDS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveRecords(records: AttendanceRecord[]) {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function addRecord(studentId: string, status: AttendanceRecord["status"] = "hadir", keterangan?: string): AttendanceRecord | null {
  const today = new Date().toISOString().split("T")[0];
  const records = getRecords();
  const existing = records.find((r) => r.studentId === studentId && r.date === today);
  if (existing) return null;

  const record: AttendanceRecord = {
    id: crypto.randomUUID(),
    studentId,
    date: today,
    time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    status,
    ...(keterangan ? { keterangan } : {}),
  };
  records.push(record);
  saveRecords(records);
  return record;
}

export function getTodayRecords(): AttendanceRecord[] {
  const today = new Date().toISOString().split("T")[0];
  return getRecords().filter((r) => r.date === today);
}

const defaultStudents: Student[] = [
  { id: "1", name: "Ahmad Fauzi", class: "XII IPA 1", nisn: "0012345601", parentPhone: "081234567801" },
  { id: "2", name: "Siti Nurhaliza", class: "XII IPA 1", nisn: "0012345602", parentPhone: "081234567802" },
  { id: "3", name: "Budi Santoso", class: "XII IPA 1", nisn: "0012345603", parentPhone: "081234567803" },
  { id: "4", name: "Dewi Lestari", class: "XII IPA 2", nisn: "0012345604", parentPhone: "081234567804" },
  { id: "5", name: "Eko Prasetyo", class: "XII IPA 2", nisn: "0012345605" },
  { id: "6", name: "Fitri Handayani", class: "XII IPS 1", nisn: "0012345606", parentPhone: "081234567806" },
  { id: "7", name: "Gilang Ramadhan", class: "XII IPS 1", nisn: "0012345607" },
  { id: "8", name: "Hana Safitri", class: "XII IPS 1", nisn: "0012345608", parentPhone: "081234567808" },
];
