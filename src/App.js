import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';

import MotionDetection from './pages/motion/motiondetection';


import Routers from './routes/Routers.js';

function App() {
  return (
    <ChakraProvider>
      <div className="App">

        <Routers />

        <MotionDetection/>
        <Routers/>

      </div>
    </ChakraProvider>
  );
}

export default App;
