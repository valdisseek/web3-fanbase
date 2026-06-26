// Minimal typings for the FPL public API responses we consume.

export interface FplTeam {
  id: number;
  name: string;
  short_name: string;
  code: number;
}

export interface FplElement {
  id: number;
  code: number;
  web_name: string;
  first_name: string;
  second_name: string;
  team: number;
  element_type: number;
  now_cost: number;
  total_points: number;
  form: string;
  ep_next: string;
  status: string;
}

export interface FplEvent {
  id: number;
  name: string;
  deadline_time: string;
  is_next: boolean;
  is_current: boolean;
  is_previous: boolean;
  finished: boolean;
  data_checked: boolean;
}

export interface FplBootstrap {
  teams: FplTeam[];
  elements: FplElement[];
  events: FplEvent[];
}

export interface FplFixture {
  id: number;
  event: number | null;
  team_h: number;
  team_a: number;
  team_h_score: number | null;
  team_a_score: number | null;
  kickoff_time: string | null;
  started: boolean;
  finished: boolean;
}

export interface FplLiveElement {
  id: number;
  stats: { total_points: number; minutes: number };
}

export interface FplLive {
  elements: FplLiveElement[];
}
