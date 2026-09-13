import { S001_CENTERED_ARCH_CLASS_ID } from './class-config.mjs';

export const PUBLISHED_PROJECT_PROTOCOL_VERSION = 'stb-published-project-http/0.1';
export const PUBLISHED_PROJECT_PATH = '/api/published-job';
export const PUBLISHED_PROJECT_STORE_PIN = '4402abeb6b0299a5b6db2eec85ed04c3b0236bcc';
export const PUBLISHED_PROJECT_CLIENT_ID = 'stb-published-project-client-0.1';

export const PUBLISHED_PROJECTS = Object.freeze({
  [S001_CENTERED_ARCH_CLASS_ID]: Object.freeze({
    classId: S001_CENTERED_ARCH_CLASS_ID,
    jobId: 'arched-opening',
    requestType: 'SHEET_MODE2_ARCHED_APERTURE_V0',
    scope: 'SHEET_MODE2_ARCHED_APERTURE_V0',
    machineFamily: 'S001',
    expectedStorePin: PUBLISHED_PROJECT_STORE_PIN,
    requiresMaterialOnlyUnresolvedReview: true,
  }),
});

export function publishedProjectForClass(classId) {
  return PUBLISHED_PROJECTS[classId] ?? null;
}

export function storeScopeForClass(classId, fallback = null) {
  return publishedProjectForClass(classId)?.scope ?? fallback;
}
