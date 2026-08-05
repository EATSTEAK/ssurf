export const DEFAULT_LMS_BASE_URL = 'https://canvas.ssu.ac.kr';

export class CanvasApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'CanvasApiError';
  }
}

export const LearningItemType = {
  Assignment: 'assignment',
  CalendarEvent: 'calendarEvent',
  DiscussionTopic: 'discussionTopic',
  PlannerNote: 'plannerNote',
  Quiz: 'quiz',
  Unknown: 'unknown',
  WikiPage: 'wikiPage',
} as const;

export type LearningItemType = (typeof LearningItemType)[keyof typeof LearningItemType];

export const SubmissionStatus = {
  Graded: 'graded',
  Missing: 'missing',
  PendingReview: 'pendingReview',
  Submitted: 'submitted',
  Unknown: 'unknown',
  Unsubmitted: 'unsubmitted',
} as const;

export type SubmissionStatus = (typeof SubmissionStatus)[keyof typeof SubmissionStatus];

export interface AnnouncementItem {
  authorName?: string;
  courseId: string;
  courseName: string;
  htmlUrl?: string;
  id: string;
  messagePreview?: string;
  postedAt: Date;
  title: string;
}

export interface CanvasCourse {
  courseCode?: string;
  currentGrade?: string;
  currentScore?: number;
  finalGrade?: string;
  finalScore?: number;
  gradesHtmlUrl?: string;
  htmlUrl?: string;
  id: string;
  isFavorite: boolean;
  name: string;
}

export interface CanvasUser {
  avatarUrl?: string;
  email?: string;
  id: string;
  locale?: string;
  loginId?: string;
  name: string;
  primaryEmail?: string;
  shortName?: string;
  sisUserId?: string;
  sortableName?: string;
  timeZone?: string;
}

export interface GradedSubmissionItem {
  assignmentId: string;
  assignmentName: string;
  courseId: string;
  courseName: string;
  grade?: string;
  gradedAt?: Date;
  htmlUrl?: string;
  id: string;
  late: boolean;
  missing: boolean;
  pointsPossible?: number;
  score?: number;
  status: SubmissionStatus;
  submittedAt?: Date;
}

export interface LearningItem {
  courseId?: string;
  courseName?: string;
  details?: string;
  dueAt?: Date;
  htmlUrl?: string;
  id: string;
  isCompleted: boolean;
  title: string;
  type: LearningItemType;
}

export interface PlannerItem {
  contextName?: string;
  contextType?: string;
  courseId?: string;
  htmlUrl?: string;
  plannable: Record<string, unknown>;
  plannableId: string;
  plannableType: string;
  plannerOverride?: PlannerOverride;
  submissions?: unknown;
}

export interface PlannerOverride {
  dismissed?: boolean;
  id?: string;
  markedComplete?: boolean;
  workflowState?: string;
}

export interface LmsApiRequestOptions {
  accessToken: string;
  baseUrl?: string;
  request?: typeof fetch;
  timeoutMs?: number;
}

type AnnouncementsOptions = LmsApiRequestOptions & {
  courses?: CanvasCourse[];
  daysBack?: number;
};
type CourseHistoryOptions = LmsApiRequestOptions & {
  course: CanvasCourse;
  daysBack?: number;
};
type GradedSubmissionsOptions = LmsApiRequestOptions & {
  courses?: CanvasCourse[];
  daysBack?: number;
};
type PlannerItemsOptions = LmsApiRequestOptions & {
  endDate?: Date;
  filter?: string;
  startDate?: Date;
};
type QueryValue = boolean | number | readonly string[] | string | undefined;
type Query = Record<string, QueryValue>;
type UpcomingLearningItemsOptions = LmsApiRequestOptions & {
  daysAhead?: number;
  from?: Date;
};

const learningItemTypeLabels: Record<LearningItemType, string> = {
  [LearningItemType.Assignment]: '과제',
  [LearningItemType.CalendarEvent]: '일정',
  [LearningItemType.DiscussionTopic]: '토론',
  [LearningItemType.PlannerNote]: '메모',
  [LearningItemType.Quiz]: '퀴즈',
  [LearningItemType.Unknown]: '항목',
  [LearningItemType.WikiPage]: '페이지',
};

