"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from "@mocha/ui";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  ADDRESS_BACK_LABEL,
  ADDRESS_CLOSING_LINE_1,
  ADDRESS_CLOSING_LINE_2,
  ADDRESS_EMAIL_LABEL,
  ADDRESS_EMAIL_OPTIONAL_TAG,
  ADDRESS_FIELD_HELP,
  ADDRESS_FIELD_LABEL,
  ADDRESS_FORM_HEADING,
  ADDRESS_NAME_LABEL,
  ADDRESS_SENDING_LABEL,
  ADDRESS_SUBMIT_ERROR,
  ADDRESS_SUBMIT_LABEL,
  ADDRESS_SUCCESS_BACK_LABEL,
  ADDRESS_SUCCESS_BODY,
  ADDRESS_SUCCESS_HEADING,
  INVITATION_HREF,
} from "./address-content";
import { addressFormSchema, type AddressFormValues } from "./address-schema";
import { submitAddress } from "./address-submit";

type AddressStatus = "idle" | "sending" | "success" | "error";

const DEFAULT_VALUES: AddressFormValues = { name: "", email: "", address: "" };

const LABEL = "font-serif text-[15px] font-normal normal-case tracking-normal text-std-label";

const FIELD =
  "h-auto min-h-11 w-full rounded-lg border-[1.5px] border-std-field-border bg-surface " +
  "px-3 py-2.5 font-serif text-base text-std-field-ink " +
  "aria-[invalid=true]:border-std-field-border-error " +
  "focus-visible:ring-0 focus-visible:[box-shadow:0_0_0_3px_var(--std-focus-glow)]";

const MESSAGE = "font-serif text-[14px] leading-[1.4] text-std-error-ink";

const BACK_LINK =
  "inline-flex min-h-11 items-center bg-std-cta-fill px-3 py-1.5 font-serif " +
  "text-[19px] text-std-cta-ink underline " +
  "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-std-focus-ring";

export function AddressForm() {
  const [status, setStatus] = useState<AddressStatus>("idle");
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const sending = status === "sending";
  const succeeded = status === "success";

  async function onSubmit(values: AddressFormValues) {
    setStatus("sending");
    try {
      await submitAddress(values);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <div className="w-full rounded-xl border-2 border-border bg-surface px-[22px] py-6">
        {succeeded ? (
          <div
            role="status"
            className="flex flex-col items-center gap-2.5 px-0 pb-1 pt-2.5 text-center"
          >
            <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden>
              <circle cx="26" cy="26" r="24" fill="none" className="stroke-std-check-ring" strokeWidth="2" />
              <path
                d="M16 27 L23 34 L37 19"
                fill="none"
                className="stroke-std-check-stroke"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="m-0 font-script text-[40px] font-normal text-std-heading-ink">
              {ADDRESS_SUCCESS_HEADING}
            </h2>
            <p className="m-0 text-pretty font-serif text-base leading-[1.55] text-std-field-ink">
              {ADDRESS_SUCCESS_BODY}
            </p>
            <Link
              href={INVITATION_HREF}
              className="mt-2 inline-flex min-h-11 items-center bg-std-cta-fill px-4 py-2 font-serif text-base text-std-cta-ink underline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-std-focus-ring"
            >
              {ADDRESS_SUCCESS_BACK_LABEL}
            </Link>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-[18px]">
              <h2 className="m-0 mb-0.5 font-serif text-[23px] font-normal text-std-form-heading">
                {ADDRESS_FORM_HEADING}
              </h2>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="gap-1.5">
                    <FormLabel className={LABEL}>{ADDRESS_NAME_LABEL}</FormLabel>
                    <FormControl>
                      <Input type="text" autoComplete="name" className={FIELD} {...field} />
                    </FormControl>
                    <FormMessage className={MESSAGE} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="gap-1.5">
                    <FormLabel className={`${LABEL} flex items-baseline gap-1.5`}>
                      {ADDRESS_EMAIL_LABEL}
                      <span className="text-[13px] text-std-help-ink">
                        {ADDRESS_EMAIL_OPTIONAL_TAG}
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        className={FIELD}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={MESSAGE} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="gap-1.5">
                    <FormLabel className={LABEL}>{ADDRESS_FIELD_LABEL}</FormLabel>
                    <FormDescription className="font-serif text-[13.5px] leading-[1.45] text-std-help-ink">
                      {ADDRESS_FIELD_HELP}
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        rows={4}
                        autoComplete="street-address"
                        className={`${FIELD} min-h-[104px] resize-y leading-[1.45]`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={MESSAGE} />
                  </FormItem>
                )}
              />

              {status === "error" && (
                <p
                  role="alert"
                  className="m-0 rounded-lg bg-std-alert-fill px-3 py-2.5 font-serif text-[14.5px] leading-[1.45] text-std-alert-ink"
                >
                  {ADDRESS_SUBMIT_ERROR}
                </p>
              )}

              <Button
                type="submit"
                disabled={sending}
                aria-disabled={sending}
                className="mt-1.5 h-auto min-h-[46px] w-full rounded-full bg-std-submit-fill font-serif text-[15px] font-normal normal-case tracking-[0.12em] text-std-submit-ink uppercase hover:bg-std-submit-fill-hover hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-std-focus-ring"
              >
                {sending ? ADDRESS_SENDING_LABEL : ADDRESS_SUBMIT_LABEL}
              </Button>
            </form>
          </Form>
        )}
      </div>

      <div className="flex w-full flex-wrap items-center justify-between gap-4">
        <Link href={INVITATION_HREF} className={BACK_LINK}>
          {ADDRESS_BACK_LABEL}
        </Link>
        {!succeeded && (
          <p className="m-0 text-right font-script text-[26px] leading-[1.15] text-std-heading-ink">
            <span className="block">{ADDRESS_CLOSING_LINE_1}</span>
            <span className="block">{ADDRESS_CLOSING_LINE_2}</span>
          </p>
        )}
      </div>
    </>
  );
}
