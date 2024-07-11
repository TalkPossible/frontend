import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import Routers from './routes/Routers.js';
import MotionDetection from './pages/motion/motiondetection.js';

function App() {
  return (
    <ChakraProvider>
      <Routers>
        <div className="App">
          <MotionDetection />
        </div>
      </Routers>
    </ChakraProvider>
  );
}

export default App;
