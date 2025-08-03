const { useState, useEffect } = React;

function App() {
  // Application state
  const [docs, setDocs] = useState(null);
  const [selectedVersionIdx, setSelectedVersionIdx] = useState(0);
  const [selectedFileIdx, setSelectedFileIdx] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [repoName, setRepoName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load the static documentation file on mount
  useEffect(() => {
    // Attempt to fetch docsData.json from the same directory. If the fetch
    // fails (e.g. when running over the file protocol), fall back to the
    // embedded script tag with id="docs-data".
    fetch('docsData.json')
      .then((res) => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
      })
      .then((data) => {
        initialiseDocs(data);
      })
      .catch(() => {
        const el = document.getElementById('docs-data');
        if (el) {
          try {
            const data = JSON.parse(el.textContent);
            initialiseDocs(data);
            return;
          } catch (err) {
            console.error('Failed to parse embedded documentation data', err);
          }
        }
        setLoading(false);
      });
  }, []);

  // Initialise documentation state and compare versions.
  function initialiseDocs(data) {
    setDocs(data);
    const latestVersion = data.versions?.[0]?.version;
    const stored = localStorage.getItem('currentDocVersion');
    if (stored && stored !== latestVersion) {
      setUpdateAvailable(true);
    }
    if (latestVersion) {
      localStorage.setItem('currentDocVersion', latestVersion);
    }
    setSelectedVersionIdx(0);
    setSelectedFileIdx(0);
    setLoading(false);
  }

  // Handler for the form submission. In a full implementation this would
  // call an API endpoint on the server that pulls the repo, generates
  // documentation and updates docsData.json. In this offline example
  // we simply show a message to the user.
  const handleGenerate = (e) => {
    e.preventDefault();
    if (!repoName.trim()) {
      setErrorMessage('Please enter a repository in the form owner/repo');
      return;
    }
    setErrorMessage('');
    setGenerating(true);
    // In a real implementation you would call your backend here, e.g.:
    // fetch(`/api/generate?repo=${encodeURIComponent(repoName)}`)
    //   .then(res => res.json())
    //   .then(updated => { /* reload docs */ });
    // For this demo we'll just wait and then stop loading.
    setTimeout(() => {
      alert(
        'Documentation generation is not available in this demo.\n' +
          'Run the provided generate_docs.py script to create a new version.'
      );
      setGenerating(false);
    }, 500);
  };

  // Render the landing page while docs are loading
  if (loading) {
    return (
      <div className="content" style={{ padding: '2rem' }}>
        <p>Loading documentation…</p>
      </div>
    );
  }

  // If docs failed to load or are missing, show a simple form to generate
  if (!docs) {
    return (
      <div className="content" style={{ padding: '2rem' }}>
        <h2>Generate Documentation</h2>
        <p>
          Enter the GitHub repository you wish to document. Use the format
          <code>owner/repo</code> (for example, <code>sarassat/textbasedimagesearch</code>).
        </p>
        <form onSubmit={handleGenerate}>
          <input
            type="text"
            value={repoName}
            placeholder="owner/repo"
            onChange={(e) => setRepoName(e.target.value)}
            style={{ padding: '0.5rem', width: '70%' }}
          />
          <button
            type="submit"
            style={{ padding: '0.5rem 1rem', marginLeft: '0.5rem' }}
            disabled={generating}
          >
            {generating ? 'Generating…' : 'Generate'}
          </button>
        </form>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </div>
    );
  }

  const versions = docs.versions || [];
  const selectedVersion = versions[selectedVersionIdx];
  const files = selectedVersion ? selectedVersion.files : [];
  const selectedFile = files[selectedFileIdx];

  return (
    <>
      {updateAvailable && (
        <div className="update-banner">
          A newer version of the documentation is available. Please refresh the page
          to load the latest version.
        </div>
      )}
      <div className="sidebar">
        <h2>Versions</h2>
        <ul className="version-list">
          {versions.map((v, idx) => (
            <li key={v.version} className="version-item">
              <button
                onClick={() => {
                  setSelectedVersionIdx(idx);
                  setSelectedFileIdx(0);
                }}
                style={{
                  fontWeight: idx === selectedVersionIdx ? 'bold' : 'normal',
                }}
              >
                {v.version}
              </button>
            </li>
          ))}
        </ul>
        {selectedVersion && (
          <>
            <h2>Files</h2>
            <ul className="file-list">
              {files.map((file, idx) => (
                <li key={file.path} className="file-item">
                  <button
                    onClick={() => setSelectedFileIdx(idx)}
                    style={{
                      fontWeight: idx === selectedFileIdx ? 'bold' : 'normal',
                    }}
                  >
                    {file.path}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div className="content">
        {selectedVersion && selectedFile ? (
          <>
            <h2>{selectedFile.title}</h2>
            {selectedVersion.summary && (
              <p style={{ fontStyle: 'italic' }}>{selectedVersion.summary}</p>
            )}
            <h3>Description</h3>
            <p>{selectedFile.description}</p>
            <h3>API Details</h3>
            <p dangerouslySetInnerHTML={{ __html: selectedFile.apiDetails.replace(/\n/g, '<br/>') }} />
            <h3>Performance Improvement Recommendations</h3>
            <p dangerouslySetInnerHTML={{ __html: selectedFile.performanceRecommendations.replace(/\n/g, '<br/>') }} />
            <h3>Potential Vulnerability Detection</h3>
            <p dangerouslySetInnerHTML={{ __html: selectedFile.vulnerabilities.replace(/\n/g, '<br/>') }} />
          </>
        ) : (
          <p>Select a file to view its documentation.</p>
        )}
      </div>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('app'));