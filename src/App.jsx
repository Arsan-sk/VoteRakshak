import Home from './pages/Home.jsx'
import FindBooth from "./pages/FindBooth";
import Register from "./pages/Register";
import Profile from './pages/Profile.jsx';
import CastVote from './pages/CastVote.jsx';
import Send from './pages/Send.jsx';
import Login from "./pages/Login";
import React from "react";
import TestVote from "./pages/TestVote.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from './components/Header.jsx'
import Layout from './pages/Layout.jsx';

function App() {
  return (
    <>
      <Router>
        <Layout>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/FindBooth" element={<FindBooth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/CastVote" element={<TestVote />} />
            <Route path="/Send" element={<Send />} />
          </Routes>

        </Layout>
      </Router >
    </>
  )
}

export default App
