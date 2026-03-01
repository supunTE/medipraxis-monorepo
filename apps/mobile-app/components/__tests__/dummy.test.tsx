import { render, screen } from "@testing-library/react-native";
import { Text, View } from "react-native";

// Dummy component for testing
function DummyComponent() {
  return (
    <View testID="dummy-view">
      <Text testID="dummy-text">Hello, Mobile!</Text>
    </View>
  );
}

describe("Mobile App Dummy Test", () => {
  it("renders dummy component", () => {
    render(<DummyComponent />);
    const element = screen.getByTestId("dummy-text");
    expect(element).toBeTruthy();
    expect(element.props.children).toBe("Hello, Mobile!");
  });

  it("performs basic math", () => {
    expect(5 * 5).toBe(25);
  });

  it("validates string operations", () => {
    const message = "React Native Testing";
    expect(message).toContain("Native");
  });
});
