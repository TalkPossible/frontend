import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import Routers from './routes/Routers.js';

function App() {
  return (
    <ChakraProvider>
      <div className="App">
        <Routers />
      </div>
    </ChakraProvider>
  );
}

export default App;
