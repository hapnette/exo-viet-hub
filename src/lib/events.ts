export const MEMBER_OPTIONS = ["All", "Chanyeol", "EXO", "Suho", "Sehun", "Kai", "D.O."] as const;

export const EVENT_TYPE_OPTIONS = ["LED", "Photoframe", "Gift", "Cafe Event", "Freebies", "Other"] as const;

export type MemberOption = (typeof MEMBER_OPTIONS)[number];
export type EventTypeOption = (typeof EVENT_TYPE_OPTIONS)[number];

export type EventRecord = {
  id: string;
  name: string;
  fanpage: string;
  type: EventTypeOption | string;
  event_date: string;
  event_time: string;
  specific_address: string;
  ward_commune: string | null;
  district: string;
  member: Exclude<MemberOption, "All"> | string;
  link: string | null;
  image_url: string | null;
  created_at: string;
};

export const formatEventSchedule = (eventDate: string, eventTime: string) => {
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

export const sortEvents = (events: EventRecord[]) => {
  return [...events].sort((a, b) => {
    const scheduleA = new Date(`${a.event_date}T${a.event_time}`).getTime();
    const scheduleB = new Date(`${b.event_date}T${b.event_time}`).getTime();
    const now = Date.now();
    const aUpcoming = scheduleA >= now;
    const bUpcoming = scheduleB >= now;

    if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
    if (aUpcoming && bUpcoming) return scheduleA - scheduleB;

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};
