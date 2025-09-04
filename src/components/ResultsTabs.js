import React, { useState } from 'react';
import { Copy, Download, FileText, BarChart3, Eye, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

// Helper function to get all fields from the Korean medical data structure
const getAllFields = (data) => {
  if (!data.data) return [];
  
  const fieldsMap = [
    // Personal Information
    { name: 'Name of Policyowner', value: data.data.policyownerName, section: 'Personal Info' },
    { name: 'Name of Insured', value: data.data.insuredName, section: 'Personal Info' },
    { name: 'Patient Name', value: data.data.patientName, section: 'Personal Info' },
    { name: 'Occupation', value: data.data.occupation, section: 'Personal Info' },
    { name: 'HKID/Passport', value: data.data.hkidPassport, section: 'Personal Info' },
    { name: 'Date of Birth', value: data.data.dateOfBirth, section: 'Personal Info' },
    { name: 'Patient ID Number', value: data.data.patientIdNumber, section: 'Personal Info' },
    { name: 'Address', value: data.data.address, section: 'Personal Info' },
    { name: 'Phone Number', value: data.data.phone, section: 'Personal Info' },
    
    // Hospital Information
    { name: 'Hospital Name', value: data.data.hospitalName, section: 'Hospital Info' },
    { name: 'Hospital ID', value: data.data.hospitalId, section: 'Hospital Info' },
    { name: 'Hospital Address', value: data.data.hospitalAddress, section: 'Hospital Info' },
    { name: 'Doctor Name', value: data.data.doctorName, section: 'Hospital Info' },
    
    // Medical Information
    { name: 'Treatment Date', value: data.data.treatmentDate, section: 'Medical Info' },
    { name: 'Medical Department', value: data.data.department, section: 'Medical Info' },
    { name: 'Diagnosis', value: data.data.diagnosis, section: 'Medical Info' },
    { name: 'Treatment', value: data.data.treatment, section: 'Medical Info' },
    { name: 'Prescription', value: data.data.prescription, section: 'Medical Info' },
    
    // Financial Information
    { name: 'Total Cost', value: data.data.totalCost, section: 'Financial Info' },
    { name: 'Patient Payment', value: data.data.patientPayment, section: 'Financial Info' },
    { name: 'Insurance Claim', value: data.data.insuranceClaim, section: 'Financial Info' },
    
    // Banking Information
    { name: 'Name of Account Holder', value: data.data.accountHolderName, section: 'Banking Info' },
    { name: 'Currency', value: data.data.currency, section: 'Banking Info' },
    { name: 'Bank Name', value: data.data.bankName, section: 'Banking Info' },
    { name: 'HKD Bank Account', value: data.data.hkdBankAccount, section: 'Banking Info' },
    { name: 'USD Bank Account', value: data.data.usdBankAccount, section: 'Banking Info' },
    { name: 'Bank Number', value: data.data.bankNumber, section: 'Banking Info' },
    { name: 'Account Number', value: data.data.accountNumber, section: 'Banking Info' },
    { name: 'Insurance Number', value: data.data.insuranceNumber, section: 'Insurance Info' }
  ].filter(field => field.value);
  
  // Add confidence (could be enhanced later based on field importance)
  return fieldsMap.map(field => ({
    ...field,
    confidence: 0.85 // Default confidence
  }));
};

const ResultsTabs = ({ data, className }) => {
  const [activeTab, setActiveTab] = useState('summary');

  if (!data) return null;

  const tabs = [
    { id: 'summary', label: 'Summary', icon: BarChart3 },
    { id: 'structured', label: 'Structured Data', icon: FileText },
    { id: 'raw', label: 'Raw Text', icon: Eye },
  ];

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadJson = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.metadata?.filename || 'korean-medical-form'}_extracted.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    const fields = getAllFields(data);
    const csvContent = [
      ['Field', 'Value', 'Confidence', 'Section'].join(','),
      ...fields.map(field => [
        `"${field.name}"`,
        `"${field.value}"`,
        field.confidence,
        `"${field.section}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.metadata?.filename || 'korean-medical-form'}_extracted.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('bg-white rounded-lg shadow-lg border border-gray-200', className)}>
      {/* Header with Actions */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <h2 className="text-lg font-semibold text-gray-900">
            Extraction Results
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => copyToClipboard(JSON.stringify(data, null, 2))}
              className="inline-flex items-center space-x-1 px-2 sm:px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span className="hidden sm:inline">Copy JSON</span>
              <span className="sm:hidden">Copy</span>
            </button>
            <button
              onClick={downloadJson}
              className="inline-flex items-center space-x-1 px-2 sm:px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
            >
              <Download className="w-3 h-3" />
              <span className="hidden sm:inline">Download JSON</span>
              <span className="sm:hidden">JSON</span>
            </button>
            <button
              onClick={downloadCsv}
              className="inline-flex items-center space-x-1 px-2 sm:px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
            >
              <Download className="w-3 h-3" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>
          </div>
        </div>

        {/* Validation Summary */}
        {data.validation && (
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm space-y-2 sm:space-y-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <span className="text-gray-600">
                Accuracy: <span className="font-medium">{data.accuracy || 0}%</span>
              </span>
              <span className="text-gray-600">
                Processing Time: <span className="font-medium">{data.metadata?.processingTime || 0}ms</span>
              </span>
            </div>
                        {data.validation?.issues && data.validation.issues.length > 0 && (
              <div className="flex items-center space-x-1 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span>{data.validation.issues.length} issue{data.validation.issues.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-0 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-shrink-0 flex items-center space-x-1.5 px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'summary' && <SummaryView data={data} />}
        {activeTab === 'structured' && <StructuredView data={data} />}
        {activeTab === 'raw' && <RawTextView data={data} />}
      </div>
    </div>
  );
};

const SummaryView = ({ data }) => {
  const keyFields = [
    { label: 'Patient Name', value: data.data?.patientName },
    { label: 'Patient ID Number', value: data.data?.patientIdNumber },
    { label: 'Hospital Name', value: data.data?.hospitalName },
    { label: 'Treatment Date', value: data.data?.treatmentDate },
    { label: 'Medical Department', value: data.data?.department },
    { label: 'Doctor Name', value: data.data?.doctorName },
    { label: 'Total Cost', value: data.data?.totalCost },
    { label: 'Patient Payment', value: data.data?.patientPayment },
    { label: 'Insurance Claim', value: data.data?.insuranceClaim },
    { label: 'Phone Number', value: data.data?.phone },
  ].filter(field => field.value);

  return (
    <div className="space-y-6">
      {/* Key Information Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-3">
          Key Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {keyFields.slice(0, 6).map((field, index) => (
            <div key={index} className="flex justify-between">
              <span className="text-xs text-blue-700">{field.label}:</span>
              <span className="text-xs font-medium text-blue-900 truncate ml-2">
                {field.value || 'Not found'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Medical Details Card */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-green-900 mb-3">
          Medical Details
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-green-700">Total Cost:</span>
            <span className="text-xs font-medium text-green-900">
              {data.data?.totalCost || 'Not specified'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-green-700">Patient Payment:</span>
            <span className="text-xs font-medium text-green-900">
              {data.data?.patientPayment || 'Not specified'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-green-700">Insurance Claim:</span>
            <span className="text-xs font-medium text-green-900">
              {data.data?.insuranceClaim || 'Not specified'}
            </span>
          </div>
        </div>
      </div>

      {/* Validation Issues */}
      {data.validation && (data.validation.issues.length > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-900 mb-3">
            Validation Issues
          </h3>
          
          {data.validation.issues.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-yellow-700 mb-1">Issues:</p>
              <ul className="text-xs text-yellow-600 space-y-1">
                {data.validation.issues.map((issue, index) => (
                  <li key={index}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}
          
          {data.validation.suggestions && data.validation.suggestions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-blue-700 mb-1">Suggestions:</p>
              <ul className="text-xs text-blue-600 space-y-1">
                {data.validation.suggestions.map((suggestion, index) => (
                  <li key={index}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StructuredView = ({ data }) => {
  const allFields = getAllFields(data);

  return (
    <div className="space-y-6">
      {/* Field Table */}
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allFields.map((field, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-xs text-gray-600">{field.section}</td>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">{field.name}</td>
                  <td className="px-3 py-2 text-sm text-gray-700 max-w-xs truncate">{field.value || 'Not found'}</td>
                  <td className="px-3 py-2">
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full font-medium',
                      field.confidence >= 0.8 ? 'bg-green-100 text-green-800' :
                      field.confidence >= 0.5 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    )}>
                      {Math.round(field.confidence * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON View */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          JSON Structure
        </h3>
        <pre className="text-xs text-gray-700 overflow-auto max-h-96">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

const RawTextView = ({ data }) => {
  const rawText = data.debug?.ocrText || 'No text extracted';
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Extracted Text
        </h3>
        <button
          onClick={() => navigator.clipboard.writeText(rawText)}
          className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          <Copy className="w-3 h-3" />
          <span>Copy Text</span>
        </button>
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
          {rawText}
        </pre>
      </div>

      {/* Processing Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Processing Information
        </h4>
        <div className="text-xs text-blue-700 space-y-1">
          <div>Method: {data.metadata?.method || 'local_ocr'}</div>
          <div>Processing Time: {data.metadata?.processingTime || 0}ms</div>
          <div>OCR Results: {data.metadata?.ocrResults || 1}</div>
          {data.confidence && (
            <div>Confidence: {data.confidence}%</div>
          )}
          {data.validation?.issues && data.validation.issues.length > 0 && (
            <div>
              <div className="font-medium mt-2">Issues:</div>
              <ul className="list-disc list-inside">
                {data.validation.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsTabs;
