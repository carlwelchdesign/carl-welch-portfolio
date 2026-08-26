export const analyticsModes = ['disabled', 'development'] as const;
export type AnalyticsMode = (typeof analyticsModes)[number];

export const analyticsEventDefinitions = {
  portfolio_navigation: {
    category: 'portfolio',
    properties: { destination: ['home', 'work', 'capabilities', 'experience', 'recommendations', 'contact', 'project'] },
  },
  evidence_reveal: {
    category: 'portfolio',
    properties: { surface: ['portfolio'] },
  },
  resume_download: {
    category: 'portfolio',
    properties: { location: ['home', 'contact', 'footer', 'other'] },
  },
  outbound_contact: {
    category: 'portfolio',
    properties: {
      channel: ['email', 'linkedin', 'github'],
      location: ['header', 'contact', 'footer', 'other'],
    },
  },
  jolene_open: {
    category: 'jolene',
    properties: { source: ['launcher'] },
  },
  jolene_response: {
    category: 'jolene',
    properties: {
      operation: ['answer', 'job_fit', 'contact_intent'],
      state: ['success', 'no_evidence', 'error', 'unavailable'],
    },
  },
  jolene_citation_followthrough: {
    category: 'jolene',
    properties: { destination: ['portfolio'] },
  },
} as const;

export type AnalyticsEventName = keyof typeof analyticsEventDefinitions;
export type AnalyticsCategory = (typeof analyticsEventDefinitions)[AnalyticsEventName]['category'];
export type AnalyticsProperties = Record<string, string>;

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  category: AnalyticsCategory;
  properties: AnalyticsProperties;
};

export class AnalyticsContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnalyticsContractError';
  }
}

export function parseAnalyticsEvent(name: string, properties: unknown): AnalyticsEvent {
  if (!Object.hasOwn(analyticsEventDefinitions, name)) {
    throw new AnalyticsContractError('Analytics event is not approved.');
  }

  const definition = analyticsEventDefinitions[name as AnalyticsEventName];
  if (!properties || typeof properties !== 'object' || Array.isArray(properties)) {
    throw new AnalyticsContractError('Analytics properties must be a plain object.');
  }

  const supplied = properties as Record<string, unknown>;
  const approvedProperties = definition.properties as Record<string, readonly string[]>;
  const approvedKeys = Object.keys(approvedProperties);
  if (Object.keys(supplied).length !== approvedKeys.length || Object.keys(supplied).some((key) => !approvedKeys.includes(key))) {
    throw new AnalyticsContractError('Analytics payload contains missing or prohibited properties.');
  }

  const parsed: AnalyticsProperties = {};
  for (const key of approvedKeys) {
    const value = supplied[key];
    if (typeof value !== 'string' || !approvedProperties[key].includes(value)) {
      throw new AnalyticsContractError(`Analytics property ${key} is not approved.`);
    }
    parsed[key] = value;
  }

  return { name: name as AnalyticsEventName, category: definition.category, properties: parsed };
}
