import { ACTORS } from '/shared/contracts.mjs';

const SESSION_KEY = 'stb-view-session-v1';

function emptyState() {
  return { actorId: null, currentLocalRecordId: null };
}

function parseActorId(value) {
  return value && ACTORS[value] ? value : null;
}

function parseProjectId(value) {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function readViewSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      return emptyState();
    }
    const parsed = JSON.parse(raw);
    return {
      actorId: parseActorId(parsed.actorId),
      currentLocalRecordId: parseProjectId(parsed.currentLocalRecordId),
    };
  } catch {
    return emptyState();
  }
}

export function writeViewSession(patch) {
  const current = readViewSession();
  const state = {
    actorId: patch.actorId !== undefined ? parseActorId(patch.actorId) : current.actorId,
    currentLocalRecordId:
      patch.currentLocalRecordId !== undefined
        ? parseProjectId(patch.currentLocalRecordId)
        : current.currentLocalRecordId,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  return state;
}

export function setSessionActor(actorId) {
  return writeViewSession({ actorId });
}

export function clearSessionActor() {
  return writeViewSession({ actorId: null });
}

export function setCurrentProject(localRecordId) {
  return writeViewSession({ currentLocalRecordId: localRecordId });
}

export function currentActor() {
  const id = readViewSession().actorId;
  return id ? ACTORS[id] : null;
}

export function currentProjectId() {
  return readViewSession().currentLocalRecordId;
}
