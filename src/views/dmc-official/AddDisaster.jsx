import React, { useState } from 'react';
import {
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  RadioGroup,
  Radio,
  Typography,
} from '@mui/material';
import * as Select from '@radix-ui/react-select';

// Helper function to get current date and time
function getCurrentDateTime() {
  const now = new Date();
  return now.toISOString().slice(0, 16);
}

// Stepper Form Component
function DisasterStepperForm() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Step 1: Disaster Incident Report
    commencedDateTime: '',
    reportedDateTime: getCurrentDateTime(),
    province: '',
    district: '',
    division: '',
    disasterType: '',
    preciseLocation: '',
    affectedFamilies: '',
    affectedPeople: '',
    deaths: '',
    injured: '',
    missing: '',
    fullyDamagedHouses: '',
    partiallyDamagedHouses: '',
    enterpriseDamages: '',
    infrastructureDamages: '',
    safeLocations: '',
    familiesInSafeLocations: '',
    peopleInSafeLocations: '',
    remarks: '',

    // Step 2: Disaster Resource Request Form
    requestType: '',
    requestLocation: '',
    requestDate: getCurrentDateTime(),
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    resources: {
      food: false,
      medical: false,
      shelter: false,
      blankets: false,
      sanitation: false,
      searchRescue: false,
      communication: false,
      vehicles: false,
      generators: false,
    },
    additionalNotes: '',

    // Step 3: Volunteer Requirements Form
    volunteersNeeded: false,
    numberOfVolunteers: '',
    urgencyLevel: '',
    requiredSkills: {
      medical: false,
      construction: false,
      searchRescue: false,
      logistics: false,
      communication: false,
      engineering: false,
      foodPreparation: false,
      psychosocialSupport: false,
      languageTranslation: false,
      transportation: false,
    },
    volunteerNotes: '',
  });

  const steps = [
    'Disaster Incident Report',
    'Disaster Resource Request',
    'Volunteer Requirements',
    'Review & Submit',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (section, field) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: !prev[section][field] },
    }));
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  // Step Content Renderer
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField label="Disaster Type" name="disasterType" value={formData.disasterType} onChange={handleChange} fullWidth margin="normal" />
            <TextField type="datetime-local" label="Commenced Date" name="commencedDateTime" value={formData.commencedDateTime} onChange={handleChange} fullWidth margin="normal" />
            <TextField type="datetime-local" label="Reported Date" name="reportedDateTime" value={formData.reportedDateTime} onChange={handleChange} fullWidth margin="normal" />
            <TextField label="District" name="district" value={formData.district} onChange={handleChange} fullWidth margin="normal" />
            <TextField label="Division" name="division" value={formData.division} onChange={handleChange} fullWidth margin="normal" />
            <TextField label="Affected People" type="number" name="affectedPeople" value={formData.affectedPeople} onChange={handleChange} fullWidth margin="normal" />
          </>
        );
      case 1:
        return (
          <>
            <TextField label="Request Type" name="requestType" value={formData.requestType} onChange={handleChange} fullWidth margin="normal" />
            <FormControlLabel control={<Checkbox checked={formData.resources.medical} onChange={() => handleCheckboxChange('resources', 'medical')} />} label="Medical" />
            <FormControlLabel control={<Checkbox checked={formData.resources.shelter} onChange={() => handleCheckboxChange('resources', 'shelter')} />} label="Shelter" />
          </>
        );
      case 2:
        return (
          <>
            <FormControlLabel control={<Checkbox checked={formData.volunteersNeeded} onChange={(e) => setFormData({ ...formData, volunteersNeeded: e.target.checked })} />} label="Volunteers Needed" />
            <RadioGroup value={formData.urgencyLevel} onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}>
              <FormControlLabel value="Low" control={<Radio />} label="Low" />
              <FormControlLabel value="Medium" control={<Radio />} label="Medium" />
              <FormControlLabel value="High" control={<Radio />} label="High" />
            </RadioGroup>
          </>
        );
      case 3:
        return (
          <div>
            <Typography variant="h6">Review Information</Typography>
            {Object.entries(formData).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
              </p>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <form>
          {renderStepContent(activeStep)}
          <div style={{ marginTop: 20 }}>
            {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" color="primary" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button variant="contained" color="primary">Submit</Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default DisasterStepperForm;