const upcomingLearningItemTypes = new Set<LearningItemType>([
  LearningItemType.Assignment,
  LearningItemType.DiscussionTopic,
  LearningItemType.Quiz,
  LearningItemType.WikiPage,
]);

export const getLearningItemTypeLabel = (type: LearningItemType) => learningItemTypeLabels[type];

type LmsApiRequestContext = {
  accessToken: string;
  baseOrigin: string;
  baseUrl: string;
  request: typeof fetch;
  timeoutMs: number;
};

const createLmsApiRequestContext = ({
  accessToken,
  baseUrl = DEFAULT_LMS_BASE_URL,
  request = fetch,
  timeoutMs = 30_000,
}: LmsApiRequestOptions): LmsApiRequestContext => {
  if (!accessToken.trim()) {
    throw new Error('A Canvas access token is required.');
  }
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error('timeoutMs must be greater than zero.');
  }

  let parsedBaseUrl: URL;
  try {
    parsedBaseUrl = new URL(baseUrl);
  } catch {
    throw new Error('baseUrl must be a valid absolute URL.');
  }
  if (parsedBaseUrl.protocol !== 'https:') {
    throw new Error('baseUrl must use HTTPS.');
  }

  return {
    accessToken,
    baseOrigin: parsedBaseUrl.origin,
    baseUrl: parsedBaseUrl.toString().replace(/\/$/, ''),
    request,
    timeoutMs,
  };
};

export const getActiveCourses = async (options: LmsApiRequestOptions) =>
  getActiveCoursesFrom(createLmsApiRequestContext(options));

export const getAnnouncements = async ({
  courses,
  daysBack = 30,
  ...options
}: AnnouncementsOptions): Promise<AnnouncementItem[]> => {
  const context = createLmsApiRequestContext(options);
  validateDays(daysBack, 'daysBack');
  const targetCourses = courses ?? (await getActiveCoursesFrom(context));
  const announcements: AnnouncementItem[] = [];

  for (const course of targetCourses) {
    announcements.push(...(await getAnnouncementsForCourseFrom(context, course, daysBack)));
  }

  return announcements.sort((left, right) => right.postedAt.getTime() - left.postedAt.getTime());
};

export const getAnnouncementsForCourse = async ({
  course,
  daysBack = 30,
  ...options
}: CourseHistoryOptions) =>
  getAnnouncementsForCourseFrom(createLmsApiRequestContext(options), course, daysBack);

export const getGradedSubmissions = async ({
  courses,
  daysBack = 120,
  ...options
}: GradedSubmissionsOptions): Promise<GradedSubmissionItem[]> => {
  const context = createLmsApiRequestContext(options);
  validateDays(daysBack, 'daysBack');
  const targetCourses = courses ?? (await getActiveCoursesFrom(context));
  const submissions: GradedSubmissionItem[] = [];

  for (const course of targetCourses) {
    submissions.push(...(await getGradedSubmissionsForCourseFrom(context, course, daysBack)));
  }

  return submissions.sort(compareGradedSubmissions);
};

export const getGradedSubmissionsForCourse = async ({
  course,
  daysBack = 120,
  ...options
}: CourseHistoryOptions) =>
  getGradedSubmissionsForCourseFrom(createLmsApiRequestContext(options), course, daysBack);

export const getPlannerItems = async ({
  endDate,
  filter,
  startDate,
  ...options
}: PlannerItemsOptions) => {
  const context = createLmsApiRequestContext(options);
  validateDate(endDate, 'endDate');
  validateDate(startDate, 'startDate');
  return getPlannerItemsFrom(context, { endDate, filter, startDate });
};

export const getSelf = async (options: LmsApiRequestOptions) =>
  canvasUserFrom(await getMap(createLmsApiRequestContext(options), '/api/v1/users/self'));

export const getSelfProfile = async (options: LmsApiRequestOptions) =>
  canvasUserFrom(await getMap(createLmsApiRequestContext(options), '/api/v1/users/self/profile'));

export const getUpcomingLearningItems = async ({
  daysAhead = 60,
  from = new Date(),
  ...options
}: UpcomingLearningItemsOptions): Promise<LearningItem[]> => {
  const context = createLmsApiRequestContext(options);
  validateDays(daysAhead, 'daysAhead');
  validateDate(from, 'from');
  const plannerItems = await getPlannerItemsFrom(context, {
    endDate: new Date(from.getTime() + daysAhead * 86_400_000),
    filter: 'incomplete_items',
    startDate: from,
  });
  const items: LearningItem[] = [];

  for (const plannerItem of plannerItems) {
    const item = learningItemFrom(plannerItem);
    if (item && !item.isCompleted) {
      items.push(item);
    }
  }

  return items.sort(compareLearningItems);
};

