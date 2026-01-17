import { useEffect, useState } from "react";
import logo from "../assets/images/logo.png";

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number;
}

export default function SplashScreen({
  onFinish,
  duration = 3000,
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 500);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ pointerEvents: isVisible ? "auto" : "none" }}
    >
      <div className="animate-bounce-in">
        <img
          src={logo}
          alt="MediPraxis Logo"
          className="h-32 w-auto animate-pulse"
          style={{
            animation:
              "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite, fadeIn 0.8s ease-out",
          }}
        />
      </div>
    </div>
  );
}
