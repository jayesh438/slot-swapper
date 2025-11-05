import React, { useContext } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from '../screens/Login.jsx';
import Signup from '../screens/Signup.jsx';
import Dashboard from '../screens/Dashboard.jsx';
import Marketplace from '../screens/Marketplace.jsx';
import Requests from '../screens/Requests.jsx';
import { AuthContext, AuthProvider } from '../AuthContext.jsx';

function Shell() {
  const { user, logout } = useContext(AuthContext);
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">SlotSwapper</h1>
        <nav className="flex gap-4 items-center">
          {user ? (<>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/marketplace">Marketplace</Link>
            <Link to="/requests">Requests</Link>
            <button onClick={logout} className="px-3 py-1 border rounded">Logout</button>
          </>) : (<>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>)}
        </nav>
      </div>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/marketplace" element={<RequireAuth><Marketplace /></RequireAuth>} />
        <Route path="/requests" element={<RequireAuth><Requests /></RequireAuth>} />
        <Route path="*" element={<div>Not found</div>} />
      </Routes>
    </div>
  );
}

function RequireAuth({ children }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  )
}
