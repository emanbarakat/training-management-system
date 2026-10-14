import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password });
  }

  logout() {
    return this.client.post('/auth/logout');
  }

  refreshToken(refreshToken: string) {
    return this.client.post('/auth/refresh-token', { refreshToken });
  }

  // Programs
  getPrograms(page = 1, limit = 20, type?: string, status?: string) {
    return this.client.get('/programs', {
      params: { page, limit, type, status },
    });
  }

  getProgram(id: string) {
    return this.client.get(`/programs/${id}`);
  }

  createProgram(data: any) {
    return this.client.post('/programs', data);
  }

  updateProgram(id: string, data: any) {
    return this.client.put(`/programs/${id}`, data);
  }

  deleteProgram(id: string) {
    return this.client.delete(`/programs/${id}`);
  }

  activateProgram(id: string) {
    return this.client.post(`/programs/${id}/activate`);
  }

  // Tracks
  getTracks(page = 1, limit = 20, programId?: string, status?: string) {
    return this.client.get('/tracks', {
      params: { page, limit, program_id: programId, status },
    });
  }

  getTrack(id: string) {
    return this.client.get(`/tracks/${id}`);
  }

  createTrack(data: any) {
    return this.client.post('/tracks', data);
  }

  updateTrack(id: string, data: any) {
    return this.client.put(`/tracks/${id}`, data);
  }

  deleteTrack(id: string) {
    return this.client.delete(`/tracks/${id}`);
  }

  // Students
  getStudents(page = 1, limit = 20, trackId?: string, status?: string) {
    return this.client.get('/students', {
      params: { page, limit, track_id: trackId, status },
    });
  }

  getStudent(id: string) {
    return this.client.get(`/students/${id}`);
  }

  createStudent(data: any) {
    return this.client.post('/students', data);
  }

  enrollStudent(studentId: string, data: any) {
    return this.client.post(`/students/${studentId}/enroll`, data);
  }

  bulkImportStudents(students: any[]) {
    return this.client.post('/students/bulk-import', { students });
  }

  importStudents(file: File, programId: string, trackId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('programId', programId);
    formData.append('trackId', trackId);
    return this.client.post('/students/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  getStudentEnrollments(studentId: string) {
    return this.client.get(`/students/${studentId}/enrollments`);
  }

  // Attendance
  createAttendanceSession(data: any) {
    return this.client.post('/attendance/sessions', data);
  }

  getAttendanceSessions(page = 1, limit = 20, trackId?: string, date?: string) {
    return this.client.get('/attendance/sessions', {
      params: { page, limit, track_id: trackId, date },
    });
  }

  bulkRecordAttendance(data: any) {
    return this.client.post('/attendance/records/bulk', data);
  }

  getAttendanceRecords(sessionId: string, page = 1, limit = 50) {
    return this.client.get(`/attendance/sessions/${sessionId}/records`, {
      params: { page, limit },
    });
  }

  // Grades
  createGrade(data: any) {
    return this.client.post('/grades', data);
  }

  getStudentGrades(studentId: string) {
    return this.client.get(`/grades/student/${studentId}`);
  }

  getEnrollmentGrades(enrollmentId: string) {
    return this.client.get(`/grades/enrollment/${enrollmentId}`);
  }

  // Evaluations
  createEvaluation(data: any) {
    return this.client.post('/evaluations', data);
  }

  getStudentEvaluations(studentId: string) {
    return this.client.get(`/evaluations/student/${studentId}`);
  }

  // Reports
  getTrackDashboard(trackId: string) {
    return this.client.get(`/reports/track/${trackId}/dashboard`);
  }

  getAttendanceReport(trackId: string, startDate: string, endDate: string) {
    return this.client.get(`/reports/track/${trackId}/attendance`, {
      params: { startDate, endDate },
    });
  }

  getGradeReport(enrollmentId: string) {
    return this.client.get(`/reports/enrollment/${enrollmentId}/grades`);
  }

  getProgramMetrics(programId: string) {
    return this.client.get(`/reports/program/${programId}/metrics`);
  }
}

export const apiClient = new ApiClient();
