export interface ApiResult {
  count: number;
  overflow: boolean;
  next: string;
  previous: null;
  results: Event[];
}

export interface Event {
  relevance: number;
  id: string;
  title: string;
  description: string;
  category: string;
  labels: string[];
  rank: number;
  local_rank: number;
  phq_attendance: number;
  entities: (Entity | Entities2)[];
  duration: number;
  start: string;
  start_local: string;
  end: string;
  end_local: string;
  updated: string;
  first_seen: string;
  timezone: string;
  location: number[];
  geo: Geo;
  impact_patterns: Impactpattern[];
  scope: string;
  country: string;
  place_hierarchies: string[][];
  state: string;
  brand_safe: boolean;
  private: boolean;
  predicted_event_spend: number;
  predicted_event_spend_industries: Predictedeventspendindustries;
  phq_labels?: Phqlabel[];
  alternate_titles?: string[];
}

export interface Phqlabel {
  label: string;
  weight: number;
}

export interface Predictedeventspendindustries {
  accommodation: number;
  hospitality: number;
  transportation: number;
}

export interface Impactpattern {
  vertical: string;
  impact_type: string;
  impacts: Impact[];
}

export interface Impact {
  date_local: string;
  value: number;
  position: string;
}

export interface Geo {
  geometry: Geometry;
  placekey: string;
  address: Address;
}

export interface Address {
  country_code: string;
  formatted_address: string;
  locality: string;
  postcode?: string;
  region: string;
}

export interface Geometry {
  coordinates: number[];
  type: string;
}

export interface Entities2 {
  entity_id: string;
  name: string;
  type: string;
  formatted_address: string;
  category?: string;
  labels?: string[];
  description?: string;
  timezone?: string;
}

export interface Entity {
  entity_id: string;
  name: string;
  type: string;
  formatted_address: string;
}