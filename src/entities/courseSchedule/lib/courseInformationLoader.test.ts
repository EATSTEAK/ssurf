import { describe, expect, it } from 'vitest';

import { loadCourseInformation } from './courseInformationLoader';

const NO_LECTURE_FOUND = 'RusaintError.General: Error from application: No lecture found';

describe('loadCourseInformation', () => {
  it('loads each unique registered course code and skips missing courses', async () => {
    const searchedCodes: string[] = [];

    await expect(
      loadCourseInformation({
        courseCodes: ['2150010101', '2150010101', '없는과목', '2150010201'],
        findByCode: async (code) => {
          searchedCodes.push(code);
          if (code === '없는과목') {
            throw new Error(NO_LECTURE_FOUND);
          }
          return [{ code }];
        },
      }),
    ).resolves.toEqual([{ code: '2150010101' }, { code: '2150010201' }]);
    expect(searchedCodes).toEqual(['2150010101', '없는과목', '2150010201']);
  });

  it('throws when no registered course can be found', async () => {
    const error = new Error(NO_LECTURE_FOUND);

    await expect(
      loadCourseInformation({
        courseCodes: ['없는과목'],
        findByCode: async () => Promise.reject(error),
      }),
    ).rejects.toBe(error);
  });
});
