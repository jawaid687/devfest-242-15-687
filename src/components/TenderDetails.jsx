import React from 'react';

export default function TenderDetails({ tenderDetails, requirements, language }) {
    if (!tenderDetails) return <div className="p-4 border rounded bg-gray-50 text-gray-500">Upload requirements.json to start...</div>;

    return (
        <div className="p-4 bg-white border rounded shadow-sm">
            <h2 className="text-xl font-bold mb-4">{language === 'en' ? 'Tender Details' : 'দরপত্রের বিবরণ'}</h2>
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div><strong>ID:</strong> {tenderDetails.tender_id}</div>
                <div><strong>Title:</strong> {tenderDetails.title}</div>
                <div><strong>Entity:</strong> {tenderDetails.procuring_entity}</div>
                <div><strong>Bidder:</strong> {tenderDetails.bidder}</div>
                <div><strong>Deadline:</strong> {tenderDetails.submission_deadline}</div>
            </div>

            <h3 className="text-lg font-semibold mb-2">{language === 'en' ? 'Required Documents' : 'প্রয়োজনীয় কাগজপত্র'}</h3>
            <ul className="space-y-2">
                {requirements.map((req) => (
                    <li key={req.id} className="p-3 border rounded flex justify-between items-center bg-gray-50">
                        <div>
                            <span className="font-medium mr-2">{req.order}. {language === 'en' ? req.title_en : req.title_bn}</span>
                            {req.mandatory && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Mandatory</span>}
                            {req.has_expiry && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded ml-2">Needs Expiry</span>}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}