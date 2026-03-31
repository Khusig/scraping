import "server-only";
import { getCreditsPack, PackId } from "@/lib/billing";
import prisma from "@/lib/prisma";

export type DummyPaymentResult =
  | { success: true; sessionId: string }
  | { success: false; error: string };

export async function processDummyPayment(
  userId: string,
  packId: PackId
): Promise<DummyPaymentResult> {
  const pack = getCreditsPack(packId);
  if (!pack) {
    return { success: false, error: "Invalid credit pack selected." };
  }

  // Optional: set DUMMY_PAYMENT_FAIL_RATE=0.2 in .env to simulate 20% failure
  const failRate = parseFloat(process.env.DUMMY_PAYMENT_FAIL_RATE ?? "0");
  if (failRate > 0 && Math.random() < failRate) {
    return { success: false, error: "Payment declined. Please try again." };
  }

  const sessionId = `dummy_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  await prisma.userBalance.upsert({
    where: { userId },
    create: { userId, credits: pack.credits },
    update: { credits: { increment: pack.credits } },
  });

  await prisma.userPurchase.create({
    data: {
      userId,
      stripeId: sessionId, // reuses existing column — no schema change needed
      description: `${pack.name} - ${pack.credits} credits (Demo Purchase)`,
      amount: pack.price,
      currency: "inr",
    },
  });

  return { success: true, sessionId };
}