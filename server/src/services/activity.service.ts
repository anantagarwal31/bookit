import type { PoolClient } from 'pg';
import * as db from '../db/pool';
import type { ActivityType } from '../types';

export const ACTIVITY = {
  VIEWED: 'event_viewed',
  BOOKING_STARTED: 'booking_started',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
} as const satisfies Record<string, ActivityType>;

interface ActivityInput {
  eventId: number;
  userId?: number | null;
  type: ActivityType;
}

export async function logActivity(
  { eventId, userId = null, type }: ActivityInput,
  client?: PoolClient
): Promise<void> {
  const sql = 'INSERT INTO activity_log (event_id, user_id, type) VALUES ($1, $2, $3)';
  const params = [eventId, userId, type];

  if (client) await client.query(sql, params);
  else await db.query(sql, params);
}

export async function logActivitySafely(input: ActivityInput): Promise<void> {
  try {
    await logActivity(input);
  } catch (error) {
    console.error('Failed to write activity log:', (error as Error).message);
  }
}