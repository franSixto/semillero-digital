// Google Classroom API integration
import { Course, Student, Teacher, Assignment, StudentSubmission } from '@/types/classroom';

const CLASSROOM_API_BASE = 'https://classroom.googleapis.com/v1';

export class ClassroomAPI {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${CLASSROOM_API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Classroom API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Courses
  async getCourses(): Promise<{ courses: Course[] }> {
    return this.request('/courses');
  }

  async getCourse(courseId: string): Promise<Course> {
    return this.request(`/courses/${courseId}`);
  }

  async createCourse(course: Partial<Course>): Promise<Course> {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(course),
    });
  }

  async updateCourse(courseId: string, course: Partial<Course>): Promise<Course> {
    return this.request(`/courses/${courseId}`, {
      method: 'PATCH',
      body: JSON.stringify(course),
    });
  }

  async deleteCourse(courseId: string): Promise<void> {
    return this.request(`/courses/${courseId}`, {
      method: 'DELETE',
    });
  }

  // Students
  async getStudents(courseId: string): Promise<{ students: Student[] }> {
    return this.request(`/courses/${courseId}/students`);
  }

  async addStudent(courseId: string, studentEmail: string): Promise<Student> {
    return this.request(`/courses/${courseId}/students`, {
      method: 'POST',
      body: JSON.stringify({
        userId: studentEmail,
      }),
    });
  }

  async removeStudent(courseId: string, userId: string): Promise<void> {
    return this.request(`/courses/${courseId}/students/${userId}`, {
      method: 'DELETE',
    });
  }

  // Teachers
  async getTeachers(courseId: string): Promise<{ teachers: Teacher[] }> {
    return this.request(`/courses/${courseId}/teachers`);
  }

  async addTeacher(courseId: string, teacherEmail: string): Promise<Teacher> {
    return this.request(`/courses/${courseId}/teachers`, {
      method: 'POST',
      body: JSON.stringify({
        userId: teacherEmail,
      }),
    });
  }

  async removeTeacher(courseId: string, userId: string): Promise<void> {
    return this.request(`/courses/${courseId}/teachers/${userId}`, {
      method: 'DELETE',
    });
  }

  // Course Work (Assignments)
  async getAssignments(courseId: string): Promise<{ courseWork: Assignment[] }> {
    return this.request(`/courses/${courseId}/courseWork`);
  }

  async getAssignment(courseId: string, assignmentId: string): Promise<Assignment> {
    return this.request(`/courses/${courseId}/courseWork/${assignmentId}`);
  }

  async createAssignment(courseId: string, assignment: Partial<Assignment>): Promise<Assignment> {
    return this.request(`/courses/${courseId}/courseWork`, {
      method: 'POST',
      body: JSON.stringify(assignment),
    });
  }

  async updateAssignment(
    courseId: string,
    assignmentId: string,
    assignment: Partial<Assignment>
  ): Promise<Assignment> {
    return this.request(`/courses/${courseId}/courseWork/${assignmentId}`, {
      method: 'PATCH',
      body: JSON.stringify(assignment),
    });
  }

  async deleteAssignment(courseId: string, assignmentId: string): Promise<void> {
    return this.request(`/courses/${courseId}/courseWork/${assignmentId}`, {
      method: 'DELETE',
    });
  }

  // Student Submissions
  async getSubmissions(
    courseId: string,
    assignmentId: string
  ): Promise<{ studentSubmissions: StudentSubmission[] }> {
    return this.request(`/courses/${courseId}/courseWork/${assignmentId}/studentSubmissions`);
  }

  async getSubmission(
    courseId: string,
    assignmentId: string,
    submissionId: string
  ): Promise<StudentSubmission> {
    return this.request(
      `/courses/${courseId}/courseWork/${assignmentId}/studentSubmissions/${submissionId}`
    );
  }

  async gradeSubmission(
    courseId: string,
    assignmentId: string,
    submissionId: string,
    grade: number
  ): Promise<StudentSubmission> {
    return this.request(
      `/courses/${courseId}/courseWork/${assignmentId}/studentSubmissions/${submissionId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          assignedGrade: grade,
        }),
      }
    );
  }

  async returnSubmission(
    courseId: string,
    assignmentId: string,
    submissionId: string
  ): Promise<void> {
    return this.request(
      `/courses/${courseId}/courseWork/${assignmentId}/studentSubmissions/${submissionId}:return`,
      {
        method: 'POST',
      }
    );
  }
}

// Utility functions
export function createClassroomClient(accessToken: string): ClassroomAPI {
  return new ClassroomAPI(accessToken);
}

export function isValidCourseId(courseId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(courseId);
}

export function formatCourseName(course: Course): string {
  return `${course.name}${course.section ? ` - ${course.section}` : ''}`;
}

export function getCourseUrl(courseId: string): string {
  return `https://classroom.google.com/c/${courseId}`;
}

export function getAssignmentUrl(courseId: string, assignmentId: string): string {
  return `https://classroom.google.com/c/${courseId}/a/${assignmentId}`;
}
