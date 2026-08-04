export type CourseInformationLoaderOptions<T> = {
  courseCodes: readonly string[];
  findByCode: (code: string) => Promise<T[]>;
};

const isNoLectureFound = (error: unknown) => String(error).includes('No lecture found');

export const loadCourseInformation = async <T>({
  courseCodes,
  findByCode,
}: CourseInformationLoaderOptions<T>): Promise<T[]> => {
  const results: T[] = [];
  let firstMissingCourseError: unknown;

  for (const code of new Set(courseCodes.map((value) => value.trim()).filter(Boolean))) {
    try {
      results.push(...(await findByCode(code)));
    } catch (error) {
      if (!isNoLectureFound(error)) {
        throw error;
      }
      firstMissingCourseError ??= error;
    }
  }

  if (results.length === 0 && firstMissingCourseError) {
    throw firstMissingCourseError;
  }
  return results;
};
