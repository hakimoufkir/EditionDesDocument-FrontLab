import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaFileImport, FaUpload, FaTimesCircle, FaEdit, FaTrash } from 'react-icons/fa';

const truncateFilename = (filename, maxLength = 27) => {
  const name = filename.replace('.pdf', '');
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
};

const PdfOptions = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [documentList, setDocumentList] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadedFilenames, setUploadedFilenames] = useState(new Set());
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedOption === 'edit') {
      axios.get(`${process.env.REACT_APP_BASE_URL}/api/Document/list`)
        .then(response => setDocumentList(response.data))
        .catch(error => setError('Error fetching document list: ' + error.message));
    }
  }, [selectedOption]);

  const handleUploadChange = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.filter(file => !uploadedFilenames.has(file.name));

    if (newFiles.length === 0) {
      setError('Some files have already been uploaded.');
      return;
    }

    if (uploadFiles.length + newFiles.length > 5) {
      setError('You can only upload a maximum of 5 PDFs.');
      return;
    }

    setUploadFiles(prevFiles => [...prevFiles, ...newFiles]);
    setUploadedFilenames(prevFilenames => new Set([...prevFilenames, ...newFiles.map(file => file.name)]));
    setError(null);
  };

  const handleUpload = () => {
    if (uploadFiles.length > 0) {
      const uploadPromises = uploadFiles.map(file => {
        const formData = new FormData();
        formData.append('file', file);

        return axios.post(`${process.env.REACT_APP_BASE_URL}/api/File/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then(uploadResponse => {
          const documentData = { pathFile: uploadResponse.data.fileUrl, name: file.name };
          return axios.post(`${process.env.REACT_APP_BASE_URL}/api/Document/add`, documentData);
        });
      });

      Promise.all(uploadPromises)
        .then(() => {
          setUploadFiles([]);
          setUploadedFilenames(new Set());
          setSelectedOption(null);
          setError(null);
        })
        .catch(error => setError('Error uploading files or adding documents: ' + error.message));
    }
  };

  const handleEdit = (document) => {
    const { pathFile } = document;

    axios.post(`${process.env.REACT_APP_BASE_URL}/api/Document/getDocumentByURL`,  pathFile , {
      headers: { 'Content-Type': 'application/json' },
    })
    .then(response => {
      const { pathFile, instantJSON, id } = response.data;

      return axios.get(`${process.env.REACT_APP_BASE_URL}/api/File/download`, {
        params: { url: encodeURIComponent(pathFile) },
        responseType: 'blob',
      }).then(downloadResponse => {
        const fileBlob = new Blob([downloadResponse.data], { type: 'application/pdf' });
        navigate('/pdf-viewer', { state: { fileBlob, pathFile, instantJSON, id } });
      });
    })
    .catch(error => setError('Error fetching document details: ' + error.message));
  };

  const handleImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = (index) => {
    const fileToRemove = uploadFiles[index].name;
    setUploadFiles(prevFiles => {
      const newFiles = prevFiles.filter((_, i) => i !== index);
      setUploadedFilenames(prevFilenames => {
        const newFilenames = new Set(prevFilenames);
        newFilenames.delete(fileToRemove);
        return newFilenames;
      });
      return newFiles;
    });
  };

  const handleBack = () => {
    setSelectedOption(null);
    setUploadFiles([]);
    setUploadedFilenames(new Set());
    setError(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-white rounded-lg p-8 mt-52 border border-gray-300">
        <h1 className="text-3xl font-bold mb-6 text-center">PDF Options</h1>
        {error && <p className="text-red-500 mb-6">{error}</p>}
        {!selectedOption ? (
          <div className="flex flex-col items-center space-y-6">
            <button
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200"
              onClick={() => {
                setSelectedOption('upload');
                setUploadFiles([]); // Ensure files are cleared when selecting upload
              }}
            >
              Upload a PDF
            </button>
            <button
              className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition duration-200"
              onClick={() => setSelectedOption('edit')}
            >
              Edit a PDF
            </button>
          </div>
        ) : selectedOption === 'upload' ? (
          <div className="flex flex-col items-center space-y-6">
            <div className="flex justify-end items-center space-x-3 mb-4">
              <button onClick={handleImport} className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600">
                <FaFileImport size={20} />
              </button>
              <button onClick={handleUpload} className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600">
                <FaUpload size={20} />
              </button>
              <button onClick={() => setUploadFiles([])} className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600">
                <FaTimesCircle size={20} />
              </button>
            </div>

            <input
              type="file"
              accept=".pdf"
              onChange={handleUploadChange}
              ref={fileInputRef}
              className="hidden"
              multiple
            />

            {uploadFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg mb-2 w-full border border-gray-300">
                <div className="flex-1 flex items-center">
                  <span className="truncate flex-1 mr-4">{truncateFilename(file.name)}</span>
                  <span className="text-gray-600 mr-4">{(file.size / 1024).toFixed(2)} KB</span>
                </div>
                <button
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  onClick={() => handleRemoveFile(index)}
                >
                  <FaTrash size={16} />
                </button>
              </div>
            ))}

            <button
              className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition duration-200"
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
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                    onClick={() => handleEdit(doc)}
                  >
                    <FaEdit size={20} /> edit
                  </button>
                </li>
              ))}
            </ul>
            <button
              className="bg-gray-600 text-white py-3 px-6 mt-4 rounded-lg hover:bg-gray-700 transition duration-200"
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
