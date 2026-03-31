"use server";

import { getCreditsPack, PackId } from "@/lib/billing";
import prisma from "@/lib/prisma";
import { processDummyPayment } from "@/lib/dummy-payment/dummyPayment";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function getAvailableCredits() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const balance = await prisma.userBalance.findUnique({ where: { userId } });
  if (!balance) return -1;
  return balance.credits;
}

export async function setupUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const userBalance = await prisma.userBalance.findUnique({ where: { userId } });
  if (!userBalance) {
    await prisma.userBalance.create({ data: { userId, credits: 200 } });
  }
  redirect("/home");
}

export async function purchaseCredits(packId: PackId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const selectedPack = getCreditsPack(packId);
  if (!selectedPack) throw new Error("Invalid package");

  const result = await processDummyPayment(userId, packId);
  if (!result.success) throw new Error(result.error);

  return {
    success: true,
    credits: selectedPack.credits,
    transactionId: result.sessionId,
  };
}

export async function getUserPurchases() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  return await prisma.userPurchase.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
}

export async function downloadInvoice(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const purchase = await prisma.userPurchase.findUnique({
    where: { userId, id },
  });
  if (!purchase) throw new Error("Purchase not found");

  return `/api/payment/receipt?id=${purchase.id}`;
}