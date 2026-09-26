(function(root){
  'use strict';

  // Alcove's request shape only. Transport, the Store address, the Store version and every
  // freshness check live in the shared stb-store-client.js (address and version from stb-store-runtime.json).
  const REQUEST_TYPE = 'ALCOVE_INSERT_V1';
  const DEFINITION_KIND = 'alcove_insert.v1';
  const RULE_VERSION = '0.1';

  function clone(value){
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  async function request(definition){
    if(!definition || typeof definition !== 'object') throw new Error('ALCOVE_DEFINITION_REQUIRED');
    const client = root.STBStoreClient;
    if(!client) throw new Error('STORE_CLIENT_UNAVAILABLE');
    return client.sendJob({
      projectId:'alcove',
      requestType:REQUEST_TYPE,
      candidateRevisionId:String(definition.configurationVersion || crypto.randomUUID()),
      payload:{definition:clone(definition), definitionKind:DEFINITION_KIND, ruleVersion:RULE_VERSION},
      timeoutMs:20000
    });
  }

  root.STBAlcoveStoreBridge = Object.freeze({
    version:'0.3',
    requestType:REQUEST_TYPE,
    request
  });
})(window);
