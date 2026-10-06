import React from 'react';

export default function Uploader({ onFilesSelected }) {
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            onFilesSelected(files);
        }
        e.target.value = ''; // Reset so the same file can be clicked again
    };

    return (
        <div className="p-6 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 text-center mb-6">
            <p className="mb-4 text-gray-700">
                Upload <strong>requirements.json</strong> and your <strong>PDF documents</strong> here.
            </p>
            <input
                type="file"
                multiple
                accept="application/pdf,.json"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-600 file:text-white
          hover:file:bg-blue-700 cursor-pointer"
            />
        </div>
    );
}