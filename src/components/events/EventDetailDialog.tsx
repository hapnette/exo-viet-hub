import { CalendarDays, ExternalLink, MapPin } from "lucide-react";

import type { EventRecord } from "@/lib/events";
import { formatEventSchedule } from "@/lib/events";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const tagClassName =
  "inline-flex items-center rounded-full border border-border bg-surface-3 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground";

type EventDetailDialogProps = {
  event: EventRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fallbackImage: string;
};

export const EventDetailDialog = ({ event, open, onOpenChange, fallbackImage }: EventDetailDialogProps) => {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1rem)] overflow-y-auto border-border bg-popover p-0 text-popover-foreground sm:max-w-2xl">
        <div className="aspect-[16/11] overflow-hidden border-b border-border bg-surface-2">
          <img src={event.image_url ?? fallbackImage} alt={event.name} className="h-full w-full object-cover" />
        </div>

        <div className="space-y-5 px-4 py-4 sm:px-6 sm:py-5">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex flex-wrap gap-2">
              <span className={tagClassName}>{event.member}</span>
              <span className={tagClassName}>{event.district}</span>
              <span className={tagClassName}>{event.type}</span>
            </div>
            <DialogTitle className="text-balance text-2xl text-title sm:text-3xl">{event.name}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">{event.fanpage}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 rounded-md border border-border bg-surface-2 p-4">
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <CalendarDays className="mt-0.5 h-4 w-4 text-primary" />
              <span>{formatEventSchedule(event.start_date, event.start_time, event.end_date, event.end_time)}</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 text-primary" />
              <div className="space-y-1">
                <p className="text-foreground">{event.detailed_address}</p>
                <p>
                  {[event.ward_commune, event.district, "Ho Chi Minh City"].filter(Boolean).join(", ")}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Start</p>
              <p className="text-sm text-foreground">{event.start_date} • {event.start_time}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">End</p>
              <p className="text-sm text-foreground">{event.end_date} • {event.end_time}</p>
            </div>
          </div>

          {event.link ? (
            <a
              href={event.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              Open event link
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};