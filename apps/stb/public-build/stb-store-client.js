(function(root){
  'use strict';

  // One browser Store client for every project page. It knows how to reach the live Store, which Store
  // version System is pinned to, and how to check that an answer is fresh and meant for this request.
  // It knows nothing about any project. The Store address and the Store version both come from
  // stb-store-runtime.json, so a Store repin changes that one file here, never each project page.
  const CONFIG_URL = new URL('stb-store-runtime.json', document.currentScript.src).href;
  const PROTOCOL_VERSION = 'stb-store-zero-http/1';
  const FRESHNESS_RULE = 'STB-STORE-FRESH-EVALUATION-0.1';
  const PIN_PATTERN = /^[0-9a-f]{40}$/;

  async function loadConfig(){
    const response = await fetch(CONFIG_URL, {cache:'no-store'});
    if(!response.ok) throw new Error('STORE_RUNTIME_CONFIGURATION_UNAVAILABLE');
    const config = await response.json();
    if(!config.jobEndpoint) throw new Error('STORE_RUNTIME_NOT_DEPLOYED');
    if(!PIN_PATTERN.test(String(config.storePin || ''))) throw new Error('STORE_RUNTIME_PIN_MISSING');
    const endpoint = new URL(config.jobEndpoint);
    const loopback = host => ['localhost','127.0.0.1','[::1]'].includes(host);
    const localTest = loopback(root.location.hostname) && loopback(endpoint.hostname);
    if(endpoint.username || endpoint.password || endpoint.search || endpoint.hash ||
       endpoint.pathname !== '/api/store-zero/job' ||
       (!localTest && (endpoint.protocol !== 'https:' || loopback(endpoint.hostname))) ||
       (localTest && !['http:','https:'].includes(endpoint.protocol))){
      throw new Error('STORE_RUNTIME_ENDPOINT_INVALID');
    }
    return {endpoint:endpoint.href, storePin:config.storePin};
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

  // Send one formal job request. `payload` is the request type's payload, e.g. { definition, definitionKind, ruleVersion }.
  // `signatureBody` is what the request type signs; by default the definition form used by Alcove and cut packages.
  // The answer is returned only if it is correlated to this request, comes from the pinned Store,
  // and (unless freshReceipt is false) carries a fresh evaluation receipt for this request.
  async function sendJob({projectId, requestType, payload, signatureBody = null, candidateRevisionId, requestId, freshReceipt = true, timeoutMs = 25000}){
    if(!projectId || !requestType || !payload) throw new Error('STORE_CLIENT_REQUEST_INCOMPLETE');
    const config = await loadConfig();
    const body = clone(payload);
    const wire = {
      protocolVersion:PROTOCOL_VERSION,
      requestId:String(requestId || crypto.randomUUID()),
      projectId,
      candidateRevisionId:String(candidateRevisionId || body.definition?.configurationVersion || crypto.randomUUID()),
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

  root.STBStoreClient = Object.freeze({
    version:'0.1',
    configurationUrl:CONFIG_URL,
    protocolVersion:PROTOCOL_VERSION,
    freshnessRule:FRESHNESS_RULE,
    loadConfig,
    canonicalJson,
    sha256,
    sendJob
  });
})(window);
