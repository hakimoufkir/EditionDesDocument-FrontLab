import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PdfOptions = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [documentList, setDocumentList] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedOption === 'edit') {
      axios.get(`${process.env.REACT_APP_BASE_URL}/api/Document/list`)
        .then(response => setDocumentList(response.data))
        .catch(error => setError('Error fetching document list: ' + error.message));
    }
  }, [selectedOption]);

  const handleUploadChange = (event) => {
    setUploadFile(event.target.files[0]);
    //console.log("test : ", event.target.files[0].name);
    
  };

  const handleUpload = () => {
    if (uploadFile) {
      const formData = new FormData();
      formData.append('file', uploadFile);

      axios.post(`${process.env.REACT_APP_BASE_URL}/api/File/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
        .then(uploadResponse => {
          console.log('File uploaded successfully:', uploadResponse.data);

          const documentData = { pathFile: uploadResponse.data.fileUrl , name:  uploadFile.name };
          console.log('Document data:', documentData);

          return axios.post(`${process.env.REACT_APP_BASE_URL}/api/Document/add`, documentData);
        })
        .then(() => {
          setUploadFile(null);
          setSelectedOption(null);
          console.log('Document added successfully.');
        })
        .catch(error => setError('Error uploading file or adding document: ' + error.message));
    }
  };

  const handleEdit = (document) => {
    const { pathFile } = document;

    axios.post(`${process.env.REACT_APP_BASE_URL}/api/Document/getDocumentByURL`, pathFile, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        const { pathFile, instantJSON, id } = response.data;

        axios.get(`${process.env.REACT_APP_BASE_URL}/api/File/download`, {
          params: { url: encodeURIComponent(pathFile) },
          responseType: 'blob',
        })
          .then(downloadResponse => {
            const fileBlob = new Blob([downloadResponse.data], { type: 'application/pdf' });

            // Navigate to PdfViewerComponent with the file Blob, instantJSON, and id
            navigate('/pdf-viewer', { state: { fileBlob, pathFile, instantJSON, id } });
          })
          .catch(error => setError('Error downloading file: ' + error.message));
      })
      .catch(error => {
        console.error('Error fetching document details:', error.response?.data);
        setError('Error fetching document details: ' + error.message);
      });
  };

  const handleBack = () => {
    setSelectedOption(null);
    setError(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-white shadow-lg rounded-lg p-8 mt-52">
        <h1 className="text-3xl font-bold mb-6 text-center">PDF Options</h1>
        {error && <p className="text-red-500 mb-6">{error}</p>}
        {!selectedOption ? (
          <div className="flex flex-col items-center space-y-6">
            <button
              className="bg-blue-600 text-white py-3 px-6 rounded-lg shadow hover:bg-blue-700 transition duration-200"
              onClick={() => setSelectedOption('upload')}
            >
              Upload a PDF
            </button>
            <button
              className="bg-green-600 text-white py-3 px-6 rounded-lg shadow hover:bg-green-700 transition duration-200"
              onClick={() => setSelectedOption('edit')}
            >
              Edit a PDF
            </button>
          </div>
        ) : selectedOption === 'upload' ? (
          <div className="flex flex-col items-center space-y-6">
            <input
              type="file"
              accept=".pdf"
              onChange={handleUploadChange}
              className="border border-gray-300 py-2 px-4 rounded-lg w-full"
            /> 
            <button
              className="bg-blue-600 text-white py-3 px-6 rounded-lg shadow hover:bg-blue-700 transition duration-200"
              onClick={handleUpload}
            >
              Upload
            </button>
            <button
              className="bg-gray-600 text-white py-3 px-6 rounded-lg shadow hover:bg-gray-700 transition duration-200"
              onClick={handleBack}
            >
              Back
            </button>
          </div>
        ) : selectedOption === 'edit' && (
          <div className="mt-6">
            <ul className="space-y-4">
              {documentList.map((doc, index) => (
                <li key={index} className="flex justify-between items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200 shadow">
                  <span className="truncate">{doc.name}</span>
                  <button
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition duration-200"
                    onClick={() => handleEdit(doc)}
                  >
                    Edit
                  </button>
                </li>
              ))}
            </ul>
            <button
              className="bg-gray-600 text-white py-3 px-6 mt-4 rounded-lg shadow hover:bg-gray-700 transition duration-200"
              onClick={handleBack}
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfOptions;
