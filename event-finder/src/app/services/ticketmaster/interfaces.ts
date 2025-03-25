export interface TicketmasterResult {
  _embedded: Embedded2;
  _links: Links3;
  page: Page;
}

export interface Page {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface Links3 {
  first: Self;
  self: Self;
  next: Self;
  last: Self;
}

export interface Embedded2 {
  events: Event[];
}

export interface Event {
  name: string;
  type: string;
  id: string;
  test: boolean;
  url: string;
  locale: string;
  images: Image[];
  sales: Sales;
  dates: Dates;
  classifications: Classification[];
  promoter: Promoter;
  promoters: Promoter[];
  priceRanges: PriceRange[];
  products: Product[];
  seatmap: Seatmap;
  accessibility: Accessibility;
  ticketLimit: TicketLimit;
  ageRestrictions: AgeRestrictions;
  ticketing: Ticketing;
  _links: Links;
  _embedded: Embedded;
  info: string;
  pleaseNote: string;
  outlets: Outlet[];
}

export interface Outlet {
  url: string;
  type: string;
}

export interface Embedded {
  venues: Venue[];
  attractions: Attraction[];
}

export interface Attraction {
  name: string;
  type: string;
  id: string;
  test: boolean;
  url: string;
  locale: string;
  externalLinks: ExternalLinks;
  images: Image[];
  classifications: Classification2[];
  upcomingEvents: UpcomingEvents2;
  _links: Links2;
  aliases: string[];
}

export interface UpcomingEvents2 {
  tmr: number;
  ticketmaster: number;
  _total: number;
  _filtered: number;
}

export interface ExternalLinks {
  twitter: Twitter2[];
  facebook: Twitter2[];
  wiki: Twitter2[];
  instagram: Twitter2[];
  homepage: Twitter2[];
  youtube: Twitter2[];
}

export interface Twitter2 {
  url: string;
}

export interface Venue {
  name: string;
  type: string;
  id: string;
  test: boolean;
  url: string;
  locale: string;
  images: Image2[];
  postalCode: string;
  timezone: string;
  city: City;
  state: State;
  country: Country;
  address: Address;
  location: Location;
  markets: Market[];
  dmas: Dma[];
  boxOfficeInfo: BoxOfficeInfo;
  parkingDetail: string;
  accessibleSeatingDetail: string;
  generalInfo: GeneralInfo;
  upcomingEvents: UpcomingEvents;
  _links: Links2;
  aliases: string[];
  social: Social;
  ada: Ada;
}

export interface Ada {
  adaPhones: string;
  adaCustomCopy: string;
  adaHours: string;
}

export interface Social {
  twitter: Twitter;
}

export interface Twitter {
  handle: string;
}

export interface Links2 {
  self: Self;
}

export interface UpcomingEvents {
  archtics: number;
  ticketmaster: number;
  _total: number;
  _filtered: number;
  tmr: number;
}

export interface GeneralInfo {
  generalRule: string;
  childRule: string;
}

export interface BoxOfficeInfo {
  phoneNumberDetail: string;
  openHoursDetail: string;
  acceptedPaymentDetail: string;
  willCallDetail: string;
}

export interface Dma {
  id: number;
}

export interface Market {
  name: string;
  id: string;
}

export interface Location {
  longitude: string;
  latitude: string;
}

export interface Address {
  line1: string;
}

export interface Country {
  name: string;
  countryCode: string;
}

export interface State {
  name: string;
  stateCode: string;
}

export interface City {
  name: string;
}

export interface Image2 {
  ratio: string;
  url: string;
  width: number;
  height: number;
  fallback: boolean;
}

export interface Links {
  self: Self;
  attractions: Self[];
  venues: Self[];
}

export interface Self {
  href: string;
}

export interface Ticketing {
  safeTix: SafeTix;
  allInclusivePricing: SafeTix;
  id: string;
}

export interface SafeTix {
  enabled: boolean;
}

export interface AgeRestrictions {
  legalAgeEnforced: boolean;
  id: string;
}

export interface TicketLimit {
  info: string;
  id: string;
}

export interface Accessibility {
  ticketLimit: number;
  id: string;
  info: string;
}

export interface Seatmap {
  staticUrl: string;
  id: string;
}

export interface Product {
  name: string;
  id: string;
  url: string;
  type: string;
  classifications: Classification2[];
}

export interface Classification2 {
  primary: boolean;
  segment: Segment;
  genre: Segment;
  subGenre: Segment;
  type: Segment;
  subType: Segment;
  family: boolean;
}

export interface PriceRange {
  type: string;
  currency: string;
  min: number;
  max: number;
}

export interface Promoter {
  id: string;
  name: string;
  description: string;
}

export interface Classification {
  primary: boolean;
  segment: Segment;
  genre: Segment;
  subGenre: Segment;
  type: Segment;
  subType: Segment;
  family: boolean;
}

export interface Segment {
  id: string;
  name: string;
  levelType: string;
}

export interface Dates {
  start: Start;
  timezone: string;
  status: Status;
  spanMultipleDays: boolean;
  initialStartDate: InitialStartDate;
}

export interface InitialStartDate {
  localDate: string;
  localTime: string;
  dateTime: string;
}

export interface Status {
  code: string;
}

export interface Start {
  localDate: string;
  localTime: string;
  dateTime: string;
  dateTBD: boolean;
  dateTBA: boolean;
  timeTBA: boolean;
  noSpecificTime: boolean;
}

export interface Sales {
  public: Public;
  presales: Presale[];
}

export interface Presale {
  startDateTime: string;
  endDateTime: string;
  name: string;
  description: string;
}

export interface Public {
  startDateTime: string;
  startTBD: boolean;
  startTBA: boolean;
  endDateTime: string;
}

export interface Image {
  ratio: string;
  url: string;
  width: number;
  height: number;
  fallback: boolean;
  attribution: string;
}