import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CapsulePage from "./pages/CapsulePage";
import DrawerDiagnosisPage from "./pages/DrawerDiagnosisPage";
import DrawerPage from "./pages/DrawerPage";
import DrawerRecommendPage from "./pages/DrawerRecommendPage";
import DrawerBookIntroPage from "./pages/DrawerBookIntroPage";
import DrawerMateSetPage from "./pages/DrawerMateSetPage";
import GoalAchievedPage from "./pages/GoalAchievedPage";
import HomePage from "./pages/HomePage";
import LibraryBookshelfPage from "./pages/LibraryBookshelfPage";
import LibraryEssayDraftPage from "./pages/LibraryEssayDraftPage";
import LibraryPage from "./pages/LibraryPage";
import LibraryPdfCompletePage from "./pages/LibraryPdfCompletePage";
import LibraryReasonSelectPage from "./pages/LibraryReasonSelectPage";
import LibraryReasonsPage from "./pages/LibraryReasonsPage";
import MatePage from "./pages/MatePage";
import OnboardingGuidePage from "./pages/OnboardingGuidePage";
import LoginEmailPage from "./pages/LoginEmailPage";
import LoginPage from "./pages/LoginPage";
import SignupNicknamePage from "./pages/SignupNicknamePage";
import SignupPage from "./pages/SignupPage";
import ReflectPage from "./pages/ReflectPage";
import ShelterPage from "./pages/ShelterPage";
import ShelterThoughtDetailPage from "./pages/ShelterThoughtDetailPage";
import ShelterThoughtWritePage from "./pages/ShelterThoughtWritePage";
import ShelterThoughtsPage from "./pages/ShelterThoughtsPage";
import ShelterMyThoughtPage from "./pages/ShelterMyThoughtPage";
import ShelterThoughtSharePage from "./pages/ShelterThoughtSharePage";
import RequireDailyReading from "./components/shelter/RequireDailyReading";
import BackupSyncPage from "./pages/profile/BackupSyncPage";
import InquiryPage from "./pages/profile/InquiryPage";
import NoticePage from "./pages/profile/NoticePage";
import PrivacyPage from "./pages/profile/PrivacyPage";
import ProfileEditPage from "./pages/profile/ProfileEditPage";
import ProfilePage from "./pages/profile/ProfilePage";
import PushNotificationPage from "./pages/profile/PushNotificationPage";
import MembershipPage from "./pages/profile/MembershipPage";
import TermsPage from "./pages/profile/TermsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/onboarding" element={<OnboardingGuidePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/email" element={<LoginEmailPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signup/nickname" element={<SignupNicknamePage />} />
        <Route path="/drawer" element={<DrawerPage />} />
        <Route path="/drawer/diagnosis" element={<DrawerDiagnosisPage />} />
        <Route path="/drawer/recommend" element={<DrawerRecommendPage />} />
        <Route
          path="/drawer/recommend/:bookId"
          element={<DrawerBookIntroPage />}
        />
        <Route path="/drawer/mate-set" element={<DrawerMateSetPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/library/bookshelf" element={<LibraryBookshelfPage />} />
        <Route path="/library/reasons" element={<LibraryReasonsPage />} />
        <Route
          path="/library/reasons/select"
          element={<LibraryReasonSelectPage />}
        />
        <Route path="/library/essay" element={<LibraryEssayDraftPage />} />
        <Route
          path="/library/essay/complete"
          element={<LibraryPdfCompletePage />}
        />
        <Route path="/mate" element={<MatePage />} />
        <Route path="/mate/capsule" element={<CapsulePage />} />
        <Route path="/mate/goal" element={<GoalAchievedPage />} />
        <Route path="/mate/reflect" element={<ReflectPage />} />
        <Route path="/shelter" element={<ShelterPage />} />
        <Route
          path="/shelter/thoughts"
          element={
            <RequireDailyReading>
              <ShelterThoughtsPage />
            </RequireDailyReading>
          }
        />
        <Route
          path="/shelter/thoughts/write"
          element={
            <RequireDailyReading>
              <ShelterThoughtWritePage />
            </RequireDailyReading>
          }
        />
        <Route
          path="/shelter/thoughts/mine"
          element={<ShelterMyThoughtPage />}
        />
        <Route
          path="/shelter/thoughts/mine/share"
          element={<ShelterThoughtSharePage />}
        />
        <Route
          path="/shelter/thoughts/:thoughtId"
          element={
            <RequireDailyReading>
              <ShelterThoughtDetailPage />
            </RequireDailyReading>
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<ProfileEditPage />} />
        <Route path="/profile/membership" element={<MembershipPage />} />
        <Route path="/profile/push" element={<PushNotificationPage />} />
        <Route path="/profile/backup" element={<BackupSyncPage />} />
        <Route path="/profile/notice" element={<NoticePage />} />
        <Route path="/profile/inquiry" element={<InquiryPage />} />
        <Route path="/profile/terms" element={<TermsPage />} />
        <Route path="/profile/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
