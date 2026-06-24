import type { Prisma } from "@prisma/client";
import type { LedgerType } from "@/lib/constants";

export class InsufficientFundsError extends Error {
  constructor(accountId: string) {
    super(`Insufficient funds in account ${accountId}`);
    this.name = "InsufficientFundsError";
  }
}

export class ConcurrencyError extends Error {
  constructor(accountId: string) {
    super(`Concurrent modification of account ${accountId}`);
    this.name = "ConcurrencyError";
  }
}

export interface MoveParams {
  accountId: string;
  amount: bigint; // signed: +credit, -debit
  type: LedgerType;
  refType?: string;
  refId?: string;
  idempotencyKey?: string;
}

/**
 * Apply a single signed balance change and record a LedgerEntry, inside the
 * given transaction. Enforces non-negative balance and an optimistic lock.
 * Idempotent when an idempotencyKey is supplied (replay returns the existing
 * entry without re-applying).
 */
export async function move(tx: Prisma.TransactionClient, params: MoveParams) {
  const { accountId, amount, type, refType, refId, idempotencyKey } = params;

  if (idempotencyKey) {
    const existing = await tx.ledgerEntry.findUnique({ where: { idempotencyKey } });
    if (existing) return existing; // no-op replay
  }

  const acct = await tx.creditAccount.findUniqueOrThrow({ where: { id: accountId } });
  const next = acct.balance + amount;
  if (next < 0n) throw new InsufficientFundsError(accountId);

  try {
    await tx.creditAccount.update({
      where: { id: accountId, version: acct.version },
      data: { balance: next, version: { increment: 1 } },
    });
  } catch {
    // P2025: the version guard failed => someone else moved this balance.
    throw new ConcurrencyError(accountId);
  }

  return tx.ledgerEntry.create({
    data: { accountId, amount, type, refType, refId, idempotencyKey },
  });
}

export interface TransferParams {
  fromAccountId: string;
  toAccountId: string;
  amount: bigint; // positive
  type: LedgerType;
  refType?: string;
  refId?: string;
  /** Base key; the two legs get `${key}:debit` / `${key}:credit`. */
  idempotencyKey?: string;
}

/** Move `amount` from one account to another within the same transaction. */
export async function transfer(tx: Prisma.TransactionClient, params: TransferParams) {
  const { fromAccountId, toAccountId, amount, type, refType, refId, idempotencyKey } = params;
  if (amount <= 0n) throw new Error("transfer amount must be positive");

  const debit = await move(tx, {
    accountId: fromAccountId,
    amount: -amount,
    type,
    refType,
    refId,
    idempotencyKey: idempotencyKey ? `${idempotencyKey}:debit` : undefined,
  });
  const credit = await move(tx, {
    accountId: toAccountId,
    amount,
    type,
    refType,
    refId,
    idempotencyKey: idempotencyKey ? `${idempotencyKey}:credit` : undefined,
  });
  return { debit, credit };
}
