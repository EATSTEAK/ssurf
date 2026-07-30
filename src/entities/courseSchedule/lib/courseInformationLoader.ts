export type CourseInformationLoaderOptions<T> = {
  courseNames: readonly string[];
  findAll: () => Promise<T[]>;
  findByName: (name: string) => Promise<T[]>;
};

const isNoLectureFound = (error: unknown) => String(error).includes('No lecture found');

export const loadCourseInformation = async <T>({
  courseNames,
  findAll,
  findByName,
}: CourseInformationLoaderOptions<T>): Promise<T[]> => {
  try {
    return await findAll();
  } catch (error) {
    if (!isNoLectureFound(error)) {
      throw error;
    }

    const results: T[] = [];
    for (const name of new Set(courseNames.map((value) => value.trim()).filter(Boolean))) {
      try {
        results.push(...(await findByName(name)));
      } catch (fallbackError) {
        if (!isNoLectureFound(fallbackError)) {
          throw fallbackError;
        }
      }
    }

    if (results.length === 0) {
      throw error;
    }
    return results;
  }
};
