import React, { useEffect, useState } from "react";

const CubeAnimator = ({ steps }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (steps.length === 0) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [steps]);

  return (
    <div>
      <h3>Solving Steps</h3>
      <ul>
        {steps.map((step, index) => (
          <li key={index} style={{ fontWeight: index === currentStep ? "bold" : "normal" }}>
            {step}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CubeAnimator;
