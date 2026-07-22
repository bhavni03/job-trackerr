import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import ApplicationForm from './components/ApplicationForm';
import ApplicationList from './components/ApplicationList';
import ResumeMatcher from './components/ResumeMatcher';
import { getApplications, createApplication, deleteApplication } from './api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // On app load, check if a token already exists (user previously logged in)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // We're not verifying it here for simplicity — just assuming it's valid
      // If it's expired, the first API call will fail with 401 and we handle that below
      setUser({ loggedIn: true });
    }
    setAuthChecked(true);
  }, []);

  const fetchApplications = async () => {
    try {
      setAppsLoading(true);

      const res = await getApplications();
      setApplications(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        // Token invalid/expired — log the user out
        handleLogout();
      }
      console.error('Error fetching applications:', err);
    } finally {
      setAppsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setApplications([]);
  };

  const handleAdd = async (data) => {
    try {
      await createApplication(data);
      fetchApplications();
    } catch (err) {
      console.error('Error adding application:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteApplication(id);
      fetchApplications();
    } catch (err) {
      console.error('Error deleting application:', err);
    }
  };

  // Don't render anything until we've checked for an existing token
  if (!authChecked) return null;

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="App">
      <div className="app-header">
  <div>
    <h1>Job Application Tracker</h1>
    <p className="subtitle">
      Track applications, get reminders, check your fit
    </p>
  </div>

  <button onClick={handleLogout} className="logout-button">
    Log Out
  </button>
</div>

      <ApplicationForm onAdd={handleAdd} />
      <ApplicationList
        applications={applications}
        onDelete={handleDelete}
        loading={appsLoading}
      />

      <ResumeMatcher />
    </div>
  );
}

export default App;