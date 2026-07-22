import { useState } from 'react';
import { matchResume } from '../api';

function ResumeMatcher() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await matchResume({ resumeText, jobDescription });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-matcher">
      <h2>Resume ↔ Job Match Checker</h2>

      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Paste your resume text here..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          rows={6}
        />

        <textarea
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={6}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Check Match'}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {result && (
        <div className="match-result">
          <h3>Match Score: {result.matchScore}%</h3>

          <div className="score-bar-track">
            <div
              className="score-bar-fill"
              style={{ width: `${result.matchScore}%` }}
            />
          </div>

          <p className="summary">{result.summary}</p>

          <div className="skills-columns">
            <div>
              <h4>Matched Skills</h4>

              {result.matchedSkills?.length > 0 ? (
                <ul>
                  {result.matchedSkills.map((skill, i) => (
                    <li key={i} className="matched">
                      {skill}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>None found</p>
              )}
            </div>

            <div>
              <h4>Missing Skills</h4>

              {result.missingSkills?.length > 0 ? (
                <ul>
                  {result.missingSkills.map((skill, i) => (
                    <li key={i} className="missing">
                      {skill}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>None found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeMatcher;