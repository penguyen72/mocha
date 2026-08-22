import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

describe("Accordion", () => {
  it("keeps only one item open at a time", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger>Question A</AccordionTrigger>
          <AccordionContent>Answer A</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>Question B</AccordionTrigger>
          <AccordionContent>Answer B</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Question A" }));
    expect(screen.getByText("Answer A")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Question B" }));
    expect(screen.getByText("Answer B")).toBeInTheDocument();
    expect(screen.queryByText("Answer A")).not.toBeInTheDocument();
  });
});
