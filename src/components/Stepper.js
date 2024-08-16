import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';

// Example images for each step (replace these URLs with your own images)
import image1 from '.././assets/image1.png';
const stepImages = [
  image1,
  'https://via.placeholder.com/600x400?text=Step+2+Image',
  'https://via.placeholder.com/600x400?text=Step+3+Image',
  'https://via.placeholder.com/600x400?text=Step+4+Image',
  'https://via.placeholder.com/600x400?text=Step+5+Image',
];

const steps = [
  {
    label: 'Select campaign settings',
    description: `For each ad campaign that you create, you can control how much
              you're willing to spend on clicks and conversions, which networks
              and geographical locations you want your ads to show on, and more.`,
  },
  {
    label: 'Create an ad group',
    description:
      'An ad group contains one or more ads which target a shared set of keywords.',
  },
  {
    label: 'Create an ad',
    description: `Try out different ad text to see what brings in the most customers,
              and learn how to enhance your ads using features like ad extensions.
              If you run into any problems with your ads, find out how to tell if
              they're running and how to resolve approval issues.`,
  },
  {
    label: 'Create an ad',
    description: `Try out different ad text to see what brings in the most customers,
              and learn how to enhance your ads using features like ad extensions.
              If you run into any problems with your ads, find out how to tell if
              they're running and how to resolve approval issues.`,
  },
  {
    label: 'Finish',
    description: `finish.`,
  },
];

export default function VerticalLinearStepper() {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate('/pdf-options')
  };

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100vh' }}>
      {/* Left column: Stepper */}
      <Box sx={{ width: '25%', p: 3, backgroundColor: '#f5f5f5' }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                optional={
                  index === steps.length - 1 ? (
                    <Typography variant="caption">Last step</Typography>
                  ) : null
                }
              >
                {step.label}
              </StepLabel>
              <StepContent>
                <Typography>{step.description}</Typography>
                <Box sx={{ mb: 2 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      {index === steps.length - 1 ? 'Finish' : 'Continue'}
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Back
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length && (
          <Paper square elevation={0} sx={{ p: 3 }}>
            <Typography>All steps completed - you're finished</Typography>
            <Button onClick={handleRedirect} sx={{ mt: 1, mr: 1 }}>
              go To Pdf option
            </Button>
          </Paper>
        )}
      </Box>

      {/* Right column: Content */}
      <Box sx={{ width: '75%', p: 3, display: 'flex', flexDirection:'column' , alignItems: 'center', justifyContent: 'center' }}>
        <img src={stepImages[activeStep]} alt={`Step ${activeStep + 1}`} style={{ maxWidth: '100%', maxHeight: '100%' }} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {steps[activeStep]?.description}
        </Typography>
      </Box>
    </Box>
  );
}