const getActiveCoursesFrom = async (context: LmsApiRequestContext): Promise<CanvasCourse[]> => {
  const rows = await getPaginatedList(context, '/api/v1/courses', {
    enrollment_state: 'active',
    enrollment_type: 'student',
    'include[]': ['total_scores', 'favorites'],
    per_page: 100,
  });
  const courses: CanvasCourse[] = [];

  for (const row of rows) {
    const json = objectFrom(row);
    if (!json) {
      continue;
    }
    const course = canvasCourseFrom(json);
    if (course.id) {
      courses.push(course);
    }
  }

  return courses.sort((left, right) => left.name.localeCompare(right.name));
};

const getAnnouncementsForCourseFrom = async (
  context: LmsApiRequestContext,
  course: CanvasCourse,
  daysBack: number,
): Promise<AnnouncementItem[]> => {
  validateDays(daysBack, 'daysBack');
  const end = new Date();
  const start = new Date(end.getTime() - daysBack * 86_400_000);
  const rows = await getPaginatedList(context, '/api/v1/announcements', {
    active_only: true,
    'context_codes[]': [`course_${course.id}`],
    end_date: end.toISOString(),
    per_page: 100,
    start_date: start.toISOString(),
  });
  const announcements: AnnouncementItem[] = [];

  for (const row of rows) {
    const json = objectFrom(row);
    if (!json) {
      continue;
    }
    const announcement = announcementFrom({
      ...json,
      course_id: course.id,
      course_name: course.name,
    });
    if (announcement.id) {
      announcements.push(announcement);
    }
  }

  return announcements.sort((left, right) => right.postedAt.getTime() - left.postedAt.getTime());
};

const getGradedSubmissionsForCourseFrom = async (
  context: LmsApiRequestContext,
  course: CanvasCourse,
  daysBack: number,
): Promise<GradedSubmissionItem[]> => {
  validateDays(daysBack, 'daysBack');
  const since = new Date(Date.now() - daysBack * 86_400_000);
  const rows = await getPaginatedList(
    context,
    `/api/v1/courses/${encodeURIComponent(course.id)}/students/submissions`,
    {
      graded_since: since.toISOString(),
      'include[]': ['assignment'],
      order: 'graded_at',
      order_direction: 'descending',
      per_page: 100,
      workflow_state: 'graded',
    },
  );
  const submissions: GradedSubmissionItem[] = [];

  for (const row of rows) {
    const json = objectFrom(row);
    if (!json) {
      continue;
    }
    const submission = gradedSubmissionFrom({
      ...json,
      course_id: course.id,
      course_name: course.name,
    });
    if (submission.assignmentId && isGradedSubmission(submission)) {
      submissions.push(submission);
    }
  }

  return submissions.sort(compareGradedSubmissions);
};

const getPlannerItemsFrom = async (
  context: LmsApiRequestContext,
  { endDate, filter, startDate }: { endDate?: Date; filter?: string; startDate?: Date },
): Promise<PlannerItem[]> => {
  validateDate(endDate, 'endDate');
  validateDate(startDate, 'startDate');
  const rows = await getPaginatedList(context, '/api/v1/planner/items', {
    end_date: endDate?.toISOString(),
    filter,
    start_date: startDate?.toISOString(),
  });
  const items: PlannerItem[] = [];

  for (const row of rows) {
    const json = objectFrom(row);
    if (json) {
      items.push(plannerItemFrom(json));
    }
  }
  return items;
};

