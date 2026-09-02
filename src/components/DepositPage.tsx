import { useState } from "react";
import { useApiUser } from "../api/useApiUser";
import { toast } from "react-toastify";

export default function DepositPage() {
  const { createStripeSession, isUpdating } = useApiUser();
  const [amount, setAmount] = useState<number>(0);

  const handleDeposit = () => {
    if (amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    createStripeSession(amount);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-gray-900 p-8 rounded-xl shadow-xl w-full max-w-md text-center border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-green-400">
          Deposit Funds
        </h1>

        <p className="mb-4 text-gray-300">
          Enter the amount you want to deposit into your casino balance.
        </p>

        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-green-400 mb-6"
          placeholder="Amount in SEK"
        />

        <button
          onClick={handleDeposit}
          disabled={isUpdating}
          className={`w-full py-3 rounded text-lg font-semibold transition ${
            isUpdating
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {isUpdating ? "Processing..." : `Deposit ${amount} kr`}
        </button>

        <p className="text-gray-400 text-sm mt-6">
          You will be redirected to Stripe Checkout to complete your payment.
        </p>
      </div>
    </div>
  );
}
