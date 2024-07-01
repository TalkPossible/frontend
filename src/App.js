import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import PoseDetection from './pages/motion/motiondetection';

import Routers from './routes/Routers.js';

function App() {
  return (
    <ChakraProvider>
      <div className="App">
        <Routers/>
        <PoseDetection></PoseDetection>
      </div>
    </ChakraProvider>
  );
}

export default App;