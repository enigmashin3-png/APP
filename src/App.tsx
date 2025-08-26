import React from "react";
import { Routes, Route } from "react-router-dom";
import WorkoutHome from "./pages/WorkoutHome";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Exercises from "./pages/Exercises";
import Measure from "./pages/Measure";
import BottomTabs from "./components/BottomTabs";
import "./styles/theme.css";

export default function App(){
  return (
    <>
      <Routes>
        <Route path="/" element={<WorkoutHome/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/history" element={<History/>} />
        <Route path="/exercises" element={<Exercises/>} />
        <Route path="/measure" element={<Measure/>} />
      </Routes>
      <BottomTabs/>
    </>
  );
}
