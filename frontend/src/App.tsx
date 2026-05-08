import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import ClassTimetablePage from './pages/ClassTimetablePage';
import TeacherTimetablePage from './pages/TeacherTimetablePage';
import ValidationPage from './pages/ValidationPage';
import { TimetableProvider } from './context/TimetableContext';

export default function App() {
  return (
    <TimetableProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/class" element={<ClassTimetablePage />} />
              <Route path="/teacher" element={<TeacherTimetablePage />} />
              <Route path="/validation" element={<ValidationPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TimetableProvider>
  );
}
