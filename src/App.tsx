import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CapsulePage from "./pages/CapsulePage";
import HomePage from "./pages/HomePage";
import MatePage from "./pages/MatePage";
import TestPage from "./pages/TestPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mate" element={<MatePage />} />
        <Route path="/mate/capsule" element={<CapsulePage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
