import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "@jest/globals";

// Dummy component for testing
function DummyComponent() {
  return <div data-testid="dummy">Hello, World!</div>;
}

describe("DummyComponent", () => {
  it("renders hello world message", () => {
    render(<DummyComponent />);
    const element = screen.getByTestId("dummy");
    expect(element).toBeTruthy();
    expect(element.textContent).toBe("Hello, World!");
  });

  it("performs basic math", () => {
    expect(2 + 2).toBe(4);
  });
});
