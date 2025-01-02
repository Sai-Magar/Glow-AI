// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initNavbar();
    initImageUpload();
    initAnimations();
    initTestimonialSlider();
    initNewsletterForm();
});

// Navbar functionality
const initNavbar = () => {
    const navbar = document.querySelector('.navbar');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    mobileMenuBtn?.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-links') && !e.target.closest('.mobile-menu-btn')) {
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        }
    });
};

// Image upload and analysis functionality
const initImageUpload = () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const resultsContainer = document.querySelector('.results-container');
    const loadingState = document.querySelector('.loading-state');
    const analysisResults = document.querySelector('.analysis-results');

    // Handle drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('highlight');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('highlight');
        });
    });

    // Handle file drop
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    });

    // Handle file input change
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // File handling and analysis
    function handleFiles(files) {
        const file = files[0];
        if (file && file.type.startsWith('image/')) {
            // Show loading state
            resultsContainer.classList.remove('hidden');
            loadingState.classList.remove('hidden');
            analysisResults.classList.add('hidden');

            // Simulate analysis progress
            simulateAnalysis()
                .then(() => {
                    loadingState.classList.add('hidden');
                    analysisResults.classList.remove('hidden');
                    populateResults();
                });
        } else {
            showError('Please upload an image file.');
        }
    }

    // Simulate AI analysis with progress
    function simulateAnalysis() {
        const progressBar = document.querySelector('.progress-bar-fill');
        let progress = 0;

        return new Promise((resolve) => {
            const interval = setInterval(() => {
                progress += 1;
                progressBar.style.width = `${progress}%`;

                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(resolve, 500);
                }
            }, 30);
        });
    }

    // Populate analysis results
    function populateResults() {
        // Sample results - In production, this would come from your AI analysis
        const sampleResults = {
            skinType: 'Combination',
            concerns: ['Mild dryness', 'Uneven texture', 'Fine lines'],
            recommendations: [
                {
                    name: 'Vitamin C Serum',
                    description: 'Brightening & Anti-aging',
                    image: 'assets/serum1.jpg',
                    price: '$45'
                },
                {
                    name: 'Hyaluronic Acid',
                    description: 'Deep hydration',
                    image: 'assets/serum2.jpg',
                    price: '$38'
                },
                {
                    name: 'Niacinamide Serum',
                    description: 'Pore refinement',
                    image: 'assets/serum3.jpg',
                    price: '$42'
                }
            ]
        };

        // Populate results
        displayResults(sampleResults);
    }
};

// Animation initialization
const initAnimations = () => {
    // Initialize GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Animate sections on scroll
    gsap.utils.toArray('.animate-on-scroll').forEach(element => {
        gsap.from(element, {
            y: 50,
            opacity: 0,
            duration: 1,
            scrollTrigger: {
                trigger: element,
                start: 'top 80%',
                end: 'top 50%',
                scrub: 1
            }
        });
    });
};

// Testimonial slider
const initTestimonialSlider = () => {
    const slider = document.querySelector('.testimonials-slider');
    if (!slider) return;

    let currentSlide = 0;
    const slides = slider.children;
    const slideCount = slides.length;

    setInterval(() => {
        currentSlide = (currentSlide + 1) % slideCount;
        updateSlider();
    }, 5000);

    function updateSlider() {
        const offset = -currentSlide * 100;
        slider.style.transform = `translateX(${offset}%)`;
    }
};

// Newsletter form handling
const initNewsletterForm = () => {
    const form = document.querySelector('.newsletter-form');
    
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value;
        
        // Validate email
        if (validateEmail(email)) {
            // Show success message
            showToast('Thank you for subscribing!', 'success');
            form.reset();
        } else {
            showToast('Please enter a valid email address.', 'error');
        }
    });
};

// Utility functions
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Display analysis results
function displayResults(results) {
    const resultCards = document.querySelector('.result-cards');
    const serumCards = document.querySelector('.serum-cards');

    // Clear previous results
    resultCards.innerHTML = '';
    serumCards.innerHTML = '';

    // Display skin analysis
    const skinTypeCard = createResultCard('Skin Type', results.skinType);
    const concernsCard = createResultCard('Concerns', results.concerns.join(', '));
    resultCards.appendChild(skinTypeCard);
    resultCards.appendChild(concernsCard);

    // Display serum recommendations
    results.recommendations.forEach(serum => {
        const serumCard = createSerumCard(serum);
        serumCards.appendChild(serumCard);
    });
}

// Create result card element
function createResultCard(title, content) {
    const card = document.createElement('div');
    card.className = 'result-card animate-fade-up';
    card.innerHTML = `
        <h3>${title}</h3>
        <p>${content}</p>
    `;
    return card;
}

// Create serum card element
function createSerumCard(serum) {
    const card = document.createElement('div');
    card.className = 'serum-card animate-fade-up';
    card.innerHTML = `
        <img src="${serum.image}" alt="${serum.name}">
        <div class="serum-content">
            <h3>${serum.name}</h3>
            <p>${serum.description}</p>
            <span class="price">${serum.price}</span>
            <button class="btn btn-primary">Learn More</button>
        </div>
    `;
    return card;
}

// Add smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}); 