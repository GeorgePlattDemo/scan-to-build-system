// Publication gate: OPEN SYSTEM BUILD publishes a commit only when the pinned-Store
// integration job (playhouse-candidate in playhouse-candidate-integration.yml) passed
// for that exact commit, and that commit is still the head of main.
//
// decide() is pure so the denial cases are tested without the network.
// The CLI reads the GitHub API and exits non-zero on any denial.

export const INTEGRATION_WORKFLOW = 'playhouse-candidate-integration.yml';
export const INTEGRATION_JOB = 'playhouse-candidate';
// pull_request runs test a merge commit, not this SHA, so they are not proof for it.
export const PROOF_EVENTS = new Set(['push', 'workflow_dispatch']);

// runs: workflow runs of INTEGRATION_WORKFLOW for sha, each with jobs (latest attempt).
export function decide({ sha, ref, mainHeadSha, runs }) {
  const proofRuns = runs.filter((run) => run.head_sha === sha && PROOF_EVENTS.has(run.event));
  if (proofRuns.length === 0) {
    return deny(`no ${INTEGRATION_WORKFLOW} push run exists for ${sha}`);
  }
  const passed = proofRuns.filter((run) => {
    if (run.status !== 'completed') return false;
    const job = (run.jobs || []).find((j) => j.name === INTEGRATION_JOB);
    return job && job.conclusion === 'success' && (!job.head_sha || job.head_sha === sha);
  });
  if (passed.length === 0) {
    const blocked = proofRuns.find((run) => run.status !== 'completed')
      || proofRuns.find((run) => !(run.jobs || []).some((j) => j.name === INTEGRATION_JOB && j.conclusion === 'success'));
    return deny(`no successful ${INTEGRATION_JOB} job for ${sha}` + (blocked ? ` (run ${blocked.id})` : ''));
  }
  if (ref !== 'refs/heads/main') {
    return deny(`publication runs only from refs/heads/main, not ${ref}`);
  }
  if (mainHeadSha !== sha) {
    return deny(`${sha} is not the head of main (${mainHeadSha}); only main's head is published`);
  }
  const ids = proofRuns.map((run) => run.id).join(', ');
  return { ok: true, reason: `integration job ${INTEGRATION_JOB} passed for ${sha} (run ${ids})` };
}

function deny(reason) {
  return { ok: false, reason };
}

async function api(path) {
  const res = await fetch(`${process.env.GITHUB_API_URL || 'https://api.github.com'}${path}`, {
    headers: {
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
    },
  });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.json();
}

async function main() {
  const { GITHUB_REPOSITORY: repo, PUBLISH_SHA: sha, PUBLISH_REF: ref } = process.env;
  if (!repo || !sha || !ref || !process.env.GITHUB_TOKEN) {
    throw new Error('GITHUB_REPOSITORY, PUBLISH_SHA, PUBLISH_REF and GITHUB_TOKEN are required');
  }
  const { workflow_runs: listed } = await api(
    `/repos/${repo}/actions/workflows/${INTEGRATION_WORKFLOW}/runs?head_sha=${sha}&per_page=100`,
  );
  const runs = [];
  for (const run of listed) {
    const { jobs } = await api(`/repos/${repo}/actions/runs/${run.id}/jobs?filter=latest&per_page=100`);
    runs.push({ ...run, jobs });
    console.log(`run ${run.id} ${run.event} ${run.status}/${run.conclusion}: ` +
      jobs.map((j) => `${j.name}=${j.conclusion}`).join(' '));
  }
  const branch = await api(`/repos/${repo}/branches/main`);
  const verdict = decide({ sha, ref, mainHeadSha: branch.commit.sha, runs });
  if (!verdict.ok) {
    console.log(`::error title=Publication denied::${verdict.reason}`);
    process.exit(1);
  }
  console.log(`Publication allowed: ${verdict.reason}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.log(`::error title=Publication denied::${err.message}`);
    process.exit(1);
  });
}
