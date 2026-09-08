import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "react-toastify";

interface UserDto {
  userName: string;
  balance: number;
  totalTransactions: number;
  hasClaimedWelcomeBonus: boolean;
}

interface UpdateBalanceDto {
  balance: number;
}

export function useApiUser() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5136";

  // ---------------------------------------------------------
  // GET USER
  // ---------------------------------------------------------
  const userQuery = useQuery<UserDto>({
    queryKey: ["user"],
    queryFn: async () => {
      const token = await getToken({ template: "Casino-JWT" });

      const res = await fetch(`${API_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
    staleTime: 30_000,
  });

  // ---------------------------------------------------------
  // UPDATE BALANCE (withdraw, game results)
  // ---------------------------------------------------------
  const updateBalance = useMutation({
    mutationFn: async ({
      amount,
      gameType,
    }: {
      amount: number;
      gameType: string;
    }) => {
      const token = await getToken({ template: "Casino-JWT" });

      const res = await fetch(`${API_URL}/user/balance`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount, gameType }),
      });

      if (!res.ok) throw new Error("Failed to update balance");
      return res.json() as Promise<UpdateBalanceDto>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], (old: any) => ({
        ...old,
        balance: data.balance,
      }));
      toast.success(`Balance updated! $${data.balance.toFixed(2)}`);
    },
    onError: () => {
      toast.error("Balance update failed");
    },
  });

  // ---------------------------------------------------------
  // CREATE STRIPE CHECKOUT SESSION (deposit)
  // ---------------------------------------------------------
  const createStripeSession = useMutation({
    mutationFn: async (amount: number) => {
      const token = await getToken({ template: "Casino-JWT" });

      const res = await fetch(`${API_URL}/payments/create-checkout-session`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      if (!res.ok) throw new Error("Failed to create Stripe session");
      return res.json();
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });

  const withdraw = useMutation({
    mutationFn: async (amount: number) => {
      const token = await getToken({ template: "Casino-JWT" });

      const res = await fetch(`${API_URL}/payments/withdraw`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], (old: any) => ({
        ...old,
        balance: data.balance,
      }));
      queryClient.invalidateQueries({ queryKey: ["user"] });

      toast.success("Withdrawal successful!");
    },
  });


  // ---------------------------------------------------------
  // RETURN HOOK API
  // ---------------------------------------------------------
  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    error: userQuery.error,
    refetch: userQuery.refetch,
    withdraw: withdraw.mutate,
    isWithdrawing: withdraw.isPending,
    updateBalance: updateBalance.mutate,
    isUpdating: updateBalance.isPending,

    createStripeSession: createStripeSession.mutate, // ⭐ FIX
  };
}
