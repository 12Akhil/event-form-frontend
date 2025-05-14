import {HashRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Navbar from './components/Navbar';
import RegistrationForm from './pages/RegistrationForm';
import User from './pages/User';
import Thank from './pages/Thank'
import UserLogin from './pages/UserLogin'
import AdminLogin from './pages/AdminLogin'
import Scanner from './pages/Scanner'
import Dictaphone from './pages/Dictaphone';
function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/check-in" element={<Scanner />} />
          <Route path="/thank" element={<Thank />} />
          <Route path="/user" element={<User />} />
          <Route path="/user-login" element={<UserLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/audio" element={<Dictaphone/>}/>
        </Routes>
      </main>
    </>
  );
}

export default App;
