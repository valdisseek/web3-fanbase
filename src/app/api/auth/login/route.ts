import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

const schema = z.object({ email: z.string().email(), password: z.string() });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("Invalid login details");
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return fail("Invalid email or password", 401);
  }
  await createSession({ userId: user.id, email, displayName: user.displayName });
  return ok({ id: user.id, email, displayName: user.displayName });
}
