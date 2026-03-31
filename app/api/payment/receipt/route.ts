import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return new NextResponse("Missing id", { status: 400 });

  const purchase = await prisma.userPurchase.findUnique({
    where: { id, userId },
  });
  if (!purchase) return new NextResponse("Not found", { status: 404 });

  const date = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(purchase.date));

  const amount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: purchase.currency.toUpperCase(),
  }).format(purchase.amount / 100);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Receipt – FlowScrape</title>
  <style>
    body { font-family: sans-serif; max-width: 480px; margin: 60px auto; color: #111; }
    h1 { color: #6d28d9; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .label { color: #666; }
    .badge { background: #d1fae5; color: #065f46; padding: 2px 10px; border-radius: 999px; font-size: 13px; }
    footer { margin-top: 32px; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <h1>FlowScrape</h1>
  <h2>Payment Receipt <span class="badge">Demo</span></h2>
  <div class="row"><span class="label">Transaction ID</span><span>${purchase.stripeId}</span></div>
  <div class="row"><span class="label">Description</span><span>${purchase.description}</span></div>
  <div class="row"><span class="label">Amount</span><span>${amount}</span></div>
  <div class="row"><span class="label">Date</span><span>${date}</span></div>
  <footer>This is a demo receipt. No real payment was processed.</footer>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}