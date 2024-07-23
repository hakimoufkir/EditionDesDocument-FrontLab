import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PSPDFKit from 'pspdfkit';
import axios from 'axios';

export default function PdfViewerComponent() {
  const location = useLocation();
  const { fileBlob, pathFile, instantJSON, id } = location.state || {};
  const containerRef = useRef(null);
  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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

          if (instantJSON) {
            await loadedInstance.applyOperations([
              {
                type: 'applyInstantJson',
                instantJson: JSON.parse(instantJSON)
              }
            ]);
          }

          console.log("PSPDFKit for Web successfully loaded!", loadedInstance);
        } catch (error) {
          console.error("Error loading PSPDFKit", error);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      console.error("No PDF file provided.");
    }

    return () => {
      if (instance && containerRef.current) {
        PSPDFKit.unload(containerRef.current).catch(error => {
          console.error("Error unloading PSPDFKit", error);
        });
      }
    };
  }, [fileBlob, instantJSON]);

  const handleExport = async () => {
    if (!instance) {
      console.error("Instance is not loaded.");
      return;
    }

    try {
      setLoading(true);
      const exportedInstantJSON = await instance.exportInstantJSON();
      console.log("Exported Instant JSON:", exportedInstantJSON);

      // Create a new PDF Blob
      const pdfArrayBuffer = await instance.exportPDF();
      const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('file', pdfBlob, 'updated.pdf');

      // Upload the new PDF Blob
      const uploadResponse = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/File/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newFileUrl = uploadResponse.data.fileUrl;
      console.log('File uploaded successfully:', newFileUrl);

      const documentData = {
        id: id,
        pathFile: newFileUrl,
        instantJSON: JSON.stringify(exportedInstantJSON),
      };

      await axios.put(`${process.env.REACT_APP_BASE_URL}/api/Document/update`, documentData);
      console.log('Document data saved successfully.');
    } catch (error) {
      console.error("Error exporting Instant JSON or saving data:", error);
    } finally {
      setLoading(false);
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
