/*
-------------------section01_START
Imports: You import necessary modules like React, PropTypes for type checking, and PSPDFKit for PDF handling.
State and Refs: You use useRef to get a reference to the container where PSPDFKit will be loaded (containerRef), and useState to manage the PSPDFKit instance (instance).
 */
import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import PSPDFKit from "pspdfkit";

export default function PdfViewerComponent({ document: pdfDocument }) {
  const containerRef = useRef(null);
  const [instance, setInstance] = useState(null);
/*section01_END*/

/*
--------------------section02_START
useEffect Explanation:
Runs when pdfDocument prop changes (initial render and when pdfDocument changes).
Loads PSPDFKit into the containerRef.current.
Sets up PSPDFKit with a license key, the PDF document (pdfDocument), toolbar items (content-editor, form-creator), and initial view state.
Cleans up by unloading PSPDFKit instance when the component unmounts or pdfDocument changes.
 */
  useEffect(() => {
    const container = containerRef.current;

    (async function () {
      try {
        const loadedInstance = await PSPDFKit.load({
          licenseKey: '9hoWfNVjZfTReALX5omI1rMMEU43KIbQwus2Giv9zYx6ZCGlbfOjdkPa7SdsUJNNPdLGV7uBgwry5nQG9RzfClRrUkGXc12i9QxBrH8R7xI6Oyd-PrAKtcJ04rLQ38nLv5XqIncsBXJtztUrlm4gx8qEkOWIbGGTAYrEAGeU1pUdUt042kfsxYEeR6TvklzhzNBzEDZawSxpHTE',
          container,
          document: pdfDocument,
          baseUrl: `${window.location.protocol}//${window.location.host}/${process.env.PUBLIC_URL}`,
          toolbarItems: [
            ...PSPDFKit.defaultToolbarItems,
            { type: "content-editor" },
            { type: "form-creator" }
          ],
          initialViewState: new PSPDFKit.ViewState({
            formDesignMode: false // Enable form-filling by default
          })
        });

        setInstance(loadedInstance);
        console.log("PSPDFKit for Web successfully loaded!!", loadedInstance);
      } catch (error) {
        console.error("Error loading PSPDFKit", error);
      }
    })();
    return () => {
      if (instance) {
        PSPDFKit.unload(container);
      }
    };
  }, [pdfDocument]);
/*section02_END*/


/*
-----------------section03_START
Export Function (exportInstantJSON):

Uses PSPDFKit's exportInstantJSON() method to get current document state as JSON.
Converts JSON to a downloadable file (document-instant.json).
Import Function (importInstantJSON):

Handles file input (event.target.files).
Reads imported JSON file, parses it into JSON format.
Unloads current PSPDFKit instance, then loads a new instance with imported JSON (instantJSON). */
  const exportInstantJSON = async () => {
    if (instance) {
      try {
        const instantJSON = await instance.exportInstantJSON();
        console.log("Exported Instant JSON", instantJSON);

        const jsonString = JSON.stringify(instantJSON, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "document-instant.json";
        a.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error exporting Instant JSON", error);
      }
    }
  };



  const importInstantJSON = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const jsonText = await file.text();
      const instantJSON = JSON.parse(jsonText);
      console.log("Imported Instant JSON", instantJSON);

      // Check if the PDF ID matches
      // if (instantJSON.pdfId.permanent !== instance.pdfId.permanent) {
      //   console.error("PDF ID mismatch. Please use the same PDF document.");
      //   return;
      // }

      try {
        if (instance) {
          await PSPDFKit.unload(containerRef.current);
        }

        const updatedInstance = await PSPDFKit.load({
          licenseKey: '9hoWfNVjZfTReALX5omI1rMMEU43KIbQwus2Giv9zYx6ZCGlbfOjdkPa7SdsUJNNPdLGV7uBgwry5nQG9RzfClRrUkGXc12i9QxBrH8R7xI6Oyd-PrAKtcJ04rLQ38nLv5XqIncsBXJtztUrlm4gx8qEkOWIbGGTAYrEAGeU1pUdUt042kfsxYEeR6TvklzhzNBzEDZawSxpHTE',
          container: containerRef.current,
          document: pdfDocument,
          baseUrl: `${window.location.protocol}//${window.location.host}/${process.env.PUBLIC_URL}`,
          toolbarItems: [
            ...PSPDFKit.defaultToolbarItems,
            { type: "content-editor" },
            { type: "form-creator" }
          ],
          instantJSON,
          initialViewState: new PSPDFKit.ViewState({
            formDesignMode: false // Enable form-filling by default
          })
        });

        setInstance(updatedInstance);
        // console.log("Imported Instant JSON + Details", updatedInstance);
      } catch (error) {
        console.error("Error importing Instant JSON", error);
      }
    }
  };
/*section03_END*/

/*
------------section04_START
JSX Explanation:
Renders a container (div) for PSPDFKit with a ref={containerRef} to manage PSPDFKit's display.
Provides buttons for exporting and importing Instant JSON (exportInstantJSON, importInstantJSON).
Uses an <input type="file"> hidden with CSS, triggered by a styled label for importing JSON files.
*/
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div ref={containerRef} style={{ flex: "1 1 auto", minHeight: 0 }} />
      <button onClick={exportInstantJSON} style={{ width: "100%", height: "5vh" }}>
        Export as Instant JSON
      </button>
      <div style={{ width: "100%", marginTop: "1rem", position: "relative" }}>
        <input
          id="fileInput"
          type="file"
          accept=".json"
          onChange={importInstantJSON}
          style={{
            width: "100%",
            height: "5vh",
            opacity: 0,
            position: "absolute",
            cursor: "pointer",
            top: 0,
            left: 0
          }}
        />
        <label
          htmlFor="fileInput"
          style={{
            width: "100%",
            height: "5vh",
            cursor: "pointer",
            display: "inline-block",
            backgroundColor: "#2196F3",
            color: "white",
            textAlign: "center",
            paddingTop: "1.5vh"
          }}
        >
          Import Instant JSON
        </label>
      </div>
    </div>
  );
}

PdfViewerComponent.propTypes = {
  document: PropTypes.string.isRequired
};
/*section04_END*/