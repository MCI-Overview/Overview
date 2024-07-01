/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { CandidateUser, CommonCandidate } from "../types/common";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "./userContextProvider";

type Step = {
  label: string;
  icon: JSX.Element;
  content: JSX.Element;
};

type AugmentedCandidate = CommonCandidate & {
  nricFront: File | null;
  nricBack: File | null;
  bankStatement: File | null;
  address: {
    isLanded: boolean;
  };
  bankDetails: {
    bankName: string;
    bankHolderName: string;
    bankNumber: string;
  };
  emergencyContact: {
    name: string;
    contact: string;
    relationship: string;
  };
};

const OnboardingContext = createContext<{
  oldCandidate: AugmentedCandidate | null;
  newCandidate: AugmentedCandidate | null;
  currentStepNumber: number;
  steps: Step[];
  setOldCandidate: (candidate: AugmentedCandidate) => void;
  setNewCandidate: (candidate: AugmentedCandidate) => void;
  setSteps: (maxSteps: Step[]) => void;
  handleBack: () => void;
  handleNext: () => void;
}>({
  oldCandidate: null,
  newCandidate: null,
  currentStepNumber: 0,
  steps: [],
  setOldCandidate: () => {},
  setNewCandidate: () => {},
  setSteps: () => {},
  handleBack: () => {},
  handleNext: () => {},
});

export function OnboardingContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUserContext();
  const [currentStepNumber, setCurrentStepNumber] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);

  const {
    address: userAddress,
    bankDetails,
    emergencyContact,
    ...rest
  } = user as CandidateUser;

  const [oldCandidate, setOldCandidate] = useState<AugmentedCandidate | null>({
    ...rest,
    nricFront: null,
    nricBack: null,
    bankStatement: null,
    address: {
      block: userAddress?.block || "",
      building: userAddress?.building || "",
      street: userAddress?.street || "",
      country: userAddress?.country || "",
      postal: userAddress?.postal || "",
      floor: userAddress?.floor || "",
      unit: userAddress?.unit || "",
      isLanded: !(userAddress?.unit || userAddress?.floor) || false,
    },
    bankDetails: {
      bankName: bankDetails?.bankName || "",
      bankHolderName: bankDetails?.bankHolderName || "",
      bankNumber: bankDetails?.bankNumber || "",
    },
    emergencyContact: {
      name: emergencyContact?.name || "",
      contact: emergencyContact?.contact || "",
      relationship: emergencyContact?.relationship || "",
    },
  });
  const [newCandidate, setNewCandidate] = useState<AugmentedCandidate | null>(
    oldCandidate
  );

  const navigate = useNavigate();

  const handleBack = () => {
    setCurrentStepNumber(Math.max(0, currentStepNumber - 1));
  };

  const handleNext = () => {
    if (currentStepNumber === steps.length - 1) {
      navigate("/user/home");
    } else {
      setCurrentStepNumber(currentStepNumber + 1);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        oldCandidate,
        newCandidate,
        steps,
        currentStepNumber,
        setOldCandidate,
        setNewCandidate,
        setSteps,
        handleBack,
        handleNext,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingContext() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error(
      "useOnboardingContext must be used within a OnboardingContextProvider"
    );
  }
  return context;
}
