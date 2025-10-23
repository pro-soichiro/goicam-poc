import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { QuizAppPage } from './pages/QuizAppPage';
import './App.css';

function App() {
  return (
    <BrowserRouter basename="/goicam-poc">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<QuizAppPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
