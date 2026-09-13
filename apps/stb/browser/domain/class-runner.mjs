import { planBoardDerivation } from '/domain/derive.mjs';
import { planAlcoveDerivation } from '/domain/alcove-engine.mjs';
import { planPicnicDerivation } from '/domain/picnic-engine.mjs';
import { ALCOVE_CLASS_ID } from '/shared/alcove-rule.mjs';
import { PICNIC_CLASS_ID } from '/shared/picnic-rule.mjs';

export function planCandidateDerivation(input) {
  const classId = input.payload?.classReference?.classId ?? null;
  if (classId === ALCOVE_CLASS_ID) {
    return planAlcoveDerivation(input);
  }
  if (classId === PICNIC_CLASS_ID) {
    return planPicnicDerivation(input);
  }
  return planBoardDerivation({
    ...input,
    previousDefinition: input.previousDefinition ?? null,
  });
}
