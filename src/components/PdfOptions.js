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

          const documentData = {pathFile: uploadResponse.data.fileUrl};
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
  

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!selectedOption ? (
        <div>
          <button onClick={() => setSelectedOption('upload')}>Upload a PDF</button>
          <button onClick={() => setSelectedOption('edit')}>Edit a PDF</button>
        </div>
      ) : selectedOption === 'upload' ? (
        <div>
          <input type="file" accept=".pdf" onChange={handleUploadChange} />
          <button onClick={handleUpload}>Upload</button>
        </div>
      ) : selectedOption === 'edit' && (
        <div>
          <ul>
            {documentList.map((doc, index) => (
              <li key={index}>
                <button onClick={() => handleEdit(doc)}>{doc.pathFile}</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PdfOptions;
