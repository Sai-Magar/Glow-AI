document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const loadingState = document.querySelector('.loading-state');
    const resultsContainer = document.querySelector('.results-container');

    // Handle file upload
    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            showError('Please upload an image file');
            return;
        }

        // Show loading state
        loadingState.classList.remove('hidden');
        resultsContainer.classList.add('hidden');

        // Create form data
        const formData = new FormData();
        formData.append('file', file);

        // Send to backend
        fetch('/analyze', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            loadingState.classList.add('hidden');
            displayResults(data);
        })
        .catch(error => {
            loadingState.classList.add('hidden');
            showError('Error analyzing image: ' + error.message);
        });
    }

    // Display analysis results
    function displayResults(data) {
        if (data.error) {
            showError(data.error);
            return;
        }

        const resultsHTML = `
            <div class="analysis-results">
                <h2>Your Skin Analysis</h2>
                <div class="result-cards">
                    <div class="result-card">
                        <h3>Skin Type</h3>
                        <p>${data.skin_type}</p>
                    </div>
                    <div class="result-card">
                        <h3>Age Estimate</h3>
                        <p>${data.age} years</p>
                    </div>
                    <div class="result-card">
                        <h3>Concerns</h3>
                        <ul>
                            ${data.concerns.map(concern => `<li>${concern}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <h2>Recommended Serums</h2>
                <div class="serum-cards">
                    ${data.recommendations.serums.map(serum => `
                        <div class="serum-card">
                            <img src="/static/images/${serum.image}" alt="${serum.name}">
                            <div class="serum-content">
                                <h3>${serum.name}</h3>
                                <p>${serum.benefits}</p>
                                <div class="ingredients">
                                    <strong>Key Ingredients:</strong>
                                    <p>${serum.key_ingredients.join(', ')}</p>
                                </div>
                                <span class="price">${serum.price}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        resultsContainer.innerHTML = resultsHTML;
        resultsContainer.classList.remove('hidden');
    }

    // Error handling
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        resultsContainer.innerHTML = '';
        resultsContainer.appendChild(errorDiv);
        resultsContainer.classList.remove('hidden');
    }

    // Event listeners
    fileInput.addEventListener('change', (e) => {
        handleFile(e.target.files[0]);
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFile(e.dataTransfer.files[0]);
    });
}); 