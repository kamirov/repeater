import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { PracticeCard } from "@/components/PracticeCard";

const baseProps = {
  delaySeconds: 5,
  comboDelaySeconds: 8,
  eligibleMoveCount: 2,
  isRunning: false,
  isSpeechSupported: true,
  onDelayChange: vi.fn(),
  onComboDelayChange: vi.fn(),
  onStart: vi.fn(),
  onStop: vi.fn(),
};

describe("PracticeCard", () => {
  it("disables practice with an explanation when there are no named moves", () => {
    render(<PracticeCard {...baseProps} eligibleMoveCount={0} />);

    expect(screen.getByRole("button", { name: "Start practice" })).toBeDisabled();
    expect(screen.getByTitle(/name at least one move/i)).toBeVisible();
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

    const delay = screen.getByLabelText("Move period in seconds");
    await user.clear(delay);
    await user.type(delay, "8");
    expect(onDelayChange).toHaveBeenLastCalledWith(8);
    const comboDelay = screen.getByLabelText("Combo period in seconds");
    await user.clear(comboDelay);
    await user.type(comboDelay, "12");
    expect(baseProps.onComboDelayChange).toHaveBeenLastCalledWith(12);
    await user.click(screen.getByRole("button", { name: "Start practice" }));
    expect(onStart).toHaveBeenCalled();
  });

  it("shows the pause control while practice is running", async () => {
    const user = userEvent.setup();
    const onStop = vi.fn();
    render(
      <PracticeCard
        {...baseProps}
        isRunning
        onStop={onStop}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Stop practice" }));
    expect(onStop).toHaveBeenCalled();
  });
});
