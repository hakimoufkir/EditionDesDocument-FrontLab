import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import PSPDFKit from 'pspdfkit';

export default function PdfViewerComponent() {
  const location = useLocation();
  const containerRef = useRef(null);
  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [instantJSON, setInstantJSON] = useState({}); // Default to empty object
  const [pdfId, setPdfId] = useState(''); // Default to empty string

  useEffect(() => {
    const { fileBlob, instantJSON, id } = location.state || {};
    console.log('Location State:', location.state); // Debugging

    if (instantJSON !== undefined) {
      setInstantJSON(instantJSON); // Store the instantJSON received from state
    }

    if (id !== undefined) {
      setPdfId(id); // Store the PDF ID received from state
    }

    if (fileBlob) {
      const fileURL = URL.createObjectURL(fileBlob);

      setLoading(true);

      (async function () {
        try {
          const loadedInstance = await PSPDFKit.load({
            licenseKey: process.env.REACT_APP_PSPDFKIT_LICENSE_KEY,
            container: containerRef.current,
            document: fileURL,
            baseUrl: `${window.location.protocol}//${window.location.host}/${process.env.PUBLIC_URL}`,
            toolbarItems: [
              ...PSPDFKit.defaultToolbarItems,
              { type: 'content-editor' },
              { type: 'form-creator' }
            ],
            initialViewState: new PSPDFKit.ViewState({
              formDesignMode: false
            })
          });

          setInstance(loadedInstance);
          console.log("PSPDFKit for Web successfully loaded!", loadedInstance);
        } catch (error) {
          console.error("Error loading PSPDFKit", error);
        } finally {
          setLoading(false);
        }
      })();

      return () => {
        if (instance) {
          PSPDFKit.unload(containerRef.current);
        }
      };
    } else {
      console.error("No PDF file provided.");
    }
  }, [location.state]);

  const handleExport = async () => {
    // Log values for debugging
    console.log('PDF ID:', pdfId);
    console.log('Instant JSON:', instantJSON);
    console.log('Instance:', instance);

    if (!instance || !pdfId || !instantJSON) {
      console.error("Required data is missing.");
      return;
    }

    try {
      // Export PDF as Blob
      const pdfBlob = await instance.exportPDF();
      const pdfURL = URL.createObjectURL(pdfBlob);

      // Create a link to download the PDF
      const link = document.createElement('a');
      link.href = pdfURL;
      link.download = 'exported-document.pdf';
      link.click();

      // Send data to backend
      const documentData = {
        id: pdfId,
        pathFile: pdfURL,
        instantJSON: JSON.stringify(instantJSON),
      };

      await axios.post(`${process.env.REACT_APP_BASE_URL}/api/Document/update`, documentData);
      console.log('Document data saved successfully.');
    } catch (error) {
      console.error("Error exporting files or saving data:", error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        ref={containerRef}
        style={{
          flex: '1 1 auto',
          height: '100vh',
          minHeight: '600px',
          border: '1px solid black'
        }}
      />
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>Loading...</div>
      ) : (
        <button onClick={handleExport}>Export PDF and Save Data</button>
      )}
    </div>
  );
}
