import React, { useState } from 'react';
import TenderDetails from './components/TenderDetails';
import Uploader from './components/Uploader';

function App() {
  const [language, setLanguage] = useState('en');
  const [tenderDetails, setTenderDetails] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFilesSelected = async (files) => {
    for (const file of files) {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        try {
          const data = JSON.parse(text);
          setTenderDetails(data.tender);
          setRequirements(data.requirements);
        } catch (err) {
          alert('Error reading requirements.json. Please ensure it is a valid JSON file.');
        }
      } else if (file.type === 'application/pdf') {
        // Temporary placeholder for PDF processing
        setUploadedFiles(prev => [...prev, { id: crypto.randomUUID(), file, name: file.name }]);
      } else {
        alert(`Rejected: "${file.name}" is not a PDF. Please upload only PDF files.`);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Tender Package Builder</h1>
        <button
          onClick={() => setLanguage(l => l === 'en' ? 'bn' : 'en')}
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          {language === 'en' ? 'বাংলা রূপান্তর' : 'Switch to English'}
        </button>
      </div>

      <Uploader onFilesSelected={handleFilesSelected} />

      <TenderDetails
        tenderDetails={tenderDetails}
        requirements={requirements}
        language={language}
      />
    </div>
  );
}

export default App;