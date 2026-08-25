import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { PracticeCard } from "@/components/PracticeCard";

const baseProps = {
  delaySeconds: 5,
  eligibleMoveCount: 2,
  isRunning: false,
  currentMove: null,
  countdownSeconds: null,
  isSpeechSupported: true,
  onDelayChange: vi.fn(),
  onStart: vi.fn(),
  onStop: vi.fn(),
};

describe("PracticeCard", () => {
  it("disables practice with an explanation when there are no named moves", () => {
    render(<PracticeCard {...baseProps} eligibleMoveCount={0} />);

    expect(screen.getByRole("button", { name: "Start practice" })).toBeDisabled();
    expect(screen.getByText(/name at least one move/i)).toBeVisible();
  });

  it("updates the delay and starts practice", async () => {
    const user = userEvent.setup();
    const onDelayChange = vi.fn();
    const onStart = vi.fn();
    function Harness() {
      const [delaySeconds, setDelaySeconds] = useState(5);
      return (
        <PracticeCard
          {...baseProps}
          delaySeconds={delaySeconds}
          onDelayChange={(value) => {
            setDelaySeconds(value);
            onDelayChange(value);
          }}
          onStart={onStart}
        />
      );
    }
    render(<Harness />);

    const delay = screen.getByLabelText("Delay between moves");
    await user.clear(delay);
    await user.type(delay, "8");
    expect(onDelayChange).toHaveBeenLastCalledWith(8);
    await user.click(screen.getByRole("button", { name: "Start practice" }));
    expect(onStart).toHaveBeenCalled();
  });

  it("shows the active move, countdown, and stop control", async () => {
    const user = userEvent.setup();
    const onStop = vi.fn();
    render(
      <PracticeCard
        {...baseProps}
        isRunning
        currentMove={{
          id: "move-1",
          name: "Inside turn",
          description: "",
          referenceUrl: "",
        }}
        countdownSeconds={3}
        onStop={onStop}
      />,
    );

    expect(screen.getByText("Inside turn")).toBeVisible();
    expect(screen.getByText(/next move in 3 seconds/i)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Stop practice" }));
    expect(onStop).toHaveBeenCalled();
  });
});
