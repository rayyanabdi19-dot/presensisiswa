import { supabase } from "@/integrations/supabase/client";

// ============ Types ============
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

export interface ClassInfo {
  id: string;
  name: string;
  waliKelas: string;
}

export interface SchoolProfile {
  id?: string;
  name: string;
  npsn: string;
  address: string;
  phone: string;
  email: string;
  principal: string;
}

export interface Schedule {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  label: string;
}

// Use any-typed client to bypass generated types until they sync
const db = supabase as any;

// ============ Students ============
export async function getStudents(): Promise<Student[]> {
  const { data, error } = await db.from("students").select("*").order("name");
  if (error) { console.error("getStudents error:", error); return []; }
  return (data ?? []).map((d: any) => ({
    id: d.id, name: d.name, class: d.class, nisn: d.nisn, parentPhone: d.parent_phone ?? undefined,
  }));
}

export async function addStudent(student: Omit<Student, "id">): Promise<Student | null> {
  const { data, error } = await db
    .from("students")
    .insert({ name: student.name, class: student.class, nisn: student.nisn, parent_phone: student.parentPhone ?? null })
    .select()
    .single();
  if (error) { console.error("addStudent error:", error); return null; }
  return { id: data.id, name: data.name, class: data.class, nisn: data.nisn, parentPhone: data.parent_phone ?? undefined };
}

export async function updateStudent(id: string, updates: Partial<Omit<Student, "id">>): Promise<void> {
  const mapped: any = {};
  if (updates.name !== undefined) mapped.name = updates.name;
  if (updates.class !== undefined) mapped.class = updates.class;
  if (updates.nisn !== undefined) mapped.nisn = updates.nisn;
  if (updates.parentPhone !== undefined) mapped.parent_phone = updates.parentPhone;
  const { error } = await db.from("students").update(mapped).eq("id", id);
  if (error) console.error("updateStudent error:", error);
}

export async function deleteStudent(id: string): Promise<void> {
  const { error } = await db.from("students").delete().eq("id", id);
  if (error) console.error("deleteStudent error:", error);
}

// ============ Attendance Records ============
export async function getRecords(): Promise<AttendanceRecord[]> {
  const { data, error } = await db.from("attendance_records").select("*").order("date", { ascending: false });
  if (error) { console.error("getRecords error:", error); return []; }
  return (data ?? []).map((d: any) => ({
    id: d.id, studentId: d.student_id, date: d.date, time: d.time, status: d.status, keterangan: d.keterangan ?? undefined,
  }));
}

export async function getTodayRecords(): Promise<AttendanceRecord[]> {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await db.from("attendance_records").select("*").eq("date", today);
  if (error) { console.error("getTodayRecords error:", error); return []; }
  return (data ?? []).map((d: any) => ({
    id: d.id, studentId: d.student_id, date: d.date, time: d.time, status: d.status, keterangan: d.keterangan ?? undefined,
  }));
}

export async function addRecord(
  studentId: string,
  status: AttendanceRecord["status"] = "hadir",
  keterangan?: string
): Promise<AttendanceRecord | null> {
  const today = new Date().toISOString().split("T")[0];
  const time = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const { data, error } = await db
    .from("attendance_records")
    .insert({ student_id: studentId, date: today, time, status, keterangan: keterangan ?? null })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return null;
    console.error("addRecord error:", error);
    return null;
  }
  return { id: data.id, studentId: data.student_id, date: data.date, time: data.time, status: data.status, keterangan: data.keterangan ?? undefined };
}

// ============ Classes ============
export async function getClasses(): Promise<ClassInfo[]> {
  const { data, error } = await db.from("classes").select("*").order("name");
  if (error) { console.error("getClasses error:", error); return []; }
  return (data ?? []).map((d: any) => ({ id: d.id, name: d.name, waliKelas: d.wali_kelas ?? "" }));
}

export async function addClass(cls: Omit<ClassInfo, "id">): Promise<ClassInfo | null> {
  const { data, error } = await db.from("classes").insert({ name: cls.name, wali_kelas: cls.waliKelas }).select().single();
  if (error) { console.error("addClass error:", error); return null; }
  return { id: data.id, name: data.name, waliKelas: data.wali_kelas ?? "" };
}

export async function deleteClass(id: string): Promise<void> {
  const { error } = await db.from("classes").delete().eq("id", id);
  if (error) console.error("deleteClass error:", error);
}

// ============ School Profile ============
export async function getSchoolProfile(): Promise<SchoolProfile> {
  const defaults: SchoolProfile = {
    name: "SMA Negeri 1 Contoh", npsn: "20100001",
    address: "Jl. Pendidikan No. 1, Jakarta", phone: "021-1234567",
    email: "info@sman1contoh.sch.id", principal: "Dr. Ahmad Suryadi, M.Pd.",
  };
  const { data, error } = await db.from("school_profile").select("*").limit(1).maybeSingle();
  if (error || !data) return defaults;
  return { id: data.id, name: data.name, npsn: data.npsn, address: data.address, phone: data.phone, email: data.email, principal: data.principal };
}

export async function saveSchoolProfile(profile: SchoolProfile): Promise<void> {
  if (profile.id) {
    const { error } = await db.from("school_profile").update({
      name: profile.name, npsn: profile.npsn, address: profile.address,
      phone: profile.phone, email: profile.email, principal: profile.principal,
      updated_at: new Date().toISOString(),
    }).eq("id", profile.id);
    if (error) console.error("saveSchoolProfile error:", error);
  } else {
    const { error } = await db.from("school_profile").insert({
      name: profile.name, npsn: profile.npsn, address: profile.address,
      phone: profile.phone, email: profile.email, principal: profile.principal,
    });
    if (error) console.error("saveSchoolProfile error:", error);
  }
}

// ============ Schedules ============
export async function getSchedules(): Promise<Schedule[]> {
  const { data, error } = await db.from("schedules").select("*").order("day").order("start_time");
  if (error) { console.error("getSchedules error:", error); return []; }
  return (data ?? []).map((d: any) => ({ id: d.id, day: d.day, startTime: d.start_time, endTime: d.end_time, label: d.label }));
}

export async function addSchedule(s: Omit<Schedule, "id">): Promise<Schedule | null> {
  const { data, error } = await db.from("schedules").insert({ day: s.day, start_time: s.startTime, end_time: s.endTime, label: s.label }).select().single();
  if (error) { console.error("addSchedule error:", error); return null; }
  return { id: data.id, day: data.day, startTime: data.start_time, endTime: data.end_time, label: data.label };
}

export async function deleteSchedule(id: string): Promise<void> {
  const { error } = await db.from("schedules").delete().eq("id", id);
  if (error) console.error("deleteSchedule error:", error);
}
