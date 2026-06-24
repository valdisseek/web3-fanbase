-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CreditAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "isHouse" BOOLEAN NOT NULL DEFAULT false,
    "balance" BIGINT NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CreditAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "refType" TEXT,
    "refId" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LedgerEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CreditAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Team" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "code" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Player" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "webName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "secondName" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,
    "elementType" INTEGER NOT NULL,
    "nowCost" INTEGER NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "form" REAL NOT NULL DEFAULT 0,
    "epNext" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'a',
    CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Gameweek" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "deadlineTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "finished" BOOLEAN NOT NULL DEFAULT false,
    "dataChecked" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Fixture" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameweekId" INTEGER,
    "teamHId" INTEGER NOT NULL,
    "teamAId" INTEGER NOT NULL,
    "teamHScore" INTEGER,
    "teamAScore" INTEGER,
    "kickoffTime" DATETIME,
    "started" BOOLEAN NOT NULL DEFAULT false,
    "finished" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Fixture_gameweekId_fkey" FOREIGN KEY ("gameweekId") REFERENCES "Gameweek" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlayerGameweekStat" (
    "playerId" INTEGER NOT NULL,
    "gameweekId" INTEGER NOT NULL,
    "totalPoints" INTEGER NOT NULL,
    "minutes" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("playerId", "gameweekId"),
    CONSTRAINT "PlayerGameweekStat_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlayerGameweekStat_gameweekId_fkey" FOREIGN KEY ("gameweekId") REFERENCES "Gameweek" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PropMarket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" INTEGER NOT NULL,
    "gameweekId" INTEGER NOT NULL,
    "line" REAL NOT NULL,
    "overMultiplier" REAL NOT NULL,
    "underMultiplier" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resultPoints" INTEGER,
    CONSTRAINT "PropMarket_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PropMarket_gameweekId_fkey" FOREIGN KEY ("gameweekId") REFERENCES "Gameweek" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BetSlip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "stake" BIGINT NOT NULL,
    "combinedMultiplier" REAL NOT NULL,
    "potentialPayout" BIGINT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payout" BIGINT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BetSlip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BetLeg" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slipId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "pick" TEXT NOT NULL,
    "line" REAL NOT NULL,
    "multiplier" REAL NOT NULL,
    "result" TEXT NOT NULL DEFAULT 'PENDING',
    CONSTRAINT "BetLeg_slipId_fkey" FOREIGN KEY ("slipId") REFERENCES "BetSlip" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BetLeg_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "PropMarket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "H2HChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "opponentId" TEXT,
    "gameweekId" INTEGER NOT NULL,
    "metric" TEXT NOT NULL,
    "playerId" INTEGER,
    "creatorLineup" TEXT,
    "opponentLineup" TEXT,
    "stake" BIGINT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "winnerId" TEXT,
    CONSTRAINT "H2HChallenge_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "H2HChallenge_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "H2HChallenge_gameweekId_fkey" FOREIGN KEY ("gameweekId") REFERENCES "Gameweek" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pool" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "gameweekId" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "entryFee" BIGINT NOT NULL,
    "rakeBps" INTEGER NOT NULL,
    "maxEntries" INTEGER NOT NULL,
    "minEntries" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    CONSTRAINT "Pool_gameweekId_fkey" FOREIGN KEY ("gameweekId") REFERENCES "Gameweek" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PoolEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poolId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lineup" TEXT NOT NULL,
    "score" INTEGER,
    "rank" INTEGER,
    "payout" BIGINT,
    CONSTRAINT "PoolEntry_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "Pool" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PoolEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CreditAccount_userId_key" ON "CreditAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEntry_idempotencyKey_key" ON "LedgerEntry"("idempotencyKey");

-- CreateIndex
CREATE INDEX "LedgerEntry_accountId_createdAt_idx" ON "LedgerEntry"("accountId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PropMarket_playerId_gameweekId_key" ON "PropMarket"("playerId", "gameweekId");

-- CreateIndex
CREATE UNIQUE INDEX "PoolEntry_poolId_userId_key" ON "PoolEntry"("poolId", "userId");
