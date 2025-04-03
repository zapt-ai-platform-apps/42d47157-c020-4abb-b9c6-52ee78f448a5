import React, { useRef } from 'react';
import { format, isValid } from 'date-fns';
import { jsPDF } from 'jspdf';

function formatDate(dateString) {
  const date = new Date(dateString);
  return isValid(date) ? format(date, 'MMM d, yyyy') : 'N/A';
}

export default function ReportViewer({ reportData, onBack }) {
  const reportRef = useRef(null);
  
  if (!reportData || !reportData.report) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Report data not available.</p>
        <button 
          onClick={onBack}
          className="mt-4 btn-secondary cursor-pointer"
        >
          Back to Reports
        </button>
      </div>
    );
  }
  
  const { report, medications, sideEffects, checkins } = reportData;
  
  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text(report.title, 15, 20);
    
    // Date range
    doc.setFontSize(12);
    doc.text(`Date Range: ${formatDate(report.startDate)} to ${formatDate(report.endDate)}`, 15, 30);
    
    // Medications section
    doc.setFontSize(16);
    doc.text('Medications', 15, 45);
    
    let yPosition = 55;
    medications.forEach((med, index) => {
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${med.name} - ${med.dosage} (${med.frequency})`, 20, yPosition);
      doc.setFontSize(10);
      doc.text(`Started: ${formatDate(med.startDate)}${med.endDate ? ` • Ended: ${formatDate(med.endDate)}` : ''}`, 25, yPosition + 5);
      
      if (med.notes) {
        doc.text(`Notes: ${med.notes}`, 25, yPosition + 10);
        yPosition += 15;
      } else {
        yPosition += 10;
      }
      
      // Add a new page if we're getting close to the bottom
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
    });
    
    // Side Effects section
    doc.setFontSize(16);
    doc.text('Side Effects', 15, yPosition + 10);
    
    yPosition += 20;
    sideEffects.forEach((effect, index) => {
      // Add a new page if we're getting close to the bottom
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${effect.symptom} (Severity: ${effect.severity}/10)`, 20, yPosition);
      doc.setFontSize(10);
      doc.text(`Date: ${formatDate(effect.date)} • Time: ${effect.timeOfDay}`, 25, yPosition + 5);
      doc.text(`Medication: ${effect.medicationName || 'Unknown'}`, 25, yPosition + 10);
      
      if (effect.notes) {
        doc.text(`Notes: ${effect.notes}`, 25, yPosition + 15);
        yPosition += 20;
      } else {
        yPosition += 15;
      }
    });
    
    // Check-ins summary
    if (checkins.length > 0) {
      // Add a new page for check-ins
      doc.addPage();
      
      doc.setFontSize(16);
      doc.text('Daily Check-ins Summary', 15, 20);
      
      yPosition = 35;
      checkins.forEach((checkin, index) => {
        // Add a new page if we're getting close to the bottom
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(12);
        doc.text(`${formatDate(checkin.date)}`, 20, yPosition);
        doc.setFontSize(10);
        doc.text(`Overall: ${checkin.overallFeeling}/10 • Sleep: ${checkin.sleepQuality}/10 • Energy: ${checkin.energyLevel}/10`, 25, yPosition + 5);
        doc.text(`Mood: ${checkin.mood}`, 25, yPosition + 10);
        
        if (checkin.notes) {
          doc.text(`Notes: ${checkin.notes}`, 25, yPosition + 15);
          yPosition += 20;
        } else {
          yPosition += 15;
        }
      });
    }
    
    // Save the PDF
    doc.save(`${report.title.replace(/\s+/g, '_')}.pdf`);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="btn-secondary cursor-pointer"
        >
          ← Back
        </button>
        
        <button 
          onClick={downloadPDF}
          className="btn-primary cursor-pointer"
        >
          Download PDF
        </button>
      </div>
      
      <div ref={reportRef} className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-2">{report.title}</h1>
        <p className="text-gray-600 mb-6">
          {formatDate(report.startDate)} to {formatDate(report.endDate)}
        </p>
        
        {/* Medications Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Medications</h2>
          {medications.length === 0 ? (
            <p className="text-gray-500 italic">No medications recorded during this period.</p>
          ) : (
            <div className="space-y-4">
              {medications.map(med => (
                <div key={med.id} className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium">{med.name} - {med.dosage}</h3>
                  <p className="text-sm text-gray-600">{med.frequency}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Started: {formatDate(med.startDate)}
                    {med.endDate && ` • Ended: ${formatDate(med.endDate)}`}
                  </p>
                  {med.notes && <p className="mt-2 text-sm text-gray-700">{med.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
        
        {/* Side Effects Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Side Effects</h2>
          {sideEffects.length === 0 ? (
            <p className="text-gray-500 italic">No side effects recorded during this period.</p>
          ) : (
            <div className="space-y-4">
              {sideEffects.map(effect => (
                <div key={effect.id} className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{effect.symptom}</h3>
                    <span className="badge-blue">Severity: {effect.severity}/10</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Date: {formatDate(effect.date)} • Time: {effect.timeOfDay}
                  </p>
                  <p className="text-sm text-gray-600">
                    Medication: {effect.medicationName || 'Unknown'}
                  </p>
                  {effect.notes && <p className="mt-2 text-sm text-gray-700">{effect.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
        
        {/* Check-ins Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Daily Check-ins</h2>
          {checkins.length === 0 ? (
            <p className="text-gray-500 italic">No check-ins recorded during this period.</p>
          ) : (
            <div className="space-y-4">
              {checkins.map(checkin => (
                <div key={checkin.id} className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium">{formatDate(checkin.date)}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="badge-blue">Overall: {checkin.overallFeeling}/10</span>
                    <span className="badge-green">Sleep: {checkin.sleepQuality}/10</span>
                    <span className="badge-purple">Energy: {checkin.energyLevel}/10</span>
                    <span className="badge-yellow">Mood: {checkin.mood}</span>
                  </div>
                  {checkin.notes && <p className="mt-3 text-sm text-gray-700">{checkin.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}