import React from 'react';
import './ClaimResults.css';

const ClaimResults = ({ extractedData, isProcessing, error }) => {
  if (error) {
    return (
      <div className="claim-results">
        <div className="error-section">
          <h2>❌ Processing Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="claim-results">
        <div className="processing-section">
          <div className="spinner"></div>
          <h2>Processing Insurance Claim Form...</h2>
          <p>AI is extracting and analyzing the document data...</p>
        </div>
      </div>
    );
  }

  if (!extractedData) {
    return null;
  }

  const formatFieldValue = (value) => {
    if (!value || value.trim() === '') return 'Not provided';
    return value;
  };

  const renderSection = (title, fields, icon) => (
    <div className="data-section">
      <h3>
        <span className="section-icon">{icon}</span>
        {title}
      </h3>
      <div className="fields-grid">
        {Object.entries(fields).map(([key, value]) => (
          <div key={key} className="field-item">
            <label>{key}:</label>
            <span className={value && value.trim() !== '' ? 'has-value' : 'no-value'}>
              {formatFieldValue(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="claim-results">
      <div className="results-header">
        <h2>✅ Extracted Insurance Claim Data</h2>
        <p>AI has successfully processed your insurance claim form. Review the extracted information below.</p>
      </div>

      <div className="results-content">
        {/* Personal Information */}
        {renderSection('Personal Information', {
          'Full Name': extractedData.personalInfo?.fullName,
          'Date of Birth': extractedData.personalInfo?.dateOfBirth,
          'Address': extractedData.personalInfo?.address,
          'Phone Number': extractedData.personalInfo?.phoneNumber,
          'Email Address': extractedData.personalInfo?.email,
          'Policy Number': extractedData.personalInfo?.policyNumber
        }, '👤')}

        {/* Claim Information */}
        {renderSection('Claim Details', {
          'Claim Number': extractedData.claimInfo?.claimNumber,
          'Date of Incident': extractedData.claimInfo?.dateOfIncident,
          'Type of Claim': extractedData.claimInfo?.claimType,
          'Claim Amount': extractedData.claimInfo?.claimAmount,
          'Description': extractedData.claimInfo?.description
        }, '📋')}

        {/* Vehicle Information (if applicable) */}
        {extractedData.vehicleInfo && Object.values(extractedData.vehicleInfo).some(v => v) && 
          renderSection('Vehicle Information', {
            'Make': extractedData.vehicleInfo?.make,
            'Model': extractedData.vehicleInfo?.model,
            'Year': extractedData.vehicleInfo?.year,
            'License Plate': extractedData.vehicleInfo?.licensePlate,
            'VIN': extractedData.vehicleInfo?.vin
          }, '🚗')
        }

        {/* Medical Information (if applicable) */}
        {extractedData.medicalInfo && Object.values(extractedData.medicalInfo).some(v => v) && 
          renderSection('Medical Information', {
            'Hospital/Clinic': extractedData.medicalInfo?.hospital,
            'Doctor Name': extractedData.medicalInfo?.doctorName,
            'Treatment Date': extractedData.medicalInfo?.treatmentDate,
            'Diagnosis': extractedData.medicalInfo?.diagnosis,
            'Treatment Cost': extractedData.medicalInfo?.treatmentCost
          }, '🏥')
        }

        {/* Raw Extracted Text */}
        {extractedData.rawText && (
          <div className="data-section">
            <h3>
              <span className="section-icon">📄</span>
              Raw Extracted Text
            </h3>
            <div className="raw-text">
              <pre>{extractedData.rawText}</pre>
            </div>
          </div>
        )}
      </div>

      <div className="results-actions">
        <button className="btn-primary">Download JSON</button>
        <button className="btn-secondary">Print Summary</button>
        <button className="btn-secondary">Export to Excel</button>
      </div>
    </div>
  );
};

export default ClaimResults;