const getJson = async (
  context: LmsApiRequestContext,
  path: string,
  query?: Query,
): Promise<{ data: unknown; response: Response }> => {
  const url = resolveUrl(context, path, query);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), context.timeoutMs);

  try {
    const response = await context.request(url.toString(), {
      headers: {
        Accept: 'application/json+canvas-string-ids',
        Authorization: `Bearer ${context.accessToken}`,
      },
      signal: controller.signal,
    });
    const data = await responseBodyFrom(response);
    if (!response.ok) {
      throw new CanvasApiError(
        errorMessageFrom(data) ?? `Canvas API returned ${response.status}.`,
        response.status,
        data,
      );
    }
    return { data, response };
  } catch (error) {
    if (error instanceof CanvasApiError) {
      throw error;
    }
    const message = controller.signal.aborted
      ? 'Canvas API request timed out.'
      : error instanceof Error
        ? error.message
        : 'Network request failed.';
    throw new CanvasApiError(message, undefined, error);
  } finally {
    clearTimeout(timeout);
  }
};

const getMap = async (
  context: LmsApiRequestContext,
  path: string,
): Promise<Record<string, unknown>> => {
  const { data } = await getJson(context, path);
  const json = objectFrom(data);
  if (!json) {
    throw new CanvasApiError('Unexpected Canvas API response.', undefined, data);
  }
  return json;
};

const getPaginatedList = async (
  context: LmsApiRequestContext,
  path: string,
  query?: Query,
): Promise<unknown[]> => {
  const seenUrls = new Set<string>();
  const values: unknown[] = [];
  let nextUrl: null | string = path;
  let nextQuery = query;

  while (nextUrl) {
    const pageUrl = resolveUrl(context, nextUrl, nextQuery).toString();
    if (seenUrls.has(pageUrl)) {
      throw new CanvasApiError('Canvas pagination returned a repeated URL.', undefined, pageUrl);
    }
    seenUrls.add(pageUrl);

    const { data, response } = await getJson(context, pageUrl);
    if (!Array.isArray(data)) {
      throw new CanvasApiError('Unexpected paginated Canvas API response.', undefined, data);
    }
    values.push(...data);
    nextUrl = nextLinkFrom(response.headers.get('link'));
    nextQuery = undefined;
  }

  return values;
};

const resolveUrl = (context: LmsApiRequestContext, path: string, query?: Query): URL => {
  let url: URL;
  try {
    url = new URL(path, `${context.baseUrl}/`);
  } catch (error) {
    throw new CanvasApiError('Canvas API returned an invalid pagination URL.', undefined, error);
  }
  if (url.origin !== context.baseOrigin) {
    throw new CanvasApiError('Canvas pagination returned an untrusted URL.', undefined, url.href);
  }

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        url.searchParams.append(key, item);
      }
    } else {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
};

const announcementFrom = (json: Record<string, unknown>): AnnouncementItem => {
  const contextCode = stringFrom(json.context_code);
  const contextCourseId = contextCode?.startsWith('course_')
    ? contextCode.slice('course_'.length)
    : undefined;

  return {
    authorName: stringFrom(json.user_name) ?? stringFrom(json.author_name),
    courseId: stringFrom(json.course_id) ?? contextCourseId ?? '',
    courseName: stringFrom(json.course_name) ?? 'Unknown course',
    htmlUrl: stringFrom(json.html_url),
    id: stringFrom(json.id) ?? '',
    messagePreview: stringFrom(json.message_preview) ?? plainTextFrom(json.message),
    postedAt: dateFrom(json.posted_at) ?? dateFrom(json.created_at) ?? new Date(0),
    title: stringFrom(json.title) ?? 'Untitled announcement',
  };
};

const canvasCourseFrom = (json: Record<string, unknown>): CanvasCourse => {
  const enrollments = Array.isArray(json.enrollments) ? json.enrollments : [];
  const enrollment =
    enrollments.map(objectFrom).find((row) => stringFrom(row?.type) === 'StudentEnrollment') ??
    enrollments.map(objectFrom).find(Boolean);
  const grades = objectFrom(enrollment?.grades) ?? objectFrom(json.grades);

  return {
    courseCode: stringFrom(json.course_code),
    currentGrade: stringFrom(grades?.current_grade ?? json.current_grade),
    currentScore: numberFrom(grades?.current_score ?? json.current_score),
    finalGrade: stringFrom(grades?.final_grade ?? json.final_grade),
    finalScore: numberFrom(grades?.final_score ?? json.final_score),
    gradesHtmlUrl: stringFrom(grades?.html_url),
    htmlUrl: stringFrom(json.html_url),
    id: stringFrom(json.id) ?? '',
    isFavorite: json.is_favorite === true || json.favorite === true,
    name: stringFrom(json.name) ?? stringFrom(json.course_code) ?? 'Untitled course',
  };
};

