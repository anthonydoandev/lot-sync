import { memo } from "react";
import { LotWithWorkers } from "@/hooks/useLots";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Archive, Trash2, UserPlus, UserMinus } from "lucide-react";
import { formatDate } from "@/utils/formatting";

interface LotCardProps {
  lot: LotWithWorkers;
  onEdit: (lot: LotWithWorkers) => void;
  onRetire: (id: string) => void;
  onUnretire: (id: string) => void;
  onDelete: (id: string) => void;
  isHistory?: boolean;
  currentUserId?: string;
  onJoin?: (lotId: string) => void;
  onLeave?: (lotId: string) => void;
}

export const LotCard = memo(function LotCard({
  lot,
  onEdit,
  onRetire,
  onUnretire,
  onDelete,
  isHistory = false,
  currentUserId,
  onJoin,
  onLeave,
}: LotCardProps) {
  const workers = lot.workers || [];
  const isWorker = currentUserId
    ? workers.some((w) => w.id === currentUserId)
    : false;

  return (
    <div className="group flex flex-col gap-2 px-4 py-3 rounded-lg border border-l-2 border-l-transparent hover:border-l-primary bg-card hover:bg-muted/50 transition-colors duration-150">
      <div className="flex items-center gap-3">
        <span className="font-mono font-bold text-foreground uppercase">
          {lot.lot_number}
        </span>
        {lot.io && (
          <Badge variant="outline" className="text-xs font-medium">
            IO-{lot.io}
          </Badge>
        )}
        <span className="text-sm text-muted-foreground uppercase flex-1 truncate">
          {lot.contents}
        </span>

        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {!isHistory &&
            currentUserId &&
            (isWorker ? (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onLeave?.(lot.id)}
                className="h-8 w-8 text-orange-500 hover:bg-orange-500/10"
                title="Leave lot"
              >
                <UserMinus className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onJoin?.(lot.id)}
                className="h-8 w-8 text-green-600 hover:bg-green-600/10"
                title="Join lot"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            ))}
          {!isHistory ? (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onEdit(lot)}
                className="h-8 w-8 hover:bg-muted"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onRetire(lot.id)}
                className="h-8 w-8 text-accent hover:bg-accent/10"
              >
                <Archive className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(lot.id)}
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUnretire(lot.id)}
            >
              Unretire
            </Button>
          )}
        </div>

        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {isHistory && lot.retired_at ? (
            <>
              {formatDate(lot.created_at)} -{" "}
              <span className="font-bold underline">
                {formatDate(lot.retired_at)}
              </span>
            </>
          ) : (
            formatDate(lot.created_at)
          )}
        </span>
      </div>

      {workers.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {workers.map((worker) => (
            <Badge
              key={worker.id}
              variant={worker.id === currentUserId ? "default" : "secondary"}
              className="text-xs"
            >
              {worker.display_name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
});
