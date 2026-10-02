(function(root){
  'use strict';

  // Alcove's request shape only. Transport, the Store address, the Store version and every
  // freshness check live in the shared stb-store-client.js (address and version from stb-store-runtime.json).
  // It sends only a request admit() admitted (tile-host-admission-contract.mjs), through sendAdmittedJob, and is
  // called only as the transport inside inquire(): a blocked revision never reaches it, and no Alcove inquiry
  // calls admitPublicStoreRequest.
  const REQUEST_TYPE = 'ALCOVE_INSERT_V1';
  const DEFINITION_KIND = 'alcove_insert.v1';
  const RULE_VERSION = '0.1';
  const ADMITTED_INTERFACE = 'STB-DEFINITION-STORE-0.1';

  function clone(value){
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  async function request(admitted, definition){
    if(!admitted || admitted.interface !== ADMITTED_INTERFACE || admitted.tileId !== 'alcove' || admitted.requestType !== REQUEST_TYPE) throw new Error('ALCOVE_ADMITTED_REQUEST_REQUIRED');
    if(!definition || typeof definition !== 'object' || definition.configurationVersion !== admitted.definitionRevisionId) throw new Error('ALCOVE_DEFINITION_NOT_FOR_THIS_REVISION');
    const client = root.STBStoreClient;
    if(!client) throw new Error('STORE_CLIENT_UNAVAILABLE');
    // admit() is this inquiry's one admission decision; the transport does not admit it again.
    return client.sendAdmittedJob({
      admitted,
      payload:{definition:clone(definition), definitionKind:DEFINITION_KIND, ruleVersion:RULE_VERSION},
      timeoutMs:20000
    });
  }

  root.STBAlcoveStoreBridge = Object.freeze({
    version:'0.4',
    requestType:REQUEST_TYPE,
    request
  });
})(window);
