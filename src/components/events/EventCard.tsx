import { Card, CardContent } from "@/components/ui/card";
import type { EventRecord } from "@/lib/events";

const tagClassName =
  "inline-flex items-center rounded-full border border-border bg-surface-3 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground";

type EventCardProps = {
  event: EventRecord;
  fallbackImage: string;
  onClick: (event: EventRecord) => void;
};

export const EventCard = ({ event, fallbackImage, onClick }: EventCardProps) => {
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
      <div className="relative aspect-[16/9] overflow-hidden border-b border-border bg-surface-2">
        <img
          src={event.image_url ?? fallbackImage}
          alt={event.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>

      <CardContent className="space-y-3 p-4">
        <h2 className="line-clamp-2 text-base font-semibold leading-5 text-title sm:text-lg">{event.name}</h2>

        <div className="flex flex-wrap gap-1.5">
          <span className={tagClassName}>{event.member}</span>
          <span className={tagClassName}>{event.district}</span>
          <span className={tagClassName}>{event.type}</span>
        </div>
      </CardContent>
    </Card>
  );
};
