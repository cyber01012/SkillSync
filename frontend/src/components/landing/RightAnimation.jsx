import { useState, useEffect } from "react";
import Lottie from "lottie-react";

export const RightAnimation = () => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch("/animations/vector.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch(err => console.error("Failed to load animation:", err));
  }, []);

  if (!animationData) {
    return (
      <div className="hidden md:flex flex-1 justify-center items-center">
        <div className="w-full max-w-xl aspect-square" />
      </div>
    );
  }

  // Handle potential CJS/ESM interop issues with lottie-react
  const LottieComponent = (Lottie && Lottie.default) || Lottie;

  if (typeof LottieComponent !== 'function' && typeof LottieComponent !== 'object') {
     return <div className="hidden md:flex flex-1 justify-center items-center">Animation Component Error</div>;
  }

  return (
    <div className="hidden md:flex flex-1 justify-center items-center">
      <div className="w-full max-w-xl aspect-square translate-x-9" style={{ transform: 'translateY(-13px)' }}>
        <LottieComponent
          animationData={animationData}
          loop={true}
          autoplay={true}
        />
      </div>
    </div>
  );
};
