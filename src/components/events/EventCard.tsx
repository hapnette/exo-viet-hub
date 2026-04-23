import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { EventRecord } from "@/lib/events";
import { formatEventSchedule } from "@/lib/events";

const tagClassName =
  "inline-flex items-center rounded-full border border-border bg-surface-3 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground";

type EventCardProps = {
  event: EventRecord;
  fallbackImage: string;
  onClick: (event: EventRecord) => void;
  onEdit: (event: EventRecord) => void;
};

export const EventCard = ({ event, fallbackImage, onClick, onEdit }: EventCardProps) => {
  return (
    <Card
      className="group overflow-hidden border-border bg-card shadow-soft transition-transform duration-200 hover:-translate-y-1"
      onClick={() => onClick(event)}
      role="button"
      tabIndex={0}
      onKeyDown={(keyboardEvent) => {
        if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
          keyboardEvent.preventDefault();
          onClick(event);
        }
      }}
    >
      <div className="flex min-h-[132px] flex-row-reverse sm:block">
        <div className="w-[30%] shrink-0 overflow-hidden border-l border-border bg-surface-2 sm:w-full sm:border-l-0 sm:border-b">
          <div className="aspect-square h-full sm:aspect-square">
            <img
              src={event.image_url ?? fallbackImage}
              alt={event.name}
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
          </div>
        </div>

        <CardContent className="flex w-[70%] min-w-0 flex-col justify-between space-y-2 p-3 sm:w-full sm:space-y-3 sm:p-4">
          <div className="space-y-1.5 sm:space-y-2">
            <h2 className="line-clamp-2 text-sm font-semibold leading-5 text-title sm:text-base">{event.name}</h2>
            <p className="line-clamp-2 text-xs leading-4 text-muted-foreground sm:text-sm">
              {formatEventSchedule(event.start_date, event.start_time, event.end_date, event.end_time)}
            </p>
            <p className="line-clamp-2 text-xs leading-4 text-muted-foreground sm:text-sm">
              {event.detailed_address}
              {event.ward_commune ? `, ${event.ward_commune}` : ""}, {event.district}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              <span className={tagClassName}>{event.member}</span>
              <span className={tagClassName}>{event.district}</span>
              <span className={tagClassName}>{event.type}</span>
            </div>

            <div className="flex justify-start">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={(clickEvent) => {
                  clickEvent.stopPropagation();
                  onEdit(event);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
