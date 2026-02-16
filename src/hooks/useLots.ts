import { useState, useEffect, useMemo, useCallback } from "react";
import { Lot, Profile } from "@/types/database.types";
import { lotService } from "@/services/lotService";
import { lotWorkerService } from "@/services/lotWorkerService";

export interface LotWithWorkers extends Lot {
  workers: Profile[];
}

interface UseLotsReturn {
  lots: LotWithWorkers[];
  filteredLots: LotWithWorkers[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addLot: (data: Partial<Lot>, userId?: string) => Promise<boolean>;
  updateLot: (id: string, data: Partial<Lot>) => Promise<boolean>;
  retireLot: (id: string) => Promise<boolean>;
  unretireLot: (id: string) => Promise<boolean>;
  deleteLot: (id: string) => Promise<boolean>;
  joinLot: (lotId: string, userId: string) => Promise<boolean>;
  leaveLot: (lotId: string, userId: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useLots(
  viewMode: "active" | "history",
  isAuthenticated: boolean
): UseLotsReturn {
  const [lots, setLots] = useState<LotWithWorkers[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const isHistory = viewMode === "history";

  const fetchLots = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    const lotsData = await lotService.fetchLots(isHistory);

    // Fetch workers for all lots
    const lotIds = lotsData.map((l) => l.id);
    const workersMap = await lotWorkerService.getWorkersForLots(lotIds);

    const lotsWithWorkers: LotWithWorkers[] = lotsData.map((lot) => ({
      ...lot,
      workers: workersMap[lot.id] || [],
    }));

    setLots(lotsWithWorkers);
    setLoading(false);
  }, [isHistory, isAuthenticated]);

  // Initial fetch
  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  // Real-time subscription for lots and lot_workers
  useEffect(() => {
    if (!isAuthenticated) return;
    const unsubLots = lotService.subscribeToChanges(fetchLots);
    const unsubWorkers = lotWorkerService.subscribeToChanges(fetchLots);
    return () => {
      unsubLots();
      unsubWorkers();
    };
  }, [isHistory, isAuthenticated, fetchLots]);

  // Filter lots by search query
  const filteredLots = useMemo(
    () =>
      lots.filter((lot) =>
        lot.lot_number.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [lots, searchQuery]
  );

  // CRUD operations
  const addLot = useCallback(async (data: Partial<Lot>, userId?: string) => {
    const inserted = await lotService.addLot(data);
    if (!inserted) return false;

    // Auto-join the creator as a worker
    if (userId) {
      await lotWorkerService.joinLot(inserted.id, userId);
    }
    return true;
  }, []);

  const updateLot = useCallback(async (id: string, data: Partial<Lot>) => {
    return lotService.updateLot(id, data);
  }, []);

  const retireLot = useCallback(async (id: string) => {
    return lotService.retireLot(id);
  }, []);

  const unretireLot = useCallback(async (id: string) => {
    return lotService.unretireLot(id);
  }, []);

  const deleteLot = useCallback(async (id: string) => {
    return lotService.deleteLot(id);
  }, []);

  const joinLot = useCallback(async (lotId: string, userId: string) => {
    return lotWorkerService.joinLot(lotId, userId);
  }, []);

  const leaveLot = useCallback(async (lotId: string, userId: string) => {
    return lotWorkerService.leaveLot(lotId, userId);
  }, []);

  return {
    lots,
    filteredLots,
    loading,
    searchQuery,
    setSearchQuery,
    addLot,
    updateLot,
    retireLot,
    unretireLot,
    deleteLot,
    joinLot,
    leaveLot,
    refetch: fetchLots,
  };
}
