import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAssessment } from '../../context/AssessmentContext';
import { Step1Symptoms } from '../../components/assessment/Step1Symptoms';
import { Step2Details } from '../../components/assessment/Step2Details';
import { Step3Safety } from '../../components/assessment/Step3Safety';
import { Step4HealthContext } from '../../components/assessment/Step4HealthContext';
import { Step5Review } from '../../components/assessment/Step5Review';

export const AssessmentPage: React.FC = () => {
  const location = useLocation();
  const { currentStep, setCurrentStep } = useAssessment();

  useEffect(() => {
    if (location.pathname.includes('step-2')) setCurrentStep(2);
    else if (location.pathname.includes('step-3')) setCurrentStep(3);
    else if (location.pathname.includes('step-4')) setCurrentStep(4);
    else if (location.pathname.includes('step-5')) setCurrentStep(5);
    else setCurrentStep(1);
  }, [location.pathname, setCurrentStep]);

  switch (currentStep) {
    case 1:
      return <Step1Symptoms />;
    case 2:
      return <Step2Details />;
    case 3:
      return <Step3Safety />;
    case 4:
      return <Step4HealthContext />;
    case 5:
      return <Step5Review />;
    default:
      return <Step1Symptoms />;
  }
};
