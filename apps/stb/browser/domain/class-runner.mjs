import { planBoardDerivation } from '/domain/derive.mjs';
import { planAlcoveDerivation } from '/domain/alcove-engine.mjs';
import { ALCOVE_CLASS_ID } from '/shared/alcove-rule.mjs';

export function planCandidateDerivation(input) {
  const classId = input.payload?.classReference?.classId ?? null;
  if (classId === ALCOVE_CLASS_ID) {
    return planAlcoveDerivation(input);
  }
  return planBoardDerivation({
    ...input,
    previousDefinition: input.previousDefinition ?? null,
  });
}
