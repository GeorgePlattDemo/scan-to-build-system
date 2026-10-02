(function(root){
  'use strict';

  // User 1's request shape only. Transport, the Store address (stb-store-runtime.json), the Store version
  // and every freshness check live in the shared stb-store-client.js.
  // It sends only a request admit() admitted (tile-host-admission-contract.mjs), through sendAdmittedJob, and is
  // called only as the transport inside inquire(): a blocked revision never reaches it, and no Start your own
  // inquiry calls admitPublicStoreRequest.
  const REQUEST_TYPE = 'USER_DEFINED_BOARD_V1';
  const SCOPE = 'USER_DEFINED_BOARD_V1';
  const DEFINITION_KIND = 'user_defined_board.v1';
  const RULE_VERSION = '0.1';
  const ADMITTED_INTERFACE = 'STB-DEFINITION-STORE-0.1';

  function canonicalInchString(value){
    if(typeof value !== 'number' || !Number.isFinite(value)) {
      throw new TypeError('canonical inch string requires a finite number');
    }
    const negative = value < 0 || Object.is(value,-0);
    const absolute = Math.abs(value);
    const parts = absolute.toFixed(12).split('.');
    const whole = parts[0].replace(/^0+(?=\d)/,'');
    const fraction = (parts[1] || '').replace(/0+$/,'');
    const digits = fraction ? whole+'.'+fraction : whole;
    if(digits === '0') return '0';
    return negative ? '-'+digits : digits;
  }

  function clone(value){
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  // `materialDemand` is the admitted start-own.material fact, sent as admitted: the bridge adds no material of its own.
  function payloadFromDemand(demand, materialDemand){
    if(!demand || typeof demand !== 'object') throw new Error('USER_DEFINED_BOARD_DEMAND_REQUIRED');
    if(!materialDemand || typeof materialDemand !== 'object' || Array.isArray(materialDemand)) throw new Error('START_OWN_ADMITTED_MATERIAL_REQUIRED');
    const spotCount = Number(demand.declaredSpotCount || 0);
    const spotDemand = spotCount > 0 ? {
      required:true,
      mode:'SPOT_ON_LOCATION',
      countPerPart:1,
      locationRule:'CENTERED_ON_PART',
      acrossWidthRule:'CENTERED_ON_WIDE_FACE',
      totalCount:spotCount
    } : null;
    return {
      line:{
        lineId:'SYO-USER1-XBRACE-LINE-1',
        configurationId:String(demand.configurationId || ''),
        configurationVersion:String(demand.configurationVersion || ''),
        materialDemand:clone(materialDemand),
        quantity:1,
        unit:'ea',
        requiredOps:clone(demand.requiredOps || []),
        definedWorkpieceLength:{value:canonicalInchString(Number(demand.definedWorkpieceLengthIn)),unit:'in'},
        sawCuts:Number(demand.declaredSawCuts),
        sawAngleDeg:Number(demand.sawAngleDeg),
        drillCycles:0,
        drillDepthIn:null,
        cutPlane:demand.cutPlane == null ? null : String(demand.cutPlane),
        endIdentity:demand.endIdentity == null ? null : String(demand.endIdentity),
        endRelation:demand.endRelation == null ? null : String(demand.endRelation),
        lengthDatum:demand.lengthDatum == null ? null : String(demand.lengthDatum),
        datumCMethod:String(demand.datumCMethod || ''),
        parts:clone(demand.parts || []),
        spotDemand,
        unresolvedConditions:[],
        materialSource:'STORE_ZERO'
      },
      definitionKind:DEFINITION_KIND,
      ruleVersion:RULE_VERSION
    };
  }

  function signatureBody(payload){
    const line = payload.line;
    return ({
      definitionKind:payload.definitionKind,
      ruleVersion:payload.ruleVersion,
      requestType:REQUEST_TYPE,
      scope:SCOPE,
      lineId:line.lineId,
      configurationId:line.configurationId,
      configurationVersion:line.configurationVersion,
      materialDemand:line.materialDemand,
      quantity:line.quantity,
      unit:line.unit,
      requiredOps:line.requiredOps,
      definedWorkpieceLength:line.definedWorkpieceLength,
      sawCuts:line.sawCuts,
      sawAngleDeg:line.sawAngleDeg,
      drillCycles:line.drillCycles,
      drillDepthIn:line.drillDepthIn,
      cutPlane:line.cutPlane,
      endIdentity:line.endIdentity,
      endRelation:line.endRelation,
      lengthDatum:line.lengthDatum,
      datumCMethod:line.datumCMethod,
      parts:line.parts,
      spotDemand:line.spotDemand,
      unresolvedConditions:line.unresolvedConditions,
      materialSource:line.materialSource
    });
  }

  // The demand must carry exactly the admitted request's work: its parts, operations and workpiece length.
  function sameWork(admitted, demand){
    const facts = admitted.facts || {};
    return !!demand && typeof demand === 'object'
      && JSON.stringify(demand.parts) === JSON.stringify(facts['start-own.parts'])
      && JSON.stringify(demand.requiredOps) === JSON.stringify(facts['start-own.operations'])
      && Number(demand.definedWorkpieceLengthIn) === Number(facts['start-own.workpiece-length']);
  }

  async function request(admitted, demand, options){
    if(!admitted || admitted.interface !== ADMITTED_INTERFACE || admitted.tileId !== 'start-own' || admitted.requestType !== REQUEST_TYPE) throw new Error('START_OWN_ADMITTED_REQUEST_REQUIRED');
    if(!sameWork(admitted, demand)) throw new Error('START_OWN_DEMAND_NOT_THE_ADMITTED_REQUEST');
    options = options || {};
    const client = root.STBStoreClient;
    if(!client) throw new Error('STORE_CLIENT_UNAVAILABLE');
    const payload = payloadFromDemand(demand, (admitted.facts || {})['start-own.material']);
    // admit() is this inquiry's one admission decision; the transport does not admit it again.
    return client.sendAdmittedJob({
      admitted,
      requestId:options.requestId,
      payload,
      signatureBody:signatureBody(payload),
      timeoutMs:20000
    });
  }

  root.STBUserDefinedBoardRuntimeBridge = Object.freeze({
    version:'0.4',
    requestType:REQUEST_TYPE,
    payloadFromDemand,
    request
  });
})(window);
