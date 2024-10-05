import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TxtRecProvider } from '../context/TxtRecContext.js';

import PoseDetection from '../pages/motion/motiondetection';
import MotionTest1 from '../pages/motion/MotionTest1.js';
import MotionTest2 from '../pages/motion/MotionTest2.js';
import Simulation from '../pages/simulation/simulationpage';
import LandingPage from "../pages/landing/LandingPage.js";
import ThemePage from "../pages/theme/ThemePage.js";
import LoginPage from '../pages/auth/LoginPage.js';
import SignUpPage from '../pages/auth/SignUpPage.js';
import FeedbackPage from '../pages/feedback/FeedbackPage.js';
import PatientListPage from '../pages/mypage/PatientListPage.js';
import SimulationListPage from '../pages/mypage/SimulationListPage.js';
import PatientDetailPage from '../pages/patients/PatientDetailPage.js';
import NotFoundPage from '../pages/error/NotFoundPage.js';
import SignUpSuccess from '../pages/auth/SignUpSuccess.js';

const Routers = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/motiondetection" element={<PoseDetection />} />
        <Route path="/motion-test1" element={<MotionTest1 />} />
        <Route path="/motion-test2" element={<MotionTest2 />} />
        <Route path="/simulation" element={
          <TxtRecProvider>
            <Simulation />
          </TxtRecProvider>
        }/>
        <Route path="/" element={<LandingPage />} />
        <Route path="/theme" element={<ThemePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/patients" element={<PatientListPage />} />
        <Route path="/patients/:id" element={<SimulationListPage />} />
        <Route path="/patientsdetail" element={<PatientDetailPage />} />
        <Route path="/feedback/:simId" element={<FeedbackPage />} />
        <Route path="/*" element={<NotFoundPage/>} />
        <Route path="/signup-success" element={<SignUpSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Routers;