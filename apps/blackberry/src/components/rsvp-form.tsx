"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@mocha/ui";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  EVENT_OPTIONS,
  GUEST_COUNT_OPTIONS,
  LODGING_OPTIONS,
  MEAL_OPTIONS,
  rsvpFormSchema,
  type RsvpFormValues,
} from "./rsvp-schema";

const DEFAULT_VALUES = {
  fullName: "",
  email: "",
  attending: undefined,
  guestCount: undefined,
  events: [],
  mealPreference: undefined,
  dietaryRestrictions: "",
  lodgingPreference: undefined,
  songRequest: "",
  message: "",
} satisfies Partial<RsvpFormValues>;

export function RsvpForm() {
  const [submitted, setSubmitted] = useState<"yes" | "no" | null>(null);
  const form = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const attending = useWatch({ control: form.control, name: "attending" });

  if (submitted) {
    return (
      <div className="rounded-2xl bg-surface p-10 text-center">
        <p className="font-script text-4xl text-primary">Thank you!</p>
        <p className="mt-4 text-sm text-foreground">We&apos;ve got your RSVP.</p>
        <p className="mt-2 text-sm text-muted">
          {submitted === "yes"
            ? "We can't wait to celebrate with you!"
            : "We'll miss you — thank you for letting us know."}
        </p>
        <Button type="button" variant="outline" className="mt-8" onClick={() => setSubmitted(null)}>
          Edit response
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => setSubmitted(values.attending))}
        noValidate
        className="flex flex-col gap-6 rounded-2xl bg-surface p-10"
      >
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-bb-clay">Full name(s)</FormLabel>
              <FormControl>
                <Input placeholder="Jordan & Alex Rivera" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-bb-clay">Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="attending"
          render={({ field }) => (
            <FormItem>
              <FormLabel id="attending-label" className="text-bb-clay">
                Will you be attending?
              </FormLabel>
              <FormControl>
                <RadioGroup
                  aria-labelledby="attending-label"
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <RadioGroupItem value="yes">Joyfully accepts</RadioGroupItem>
                  <RadioGroupItem value="no">Regretfully declines</RadioGroupItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {attending === "yes" && (
          <>
            <FormField
              control={form.control}
              name="guestCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel id="guest-count-label" className="text-bb-clay">
                    Number of guests
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger aria-labelledby="guest-count-label">
                        <SelectValue placeholder="Select a number" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GUEST_COUNT_OPTIONS.map((option) => (
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
              name="events"
              render={({ field }) => (
                <FormItem>
                  <FormLabel id="events-label" className="text-bb-clay">
                    Which events will you join?
                  </FormLabel>
                  <div role="group" aria-labelledby="events-label" className="flex flex-col gap-3">
                    {EVENT_OPTIONS.map((option) => {
                      const checked = field.value?.includes(option) ?? false;
                      return (
                        <label key={option} className="flex items-center gap-3 text-sm text-foreground">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(next) => {
                              const current = field.value ?? [];
                              field.onChange(
                                next === true
                                  ? [...current, option]
                                  : current.filter((item) => item !== option),
                              );
                            }}
                          />
                          {option}
                        </label>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mealPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel id="meal-preference-label" className="text-bb-clay">
                    Meal preference
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      aria-labelledby="meal-preference-label"
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      {MEAL_OPTIONS.map((option) => (
                        <RadioGroupItem key={option} value={option}>
                          {option}
                        </RadioGroupItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dietaryRestrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-bb-clay">Dietary restrictions or allergies</FormLabel>
                  <FormControl>
                    <Input placeholder="Nut allergy, gluten-free, none…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lodgingPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel id="lodging-preference-label" className="text-bb-clay">
                    Lodging preference
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      aria-labelledby="lodging-preference-label"
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      {LODGING_OPTIONS.map((option) => (
                        <RadioGroupItem key={option.value} value={option.value}>
                          {option.label}
                        </RadioGroupItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="songRequest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-bb-clay">Song request</FormLabel>
                  <FormControl>
                    <Input placeholder="Artist – Song" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-bb-clay">A note for the couple (optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Can't wait to celebrate with you both!" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="self-start">
          Send RSVP
        </Button>
      </form>
    </Form>
  );
}
