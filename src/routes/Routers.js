import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "../pages/landing/LandingPage.js";
import PatientListPage from '../pages/patientlist/PatientListPage.js';

const Routers = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/patients" element={<PatientListPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Routers;