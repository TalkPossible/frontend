import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PoseDetection from '../pages/motion/motiondetection';
import Simulation from '../pages/simulation/simulationpage';
import LandingPage from "../pages/landing/LandingPage.js";
import ThemePage from "../pages/theme/ThemePage.js";
import LoginPage from '../pages/login/LoginPage.js';
import PatientListPage from '../pages/mypage/PatientListPage.js';
import PatientDetailPage from '../pages/patients/PatientDetailPage.js';


const Routers = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<LandingPage />} /> */}
        <Route path="/motiondetection" element={<PoseDetection />} />
        <Route path="/simulation" element={<Simulation/>}></Route>
        <Route path="/" element={<LandingPage />} />
        <Route path="/theme" element={<ThemePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/patients" element={<PatientListPage />} />
        <Route path="/patientsdetail" element={<PatientDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Routers;