export type CourseInformationLoaderOptions<T> = {
  courseNames: readonly string[];
  findByName: (name: string) => Promise<T[]>;
};

const isNoLectureFound = (error: unknown) => String(error).includes('No lecture found');

export const loadCourseInformation = async <T>({
  courseNames,
  findByName,
}: CourseInformationLoaderOptions<T>): Promise<T[]> => {
  const results: T[] = [];
  let firstMissingCourseError: unknown;

  for (const name of new Set(courseNames.map((value) => value.trim()).filter(Boolean))) {
    try {
      results.push(...(await findByName(name)));
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
