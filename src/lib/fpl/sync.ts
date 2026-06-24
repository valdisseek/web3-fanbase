import { prisma } from "@/lib/db";
import { fplClient } from "./client";
import { GameweekStatus } from "@/lib/constants";
import type { FplEvent } from "./types";

export function mapGameweekStatus(e: FplEvent): GameweekStatus {
  if (e.data_checked) return GameweekStatus.FINALIZED;
  if (e.finished) return GameweekStatus.FINISHED;
  if (e.is_current) return GameweekStatus.LIVE;
  return GameweekStatus.UPCOMING;
}

export async function syncBootstrap() {
  const data = await fplClient.bootstrap();

  for (const t of data.teams) {
    await prisma.team.upsert({
      where: { id: t.id },
      update: { name: t.name, shortName: t.short_name, code: t.code },
      create: { id: t.id, name: t.name, shortName: t.short_name, code: t.code },
    });
  }

  for (const p of data.elements) {
    const fields = {
      webName: p.web_name,
      firstName: p.first_name,
      secondName: p.second_name,
      teamId: p.team,
      elementType: p.element_type,
      nowCost: p.now_cost,
      totalPoints: p.total_points,
      form: parseFloat(p.form) || 0,
      epNext: parseFloat(p.ep_next) || 0,
      status: p.status,
    };
    await prisma.player.upsert({
      where: { id: p.id },
      update: fields,
      create: { id: p.id, ...fields },
    });
  }

  for (const e of data.events) {
    const fields = {
      name: e.name,
      deadlineTime: new Date(e.deadline_time),
      status: mapGameweekStatus(e),
      finished: e.finished,
      dataChecked: e.data_checked,
    };
    await prisma.gameweek.upsert({
      where: { id: e.id },
      update: fields,
      create: { id: e.id, ...fields },
    });
  }

  return {
    teams: data.teams.length,
    players: data.elements.length,
    gameweeks: data.events.length,
  };
}

export async function syncFixtures() {
  const fixtures = await fplClient.fixtures();
  for (const f of fixtures) {
    const fields = {
      gameweekId: f.event,
      teamHId: f.team_h,
      teamAId: f.team_a,
      teamHScore: f.team_h_score,
      teamAScore: f.team_a_score,
      kickoffTime: f.kickoff_time ? new Date(f.kickoff_time) : null,
      started: f.started,
      finished: f.finished,
    };
    await prisma.fixture.upsert({
      where: { id: f.id },
      update: fields,
      create: { id: f.id, ...fields },
    });
  }
  return { fixtures: fixtures.length };
}

/** Sync per-player points for a gameweek (settlement source of truth). */
export async function syncLive(gameweekId: number) {
  const live = await fplClient.eventLive(gameweekId);
  let count = 0;
  for (const el of live.elements) {
    // Only persist players that exist (bootstrap synced first).
    const player = await prisma.player.findUnique({ where: { id: el.id } });
    if (!player) continue;
    await prisma.playerGameweekStat.upsert({
      where: { playerId_gameweekId: { playerId: el.id, gameweekId } },
      update: { totalPoints: el.stats.total_points, minutes: el.stats.minutes },
      create: {
        playerId: el.id,
        gameweekId,
        totalPoints: el.stats.total_points,
        minutes: el.stats.minutes,
      },
    });
    count++;
  }
  return { liveStats: count };
}

/** Full sync: bootstrap, fixtures, and live stats for any in-progress or
 *  finished-but-not-finalized gameweeks. Safe to run repeatedly. */
export async function syncAll() {
  const boot = await syncBootstrap();
  const fix = await syncFixtures();
  const active = await prisma.gameweek.findMany({
    where: { status: { in: [GameweekStatus.LIVE, GameweekStatus.FINISHED] } },
  });
  let liveStats = 0;
  for (const gw of active) {
    const r = await syncLive(gw.id);
    liveStats += r.liveStats;
  }
  return { ...boot, ...fix, liveStats };
}
