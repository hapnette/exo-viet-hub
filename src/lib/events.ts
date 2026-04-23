export const MEMBER_OPTIONS = ["All", "Chanyeol", "EXO", "Suho", "Sehun", "Kai", "D.O."] as const;

export const EVENT_TYPE_OPTIONS = ["LED", "Photoframe", "Gift", "Cafe Event", "Freebies", "Other"] as const;

export type MemberOption = (typeof MEMBER_OPTIONS)[number];
export type EventTypeOption = (typeof EVENT_TYPE_OPTIONS)[number];

export type EventRecord = {
  id: string;
  name: string;
  fanpage: string;
  type: EventTypeOption | string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  detailed_address: string;
  ward_commune: string | null;
  district: string;
  member: Exclude<MemberOption, "All"> | string;
  link: string | null;
  image_url: string | null;
  created_at: string;
};

const formatDateTime = (eventDate: string, eventTime: string) => {
  const date = new Date(`${eventDate}T${eventTime}`);

  if (Number.isNaN(date.getTime())) {
    return `${eventDate} • ${eventTime}`;
  }

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatEventSchedule = (startDate: string, startTime: string, endDate: string, endTime: string) => {
  const startLabel = formatDateTime(startDate, startTime);
  const endLabel = formatDateTime(endDate, endTime);

  if (startDate === endDate) {
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      const dateLabel = new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(start);

      const timeLabel = `${new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(start)} – ${new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(end)}`;

      return `${dateLabel} • ${timeLabel}`;
    }
  }

  return `${startLabel} → ${endLabel}`;
};

export const sortEvents = (events: EventRecord[]) => {
  return [...events].sort((a, b) => {
    const scheduleA = new Date(`${a.start_date}T${a.start_time}`).getTime();
    const scheduleB = new Date(`${b.start_date}T${b.start_time}`).getTime();
    const now = Date.now();
    const aUpcoming = scheduleA >= now;
    const bUpcoming = scheduleB >= now;

    if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
    if (aUpcoming && bUpcoming) return scheduleA - scheduleB;

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};
