/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface Player {
  nickname: string;
  color: string;
  goalCount: number;
  racetimeStatus?: RacetimeStatusDisconnected | RacetimeStatusConnected;
}
export interface RacetimeStatusDisconnected {
  connected: never;
}
export interface RacetimeStatusConnected {
  connected: unknown;
  /**
   * Racetime username connected to this player for the race
   */
  username: string;
  /**
   * Racetime race status
   */
  status: "requested" | "invited" | "declined" | "ready" | "not_ready" | "in_progress" | "done" | "dnf" | "dq";
}
