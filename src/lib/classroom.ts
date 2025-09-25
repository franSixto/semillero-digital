// Google Classroom API integration with OAuth2
import { Course, Assignment, Student, Teacher, StudentSubmission } from '@/types/classroom';

// OAuth2 Configuration
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const CLASSROOM_API_BASE = 'https://classroom.googleapis.com/v1';

// Required scopes for Google Classroom and user profile
const SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.profile.emails',
  'https://www.googleapis.com/auth/classroom.profile.photos',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'openid'
].join(' ');

// OAuth2 Token Response
interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

// API Response types
interface CoursesResponse {
  courses?: Course[];
  nextPageToken?: string;
}

interface AssignmentsResponse {
  courseWork?: Assignment[];
  nextPageToken?: string;
}

interface StudentsResponse {
  students?: Student[];
  nextPageToken?: string;
}

interface TeachersResponse {
  teachers?: Teacher[];
  nextPageToken?: string;
}

interface SubmissionsResponse {
  studentSubmissions?: StudentSubmission[];
  nextPageToken?: string;
}

/**
 * Generates the OAuth2 authorization URL
 */
export function getAuthorizationUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    redirect_uri: `http://localhost:5001/oauth/callback`,
    scope: SCOPES,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent'
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchanges authorization code for access token via API route
 */
export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const response = await fetch('/api/auth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Token exchange failed: ${response.status} - ${errorData}`);
  }

  return response.json();
}

/**
 * Makes authenticated requests to Google Classroom API
 */
