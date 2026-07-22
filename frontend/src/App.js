import { useState, useEffect, useCallback } from 'react';
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

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ loggedIn: true });
    }
    setAuthChecked(true);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setApplications([]);
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      setAppsLoading(true);

      const res = await getApplications();
      setApplications(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      }
      console.error('Error fetching applications:', err);
    } finally {
      setAppsLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user, fetchApplications]);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
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

  // Wait until authentication check is complete
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