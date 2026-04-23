import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, SearchX } from "lucide-react";

import { EventCard } from "@/components/events/EventCard";
import { EventFormDialog, type EventFormValues } from "@/components/events/EventFormDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MEMBER_OPTIONS, sortEvents, type EventRecord } from "@/lib/events";

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
  const [open, setOpen] = useState(false);

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
        event_date: values.event_date,
        event_time: values.event_time,
        specific_address: values.specific_address,
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

  const filteredEvents = useMemo(() => {
    if (selectedMember === "All") return events;
    return events.filter((event) => event.member === selectedMember);
  }, [events, selectedMember]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-surface-1/90">
        <div className="container py-10 md:py-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">Vietnam fan event tracker</p>
              <div className="space-y-3">
                <h1 className="text-4xl leading-none md:text-6xl">EXO Fan Events</h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                  A minimal board for collecting EXO fan events across Vietnam fanpages, with fast browsing and instant image-backed entries.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="min-w-[220px]">
                <Select value={selectedMember} onValueChange={(value) => setSelectedMember(value as (typeof MEMBER_OPTIONS)[number])}>
                  <SelectTrigger className="bg-surface-2">
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
              <Button variant="hero" size="lg" onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-8 md:py-10">
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
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      <EventFormDialog
        open={open}
        onOpenChange={setOpen}
        isSubmitting={createEventMutation.isPending}
        onSubmit={async (values, imageFile) => {
          await createEventMutation.mutateAsync({ values, imageFile });
        }}
      />
    </main>
  );
};

export default Index;