async function makeClassroomRequest<T>(
  endpoint: string,
  accessToken: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${CLASSROOM_API_BASE}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Classroom API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Gets all courses for the authenticated user
 */
export async function getUserCourses(accessToken: string): Promise<Course[]> {
  const courses: Course[] = [];
  let nextPageToken: string | undefined;

  do {
    const params: Record<string, string> = {
      courseStates: 'ACTIVE',
      pageSize: '100'
    };

    if (nextPageToken) {
      params.pageToken = nextPageToken;
    }

    const response = await makeClassroomRequest<CoursesResponse>(
      '/courses',
      accessToken,
      params
    );

    if (response.courses) {
      courses.push(...response.courses);
    }

    nextPageToken = response.nextPageToken;
  } while (nextPageToken);

  return courses;
}

/**
 * Gets all assignments (coursework) for a specific course
 */
export async function getCourseAssignments(
  courseId: string,
  accessToken: string
): Promise<Assignment[]> {
  const assignments: Assignment[] = [];
  let nextPageToken: string | undefined;

  do {
    const params: Record<string, string> = {
      pageSize: '100'
    };

    if (nextPageToken) {
      params.pageToken = nextPageToken;
    }

    const response = await makeClassroomRequest<AssignmentsResponse>(
      `/courses/${courseId}/courseWork`,
      accessToken,
      params
    );

    if (response.courseWork) {
      assignments.push(...response.courseWork);
    }

    nextPageToken = response.nextPageToken;
  } while (nextPageToken);

  return assignments;
}

/**
 * Gets all students for a specific course
 */
export async function getCourseStudents(
  courseId: string,
  accessToken: string
): Promise<Student[]> {
  const students: Student[] = [];
  let nextPageToken: string | undefined;

  do {
    const params: Record<string, string> = {
      pageSize: '100'
    };

    if (nextPageToken) {
      params.pageToken = nextPageToken;
    }

    const response = await makeClassroomRequest<StudentsResponse>(
      `/courses/${courseId}/students`,
      accessToken,
      params
    );

    if (response.students) {
      students.push(...response.students);
    }

    nextPageToken = response.nextPageToken;
  } while (nextPageToken);

  return students;
}

/**
 * Gets all teachers for a specific course
 */
export async function getCourseTeachers(
  courseId: string,
  accessToken: string
): Promise<Teacher[]> {
  const teachers: Teacher[] = [];
  let nextPageToken: string | undefined;

  do {
    const params: Record<string, string> = {
      pageSize: '100'
    };

    if (nextPageToken) {
      params.pageToken = nextPageToken;
    }

    const response = await makeClassroomRequest<TeachersResponse>(
      `/courses/${courseId}/teachers`,
      accessToken,
      params
    );

    if (response.teachers) {
      teachers.push(...response.teachers);
    }

    nextPageToken = response.nextPageToken;
  } while (nextPageToken);

  return teachers;
}

/**
 * Gets all student submissions for a specific assignment
 */
export async function getAssignmentSubmissions(
  courseId: string,
  courseWorkId: string,
  accessToken: string
): Promise<StudentSubmission[]> {
  const submissions: StudentSubmission[] = [];
  let nextPageToken: string | undefined;

  do {
    const params: Record<string, string> = {
      pageSize: '100'
    };

    if (nextPageToken) {
      params.pageToken = nextPageToken;
    }

    const response = await makeClassroomRequest<SubmissionsResponse>(
      `/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions`,
      accessToken,
      params
    );

    if (response.studentSubmissions) {
      submissions.push(...response.studentSubmissions);
    }

    nextPageToken = response.nextPageToken;
  } while (nextPageToken);

  return submissions;
}

/**
 * Gets all submissions for a specific student across all assignments in a course
 */
export async function getStudentSubmissions(
  courseId: string,
  userId: string,
  accessToken: string
): Promise<StudentSubmission[]> {
  const assignments = await getCourseAssignments(courseId, accessToken);
  const allSubmissions: StudentSubmission[] = [];

  for (const assignment of assignments) {
    try {
      const submissions = await getAssignmentSubmissions(courseId, assignment.id, accessToken);
      const studentSubmissions = submissions.filter(sub => sub.userId === userId);
      allSubmissions.push(...studentSubmissions);
    } catch (error) {
      console.warn(`Failed to get submissions for assignment ${assignment.id}:`, error);
    }
  }

  return allSubmissions;
}

/**
 * Gets complete course data including assignments, students, and teachers
 */
export async function getCompleteCourseData(
  courseId: string,
  accessToken: string
): Promise<{
  assignments: Assignment[];
  students: Student[];
  teachers: Teacher[];
}> {
  const [assignments, students, teachers] = await Promise.all([
    getCourseAssignments(courseId, accessToken),
    getCourseStudents(courseId, accessToken),
    getCourseTeachers(courseId, accessToken)
  ]);

  return {
    assignments,
    students,
    teachers
  };
}

/**
 * Calculates progress statistics for a student in a course
 */
export async function getStudentProgress(
  courseId: string,
  userId: string,
  accessToken: string
) {
  try {
    const [assignments, submissions] = await Promise.all([
      getCourseAssignments(courseId, accessToken),
      getStudentSubmissions(courseId, userId, accessToken)
    ]);

    const totalAssignments = assignments.length;
    const submittedCount = submissions.filter(sub => 
      sub.state === 'TURNED_IN' || sub.state === 'RETURNED'
    ).length;
    const gradedCount = submissions.filter(sub => 
      sub.assignedGrade !== undefined && sub.assignedGrade !== null
    ).length;
    const lateCount = submissions.filter(sub => sub.late).length;

    // Calculate average grade
    const gradedSubmissions = submissions.filter(sub => 
      sub.assignedGrade !== undefined && sub.assignedGrade !== null
    );
    const averageGrade = gradedSubmissions.length > 0 
      ? gradedSubmissions.reduce((sum, sub) => sum + (sub.assignedGrade || 0), 0) / gradedSubmissions.length
      : 0;

    // Calculate completion percentage
    const completionPercentage = totalAssignments > 0 
      ? (submittedCount / totalAssignments) * 100 
      : 0;

    return {
      success: true,
      data: {
        totalAssignments,
        submittedCount,
        gradedCount,
        lateCount,
        averageGrade: Math.round(averageGrade * 100) / 100,
        completionPercentage: Math.round(completionPercentage * 100) / 100,
        submissions: submissions.map(sub => ({
          ...sub,
          assignmentTitle: assignments.find(a => a.id === sub.courseWorkId)?.title || 'Unknown Assignment'
        }))
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Gets progress overview for all students in a course (teacher view)
 */
export async function getCourseProgress(
  courseId: string,
  accessToken: string
) {
  try {
    const [assignments, students] = await Promise.all([
      getCourseAssignments(courseId, accessToken),
      getCourseStudents(courseId, accessToken)
    ]);

    const studentProgress = await Promise.all(
      students.map(async (student) => {
        const progress = await getStudentProgress(courseId, student.userId, accessToken);
        return {
          student: student.profile,
          progress: progress.success ? progress.data : null
        };
      })
    );

    return {
      success: true,
      data: {
        courseId,
        totalAssignments: assignments.length,
        totalStudents: students.length,
        studentProgress: studentProgress.filter(sp => sp.progress !== null)
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Gets dashboard statistics from classroom data
 */
export async function getDashboardStats(accessToken: string) {
  try {
    const courses = await getUserCourses(accessToken);
    
    let totalStudents = 0;
    let totalAssignments = 0;
    let totalTeachers = 0;
    
    // Get stats for each course
    const courseStats = await Promise.all(
      courses.map(async (course) => {
        const [assignments, students, teachers] = await Promise.all([
          getCourseAssignments(course.id, accessToken),
          getCourseStudents(course.id, accessToken),
          getCourseTeachers(course.id, accessToken)
        ]);
        
        totalStudents += students.length;
        totalAssignments += assignments.length;
        totalTeachers += teachers.length;
        
        return {
          courseId: course.id,
          courseName: course.name,
          studentsCount: students.length,
          assignmentsCount: assignments.length,
          teachersCount: teachers.length,
          recentAssignments: assignments.slice(0, 3) // Last 3 assignments
        };
      })
    );

    return {
      success: true,
      data: {
        totalCourses: courses.length,
        totalStudents,
        totalAssignments,
        totalTeachers,
        courses: courses.slice(0, 5), // Show first 5 courses
        courseStats,
        recentActivity: courseStats.flatMap(stat => 
          stat.recentAssignments.map(assignment => ({
            type: 'assignment_created',
            title: assignment.title,
            courseName: stat.courseName,
            courseId: stat.courseId,
            creationTime: assignment.creationTime
          }))
        ).slice(0, 10) // Last 10 activities
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Main function to authenticate and get all classroom data
 */
export async function authenticateAndGetClassroomData(accessToken: string) {
  try {
    // Get all courses
    const courses = await getUserCourses(accessToken);
    
    // Get complete data for each course
    const coursesWithData = await Promise.all(
      courses.map(async (course) => {
        const courseData = await getCompleteCourseData(course.id, accessToken);
        return {
          ...course,
          ...courseData
        };
      })
    );

    return {
      success: true,
      data: coursesWithData
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
