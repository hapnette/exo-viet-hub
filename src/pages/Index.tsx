import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, SearchX } from "lucide-react";

import { EventCard } from "@/components/events/EventCard";
import { EventDetailDialog } from "@/components/events/EventDetailDialog";
import { EventFormDialog, type EventFormValues } from "@/components/events/EventFormDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MEMBER_OPTIONS, sortEvents, type EventRecord } from "@/lib/events";
import headerImage from "@/assets/header-exhorizon.png";
import fallbackEventImage from "@/assets/event-fallback.jpg";

const bucketName = "event-images";

type EventInsertPayload = Omit<EventRecord, "id" | "created_at">;

const fetchEvents = async () => {
  const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false });

  if (error) throw error;

  return sortEvents((data ?? []) as EventRecord[]);
};

const uploadEventImage = async (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filePath = `${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(bucketName).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
};

const Index = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedMember, setSelectedMember] = useState<(typeof MEMBER_OPTIONS)[number]>("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);

  const { data: events = [], isLoading, isError, error } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const createEventMutation = useMutation({
    mutationFn: async ({ values, imageFile }: { values: EventFormValues; imageFile?: File }) => {
      let imageUrl: string | null = null;

      if (imageFile) {
        imageUrl = await uploadEventImage(imageFile);
      }

      const payload: EventInsertPayload = {
        name: values.name,
        fanpage: values.fanpage,
        type: values.type,
        start_date: values.start_date,
        start_time: values.start_time,
        end_date: values.end_date,
        end_time: values.end_time,
        detailed_address: values.detailed_address,
        district: values.district,
        member: values.member,
        ward_commune: values.ward_commune?.trim() || null,
        link: values.link?.trim() || null,
        image_url: imageUrl,
      };

      const { error: insertError } = await supabase.from("events").insert([payload]);

      if (insertError) throw insertError;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      setOpen(false);
      toast({
        title: "Event added",
        description: "Your fan event is now visible in the dashboard.",
      });
    },
    onError: (mutationError: Error) => {
      toast({
        variant: "destructive",
        title: "Could not save event",
        description: mutationError.message,
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ eventId, values, imageFile, existingImageUrl }: { eventId: string; values: EventFormValues; imageFile?: File; existingImageUrl?: string | null }) => {
      let imageUrl = existingImageUrl ?? null;

      if (imageFile) {
        imageUrl = await uploadEventImage(imageFile);
      }

      const payload: EventInsertPayload = {
        name: values.name,
        fanpage: values.fanpage,
        type: values.type,
        start_date: values.start_date,
        start_time: values.start_time,
        end_date: values.end_date,
        end_time: values.end_time,
        detailed_address: values.detailed_address,
        district: values.district,
        member: values.member,
        ward_commune: values.ward_commune?.trim() || null,
        link: values.link?.trim() || null,
        image_url: imageUrl,
      };

      const { error: updateError } = await supabase.from("events").update(payload).eq("id", eventId);

      if (updateError) throw updateError;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      setOpen(false);
      setEditingEvent(null);
      setSelectedEvent(null);
      toast({
        title: "Event updated",
        description: "Your event changes are now visible in the dashboard.",
      });
    },
    onError: (mutationError: Error) => {
      toast({
        variant: "destructive",
        title: "Could not update event",
        description: mutationError.message,
      });
    },
  });

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesMember = selectedMember === "All" || event.member === selectedMember;
      const matchesDistrict = selectedDistrict === "All" || event.district === selectedDistrict;
      return matchesMember && matchesDistrict;
    });
  }, [events, selectedDistrict, selectedMember]);

  const districtOptions = useMemo(() => {
    return ["All", ...Array.from(new Set(events.map((event) => event.district))).sort((a, b) => a.localeCompare(b))];
  }, [events]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-surface-1/90">
        <div className="container px-4 py-3 sm:px-6 sm:py-5 lg:py-10">
          <div className="overflow-hidden rounded-md border border-border bg-surface-2 shadow-soft">
            <div className="aspect-[21/9] min-h-[88px] sm:aspect-[16/9] sm:min-h-0 lg:aspect-[21/9]">
              <img src={headerImage} alt="EXhOrizon in Ho Chi Minh City header artwork" className="h-full w-full object-cover" />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">Vietnam fan event tracker</p>
              <div className="space-y-1.5">
                <h1 className="text-[1.75rem] leading-[1.02] sm:text-4xl md:text-5xl">EXhOrizon in HO CHI MINH CITY - Fan Events</h1>
                <p className="max-w-2xl text-sm leading-5 text-muted-foreground">
                  An archive of fan events for EXO specially crafted by EXO-L Vietnam
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,220px)_minmax(0,220px)_auto] lg:items-center">
              <div>
                <Select value={selectedMember} onValueChange={(value) => setSelectedMember(value as (typeof MEMBER_OPTIONS)[number])}>
                  <SelectTrigger className="min-h-11 bg-surface-2">
                    <SelectValue placeholder="Filter by member" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMBER_OPTIONS.map((member) => (
                      <SelectItem key={member} value={member}>
                        {member}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger className="min-h-11 bg-surface-2">
                    <SelectValue placeholder="Filter by quận/huyện" />
                  </SelectTrigger>
                  <SelectContent>
                    {districtOptions.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="hero" size="lg" className="min-h-11 w-full lg:w-auto" onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container px-4 py-5 sm:px-6 md:py-8">
        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-border bg-surface-2 text-muted-foreground shadow-soft">
            <div className="flex items-center gap-3 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading events...
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-destructive/40 bg-card p-8 text-sm text-muted-foreground shadow-soft">
            Failed to load events: {error instanceof Error ? error.message : "Unknown error"}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-lg border border-border bg-surface-2 px-6 text-center shadow-soft">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface-1 text-muted-foreground">
              <SearchX className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-title">No events yet</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Add the first EXO fan event or switch the member filter to browse existing entries.
              </p>
            </div>
            <Button variant="editorial" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                fallbackImage={fallbackEventImage}
                onClick={setSelectedEvent}
                onEdit={(eventToEdit) => {
                  setEditingEvent(eventToEdit);
                  setSelectedEvent(null);
                  setOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </section>

      <EventFormDialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) setEditingEvent(null);
        }}
        isSubmitting={createEventMutation.isPending || updateEventMutation.isPending}
        mode={editingEvent ? "edit" : "create"}
        initialEvent={editingEvent}
        onSubmit={async (values, imageFile) => {
          if (editingEvent) {
            await updateEventMutation.mutateAsync({
              eventId: editingEvent.id,
              values,
              imageFile,
              existingImageUrl: editingEvent.image_url,
            });
            return;
          }

          await createEventMutation.mutateAsync({ values, imageFile });
        }}
      />

      <EventDetailDialog
        open={Boolean(selectedEvent)}
        event={selectedEvent}
        fallbackImage={fallbackEventImage}
        onEdit={(eventToEdit) => {
          setEditingEvent(eventToEdit);
          setSelectedEvent(null);
          setOpen(true);
        }}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedEvent(null);
        }}
      />
    </main>
  );
};

export default Index;