const canvasUserFrom = (json: Record<string, unknown>): CanvasUser => ({
  avatarUrl: stringFrom(json.avatar_url),
  email: stringFrom(json.email),
  id: stringFrom(json.id) ?? '',
  locale: stringFrom(json.locale),
  loginId: stringFrom(json.login_id),
  name: stringFrom(json.name) ?? '',
  primaryEmail: stringFrom(json.primary_email),
  shortName: stringFrom(json.short_name),
  sisUserId: stringFrom(json.sis_user_id),
  sortableName: stringFrom(json.sortable_name),
  timeZone: stringFrom(json.time_zone),
});

const compareGradedSubmissions = (left: GradedSubmissionItem, right: GradedSubmissionItem) => {
  const leftDate = left.gradedAt ?? left.submittedAt;
  const rightDate = right.gradedAt ?? right.submittedAt;
  if (!leftDate && !rightDate) {
    return left.assignmentName.localeCompare(right.assignmentName);
  }
  if (!leftDate) {
    return 1;
  }
  if (!rightDate) {
    return -1;
  }
  return rightDate.getTime() - leftDate.getTime();
};

const compareLearningItems = (left: LearningItem, right: LearningItem) => {
  if (!left.dueAt && !right.dueAt) {
    return left.title.localeCompare(right.title);
  }
  if (!left.dueAt) {
    return 1;
  }
  if (!right.dueAt) {
    return -1;
  }
  return left.dueAt.getTime() - right.dueAt.getTime();
};

const dateFrom = (value: unknown): Date | undefined => {
  if (typeof value !== 'string' || !value) {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const errorMessageFrom = (body: unknown): string | undefined => {
  const object = objectFrom(body);
  if (object) {
    return (
      stringFrom(object.message) ?? stringFrom(object.error) ?? stringFrom(object.error_description)
    );
  }
  if (Array.isArray(body)) {
    const first = objectFrom(body[0]);
    return first ? (stringFrom(first.message) ?? stringFrom(first.error)) : undefined;
  }
  return undefined;
};

const gradedSubmissionFrom = (json: Record<string, unknown>): GradedSubmissionItem => {
  const assignment = objectFrom(json.assignment);
  const assignmentId = stringFrom(json.assignment_id) ?? stringFrom(assignment?.id) ?? '';
  const courseId = stringFrom(json.course_id) ?? stringFrom(assignment?.course_id) ?? '';

  return {
    assignmentId,
    assignmentName:
      stringFrom(json.assignment_name) ??
      stringFrom(assignment?.name) ??
      stringFrom(assignment?.title) ??
      'Untitled assignment',
    courseId,
    courseName: stringFrom(json.course_name) ?? 'Unknown course',
    grade: stringFrom(json.grade),
    gradedAt: dateFrom(json.graded_at) ?? dateFrom(json.updated_at),
    htmlUrl:
      stringFrom(json.html_url) ?? stringFrom(assignment?.html_url) ?? stringFrom(json.preview_url),
    id: stringFrom(json.id) ?? `${courseId}:${assignmentId}`,
    late: json.late === true,
    missing: json.missing === true,
    pointsPossible: numberFrom(json.points_possible ?? assignment?.points_possible),
    score: numberFrom(json.score),
    status: submissionStatusFrom(stringFrom(json.workflow_state), json.missing === true),
    submittedAt: dateFrom(json.submitted_at),
  };
};

const isGradedSubmission = (submission: GradedSubmissionItem) =>
  submission.status === SubmissionStatus.Graded ||
  submission.grade !== undefined ||
  submission.score !== undefined;

const learningItemFrom = (item: PlannerItem): LearningItem | undefined => {
  if (item.plannerOverride?.markedComplete || item.plannerOverride?.dismissed) {
    return undefined;
  }

  const type = learningItemTypeFrom(item.plannableType);
  if (!upcomingLearningItemTypes.has(type)) {
    return undefined;
  }

  return {
    courseId: item.courseId,
    courseName: item.contextName,
    details: stringFieldFrom(item.plannable, ['description', 'details']),
    dueAt: dateFieldFrom(item.plannable, ['due_at', 'todo_date']),
    htmlUrl: item.htmlUrl ?? stringFieldFrom(item.plannable, ['html_url']),
    id: `${item.plannableType}:${item.plannableId}`,
    isCompleted: submissionCompleted(item.submissions),
    title: stringFieldFrom(item.plannable, ['title', 'name']) ?? 'Untitled',
    type,
  };
};

const learningItemTypeFrom = (type: string): LearningItemType => {
  switch (type.toLowerCase()) {
    case 'assignment':
      return LearningItemType.Assignment;
    case 'calendar_event':
      return LearningItemType.CalendarEvent;
    case 'discussion_topic':
      return LearningItemType.DiscussionTopic;
    case 'planner_note':
      return LearningItemType.PlannerNote;
    case 'quiz':
      return LearningItemType.Quiz;
    case 'wiki_page':
      return LearningItemType.WikiPage;
    default:
      return LearningItemType.Unknown;
  }
};

const nextLinkFrom = (header: null | string): null | string => {
  if (!header) {
    return null;
  }

  for (const part of header.split(',')) {
    const match = part.match(/^\s*<([^>]+)>\s*;(.*)$/);
    if (match?.[2]?.includes('rel="next"')) {
      return match[1] ?? null;
    }
  }
  return null;
};

const numberFrom = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const objectFrom = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const plainTextFrom = (value: unknown): string | undefined => {
  const raw = stringFrom(value);
  if (!raw) {
    return undefined;
  }

  const text = raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) {
    return undefined;
  }
  return text.length <= 160 ? text : `${text.slice(0, 160)}...`;
};

const plannerItemFrom = (json: Record<string, unknown>): PlannerItem => {
  const plannerOverride = objectFrom(json.planner_override);
  return {
    contextName: stringFrom(json.context_name),
    contextType: stringFrom(json.context_type),
    courseId: stringFrom(json.course_id),
    htmlUrl: stringFrom(json.html_url),
    plannable: objectFrom(json.plannable) ?? {},
    plannableId: stringFrom(json.plannable_id) ?? '',
    plannableType: stringFrom(json.plannable_type) ?? '',
    plannerOverride: plannerOverride
      ? {
          dismissed: plannerOverride.dismissed === true,
          id: stringFrom(plannerOverride.id),
          markedComplete: plannerOverride.marked_complete === true,
          workflowState: stringFrom(plannerOverride.workflow_state),
        }
      : undefined,
    submissions: json.submissions,
  };
};

const responseBodyFrom = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    if (!response.ok) {
      return text;
    }
    throw new CanvasApiError('Canvas API returned invalid JSON.', response.status, error);
  }
};

