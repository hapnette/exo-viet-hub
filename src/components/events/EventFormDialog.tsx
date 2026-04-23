import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EVENT_TYPE_OPTIONS, MEMBER_OPTIONS, type EventRecord } from "@/lib/events";

const eventSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Keep it under 120 characters"),
  fanpage: z.string().trim().min(1, "Fanpage is required").max(120, "Keep it under 120 characters"),
  type: z.string().trim().min(1, "Type is required"),
  start_date: z.string().trim().min(1, "Start date is required"),
  start_time: z.string().trim().min(1, "Start time is required"),
  end_date: z.string().trim().min(1, "End date is required"),
  end_time: z.string().trim().min(1, "End time is required"),
  detailed_address: z.string().trim().min(1, "Detailed address is required").max(200, "Keep it under 200 characters"),
  ward_commune: z.string().trim().max(100, "Keep it under 100 characters").optional().or(z.literal("")),
  district: z.string().trim().min(1, "District is required").max(100, "Keep it under 100 characters"),
  member: z.string().trim().min(1, "Member is required"),
  link: z
    .string()
    .trim()
    .max(300, "Keep it under 300 characters")
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || /^https?:\/\//i.test(value), "Use a full http(s) link"),
}).refine((value) => {
  const start = new Date(`${value.start_date}T${value.start_time}`);
  const end = new Date(`${value.end_date}T${value.end_time}`);
  return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end.getTime() >= start.getTime();
}, {
  message: "End date and time must be after the start date and time",
  path: ["end_time"],
});

export type EventFormValues = z.infer<typeof eventSchema>;

type EventFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: EventFormValues, imageFile?: File) => Promise<void>;
  isSubmitting: boolean;
  mode?: "create" | "edit";
  initialEvent?: EventRecord | null;
};

const defaultValues: EventFormValues = {
  name: "",
  fanpage: "",
  type: "",
  start_date: "",
  start_time: "",
  end_date: "",
  end_time: "",
  detailed_address: "",
  ward_commune: "",
  district: "",
  member: "",
  link: "",
};

export const EventFormDialog = ({ open, onOpenChange, onSubmit, isSubmitting, mode = "create", initialEvent = null }: EventFormDialogProps) => {
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  useEffect(() => {
    if (open && initialEvent) {
      form.reset({
        name: initialEvent.name,
        fanpage: initialEvent.fanpage,
        type: initialEvent.type,
        start_date: initialEvent.start_date,
        start_time: initialEvent.start_time.slice(0, 5),
        end_date: initialEvent.end_date,
        end_time: initialEvent.end_time.slice(0, 5),
        detailed_address: initialEvent.detailed_address,
        ward_commune: initialEvent.ward_commune ?? "",
        district: initialEvent.district,
        member: initialEvent.member,
        link: initialEvent.link ?? "",
      });
      setImageFile(undefined);
      setPreviewUrl(initialEvent.image_url ?? null);
      return;
    }

    if (!open) {
      form.reset(defaultValues);
      setImageFile(undefined);
      setPreviewUrl(null);
    }
  }, [form, initialEvent, open]);

  const submitLabel = useMemo(() => {
    if (isSubmitting) return mode === "edit" ? "Saving changes..." : "Saving event...";
    return mode === "edit" ? "Save changes" : "Save event";
  }, [isSubmitting, mode]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values, imageFile);
    form.reset(defaultValues);
    setImageFile(undefined);
    setPreviewUrl(null);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1rem)] overflow-y-auto border-border bg-popover p-0 text-popover-foreground sm:max-w-3xl">
        <div className="border-b border-border px-4 py-4 sm:px-6 sm:py-5">
          <DialogHeader>
              <DialogTitle className="text-title">{mode === "edit" ? "Edit Event" : "Create Event"}</DialogTitle>
            <DialogDescription>{mode === "edit" ? "Update the event details and artwork." : "Add a fan event from any Vietnam fanpage."}</DialogDescription>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Birthday support event" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fanpage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fanpage</FormLabel>
                    <FormControl>
                      <Input placeholder="EXO-L Vietnam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EVENT_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="member"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MEMBER_OPTIONS.filter((item) => item !== "All").map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quận/Huyện</FormLabel>
                    <FormControl>
                      <Input placeholder="District 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ward_commune"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phường/Xã</FormLabel>
                    <FormControl>
                      <Input placeholder="Ward 6" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
                name="detailed_address"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Detailed address</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Cafe name, street, building..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link</FormLabel>
                  <FormControl>
                    <Input placeholder="https://facebook.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Image upload</FormLabel>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border bg-surface-2 px-4 py-6 text-center transition-colors hover:border-primary/50 hover:bg-surface-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface-1 text-primary">
                  <ImagePlus className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Upload event artwork</p>
                  <p className="text-xs text-muted-foreground">Optional. JPG, PNG, or WEBP from your device.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1.5 text-xs text-foreground">
                  <Upload className="h-3.5 w-3.5" />
                  Choose image
                </div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(event) => setImageFile(event.target.files?.[0])}
                />
              </label>
              {previewUrl ? (
                <div className="overflow-hidden rounded-md border border-border bg-surface-1">
                  <img src={previewUrl} alt="Selected event preview" className="h-48 w-full object-cover" />
                </div>
              ) : null}
            </div>

             <DialogFooter className="border-t border-border pt-5 sm:flex-row">
              <Button type="button" variant="editorial" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="hero" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
