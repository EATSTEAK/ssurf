import { describe, expect, it } from 'vitest';

import { loadCourseInformation } from './courseInformationLoader';

const NO_LECTURE_FOUND = 'RusaintError.General: Error from application: No lecture found';

describe('loadCourseInformation', () => {
  it('falls back to scheduled course names when the wildcard search is empty', async () => {
    const searchedNames: string[] = [];

    await expect(
      loadCourseInformation({
        courseNames: ['자료구조', '자료구조', '운영체제'],
        findAll: async () => {
          throw new Error(NO_LECTURE_FOUND);
        },
        findByName: async (name) => {
          searchedNames.push(name);
          return [{ name }];
        },
      }),
    ).resolves.toEqual([{ name: '자료구조' }, { name: '운영체제' }]);
    expect(searchedNames).toEqual(['자료구조', '운영체제']);
  });
});
