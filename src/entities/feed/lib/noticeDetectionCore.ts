export type NoticeDetection = {
  currentIds: readonly string[];
  newIds: readonly string[];
  shouldNotify: boolean;
};

const normalizeIds = (ids: readonly unknown[]) =>
  Array.from(
    new Set(ids.filter((id): id is string => typeof id === 'string' && id.length > 0)),
  ).sort();

export const parseObservedNoticeIds = (value: string | undefined): null | readonly string[] => {
  if (value === undefined) {
    return null;
  }

  try {
    const ids: unknown = JSON.parse(value);
    return Array.isArray(ids) ? normalizeIds(ids) : null;
  } catch {
    return null;
  }
};

export const detectNewNoticeIds = ({
  localIds,
  observedIds,
  remoteIds,
}: {
  localIds: readonly unknown[];
  observedIds: null | readonly unknown[];
  remoteIds: readonly unknown[];
}): NoticeDetection => {
  const currentIds = normalizeIds(remoteIds);
  const local = normalizeIds(localIds);

  if (observedIds === null && local.length === 0) {
    return { currentIds, newIds: [], shouldNotify: false };
  }

  const localSet = new Set(local);
  const observedSet = new Set(normalizeIds(observedIds ?? []));
  const newIds = currentIds.filter((id) => !localSet.has(id));
  return {
    currentIds,
    newIds,
    shouldNotify: newIds.some((id) => !observedSet.has(id)),
  };
};
