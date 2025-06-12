class PresentationApp {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 3;
        this.isTransitioning = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateSlideDisplay();
        this.updateProgressBar();
        this.setupTouchSupport();
        this.setupKeyboardNavigation();
        this.initializeInteractiveElements();
    }

    setupEventListeners() {
        // Navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousSlide());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // Slide indicators - Fix: Ensure proper event binding
        document.querySelectorAll('.slide-dot').forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToSlide(index);
            });
            
            // Add visual feedback
            dot.style.cursor = 'pointer';
        });

        // Player cards click handlers - Fix: Use more specific targeting and add debugging
        this.setupPlayerCardHandlers();

        // Channel cards hover effects
        document.querySelectorAll('.channel-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.enhanceChannelCard(card);
            });
            card.addEventListener('mouseleave', () => {
                this.resetChannelCard(card);
            });
        });

        // Phase cards click handlers
        document.querySelectorAll('.phase-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.showPhaseDetails(e.currentTarget);
            });
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    setupPlayerCardHandlers() {
        // Fix: More robust player card event handling
        const playerCards = document.querySelectorAll('.player-card');
        
        playerCards.forEach(card => {
            // Remove any existing handlers to prevent duplicates
            card.removeEventListener('click', this.handlePlayerCardClick);
            
            // Add click handler
            card.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showPlayerDetails(card);
            });
            
            // Visual feedback
            card.style.cursor = 'pointer';
            
            // Add hover effect
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
                card.style.boxShadow = 'var(--shadow-lg)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.boxShadow = '';
            });
        });
    }

    setupTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;

        const slidesContainer = document.getElementById('slidesContainer');
        
        if (slidesContainer) {
            slidesContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            });

            slidesContainer.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe(touchStartX, touchEndX);
            });
        }
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides - 1);
                    break;
                case 'Escape':
                    this.closeModal();
                    break;
            }
        });
    }

    initializeInteractiveElements() {
        // Animate value bars on slide load
        this.animateValueBars();
        
        // Initialize tooltips
        this.initializeTooltips();
        
        // Set up intersection observer for animations
        this.setupIntersectionObserver();
        
        // Add modal styles immediately
        this.addModalStyles();
    }

    handleSwipe(startX, endX) {
        const threshold = 50;
        const difference = startX - endX;

        if (Math.abs(difference) > threshold) {
            if (difference > 0) {
                // Swipe left - next slide
                this.nextSlide();
            } else {
                // Swipe right - previous slide
                this.previousSlide();
            }
        }
    }

    nextSlide() {
        if (this.isTransitioning) return;
        
        if (this.currentSlide < this.totalSlides - 1) {
            this.goToSlide(this.currentSlide + 1);
        }
    }

    previousSlide() {
        if (this.isTransitioning) return;
        
        if (this.currentSlide > 0) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    goToSlide(slideIndex) {
        if (this.isTransitioning || slideIndex === this.currentSlide || slideIndex < 0 || slideIndex >= this.totalSlides) return;
        
        this.isTransitioning = true;
        
        const slides = document.querySelectorAll('.slide');
        const currentSlideElement = slides[this.currentSlide];
        const targetSlideElement = slides[slideIndex];

        // Update slide classes
        slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev');
            if (index < slideIndex) {
                slide.classList.add('prev');
            }
        });

        // Animate transition
        setTimeout(() => {
            targetSlideElement.classList.add('active');
            this.currentSlide = slideIndex;
            this.updateSlideDisplay();
            this.updateProgressBar();
            this.animateValueBars();
            
            setTimeout(() => {
                this.isTransitioning = false;
            }, 250);
        }, 50);
    }

    updateSlideDisplay() {
        // Update slide counter
        const currentSlideElement = document.getElementById('currentSlide');
        const totalSlidesElement = document.getElementById('totalSlides');
        
        if (currentSlideElement) {
            currentSlideElement.textContent = this.currentSlide + 1;
        }
        
        if (totalSlidesElement) {
            totalSlidesElement.textContent = this.totalSlides;
        }

        // Update navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentSlide === 0;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
        }

        // Update slide indicators
        document.querySelectorAll('.slide-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }

    updateProgressBar() {
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            const progress = ((this.currentSlide + 1) / this.totalSlides) * 100;
            progressFill.style.width = `${progress}%`;
        }
    }

    animateValueBars() {
        // Animate all value bars in the current slide
        const currentSlide = document.querySelector('.slide.active');
        if (!currentSlide) return;

        const valueBars = currentSlide.querySelectorAll('.value-fill, .coverage-fill');
        valueBars.forEach(bar => {
            const targetWidth = bar.style.width;
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 300);
        });
    }

    showPlayerDetails(playerCard) {
        const playerNameElement = playerCard.querySelector('h3');
        if (!playerNameElement) return;
        
        const playerName = playerNameElement.textContent.trim();
        const playerData = this.getPlayerData(playerName);
        
        if (playerData) {
            this.showModal(playerName, this.createPlayerDetailsHTML(playerData));
        } else {
            console.warn('No data found for player:', playerName);
        }
    }

    getPlayerData(playerName) {
        const players = {
            'Align Technology': {
                position: 'Global market leader',
                revenue: '$4.0B total revenue (2024)',
                systems: '$768.9M Systems & Services',
                products: 'iTero scanners, Invisalign ecosystem',
                strengths: ['Established distribution network', 'Strong brand recognition', 'Integrated treatment workflow'],
                partnerships: ['Henry Schein distribution', 'Global KOL network'],
                strategic_value: 'High market access potential, established channels',
                partnership_approach: 'Direct sales partnership, European market entry support'
            },
            '3Shape': {
                position: 'Open platform ecosystem leader',
                products: 'TRIOS scanners, Unite platform',
                ecosystem: '1000+ labs, 100+ world-class partners',
                strengths: ['Open architecture', 'Strong R&D capabilities', 'Developer-friendly platform'],
                partnerships: ['Unite Platform partners', 'Academic collaborations'],
                strategic_value: 'Excellent integration opportunities, proven open ecosystem',
                partnership_approach: 'App marketplace integration, API collaboration, standards development'
            },
            'Dentsply Sirona': {
                position: 'Traditional industry leader',
                products: 'Primescan (CEREC), exocad software',
                presence: 'Strong German presence (Bensheim headquarters)',
                strengths: ['Large installed base', 'Comprehensive CAD/CAM solutions', 'Educational programs'],
                partnerships: ['Academic partnerships', 'Dental schools'],
                strategic_value: 'Large user base, conservative but stable approach',
                partnership_approach: 'Academic partnerships, interface development, gradual integration'
            },
            'Acteon Group': {
                position: 'French dental imaging specialist',
                opportunity: 'No current IOS offering - strategic gap',
                strengths: ['Hardware expertise', 'European distribution network', 'Imaging technology leadership'],
                partnerships: ['European distributors', 'Research institutions'],
                strategic_value: 'Hardware co-development potential, European market access',
                partnership_approach: 'Joint R&D for open-source scanner modules, co-engineering partnership'
            },
            'orangedental GmbH': {
                position: 'German distributor and system integrator',
                specialization: 'DACH market specialist, Biberach-based',
                experience: 'Fussen S6500 distribution and localization',
                support: '365-day hotline, local training programs',
                strengths: ['Regional expertise', 'Technical support capabilities', 'Localization experience'],
                strategic_value: 'Critical DACH market access, proven support model',
                partnership_approach: 'Exclusive DACH distribution rights, value-added services'
            },
            'DentalTwin': {
                position: 'Munich-based AI prosthodontics startup',
                focus: 'AI-powered prosthodontic workflow automation',
                funding: '€20M+ funding, growing rapidly',
                strengths: ['AI/ML expertise', 'German market knowledge', 'Innovation focus'],
                partnerships: ['German dental practices', 'Research collaborations'],
                strategic_value: 'Complementary AI technology, workflow optimization',
                partnership_approach: 'Software integration, joint AI development, workflow enhancement'
            },
            'Pearl Inc.': {
                position: 'US AI diagnostics leader',
                achievement: 'First FDA-cleared 2D+3D dental AI system',
                funding: '$58M (largest dental AI funding round)',
                strengths: ['Regulatory expertise', 'Proven AI technology', 'Clinical validation'],
                partnerships: ['US dental networks', 'Insurance partners'],
                strategic_value: 'Proven diagnostic AI, regulatory pathway knowledge',
                partnership_approach: 'European market entry via open platform, AI module integration'
            }
        };

        return players[playerName];
    }

    createPlayerDetailsHTML(playerData) {
        return `
            <div class="player-details-modal">
                <div class="player-overview">
                    <h4>Market Position</h4>
                    <p>${playerData.position}</p>
                    
                    ${playerData.revenue ? `<p><strong>Revenue:</strong> ${playerData.revenue}</p>` : ''}
                    ${playerData.products ? `<p><strong>Products:</strong> ${playerData.products}</p>` : ''}
                    ${playerData.funding ? `<p><strong>Funding:</strong> ${playerData.funding}</p>` : ''}
                    ${playerData.ecosystem ? `<p><strong>Ecosystem:</strong> ${playerData.ecosystem}</p>` : ''}
                </div>
                
                <div class="player-strengths">
                    <h4>Key Strengths</h4>
                    <ul>
                        ${playerData.strengths.map(strength => `<li>${strength}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="strategic-assessment">
                    <h4>Strategic Value</h4>
                    <p>${playerData.strategic_value}</p>
                    
                    <h4>Partnership Approach</h4>
                    <p>${playerData.partnership_approach}</p>
                </div>
            </div>
        `;
    }

    showPhaseDetails(phaseCard) {
        const phaseNumber = phaseCard.getAttribute('data-phase');
        const phaseData = this.getPhaseData(phaseNumber);
        
        if (phaseData) {
            this.showModal(`Phase ${phaseNumber}: ${phaseData.title}`, this.createPhaseDetailsHTML(phaseData));
        }
    }

    getPhaseData(phaseNumber) {
        const phases = {
            '1': {
                title: 'Foundation Building',
                timeline: 'Months 1-6',
                investment: '€0.5M',
                description: 'Establish core partnerships and validate market approach',
                objectives: [
                    'Validate partnerships with Acteon, orangedental, Lexmann',
                    'Establish Academic Advisory Board (Prof. Wöstmann, Fraunhofer IGD)',
                    'Conference presence at IDS 2025, DGDOA meetings',
                    'Apply for EU Horizon Europe, German ZIM funding'
                ],
                risks: ['Partnership negotiations may take longer', 'Funding competition is intense'],
                success_metrics: ['Signed LOIs with key partners', 'Advisory board established', 'Funding applications submitted']
            },
            '2': {
                title: 'MVP Development',
                timeline: 'Months 6-12',
                investment: '€1.5M',
                description: 'Co-develop MVP with partners and establish IP framework',
                objectives: [
                    'Co-engineering with Acteon (optics), Fraunhofer (algorithms)',
                    'Beta program with Lexmann lab + 5 partner practices',
                    'Establish IP framework and dual licensing model',
                    'Launch community platform (GitHub, Discourse forum)'
                ],
                risks: ['Technical integration challenges', 'IP negotiations complexity'],
                success_metrics: ['Working prototype delivered', 'Beta testing completed', 'Community platform active']
            },
            '3': {
                title: 'Market Launch',
                timeline: 'Months 12-18',
                investment: '€1.5M',
                description: 'Launch commercial operations and establish market presence',
                objectives: [
                    'orangedental exclusive DACH distribution rights',
                    'Pearl diagnostic modules integration',
                    'University pilots in Germany, Austria, Switzerland',
                    'Press campaign via Dental Tribune, trade publications'
                ],
                risks: ['Market reception uncertainty', 'Competition response'],
                success_metrics: ['Distribution agreements signed', 'AI modules integrated', 'University pilots active']
            },
            '4': {
                title: 'Scale & Expand',
                timeline: 'Months 18-24+',
                investment: '€1M+',
                description: 'Scale operations and explore expansion opportunities',
                objectives: [
                    'European expansion via ADEE network',
                    'Commercial scanner based on open platform',
                    'Self-sustaining community support',
                    'Strategic exit opportunities'
                ],
                risks: ['Scaling challenges', 'Increased competition'],
                success_metrics: ['€5M+ revenue by Year 3', 'European presence established', 'Exit opportunities identified']
            }
        };

        return phases[phaseNumber];
    }

    createPhaseDetailsHTML(phaseData) {
        return `
            <div class="phase-details-modal">
                <div class="phase-overview">
                    <div class="phase-meta">
                        <span class="phase-timeline">${phaseData.timeline}</span>
                        <span class="phase-investment">${phaseData.investment}</span>
                    </div>
                    <p class="phase-description">${phaseData.description}</p>
                </div>
                
                <div class="phase-objectives">
                    <h4>Key Objectives</h4>
                    <ul>
                        ${phaseData.objectives.map(obj => `<li>${obj}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="phase-risks">
                    <h4>Key Risks</h4>
                    <ul>
                        ${phaseData.risks.map(risk => `<li>${risk}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="phase-metrics">
                    <h4>Success Metrics</h4>
                    <ul>
                        ${phaseData.success_metrics.map(metric => `<li>${metric}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    enhanceChannelCard(card) {
        card.style.transform = 'translateY(-4px) scale(1.02)';
        
        // Add subtle glow effect
        const importanceBadge = card.querySelector('.importance-badge');
        if (importanceBadge) {
            importanceBadge.style.boxShadow = '0 0 10px rgba(33, 128, 141, 0.3)';
        }
    }

    resetChannelCard(card) {
        card.style.transform = '';
        
        const importanceBadge = card.querySelector('.importance-badge');
        if (importanceBadge) {
            importanceBadge.style.boxShadow = '';
        }
    }

    showModal(title, content) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('presentationModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'presentationModal';
            modal.className = 'presentation-modal';
            modal.innerHTML = `
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title"></h3>
                        <button class="modal-close" aria-label="Close">&times;</button>
                    </div>
                    <div class="modal-body"></div>
                </div>
            `;
            document.body.appendChild(modal);

            // Add close functionality
            modal.querySelector('.modal-close').addEventListener('click', () => {
                this.closeModal();
            });

            modal.querySelector('.modal-overlay').addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Update modal content
        modal.querySelector('.modal-title').textContent = title;
        modal.querySelector('.modal-body').innerHTML = content;
        
        // Show modal with animation
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    closeModal() {
        const modal = document.getElementById('presentationModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 250);
        }
    }

    addModalStyles() {
        // Check if styles already added
        if (document.getElementById('modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .presentation-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2000;
                display: none;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity var(--duration-normal) var(--ease-standard);
            }
            
            .presentation-modal.active {
                opacity: 1;
            }
            
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
            }
            
            .modal-content {
                position: relative;
                background-color: var(--color-surface);
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-lg);
                max-width: 800px;
                max-height: 80vh;
                width: 90%;
                overflow: hidden;
                transform: scale(0.9);
                transition: transform var(--duration-normal) var(--ease-standard);
            }
            
            .presentation-modal.active .modal-content {
                transform: scale(1);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--space-20);
                border-bottom: 1px solid var(--color-border);
                background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
                color: var(--color-btn-primary-text);
            }
            
            .modal-title {
                margin: 0;
                font-size: var(--font-size-xl);
                font-weight: var(--font-weight-semibold);
            }
            
            .modal-close {
                background: none;
                border: none;
                color: var(--color-btn-primary-text);
                font-size: 24px;
                cursor: pointer;
                padding: var(--space-4);
                border-radius: var(--radius-sm);
                transition: background-color var(--duration-fast) var(--ease-standard);
            }
            
            .modal-close:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }
            
            .modal-body {
                padding: var(--space-20);
                max-height: 60vh;
                overflow-y: auto;
            }
            
            .player-details-modal, .phase-details-modal {
                display: flex;
                flex-direction: column;
                gap: var(--space-20);
            }
            
            .player-overview, .player-strengths, .strategic-assessment,
            .phase-overview, .phase-objectives, .phase-risks, .phase-metrics {
                padding: var(--space-16);
                background-color: var(--color-background);
                border-radius: var(--radius-base);
                border-left: 4px solid var(--color-primary);
            }
            
            .player-details-modal h4, .phase-details-modal h4 {
                color: var(--color-primary);
                margin-bottom: var(--space-8);
                font-size: var(--font-size-lg);
            }
            
            .player-details-modal ul, .phase-details-modal ul {
                list-style: none;
                padding: 0;
                margin: var(--space-8) 0 0 0;
            }
            
            .player-details-modal li, .phase-details-modal li {
                position: relative;
                padding-left: var(--space-20);
                margin-bottom: var(--space-6);
                color: var(--color-text);
            }
            
            .player-details-modal li::before, .phase-details-modal li::before {
                content: "→";
                position: absolute;
                left: 0;
                color: var(--color-primary);
                font-weight: var(--font-weight-bold);
            }
            
            .phase-meta {
                display: flex;
                gap: var(--space-16);
                margin-bottom: var(--space-12);
            }
            
            .phase-timeline, .phase-investment {
                background-color: var(--color-secondary);
                padding: var(--space-4) var(--space-8);
                border-radius: var(--radius-sm);
                font-size: var(--font-size-sm);
                font-weight: var(--font-weight-medium);
            }
            
            .phase-description {
                color: var(--color-text-secondary);
                font-style: italic;
                margin: 0;
            }
            
            @media (max-width: 768px) {
                .modal-content {
                    width: 95%;
                    max-height: 90vh;
                }
                
                .modal-header, .modal-body {
                    padding: var(--space-16);
                }
                
                .phase-meta {
                    flex-direction: column;
                    gap: var(--space-8);
                }
            }
        `;
        document.head.appendChild(style);
    }

    initializeTooltips() {
        // Add tooltips for confidence badges
        document.querySelectorAll('.confidence-badge').forEach(badge => {
            const confidence = badge.textContent.toLowerCase();
            let tooltipText = '';
            
            switch (confidence) {
                case 'high':
                    tooltipText = 'High confidence: Validated through multiple sources and direct contact';
                    break;
                case 'medium':
                    tooltipText = 'Medium confidence: Good evidence but requires validation';
                    break;
                case 'low':
                    tooltipText = 'Low confidence: Limited information, needs further research';
                    break;
            }
            
            if (tooltipText) {
                badge.title = tooltipText;
            }
        });

        // Add tooltips for importance badges
        document.querySelectorAll('.importance-badge').forEach(badge => {
            const importance = badge.textContent.toLowerCase();
            let tooltipText = '';
            
            switch (importance) {
                case 'critical':
                    tooltipText = 'Critical: Essential for project success';
                    break;
                case 'high':
                    tooltipText = 'High: Very important for achieving objectives';
                    break;
                case 'medium':
                    tooltipText = 'Medium: Valuable but not essential';
                    break;
                case 'limited':
                    tooltipText = 'Limited: Nice to have but low priority';
                    break;
            }
            
            if (tooltipText) {
                badge.title = tooltipText;
            }
        });
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe cards for animation
        document.querySelectorAll('.player-card, .channel-card, .phase-card').forEach(card => {
            observer.observe(card);
        });
    }

    handleResize() {
        // Update any size-dependent calculations
        this.updateProgressBar();
    }
}

// Initialize the presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.presentationApp = new PresentationApp();
});

// Add some CSS for animations
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    .player-card, .channel-card, .phase-card {
        opacity: 0;
        transform: translateY(20px);
        transition: all var(--duration-normal) var(--ease-standard);
    }
    
    .player-card.animate-in, .channel-card.animate-in, .phase-card.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .slide {
        will-change: transform, opacity;
    }
    
    .value-fill, .coverage-fill {
        will-change: width;
    }
`;
document.head.appendChild(animationStyles);