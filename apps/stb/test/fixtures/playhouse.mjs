// The Playhouse project's own definition: its facts, its geometry. Nothing chosen to get a yes.
export function playhouseDefinition({ widthIn = 36, straightHeightIn = 24, riseIn = 12, tabs = 4, extraFeature = null } = {}) {
  const features = [
    { featureId: 'OPENING', kind: 'ARCHED_APERTURE', placement: 'CENTERED', widthIn, straightHeightIn, riseIn, retain: 'TABS', requestedTabCount: tabs },
    { featureId: 'CENTER-SPLIT', kind: 'STRAIGHT_SPLIT', within: 'OPENING', line: 'VERTICAL_CENTERLINE' },
    { featureId: 'CUT-LEFT', kind: 'CROSSCUT', fromEnd: 'LEFT', distanceIn: 18 },
    { featureId: 'CUT-RIGHT', kind: 'CROSSCUT', fromEnd: 'RIGHT', distanceIn: 18 },
  ];
  if (tabs == null) delete features[0].requestedTabCount;
  if (extraFeature) features.push(extraFeature);
  return {
    configurationId: 'PLAYHOUSE-ARCHED-WINDOW',
    configurationVersion: `playhouse-w${widthIn}-s${straightHeightIn}-r${riseIn}-t${tabs}${extraFeature ? '-' + extraFeature.featureId : ''}`,
    sheet: { thicknessIn: 0.5, lengthIn: 96, widthIn: 48 },
    features,
    returnAllPieces: true,
  };
}

