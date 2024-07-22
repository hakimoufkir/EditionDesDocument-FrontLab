import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Stepper.css';

const Stepper = () => {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    { title: 'Step 1', content: '1. Select Payment Type', description: 'This is step 1' },
    { title: 'Step 2', content: '2. Enter Payment Information', description: 'This is step 2' },
    { title: 'Step 3', content: '3. Review and Submit Payment', description: 'This is step 3' },
    { title: 'Step 4', content: '4. All done!', description: 'You have successfully completed all steps.' }
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prevStep => prevStep + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(prevStep => prevStep - 1);
    }
  };

  const handleSubmit = () => {
    // Navigate to PdfViewerComponent
    navigate('/pdf-options');
    // navigate('/pdf-viewer');
  };

  return (
    <div className="container">
      <div className="panel panel-default">
        <div className="panel-body">
          <div className="stepper">
            <ul className="nav nav-tabs" role="tablist">
              {steps.map((step, index) => (
                <li
                  key={index}
                  role="presentation"
                  className={index === activeStep ? 'active' : index < activeStep ? 'completed' : 'disabled'}
                >
                  <a href={`#stepper-step-${index + 1}`} role="tab" title={step.title}>
                    <span className="round-tab">{index + 1}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="tab-content">
              {steps.map((step, index) => (
                index === activeStep && (
                  <div
                    key={index}
                    role="tabpanel"
                    className={`tab-pane fade ${index === activeStep ? 'in active' : ''}`}
                    id={`stepper-step-${index + 1}`}
                  >
                    <h3 className="h2">{step.content}</h3>
                    <p>{step.description}</p>
                    <ul className="list-inline pull-right">
                      {index > 0 && (
                        <li>
                          <button className="btn btn-default prev-step" onClick={handlePrev}>
                            Back
                          </button>
                        </li>
                      )}
                      {index < steps.length - 1 && (
                        <li>
                          <button className="btn btn-primary next-step" onClick={handleNext}>
                            Next
                          </button>
                        </li>
                      )}
                      {index === steps.length - 1 && (
                        <li>
                          <button className="btn btn-primary" onClick={handleSubmit}>
                            Submit Payment
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stepper;
