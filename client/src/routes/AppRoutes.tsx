import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../features/auth/ProtectedRoute.js";
import { DashboardLayout } from "../components/layout/DashboardLayout.js";

// Public pages
import { LandingPage } from "../features/landing/LandingPage.js";
import { LoginPage } from "../features/auth/LoginPage.js";
import { RegisterPage } from "../features/auth/RegisterPage.js";
import { ForgotPasswordPage, ResetPasswordPage } from "../features/auth/ForgotPasswordPage.js";

// Protected feature pages
import { DashboardPage } from "../features/dashboard/DashboardPage.js";
import { FarmListPage } from "../features/farms/FarmListPage.js";
import { CreateFarmPage } from "../features/farms/CreateFarmPage.js";
import { EditFarmPage } from "../features/farms/EditFarmPage.js";
import { FarmDetailPage } from "../features/farms/FarmDetailPage.js";
import { CropRecommendationsPage } from "../features/recommendations/CropRecommendationsPage.js";
import { AdvisoryCenterPage } from "../features/advisory/AdvisoryCenterPage.js";
import { AdvisoryHistoryPage } from "../features/advisory/AdvisoryHistoryPage.js";
import { AdvisoryDetailPage } from "../features/advisory/AdvisoryDetailPage.js";
import { DiseaseDetectionPage } from "../features/disease/DiseaseDetectionPage.js";
import { IrrigationPage } from "../features/irrigation/IrrigationPage.js";
import { NutrientsPage } from "../features/nutrients/NutrientsPage.js";
import { CropListPage } from "../features/crops/CropListPage.js";
import { CropDetailPage } from "../features/crops/CropDetailPage.js";
import { ActivitiesPage } from "../features/activities/ActivitiesPage.js";
import { ProfilePage } from "../features/profile/ProfilePage.js";
import { SettingsPage } from "../features/settings/SettingsPage.js";
import { NotFoundPage } from "../features/NotFoundPage.js";

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected App Pages */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="farms" element={<FarmListPage />} />
        <Route path="farms/new" element={<CreateFarmPage />} />
        <Route path="farms/:farmId" element={<FarmDetailPage />} />
        <Route path="farms/:farmId/edit" element={<EditFarmPage />} />

        <Route path="crop-recommendations" element={<CropRecommendationsPage />} />
        <Route path="advisory" element={<AdvisoryCenterPage />} />
        <Route path="history" element={<AdvisoryHistoryPage />} />
        <Route path="history/:advisoryId" element={<AdvisoryDetailPage />} />

        <Route path="disease-detection" element={<DiseaseDetectionPage />} />
        <Route path="irrigation" element={<IrrigationPage />} />
        <Route path="nutrients" element={<NutrientsPage />} />

        <Route path="crops" element={<CropListPage />} />
        <Route path="crops/:cropId" element={<CropDetailPage />} />

        <Route path="activities" element={<ActivitiesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
