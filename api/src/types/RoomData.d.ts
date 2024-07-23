/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Basic information about a room
 */
export interface RoomData {
  name: string;
  game: string;
  slug: string;
  gameSlug: string;
  racetimeConnection?: RacetimeConnection;
}
export interface RacetimeConnection {
  /**
   * Whether or not the game is enabled for racetime.gg integration and properly configured
   */
  gameActive?: boolean;
  /**
   * Racetime game slug
   */
  slug?: string;
  /**
   * Racetime race goal
   */
  goal?: string;
  /**
   * Full url to the connected racetime room. If not set, the room is not connected to a racetime room
   */
  url?: boolean;
  /**
   * True if there is an active websocket connection to the room
   */
  websocketConnected?: boolean;
  /**
   * Racetime room status
   */
  status?: string;
}
