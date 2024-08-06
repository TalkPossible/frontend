import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PoseDetection from '../pages/motion/motiondetection';
import Simulation from '../pages/simulation/simulationpage';

// import LandingPage from "../pages/landing/LandingPage.js";

const Routers = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<LandingPage />} /> */}
      <Route path="/motiondetection" element={<PoseDetection />} />
      <Route path="/simulation" element={<Simulation/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Routers;