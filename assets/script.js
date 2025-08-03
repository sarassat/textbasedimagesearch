
        function switchVersion(version) {
            const frame = document.getElementById('doc-frame');
            frame.src = 'versions/' + version + '/index.html';
        }
        
        // Load available versions
        fetch('versions.json')
            .then(response => response.json())
            .then(data => {
                const select = document.getElementById('version-select');
                select.innerHTML = '';
                
                data.versions.forEach(version => {
                    const option = document.createElement('option');
                    option.value = version.version;
                    option.textContent = version.version + (version.version === data.latest ? ' (Latest)' : '');
                    select.appendChild(option);
                });
            })
            .catch(error => console.warn('Could not load versions:', error));
    