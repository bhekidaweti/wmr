import React from 'react';
import {BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './Components/Home';
import Admin from './Components/Admin';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
};

export default App;