function ApplicationList({ applications, onDelete, loading }) {
  if (loading) {
    return <p>Loading your applications...</p>;
  }

  if (applications.length === 0) {
    return <p>No applications yet. Add one above!</p>;
  }

  return (
    <div className="application-list">
      <h2>Your Applications</h2>
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Role</th>
            <th>Status</th>
            <th>Deadline</th>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td>{app.company}</td>
              <td>{app.role}</td>
              <td>
                <span className={`status-badge status-${app.status}`}>
                  {app.status}
                </span>
              </td>
              <td>
                {app.deadline
                  ? new Date(app.deadline).toLocaleDateString()
                  : '-'}
              </td>
              <td>{app.notes}</td>
              <td>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `Delete application for ${app.company}?`
                      )
                    ) {
                      onDelete(app.id);
                    }
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ApplicationList;