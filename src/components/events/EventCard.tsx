import { CalendarDays, ExternalLink, ImageOff, MapPin } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { EventRecord } from "@/lib/events";
import { formatEventSchedule } from "@/lib/events";

const tagClassName =
  "inline-flex items-center rounded-full border border-border bg-surface-3 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground";

type EventCardProps = {
  event: EventRecord;
};

export const EventCard = ({ event }: EventCardProps) => {
  return (
    <Card className="group overflow-hidden border-border bg-card shadow-soft transition-transform duration-200 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-border bg-surface-2">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-surface-1 text-muted-foreground">
            <div className="flex items-center gap-2 text-sm">
              <ImageOff className="h-4 w-4" />
              No image
            </div>
          </div>
        )}
      </div>

      <CardContent className="space-y-4 p-5">
        <div className="space-y-2">
          <h2 className="line-clamp-2 text-lg font-semibold text-title">{event.name}</h2>
          <p className="text-sm text-muted-foreground">{event.fanpage}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={tagClassName}>{event.member}</span>
          <span className={tagClassName}>{event.district}</span>
          <span className={tagClassName}>{event.type}</span>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span>{formatEventSchedule(event.event_date, event.event_time)}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 text-primary" />
            <span className="line-clamp-2">
              {event.specific_address}
              {event.ward_commune ? `, ${event.ward_commune}` : ""}, {event.district}
            </span>
          </div>
        </div>

        {event.link ? (
          <a
            href={event.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            Event link
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
      </CardContent>
    </Card>
  );
};
