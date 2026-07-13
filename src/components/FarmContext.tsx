"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { apiGet, syncQueue, pendingCount } from "@/lib/offline";

export type FarmSummary = {
  id: string;
  name: string;
  role: string;
  licenceNumber?: string | null;
  licenceExpiry?: string | null;
};

export type Billing = {
  status: "TRIALING" | "ACTIVE" | "COVERED" | "EXPIRED";
  until: string | null;
  daysLeft: number | null;
  active: boolean;
};

type Ctx = {
  farms: FarmSummary[];
  farm: FarmSummary | null;
  setFarmId: (id: string) => void;
  user: { id: string; name: string; email: string; isAdmin?: boolean } | null;
  billing: Billing | null;
  loading: boolean;
  refreshFarms: () => Promise<void>;
  online: boolean;
  pending: number;
};

const FarmContext = createContext<Ctx>({
  farms: [],
  farm: null,
  setFarmId: () => {},
  user: null,
  billing: null,
  loading: true,
  refreshFarms: async () => {},
  online: true,
  pending: 0,
});

export function useFarm() {
  return useContext(FarmContext);
}

export function FarmProvider({ children }: { children: ReactNode }) {
  const [farms, setFarms] = useState<FarmSummary[]>([]);
  const [farmId, setFarmIdState] = useState<string | null>(null);
  const [user, setUser] = useState<Ctx["user"]>(null);
  const [billing, setBilling] = useState<Billing | null>(null);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);

  const refreshFarms = useCallback(async () => {
    try {
      const [me, list] = await Promise.all([
        apiGet<{ user: Ctx["user"]; billing?: Billing }>("/api/auth/me"),
        apiGet<FarmSummary[]>("/api/farms"),
      ]);
      setUser(me.user);
      setBilling(me.billing ?? null);
      setFarms(list);
      setFarmIdState((cur) => {
        const stored = cur ?? localStorage.getItem("kg_farm");
        if (stored && list.some((f) => f.id === stored)) return stored;
        return list[0]?.id ?? null;
      });
    } catch {
      // offline with no cache — keep whatever we have
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFarms();
  }, [refreshFarms]);

  // Online/offline tracking + automatic queue replay on reconnect.
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    const onOnline = async () => {
      setOnline(true);
      await syncQueue();
      setPending(await pendingCount());
    };
    const refreshPending = async () => setPending(await pendingCount());
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", update);
    window.addEventListener("kg-queue-changed", refreshPending);
    refreshPending();
    const interval = setInterval(refreshPending, 15000);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", update);
      window.removeEventListener("kg-queue-changed", refreshPending);
      clearInterval(interval);
    };
  }, []);

  const setFarmId = (id: string) => {
    localStorage.setItem("kg_farm", id);
    setFarmIdState(id);
  };

  const farm = farms.find((f) => f.id === farmId) ?? null;

  return (
    <FarmContext.Provider
      value={{ farms, farm, setFarmId, user, billing, loading, refreshFarms, online, pending }}
    >
      {children}
    </FarmContext.Provider>
  );
}
