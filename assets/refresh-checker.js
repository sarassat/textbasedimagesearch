
        // Check for repository updates every 30 seconds
        let lastCommitSha = null;
        
        async function checkForUpdates() {
            try {
                // This would check the repository's latest commit
                // For demo purposes, we'll simulate update detection
                const response = await fetch('versions.json');
                const data = await response.json();
                
                // In a real implementation, this would check the repository's latest commit SHA
                // and compare it with the last known SHA when the documentation was generated
                
                // Simulate random update notification for demo
                if (Math.random() < 0.05) { // 5% chance every 30 seconds
                    showUpdateNotification();
                }
            } catch (error) {
                console.warn('Could not check for updates:', error);
            }
        }
        
        function showUpdateNotification() {
            const notice = document.getElementById('refresh-notice');
            if (notice) {
                notice.style.display = 'block';
            }
        }
        
        // Start checking for updates
        setInterval(checkForUpdates, 30000);
        
        // Check immediately on load
        setTimeout(checkForUpdates, 5000);
    