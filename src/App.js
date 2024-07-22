import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Stepper from "./components/Stepper";
import PdfViewerComponent from "./components/PdfViewerComponent";
import PdfOptions from "./components/PdfOptions"; // Import PdfOptions

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Stepper />} />
        <Route path="/pdf-options" element={<PdfOptions />} /> {/* Add route for PdfOptions */}
        <Route path="/pdf-viewer" element={<PdfViewerComponent />} />
      </Routes>
    </Router>
  );
}

export default App;
