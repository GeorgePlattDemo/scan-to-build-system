(function(root){
  'use strict';

  // Deployment configuration, never a browser-side Store implementation.
  const CONFIG_URL = new URL('stb-store-runtime.json', document.currentScript.src).href;
  async function resolveEndpoint(){
    const response = await fetch(CONFIG_URL, {cache:'no-store'});
    if(!response.ok) throw new Error('STORE_RUNTIME_CONFIGURATION_UNAVAILABLE');
    const config = await response.json();
    if(!config.jobEndpoint) throw new Error('STORE_RUNTIME_NOT_DEPLOYED');
    const endpoint = new URL(config.jobEndpoint);
    const loopback = host => ['localhost','127.0.0.1','[::1]'].includes(host);
    const localTest = loopback(root.location.hostname) && loopback(endpoint.hostname);
    if(endpoint.username || endpoint.password || endpoint.search || endpoint.hash ||
       endpoint.pathname !== '/api/store-zero/job' ||
       (!localTest && (endpoint.protocol !== 'https:' || loopback(endpoint.hostname))) ||
       (localTest && !['http:','https:'].includes(endpoint.protocol))){
      throw new Error('STORE_RUNTIME_ENDPOINT_INVALID');
    }
    return endpoint.href;
  }
  const PROTOCOL_VERSION = 'stb-store-zero-http/1';
  const EXPECTED_STORE_PIN = '39a1b318063f62220c9c20c42200389098e0c687';
  const REQUEST_TYPE = 'ALCOVE_INSERT_V1';
  const SCOPE = 'ALCOVE_INSERT_V1';
  const DEFINITION_KIND = 'alcove_insert.v1';
  const RULE_VERSION = '0.1';

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
        if(key === '__proto__' || key === 'prototype' || key === 'constructor') {
          throw new TypeError('canonical JSON rejects prototype keys');
        }
        if(value[key] === undefined) throw new TypeError('canonical JSON rejects undefined');
        output[key] = canonicalize(value[key]);
      });
      return output;
    }
    throw new TypeError('canonical JSON rejects '+type);
  }

  function canonicalJson(value){
    return JSON.stringify(canonicalize(value));
  }

  async function sha256(value){
    const bytes = new TextEncoder().encode(canonicalJson(value));
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2,'0')).join('');
  }

  function clone(value){
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  async function request(definition){
    if(!definition || typeof definition !== 'object') throw new Error('ALCOVE_DEFINITION_REQUIRED');

    const payload = {
      definition: clone(definition),
      definitionKind: DEFINITION_KIND,
      ruleVersion: RULE_VERSION
    };
    const signaturePayload = {
      definitionKind: DEFINITION_KIND,
      ruleVersion: RULE_VERSION,
      requestType: REQUEST_TYPE,
      scope: SCOPE,
      definition: payload.definition
    };
    const requestId = crypto.randomUUID();
    const attemptId = crypto.randomUUID();
    const candidateRevisionId = String(definition.configurationVersion || crypto.randomUUID());
    const wire = {
      protocolVersion: PROTOCOL_VERSION,
      requestId,
      projectId: 'alcove',
      candidateRevisionId,
      requestType: REQUEST_TYPE,
      scope: SCOPE,
      demandSignature: await sha256(signaturePayload),
      querySignature: null,
      payloadDigest: await sha256(payload),
      expectedStorePin: EXPECTED_STORE_PIN,
      attemptId,
      attemptNumber: 1,
      sentAt: new Date().toISOString(),
      payload
    };

    const endpoint = await resolveEndpoint();
    const response = await fetch(endpoint, {
      method: 'POST',
      mode: 'cors',
      signal: AbortSignal.timeout(20000),
      cache: 'no-store',
      headers: {'Content-Type':'application/json'},
      body: canonicalJson(wire)
    });
    const body = await response.json().catch(() => null);
    if(!response.ok || !body || body.adapterError === true){
      const error = new Error(body?.code || 'STORE_ZERO_UNAVAILABLE');
      error.storeBody = body;
      throw error;
    }
    if(['protocolVersion','requestId','attemptId','projectId','candidateRevisionId',
        'requestType','scope','demandSignature','payloadDigest'].some(key => body[key] !== wire[key])){
      throw new Error('STORE_CORRELATION_ERROR');
    }
    if(body.storePin !== EXPECTED_STORE_PIN){
      throw new Error('STORE_PIN_MISMATCH');
    }
    return body;
  }

  root.STBAlcoveStoreBridge = Object.freeze({
    version: '0.2',
    configurationUrl: CONFIG_URL,
    expectedStorePin: EXPECTED_STORE_PIN,
    request
  });
})(window);
