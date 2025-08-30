import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Router } from "wouter";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SettingsProvider } from "../contexts/settings-context";

vi.mock("../components/workout/progress-chart", () => ({ default: () => <div /> }));
vi.mock("../components/pedometer/pedometer-card", () => ({ default: () => <div /> }));
vi.mock("../components/coach/Dock", () => ({ default: () => <div /> }));
vi.mock("../hooks/useLocalData", () => ({ useRecentSets: () => ({ data: [] }) }));
vi.mock("../components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock("../components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));
vi.mock("../components/ui/badge", () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}));

import Dashboard from "./dashboard";

function Wrapper() {
  const [location, setLocation] = useState("/");
  const hook = () => [location, setLocation] as const;
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <Router hook={hook}>
          <Dashboard />
          <div data-testid="location">{location}</div>
        </Router>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

describe("Dashboard navigation", () => {
  it("navigates to /workout when Start Workout is clicked", () => {
    render(<Wrapper />);
    const button = screen.getByRole("button", { name: /start workout/i });
    fireEvent.click(button);
    expect(screen.getByTestId("location").textContent).toBe("/workout");
  });
});

