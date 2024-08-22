import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TxtRecProvider } from '../context/TxtRecContext.js';

import PoseDetection from '../pages/motion/motiondetection';
import Simulation from '../pages/simulation/simulationpage';
import LandingPage from "../pages/landing/LandingPage.js";
import ThemePage from "../pages/theme/ThemePage.js";
import LoginPage from '../pages/login/LoginPage.js';
import FeedbackPage from '../pages/feedback/FeedbackPage.js';
import PatientListPage from '../pages/mypage/PatientListPage.js';
import SimulationListPage from '../pages/mypage/SimulationListPage.js';
import PatientDetailPage from '../pages/patients/PatientDetailPage.js';


const Routers = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/motiondetection" element={<PoseDetection />} />
        <Route path="/simulation" element={
          <TxtRecProvider>
            <Simulation />
          </TxtRecProvider>
        }/>
        <Route path="/" element={<LandingPage />} />
        <Route path="/theme" element={<ThemePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/patients" element={<PatientListPage />} />
        <Route path="/patients/:id" element={<SimulationListPage />} />
        <Route path="/patientsdetail" element={<PatientDetailPage />} />
        {/* <Route path="/feedback/:id" element={< />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default Routers;