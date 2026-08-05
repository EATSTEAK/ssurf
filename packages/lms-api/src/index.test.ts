import { describe, expect, it } from 'vitest';

import {
  CanvasApiError,
  type CanvasCourse,
  LearningItemType,
  LmsApiClient,
  SubmissionStatus,
} from './index';

const jsonResponse = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

describe('LmsApiClient', () => {
  it('loads the signed-in Canvas profile with authenticated requests', async () => {
    const request: typeof fetch = async (input, init) => {
      expect(String(input)).toBe('https://canvas.ssu.ac.kr/api/v1/users/self/profile');
      expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer canvas-token');
      expect(new Headers(init?.headers).get('Accept')).toBe('application/json+canvas-string-ids');
      return jsonResponse({ id: 42, login_id: '20260001', name: 'Student' });
    };

    const profile = await new LmsApiClient({
      accessToken: 'canvas-token',
      request,
    }).getSelfProfile();

    expect(profile).toMatchObject({ id: '42', loginId: '20260001', name: 'Student' });
  });

  it('refuses to send Canvas access tokens over plaintext HTTP', () => {
    expect(
      () => new LmsApiClient({ accessToken: 'secret', baseUrl: 'http://canvas.example' }),
    ).toThrow('baseUrl must use HTTPS.');
  });

  it('follows trusted Canvas pagination and parses course scores', async () => {
    const requestedUrls: string[] = [];
    const request: typeof fetch = async (input) => {
      const url = String(input);
      requestedUrls.push(url);
      if (url.includes('page=2')) {
        return jsonResponse([{ id: 2, name: 'Algorithms' }]);
      }
      return jsonResponse(
        [
          {
            enrollments: [
              {
                grades: { current_grade: 'A0', current_score: '91.5' },
                type: 'StudentEnrollment',
              },
            ],
            id: 1,
            name: 'Mobile Programming',
          },
        ],
        {
          headers: {
            Link: '<https://canvas.ssu.ac.kr/api/v1/courses?page=2>; rel="next"',
          },
        },
      );
    };

    const courses = await new LmsApiClient({ accessToken: 'token', request }).getActiveCourses();

    expect(requestedUrls).toHaveLength(2);
    expect(courses.map(({ name }) => name)).toEqual(['Algorithms', 'Mobile Programming']);
    expect(courses[1]).toMatchObject({ currentGrade: 'A0', currentScore: 91.5, id: '1' });
  });

  it('rejects cyclic and cross-origin pagination links', async () => {
    let cyclicRequests = 0;
    const cyclicRequest: typeof fetch = async () => {
      cyclicRequests += 1;
      return jsonResponse([], {
        headers: {
          Link: '<https://canvas.ssu.ac.kr/api/v1/courses?page=2>; rel="next"',
        },
      });
    };
    const cyclicClient = new LmsApiClient({ accessToken: 'token', request: cyclicRequest });

    await expect(cyclicClient.getActiveCourses()).rejects.toMatchObject({
      message: 'Canvas pagination returned a repeated URL.',
    });
    expect(cyclicRequests).toBe(2);

    let crossOriginRequests = 0;
    const crossOriginRequest: typeof fetch = async () => {
      crossOriginRequests += 1;
      return jsonResponse([], {
        headers: { Link: '<https://evil.example/courses?page=2>; rel="next"' },
      });
    };
    const crossOriginClient = new LmsApiClient({
      accessToken: 'token',
      request: crossOriginRequest,
    });

    await expect(crossOriginClient.getActiveCourses()).rejects.toMatchObject({
      message: 'Canvas pagination returned an untrusted URL.',
    });
    expect(crossOriginRequests).toBe(1);
  });

  it('keeps request timeouts active through response body reads', async () => {
    const stalledRequest: typeof fetch = async (_input, init) => {
      const signal = init?.signal;
      return new Response(
        new ReadableStream({
          start(controller) {
            signal?.addEventListener('abort', () => {
              controller.error(new DOMException('Aborted', 'AbortError'));
            });
          },
        }),
      );
    };
    const client = new LmsApiClient({
      accessToken: 'token',
      request: stalledRequest,
      timeoutMs: 10,
    });

    await expect(client.getSelf()).rejects.toMatchObject({
      message: 'Canvas API request timed out.',
    });
  });

  it('wraps response body failures and validates date ranges before requesting', async () => {
    let requested = false;
    const failedBodyRequest: typeof fetch = async () => {
      requested = true;
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.error(new TypeError('body failed'));
          },
        }),
      );
    };
    const client = new LmsApiClient({ accessToken: 'token', request: failedBodyRequest });

    const bodyError = await client.getSelf().catch((caught: unknown) => caught);
    expect(bodyError).toBeInstanceOf(CanvasApiError);
    expect(bodyError).toMatchObject({ message: 'body failed' });

    requested = false;
    await expect(client.getUpcomingLearningItems({ daysAhead: -1 })).rejects.toThrow(
      'daysAhead must be a non-negative integer.',
    );
    await expect(client.getPlannerItems({ startDate: new Date(Number.NaN) })).rejects.toThrow(
      'startDate must be a valid date.',
    );
    expect(requested).toBe(false);
  });

  it('returns sorted incomplete planner items and skips completed overrides', async () => {
    const request: typeof fetch = async (input) => {
      const url = new URL(String(input));
      expect(url.searchParams.get('filter')).toBe('incomplete_items');
      return jsonResponse([
        {
          context_name: 'Mobile Programming',
          course_id: 42,
          plannable: { due_at: '2026-05-02T09:00:00Z', title: 'Later report' },
          plannable_id: 2,
          plannable_type: 'assignment',
          submissions: false,
        },
        {
          context_name: 'Mobile Programming',
          course_id: 42,
          plannable: { due_at: '2026-05-01T09:00:00Z', title: 'Earlier quiz' },
          plannable_id: 1,
          plannable_type: 'quiz',
          submissions: false,
        },
        {
          context_name: 'Mobile Programming',
          course_id: 42,
          plannable: { title: 'Hidden report' },
          plannable_id: 3,
          plannable_type: 'assignment',
          planner_override: { marked_complete: true },
          submissions: false,
        },
      ]);
    };

    const items = await new LmsApiClient({
      accessToken: 'token',
      request,
    }).getUpcomingLearningItems({
      from: new Date('2026-04-30T00:00:00Z'),
    });

    expect(items.map(({ title }) => title)).toEqual(['Earlier quiz', 'Later report']);
    expect(items[0]?.type).toBe(LearningItemType.Quiz);
  });

  it('loads announcement and graded-submission models and exposes API errors', async () => {
    const course: CanvasCourse = { id: '42', isFavorite: false, name: 'Mobile Programming' };
    const request: typeof fetch = async (input) => {
      const url = new URL(String(input));
      if (url.pathname === '/api/v1/announcements') {
        return jsonResponse([
          {
            id: 7,
            message: '<p>Hello&nbsp;students</p>',
            posted_at: '2026-05-01T09:00:00Z',
            title: 'Exam notice',
          },
        ]);
      }
      if (url.pathname.endsWith('/students/submissions')) {
        return jsonResponse([
          {
            assignment: { id: 12, name: 'Project 1', points_possible: 20 },
            assignment_id: 12,
            grade: '18',
            id: 99,
            score: 18,
            workflow_state: 'graded',
          },
        ]);
      }
      return jsonResponse({ message: 'Invalid access token.' }, { status: 401 });
    };
    const client = new LmsApiClient({ accessToken: 'token', request });

    await expect(client.getAnnouncements({ courses: [course] })).resolves.toMatchObject([
      { courseName: 'Mobile Programming', messagePreview: 'Hello students' },
    ]);
    await expect(client.getGradedSubmissions({ courses: [course] })).resolves.toMatchObject([
      {
        assignmentName: 'Project 1',
        pointsPossible: 20,
        status: SubmissionStatus.Graded,
      },
    ]);
    const error = await client.getSelf().catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(CanvasApiError);
    expect(error).toMatchObject({ message: 'Invalid access token.', statusCode: 401 });
  });
});
