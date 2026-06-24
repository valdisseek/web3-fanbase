import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { ensureCreditAccount } from "@/lib/accounts";
import { ok, fail } from "@/lib/api";

const schema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(40),
  password: z.string().min(6).max(100),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("Invalid registration details");
  const { email, displayName, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return fail("Email already registered", 409);

  const user = await prisma.user.create({
    data: { email, displayName, passwordHash: await hashPassword(password) },
  });
  await ensureCreditAccount(user.id);
  await createSession({ userId: user.id, email, displayName });
  return ok({ id: user.id, email, displayName });
}
