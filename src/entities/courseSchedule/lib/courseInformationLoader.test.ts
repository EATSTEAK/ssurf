import { describe, expect, it } from 'vitest';

import { loadCourseInformation } from './courseInformationLoader';

const NO_LECTURE_FOUND = 'RusaintError.General: Error from application: No lecture found';

describe('loadCourseInformation', () => {
  it('loads each unique scheduled course name and skips missing courses', async () => {
    const searchedNames: string[] = [];

    await expect(
      loadCourseInformation({
        courseNames: ['자료구조', '자료구조', '없는과목', '운영체제'],
        findByName: async (name) => {
          searchedNames.push(name);
          if (name === '없는과목') {
            throw new Error(NO_LECTURE_FOUND);
          }
          return [{ name }];
        },
      }),
    ).resolves.toEqual([{ name: '자료구조' }, { name: '운영체제' }]);
    expect(searchedNames).toEqual(['자료구조', '없는과목', '운영체제']);
  });

  it('throws when no scheduled course can be found', async () => {
    const error = new Error(NO_LECTURE_FOUND);

    await expect(
      loadCourseInformation({
        courseNames: ['없는과목'],
        findByName: async () => Promise.reject(error),
      }),
    ).rejects.toBe(error);
  });
});
