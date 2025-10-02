import React, { useState } from "react";
import StudentRegistrationForm from "./StudentRegistrationForm";
import CourseSelectionForm from "./CourseSelectionForm";
import AddPaymentForm from "./AddPaymentForm";

const MultiStepRegistration = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const next = (data) => {
    setFormData(prevData => ({ ...prevData, ...data }));
    setStep(prev => prev + 1);
  };

  const prev = () => {
    setStep(currentStep => Math.max(1, currentStep - 1));
  };

  return (
    <div>
      {step === 1 && <StudentRegistrationForm next={next} />}
      {step === 2 && <CourseSelectionForm prev={prev} next={next} formData={formData} />}
      {step === 3 && <AddPaymentForm prev={prev} formData={formData} />}
    </div>
  );
};

export default MultiStepRegistration;
