import type {
  ChapelApplicationInterface,
  CourseGradesApplicationInterface,
} from '@rusaint/react-native';

export type RusaintClientKind = 'chapel' | 'grades';

export type RusaintClientMap = {
  chapel: ChapelApplicationInterface;
  grades: CourseGradesApplicationInterface;
};

type PipelineRuntime = {
  getClient: <K extends RusaintClientKind>(kind: K) => Promise<RusaintClientMap[K]>;
  studentId: string;
};

type PipelineObservation<TTarget> = {
  appliedFingerprint: null | string;
  remoteFingerprint: string;
  target: TTarget;
};

export type RusaintPipeline<TTarget = unknown> = {
  detect: (runtime: PipelineRuntime) => Promise<PipelineObservation<TTarget>>;
  id: string;
  settingKey: string;
};

export type RusaintPipelineDefinition<K extends RusaintClientKind, TValue, TTarget> = {
  client: K;
  fingerprint: (value: TValue) => string;
  id: string;
  observe: (context: { client: RusaintClientMap[K]; studentId: string }) => Promise<TValue>;
  readApplied: (context: { studentId: string }) => Promise<null | TValue>;
  settingKey: string;
  target: (value: TValue) => TTarget;
};

export const defineRusaintPipeline = <K extends RusaintClientKind, TValue, TTarget>({
  client,
  fingerprint,
  id,
  observe,
  readApplied,
  settingKey,
  target,
}: RusaintPipelineDefinition<K, TValue, TTarget>): RusaintPipeline<TTarget> => ({
  id,
  settingKey,
  detect: async (runtime) => {
    const remote = await observe({
      client: await runtime.getClient(client),
      studentId: runtime.studentId,
    });
    const applied = await readApplied({ studentId: runtime.studentId });

    return {
      appliedFingerprint: applied === null ? null : fingerprint(applied),
      remoteFingerprint: fingerprint(remote),
      target: target(remote),
    };
  },
});

export type DetectionChange<TTarget = unknown> = {
  fingerprint: string;
  pipelineId: string;
  shouldNotify: boolean;
  target: TTarget;
};

export type DetectionError = {
  error: Error;
  pipelineId: string;
};

export type RusaintPipelineRunDependencies = PipelineRuntime & {
  isEnabled: (settingKey: string) => Promise<boolean>;
  readState: () => Promise<Record<string, string>>;
  writeState: (state: Record<string, string>) => Promise<void>;
};

type PipelineTarget<TPipeline> = TPipeline extends RusaintPipeline<infer TTarget> ? TTarget : never;

export type DetectionRun<TTarget = unknown> = {
  acknowledge: (changes: readonly DetectionChange<TTarget>[]) => Promise<void>;
  changes: readonly DetectionChange<TTarget>[];
  errors: readonly DetectionError[];
};

const toError = (error: unknown) => (error instanceof Error ? error : new Error(String(error)));

export const runRusaintPipelines = async <const TPipelines extends readonly RusaintPipeline[]>(
  pipelines: TPipelines,
  dependencies: RusaintPipelineRunDependencies,
): Promise<DetectionRun<PipelineTarget<TPipelines[number]>>> => {
  const ids = new Set<string>();
  for (const pipeline of pipelines) {
    if (!pipeline.id || ids.has(pipeline.id)) {
      throw new Error(`Invalid or duplicate Rusaint pipeline id: ${pipeline.id}`);
    }
    ids.add(pipeline.id);
  }

  const state = await dependencies.readState();
  const nextState = { ...state };
  const changes: DetectionChange<PipelineTarget<TPipelines[number]>>[] = [];
  const errors: DetectionError[] = [];

  for (const pipeline of pipelines) {
    try {
      if (!(await dependencies.isEnabled(pipeline.settingKey))) {
        continue;
      }

      const observation = await pipeline.detect(dependencies);
      const previousFingerprint = state[pipeline.id];

      if (
        observation.remoteFingerprint === observation.appliedFingerprint ||
        (observation.appliedFingerprint === null && previousFingerprint === undefined)
      ) {
        nextState[pipeline.id] = observation.remoteFingerprint;
        continue;
      }

      changes.push({
        fingerprint: observation.remoteFingerprint,
        pipelineId: pipeline.id,
        shouldNotify: observation.remoteFingerprint !== previousFingerprint,
        target: observation.target as PipelineTarget<TPipelines[number]>,
      });
    } catch (error) {
      errors.push({ error: toError(error), pipelineId: pipeline.id });
    }
  }

  if (Object.entries(nextState).some(([id, fingerprint]) => state[id] !== fingerprint)) {
    await dependencies.writeState(nextState);
  }

  const detected = new Map(changes.map((change) => [change.pipelineId, change.fingerprint]));

  return {
    changes,
    errors,
    acknowledge: async (accepted) => {
      const updates = accepted.filter(
        (change) => detected.get(change.pipelineId) === change.fingerprint,
      );
      if (updates.length === 0) {
        return;
      }

      const latestState = await dependencies.readState();
      for (const change of updates) {
        latestState[change.pipelineId] = change.fingerprint;
      }
      await dependencies.writeState(latestState);
    },
  };
};