const stringFieldFrom = (json: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = stringFrom(json[key]);
    if (value) {
      return value;
    }
  }
  return undefined;
};

const dateFieldFrom = (json: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = dateFrom(json[key]);
    if (value) {
      return value;
    }
  }
  return undefined;
};

const stringFrom = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    return value.trim() || undefined;
  }
  return typeof value === 'number' || typeof value === 'bigint' ? String(value) : undefined;
};

const submissionCompleted = (value: unknown) => {
  const submission = objectFrom(value);
  if (!submission) {
    return false;
  }
  if (
    submission.excused === true ||
    submission.graded === true ||
    submission.needs_grading === true ||
    submission.submitted === true ||
    submission.with_feedback === true
  ) {
    return true;
  }
  const workflowState = stringFrom(submission.workflow_state);
  return (
    workflowState === 'graded' || workflowState === 'submitted' || submission.submitted_at != null
  );
};

const submissionStatusFrom = (workflowState: string | undefined, missing: boolean) => {
  if (missing) {
    return SubmissionStatus.Missing;
  }
  switch (workflowState) {
    case 'graded':
      return SubmissionStatus.Graded;
    case 'missing':
      return SubmissionStatus.Missing;
    case 'pending_review':
    case 'pendingReview':
      return SubmissionStatus.PendingReview;
    case 'submitted':
      return SubmissionStatus.Submitted;
    case 'unsubmitted':
      return SubmissionStatus.Unsubmitted;
    default:
      return SubmissionStatus.Unknown;
  }
};

const validateDate = (value: Date | undefined, name: string) => {
  if (value && Number.isNaN(value.getTime())) {
    throw new RangeError(`${name} must be a valid date.`);
  }
};

const validateDays = (value: number, name: string) => {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer.`);
  }
};
