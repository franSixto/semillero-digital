// Google Classroom API Types

export interface Course {
  id: string;
  name: string;
  description?: string;
  descriptionHeading?: string;
  room?: string;
  section?: string;
  ownerId: string;
  creationTime: string;
  updateTime: string;
  enrollmentCode?: string;
  courseState: 'COURSE_STATE_UNSPECIFIED' | 'ACTIVE' | 'ARCHIVED' | 'PROVISIONED' | 'DECLINED' | 'SUSPENDED';
  alternateLink: string;
  teacherGroupEmail?: string;
  courseGroupEmail?: string;
  teacherFolder?: DriveFolder;
  courseMaterialSets?: CourseMaterialSet[];
  guardiansEnabled?: boolean;
  calendarId?: string;
}

export interface Student {
  courseId: string;
  userId: string;
  profile: UserProfile;
  studentWorkFolder?: DriveFolder;
}

export interface Teacher {
  courseId: string;
  userId: string;
  profile: UserProfile;
}

export interface UserProfile {
  id: string;
  name: Name;
  emailAddress: string;
  photoUrl?: string;
  permissions?: GlobalPermission[];
  verifiedTeacher?: boolean;
}

export interface Name {
  givenName?: string;
  familyName?: string;
  fullName?: string;
}

export interface Assignment {
  courseId: string;
  id: string;
  title: string;
  description?: string;
  materials?: Material[];
  state: 'COURSE_WORK_STATE_UNSPECIFIED' | 'PUBLISHED' | 'DRAFT' | 'DELETED';
  alternateLink: string;
  creationTime: string;
  updateTime: string;
  dueDate?: Date;
  dueTime?: TimeOfDay;
  scheduledTime?: string;
  maxPoints?: number;
  workType: 'COURSE_WORK_TYPE_UNSPECIFIED' | 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION';
  associatedWithDeveloper?: boolean;
  assigneeMode: 'ASSIGNEE_MODE_UNSPECIFIED' | 'ALL_STUDENTS' | 'INDIVIDUAL_STUDENTS';
  individualStudentsOptions?: IndividualStudentsOptions;
  submissionModificationMode: 'SUBMISSION_MODIFICATION_MODE_UNSPECIFIED' | 'MODIFIABLE_UNTIL_TURNED_IN' | 'MODIFIABLE';
  creatorUserId: string;
  topicId?: string;
}

export interface Material {
  driveFile?: SharedDriveFile;
  youtubeVideo?: YouTubeVideo;
  link?: Link;
  form?: Form;
}

export interface DriveFolder {
  id: string;
  title: string;
  alternateLink: string;
}

export interface CourseMaterialSet {
  title?: string;
  materials?: CourseMaterial[];
}

export interface CourseMaterial {
  driveFile?: SharedDriveFile;
  youtubeVideo?: YouTubeVideo;
  link?: Link;
  form?: Form;
}

export interface SharedDriveFile {
  driveFile: DriveFile;
  shareMode: 'UNKNOWN_SHARE_MODE' | 'VIEW' | 'EDIT' | 'STUDENT_COPY';
}

export interface DriveFile {
  id: string;
  title: string;
  alternateLink: string;
  thumbnailUrl?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  alternateLink: string;
  thumbnailUrl: string;
}

export interface Link {
  url: string;
  title?: string;
  thumbnailUrl?: string;
}

export interface Form {
  formUrl: string;
  responseUrl: string;
  title: string;
  thumbnailUrl?: string;
}

export interface TimeOfDay {
  hours?: number;
  minutes?: number;
  seconds?: number;
  nanos?: number;
}

export interface IndividualStudentsOptions {
  studentIds: string[];
}

export interface GlobalPermission {
  permission: 'PERMISSION_UNSPECIFIED' | 'CREATE_COURSE';
}

// Submission Types
export interface StudentSubmission {
  courseId: string;
  courseWorkId: string;
  id: string;
  userId: string;
  creationTime: string;
  updateTime: string;
  state: 'SUBMISSION_STATE_UNSPECIFIED' | 'NEW' | 'CREATED' | 'TURNED_IN' | 'RETURNED' | 'RECLAIMED_BY_STUDENT';
  late?: boolean;
  draftGrade?: number;
  assignedGrade?: number;
  alternateLink: string;
  courseWorkType: 'COURSE_WORK_TYPE_UNSPECIFIED' | 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION';
  associatedWithDeveloper?: boolean;
  assignmentSubmission?: AssignmentSubmission;
  shortAnswerSubmission?: ShortAnswerSubmission;
  multipleChoiceSubmission?: MultipleChoiceSubmission;
  submissionHistory?: SubmissionHistory[];
}

export interface AssignmentSubmission {
  attachments?: Attachment[];
}

export interface ShortAnswerSubmission {
  answer?: string;
}

export interface MultipleChoiceSubmission {
  answer?: string;
}

export interface Attachment {
  driveFile?: DriveFile;
  youTubeVideo?: YouTubeVideo;
  link?: Link;
  form?: Form;
}

export interface SubmissionHistory {
  stateHistory?: StateHistory;
  gradeHistory?: GradeHistory;
}

export interface StateHistory {
  state: 'STATE_UNSPECIFIED' | 'CREATED' | 'TURNED_IN' | 'RETURNED';
  stateTimestamp: string;
  actorUserId: string;
}

export interface GradeHistory {
  pointsEarned?: number;
  maxPoints?: number;
  gradeTimestamp: string;
  actorUserId: string;
  gradeChangeType: 'UNKNOWN_GRADE_CHANGE_TYPE' | 'DRAFT_GRADE_POINTS_EARNED_CHANGE' | 'ASSIGNED_GRADE_POINTS_EARNED_CHANGE' | 'MAX_POINTS_CHANGE';
}
