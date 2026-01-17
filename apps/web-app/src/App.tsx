import { RouterProvider, createRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "./App.css";
import "./components/forms/form.css";
import SplashScreen from "./components/SplashScreen";

// Import the generated route tree
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

// tanstack client query
const queryClient = new QueryClient();

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [hasShownSplash, setHasShownSplash] = useState(false);

  useEffect(() => {
    const splashShown = sessionStorage.getItem("splashShown");
    if (splashShown) {
      setShowSplash(false);
      setHasShownSplash(true);
    }
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
    setHasShownSplash(true);
    sessionStorage.setItem("splashShown", "true");
  };

  return (
    <QueryClientProvider client={queryClient}>
      {showSplash && !hasShownSplash && (
        <SplashScreen onFinish={handleSplashFinish} duration={3000} />
      )}
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
