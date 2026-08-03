import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CapsulePage from "./pages/CapsulePage";
import HomePage from "./pages/HomePage";
import MatePage from "./pages/MatePage";
import BackupSyncPage from "./pages/profile/BackupSyncPage";
import InquiryPage from "./pages/profile/InquiryPage";
import NoticePage from "./pages/profile/NoticePage";
import PrivacyPage from "./pages/profile/PrivacyPage";
import ProfileEditPage from "./pages/profile/ProfileEditPage";
import ProfilePage from "./pages/profile/ProfilePage";
import PushNotificationPage from "./pages/profile/PushNotificationPage";
import TermsPage from "./pages/profile/TermsPage";
import TestPage from "./pages/TestPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mate" element={<MatePage />} />
        <Route path="/mate/capsule" element={<CapsulePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<ProfileEditPage />} />
        <Route path="/profile/push" element={<PushNotificationPage />} />
        <Route path="/profile/backup" element={<BackupSyncPage />} />
        <Route path="/profile/notice" element={<NoticePage />} />
        <Route path="/profile/inquiry" element={<InquiryPage />} />
        <Route path="/profile/terms" element={<TermsPage />} />
        <Route path="/profile/privacy" element={<PrivacyPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
