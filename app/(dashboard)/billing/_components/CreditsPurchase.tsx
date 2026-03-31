"use client";
import React, { useState } from "react";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  CoinsIcon, CreditCardIcon, CheckCircle2Icon, XCircleIcon, Loader2Icon,
} from "lucide-react";
import { CreditsPack, PackId } from "@/lib/billing";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { purchaseCredits } from "@/actions/billings";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type PaymentState = "idle" | "form" | "processing" | "success" | "failed";

function CreditsPurchase() {
  const [selectedPack, setSelectedPack] = useState(PackId.MEDIUM);
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [transactionId, setTransactionId] = useState<string>("");
  const router = useRouter();

  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvv, setCvv] = useState("123");
  const [cardName, setCardName] = useState("");

  const selectedPackData = CreditsPack.find((p) => p.id === selectedPack)!;

  const mutation = useMutation({
    mutationFn: purchaseCredits,
    onSuccess: (data) => {
      setTransactionId(data.transactionId);
      setPaymentState("success");
    },
    onError: () => {
      setPaymentState("failed");
    },
  });

  function handleOpenPayment() {
    setPaymentState("form");
  }

  function handleSubmitPayment() {
    if (!cardName.trim()) {
      toast.error("Please enter cardholder name");
      return;
    }
    setPaymentState("processing");
    setTimeout(() => {
      mutation.mutate(selectedPack);
    }, 1500);
  }

  function handleClose() {
    setPaymentState("idle");
    if (mutation.isSuccess) router.refresh();
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <CoinsIcon className="h-6 w-6 text-primary" />
            Purchase Credits
          </CardTitle>
          <CardDescription>
            Select the number of credits you want to purchase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            onValueChange={(v) => setSelectedPack(v as PackId)}
            value={selectedPack}
          >
            {CreditsPack.map((pack) => (
              <div
                key={pack.id}
                className="flex items-center space-x-3 bg-secondary/50 rounded-lg p-3 hover:bg-secondary cursor-pointer"
                onClick={() => setSelectedPack(pack.id)}
              >
                <RadioGroupItem value={pack.id} id={pack.id} />
                <Label
                  htmlFor={pack.id}
                  className="flex justify-between cursor-pointer w-full"
                >
                  <span className="font-medium">
                    {pack.name} — {pack.label}
                  </span>
                  <span className="font-bold text-primary">
                    ₹{(pack.price / 100).toFixed(2)}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleOpenPayment}>
            <CreditCardIcon className="h-5 w-5 mr-2" />
            Purchase credits
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={paymentState !== "idle"} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">

          {/* PAYMENT FORM */}
          {paymentState === "form" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CreditCardIcon className="h-5 w-5 text-primary" />
                  Secure Checkout
                </DialogTitle>
                <DialogDescription>
                  Purchasing{" "}
                  <span className="font-semibold text-foreground">
                    {selectedPackData.label}
                  </span>{" "}
                  for{" "}
                  <span className="font-semibold text-primary">
                    ₹{(selectedPackData.price / 100).toFixed(2)}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-1">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      maxLength={4}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  🔒 This is a demo payment. No real money is charged.
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitPayment}>
                  Pay ₹{(selectedPackData.price / 100).toFixed(2)}
                </Button>
              </DialogFooter>
            </>
          )}

          {/* PROCESSING */}
          {paymentState === "processing" && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <Loader2Icon className="h-12 w-12 text-primary animate-spin" />
              <p className="text-lg font-semibold">Processing payment…</p>
              <p className="text-sm text-muted-foreground">Please wait</p>
            </div>
          )}

          {/* SUCCESS */}
          {paymentState === "success" && (
            <>
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <CheckCircle2Icon className="h-16 w-16 text-green-500" />
                <p className="text-xl font-bold">Payment Successful!</p>
                <p className="text-muted-foreground text-center">
                  <span className="font-semibold text-foreground">
                    {selectedPackData.credits.toLocaleString()} credits
                  </span>{" "}
                  have been added to your account.
                </p>
                <p className="text-xs text-muted-foreground break-all">
                  Txn ID: {transactionId}
                </p>
              </div>
              <DialogFooter>
                <Button className="w-full" onClick={handleClose}>
                  Done
                </Button>
              </DialogFooter>
            </>
          )}

          {/* FAILED */}
          {paymentState === "failed" && (
            <>
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <XCircleIcon className="h-16 w-16 text-destructive" />
                <p className="text-xl font-bold">Payment Failed</p>
                <p className="text-muted-foreground text-center">
                  Something went wrong. Please try again.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={() => setPaymentState("form")}>
                  Try Again
                </Button>
              </DialogFooter>
            </>
          )}

        </DialogContent>
      </Dialog>
    </>
  );
}

export default CreditsPurchase;