export const propagateState = <S, T>(state: S, v: ((state: S) => T) | T): T =>
  typeof v === 'function' ? (v as (state: S) => T)(state) : v;
