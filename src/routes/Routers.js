import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "../pages/landing/LandingPage.js";
import ThemePage from "../pages/theme/ThemePage.js";
import LoginPage from '../pages/login/LoginPage.js';
import FeedbackPage from '../pages/feedback/FeedbackPage.js';


const Routers = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/theme" element={<ThemePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Routers;