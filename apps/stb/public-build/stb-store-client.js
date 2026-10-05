(function(root){
  'use strict';

  // One browser Store client for every project page. It knows how to reach the live Store, which Store
  // version System is pinned to, how to admit the exact current public definition, and how to check that
  // an answer is fresh and meant for this request. Store capability remains Store-owned.
  const SCRIPT_URL = document.currentScript.src;
  const CONFIG_URL = new URL('stb-store-runtime.json', SCRIPT_URL).href;
  const ADMISSION_URL = new URL('stb-public-admission.mjs', SCRIPT_URL).href;
  const PROTOCOL_VERSION = 'stb-store-zero-http/1';
  const FRESHNESS_RULE = 'STB-STORE-FRESH-EVALUATION-0.1';
  const PIN_PATTERN = /^[0-9a-f]{40}$/;
  const JOB_PATH = '/api/store-zero/job';
  const OFFERING_PATH = '/api/store-zero/offering';
  const OFFERING_LOOKUP = 'OFFERING_LOOKUP';
  const MAX_OFFERING_RESULTS = 20;
  let admissionModulePromise = null;

  function admissionModule(){
    if(!admissionModulePromise) admissionModulePromise = import(ADMISSION_URL);
    return admissionModulePromise;
  }

  async function loadConfig(){
    const response = await fetch(CONFIG_URL, {cache:'no-store'});
    if(!response.ok) throw new Error('STORE_RUNTIME_CONFIGURATION_UNAVAILABLE');
    const config = await response.json();
    if(!config.jobEndpoint || !config.offeringEndpoint) throw new Error('STORE_RUNTIME_NOT_DEPLOYED');
    if(!PIN_PATTERN.test(String(config.storePin || ''))) throw new Error('STORE_RUNTIME_PIN_MISSING');
    // Both Store paths are named in the configuration, each checked under the same rules, on one Store host.
    const endpoint = checkedEndpoint(config.jobEndpoint, JOB_PATH);
    const offeringEndpoint = checkedEndpoint(config.offeringEndpoint, OFFERING_PATH);
    if(offeringEndpoint.origin !== endpoint.origin) throw new Error('STORE_RUNTIME_ENDPOINT_INVALID');
    return {endpoint:endpoint.href, offeringEndpoint:offeringEndpoint.href, storePin:config.storePin};
  }

  function checkedEndpoint(value, pathname){
    let endpoint;
    try { endpoint = new URL(value); } catch { throw new Error('STORE_RUNTIME_ENDPOINT_INVALID'); }
    const loopback = host => ['localhost','127.0.0.1','[::1]'].includes(host);
    const localTest = loopback(root.location.hostname) && loopback(endpoint.hostname);
    if(endpoint.username || endpoint.password || endpoint.search || endpoint.hash ||
       endpoint.pathname !== pathname ||
       (!localTest && (endpoint.protocol !== 'https:' || loopback(endpoint.hostname))) ||
       (localTest && !['http:','https:'].includes(endpoint.protocol))){
      throw new Error('STORE_RUNTIME_ENDPOINT_INVALID');
    }
    return endpoint;
  }

  function canonicalize(value){
    if(value === null) return null;
    const type = typeof value;
    if(type === 'string' || type === 'boolean') return value;
    if(type === 'number'){
      if(!Number.isFinite(value)) throw new TypeError('canonical JSON rejects non-finite numbers');
      return value;
    }
    if(type === 'undefined') throw new TypeError('canonical JSON rejects undefined');
    if(Array.isArray(value)) return value.map(canonicalize);
    if(type === 'object'){
      const output = {};
      Object.keys(value).sort().forEach(key => {
        if(key === '__proto__' || key === 'prototype' || key === 'constructor') throw new TypeError('canonical JSON rejects prototype keys');
        if(value[key] === undefined) throw new TypeError('canonical JSON rejects undefined');
        output[key] = canonicalize(value[key]);
      });
      return output;
    }
    throw new TypeError('canonical JSON rejects '+type);
  }
  function canonicalJson(value){ return JSON.stringify(canonicalize(value)); }
  async function sha256(value){
    const bytes = new TextEncoder().encode(canonicalJson(value));
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2,'0')).join('');
  }
  function clone(value){ return value == null ? value : JSON.parse(JSON.stringify(value)); }

  // Send one formal public-build job request through the old admission seam (admitPublicStoreRequest).
  // `payload` remains the existing request-type payload; admission evidence is local and is not added to the wire.
  // A caller-provided readiness flag has no authority because this function derives admission itself.
  async function sendJob({projectId, requestType, payload, signatureBody = null, candidateRevisionId, requestId, freshReceipt = true, timeoutMs = 25000}){
    if(!projectId || !requestType || !payload) throw new Error('STORE_CLIENT_REQUEST_INCOMPLETE');
    const config = await loadConfig();
    const body = clone(payload);
    const revision = String(candidateRevisionId || body.definition?.configurationVersion || body.line?.configurationVersion || '');
    const admission = await admissionModule();
    await admission.admitPublicStoreRequest({
      root,
      projectId,
      requestType,
      payload:body,
      candidateRevisionId:revision,
      storePin:config.storePin
    });
    return post({config, projectId, requestType, body, revision, signatureBody, requestId, freshReceipt, timeoutMs});
  }

  // The transport inside inquire() for a tile whose one admission decision is admit() in
  // tile-host-admission-contract.mjs. `admitted` is the request admit() produced; this function does not admit
  // anything and does not call admitPublicStoreRequest. It sends only that request's tile, request type and revision.
  async function sendAdmittedJob({admitted, payload, signatureBody = null, requestId, freshReceipt = true, timeoutMs = 25000}){
    if(admitted?.interface !== 'STB-DEFINITION-STORE-0.1' || !admitted.tileId || !admitted.requestType ||
       !admitted.definitionRevisionId || !payload){
      throw new Error('STORE_CLIENT_REQUEST_INCOMPLETE');
    }
    const config = await loadConfig();
    return post({config, projectId:admitted.tileId, requestType:admitted.requestType, body:clone(payload),
      revision:String(admitted.definitionRevisionId), signatureBody, requestId, freshReceipt, timeoutMs});
  }

  async function post({config, projectId, requestType, body, revision, signatureBody, requestId, freshReceipt, timeoutMs}){
    const wire = {
      protocolVersion:PROTOCOL_VERSION,
      requestId:String(requestId || crypto.randomUUID()),
      projectId,
      candidateRevisionId:revision,
      requestType,
      scope:requestType,
      demandSignature:await sha256(signatureBody || {
        definitionKind:body.definitionKind,
        ruleVersion:body.ruleVersion,
        requestType,
        scope:requestType,
        definition:body.definition
      }),
      querySignature:null,
      payloadDigest:await sha256(body),
      expectedStorePin:config.storePin,
      attemptId:crypto.randomUUID(),
      attemptNumber:1,
      sentAt:new Date().toISOString(),
      payload:body
    };
    const response = await fetch(config.endpoint,{
      method:'POST', mode:'cors', cache:'no-store',
      signal:AbortSignal.timeout(timeoutMs),
      headers:{'Content-Type':'application/json'},
      body:canonicalJson(wire)
    });
    const answer = await response.json().catch(() => null);
    if(!response.ok || !answer || answer.adapterError === true){
      const error = new Error(answer?.code || 'STORE_ZERO_UNAVAILABLE');
      error.storeBody = answer;
      throw error;
    }
    if(['protocolVersion','requestId','attemptId','projectId','candidateRevisionId',
        'requestType','scope','demandSignature','payloadDigest'].some(key => answer[key] !== wire[key])){
      throw new Error('STORE_CORRELATION_ERROR');
    }
    if(answer.storePin !== config.storePin) throw new Error('STORE_PIN_MISMATCH');
    if(freshReceipt){
      const receipt = answer.evaluationReceipt || answer.rawEvaluation?.evaluationReceipt || null;
      if(answer.rawEvaluation?.freshEvaluation !== true ||
         receipt?.requestId !== wire.requestId ||
         receipt?.freshnessRule !== FRESHNESS_RULE ||
         receipt?.authority?.storeRevision !== config.storePin){
        throw new Error('STORE_FRESHNESS_ERROR');
      }
    }
    return answer;
  }

  // Find Store Zero items by keyword or SKU: one OFFERING_LOOKUP to the offering endpoint, never the job endpoint.
  // This is catalog discovery, not a job evaluation. The Store does the matching against its catalog at the pin;
  // the browser holds no catalog and has no answer of its own when the Store cannot be reached.
  async function lookupOfferings({projectId, candidateRevisionId, searchText, timeoutMs = 10000}){
    const text = String(searchText ?? '').trim();
    if(!projectId || !candidateRevisionId || !text) throw new Error('STORE_CLIENT_REQUEST_INCOMPLETE');
    const config = await loadConfig();
    const payload = {searchText:text};
    const wire = {
      protocolVersion:PROTOCOL_VERSION,
      requestId:crypto.randomUUID(),
      projectId:String(projectId),
      candidateRevisionId:String(candidateRevisionId),
      requestType:OFFERING_LOOKUP,
      scope:OFFERING_LOOKUP,
      demandSignature:null,
      querySignature:await sha256(payload),
      payloadDigest:await sha256(payload),
      expectedStorePin:config.storePin,
      attemptId:crypto.randomUUID(),
      attemptNumber:1,
      sentAt:new Date().toISOString(),
      payload
    };
    const response = await fetch(config.offeringEndpoint,{
      method:'POST', mode:'cors', cache:'no-store',
      signal:AbortSignal.timeout(timeoutMs),
      headers:{'Content-Type':'application/json'},
      body:canonicalJson(wire)
    });
    const answer = await response.json().catch(() => null);
    if(!response.ok || !answer || answer.adapterError === true){
      const error = new Error(answer?.code || 'STORE_ZERO_UNAVAILABLE');
      error.storeBody = answer;
      throw error;
    }
    if(['protocolVersion','requestId','attemptId','attemptNumber','projectId','candidateRevisionId',
        'requestType','scope','demandSignature','querySignature','payloadDigest'].some(key => answer[key] !== wire[key])){
      throw new Error('STORE_CORRELATION_ERROR');
    }
    if(answer.storePin !== config.storePin) throw new Error('STORE_PIN_MISMATCH');
    const rows = answer.rawOfferings;
    if(!Array.isArray(rows) || rows.length > MAX_OFFERING_RESULTS || !Number.isInteger(answer.totalMatches) ||
       answer.totalMatches < rows.length || answer.truncated !== (answer.totalMatches > rows.length) ||
       rows.some(row => !row || typeof row.storeSku !== 'string' || row.offered !== true)){
      throw new Error('STORE_MALFORMED_RESPONSE');
    }
    return answer;
  }

  root.STBStoreClient = Object.freeze({
    version:'0.2',
    configurationUrl:CONFIG_URL,
    admissionUrl:ADMISSION_URL,
    protocolVersion:PROTOCOL_VERSION,
    freshnessRule:FRESHNESS_RULE,
    loadConfig,
    canonicalJson,
    sha256,
    sendJob,
    sendAdmittedJob,
    lookupOfferings
  });
})(window);
