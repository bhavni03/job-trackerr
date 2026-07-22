import { useState } from 'react';

function ApplicationForm({ onAdd }) {
  const [formData, setFormData] = useState({
    company: '', role: '', status: 'applied', deadline: '', notes: '', email: '',
  });
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.company.trim() || !formData.role.trim()) {
      setFormError('Company and Role are required.');
      return;
    }
    setFormError('');
    onAdd(formData);
    setFormData({ company: '', role: '', status: 'applied', deadline: '', notes: '', email: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="application-form">
      <h2>Add Application</h2>
      {formError && <p className="error-text">{formError}</p>}
      <input name="company" placeholder="Company" value={formData.company} onChange={handleChange} />
      <input name="role" placeholder="Role" value={formData.role} onChange={handleChange} />
      <select name="status" value={formData.status} onChange={handleChange}>
        <option value="applied">Applied</option>
        <option value="interview">Interview</option>
        <option value="offer">Offer</option>
        <option value="rejected">Rejected</option>
      </select>
      <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} />
      <input type="email" name="email" placeholder="Email for reminders (optional)" value={formData.email} onChange={handleChange} />
      <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleChange} />
      <button type="submit">Add</button>
    </form>
  );
}

export default ApplicationForm;