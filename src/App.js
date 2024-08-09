import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import Routers from './routes/Routers.js';


function App() {
  return (
    <ChakraProvider>
      <Routers>
        <div className="App">
        </div>
      </Routers>
    </ChakraProvider>
  );
}

export default App;
