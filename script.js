document.addEventListener('DOMContentLoaded', () => {
    // 1. Staggered Entry & Scroll Reveal Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe standard reveal elements
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    
    // Observe stagger elements inside groups
    document.querySelectorAll('.stagger-group').forEach(group => {
        const items = group.querySelectorAll('.stagger-item');
        items.forEach((item, index) => {
            item.style.transitionDelay = `${index * 50}ms`;
            observer.observe(item);
        });
    });

    // Also observe the trust layer
    document.querySelectorAll('.stagger-reveal').forEach(el => observer.observe(el));


    // 2. Cursor-Based Interaction (Glow)
    const cursorGlow = document.getElementById('cursor-glow');
    if (cursorGlow) {
        document.addEventListener('mousemove', (e) => {
            // Use requestAnimationFrame for smoother performance
            requestAnimationFrame(() => {
                cursorGlow.style.left = `${e.clientX}px`;
                cursorGlow.style.top = `${e.clientY}px`;
            });
        });
    }

    // 3. Scroll-Based Motion System (Parallax for Hero Symbols)
    const parallaxSymbols = document.getElementById('parallax-symbols');
    if (parallaxSymbols) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY < window.innerHeight) { 
                // Only animate if hero is visible to save performance
                requestAnimationFrame(() => {
                    parallaxSymbols.style.transform = `translateY(${scrollY * 0.3}px)`;
                });
            }
        });
    }

    // 4. Daily Streak Logic
    function updateStreak() {
        const today = new Date().toDateString();
        let lastVisit = localStorage.getItem('jee_last_visit');
        let currentStreak = parseInt(localStorage.getItem('jee_streak') || '0', 10);

        if (lastVisit) {
            const lastDate = new Date(lastVisit);
            const todayDate = new Date(today);
            const diffTime = Math.abs(todayDate - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            if (diffDays === 1) {
                // Consecutive day
                currentStreak += 1;
            } else if (diffDays > 1) {
                // Streak broken
                currentStreak = 1;
            }
            // diffDays === 0 means already visited today, do nothing to streak
        } else {
            // First visit
            currentStreak = 1;
        }

        localStorage.setItem('jee_last_visit', today);
        localStorage.setItem('jee_streak', currentStreak);

        const streakBadge = document.getElementById('streak-badge');
        const streakCount = document.getElementById('streak-count');
        if (streakBadge && streakCount) {
            streakCount.textContent = currentStreak;
            // Only show if streak > 0
            if (currentStreak > 0) {
                streakBadge.style.display = 'inline-flex';
            }
        }
    }
    updateStreak();

    // 5. Global Feedback Modal Injection & Logic
    function initFeedbackModal() {
        // Inject modal HTML into body
        const modalHTML = `
            <div class="modal-backdrop" id="feedback-modal">
                <div class="modal-content">
                    <button class="modal-close" id="modal-close-btn" aria-label="Close modal">&times;</button>
                    
                    <div id="modal-form-view">
                        <div class="modal-header">
                            <h3>Help Us Improve</h3>
                            <p>Found a bug or have a suggestion? Let us know.</p>
                        </div>
                        <div class="modal-body">
                            <div class="input-group">
                                <label for="feedback-type">What's this about?</label>
                                <select id="feedback-type">
                                    <option value="bug">Report a Bug</option>
                                    <option value="feature">Suggest a Feature</option>
                                    <option value="other">Other Request</option>
                                </select>
                            </div>
                            <div class="input-group">
                                <label for="feedback-text">Message</label>
                                <textarea id="feedback-text" placeholder="Tell us exactly what happened..."></textarea>
                            </div>
                            <button class="btn-submit" id="submit-feedback-btn">Send Message</button>
                        </div>
                    </div>

                    <div id="modal-success-view" class="success-msg">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🚀</div>
                        <h3>Thanks for your help!</h3>
                        <p>We've received your feedback and will look into it.</p>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.getElementById('feedback-modal');
        const closeBtn = document.getElementById('modal-close-btn');
        const submitBtn = document.getElementById('submit-feedback-btn');
        const formView = document.getElementById('modal-form-view');
        const successView = document.getElementById('modal-success-view');

        // Globals for external onclick calls
        window.openFeedbackModal = () => {
            modal.classList.add('active');
            // Reset state
            formView.style.display = 'block';
            successView.style.display = 'none';
            document.getElementById('feedback-text').value = '';
            submitBtn.classList.remove('loading');
        };

        window.closeFeedbackModal = () => {
            modal.classList.remove('active');
        };

        closeBtn.addEventListener('click', window.closeFeedbackModal);
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                window.closeFeedbackModal();
            }
        });

        // Handle Submit Mock
        submitBtn.addEventListener('click', () => {
            const text = document.getElementById('feedback-text').value.trim();
            if (!text) return; // Basic validation
            
            submitBtn.classList.add('loading');
            
            // Simulate network request
            setTimeout(() => {
                formView.style.display = 'none';
                successView.style.display = 'block';
                
                // Auto close after 3s
                setTimeout(() => {
                    window.closeFeedbackModal();
                }, 3000);
            }, 1000);
        });
    }
    
    // Slight delay to ensure body is fully parsed before injecting modal
    setTimeout(initFeedbackModal, 100);

    // 6. Search and Filter Logic for tools.html
    const searchInput = document.querySelector('.search-bar input');
    const searchBtn = document.querySelector('.search-bar .btn-primary');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const sectionTitles = document.querySelectorAll('.section-title');
    
    if (searchInput && filterTabs.length > 0) {
        const filterContainer = document.querySelector('.filter-tabs');
        
        // Create the search results container
        const searchResTitle = document.createElement('h2');
        searchResTitle.className = 'section-title';
        searchResTitle.textContent = 'Search Results';
        searchResTitle.style.display = 'none';
        
        const searchResGrid = document.createElement('div');
        searchResGrid.className = 'grid';
        searchResGrid.style.marginBottom = '4rem';
        searchResGrid.style.display = 'none';
        
        filterContainer.parentNode.insertBefore(searchResTitle, filterContainer.nextSibling);
        filterContainer.parentNode.insertBefore(searchResGrid, searchResTitle.nextSibling);

        const performSearch = () => {
            const query = searchInput.value.toLowerCase().trim();
            const activeTab = document.querySelector('.filter-tab.active').textContent.trim();
            
            if (query === '') {
                // Restore default category view
                searchResTitle.style.display = 'none';
                searchResGrid.style.display = 'none';
                searchResGrid.innerHTML = '';
                
                sectionTitles.forEach(title => {
                    const sectionName = title.textContent.trim();
                    const grid = title.nextElementSibling;
                    if (!grid || !grid.classList.contains('grid')) return;
                    
                    let tabNameMatch = activeTab;
                    if (activeTab === 'Productivity') tabNameMatch = 'Revision';
                    const tabMatches = activeTab === 'All' || sectionName.includes(tabNameMatch) || sectionName.includes(activeTab);
                    
                    if (tabMatches) {
                        title.style.display = '';
                        grid.style.display = '';
                        grid.querySelectorAll('.card').forEach(c => c.style.display = '');
                    } else {
                        title.style.display = 'none';
                        grid.style.display = 'none';
                    }
                });
            } else {
                // Search view: Sort alphabetically and hide categories
                searchResGrid.innerHTML = '';
                const matchedCards = [];
                
                // Hide all standard sections
                sectionTitles.forEach(title => {
                    title.style.display = 'none';
                    
                    const grid = title.nextElementSibling;
                    if (grid && grid.classList.contains('grid')) {
                        grid.style.display = 'none';
                        
                        const sectionName = title.textContent.trim();
                        let tabNameMatch = activeTab;
                        if (activeTab === 'Productivity') tabNameMatch = 'Revision';
                        const tabMatches = activeTab === 'All' || sectionName.includes(tabNameMatch) || sectionName.includes(activeTab);
                        
                        // Only add matches if they fall under the active tab (or 'All' tab)
                        if (tabMatches) {
                            grid.querySelectorAll('.card').forEach(card => {
                                const titleText = card.querySelector('.card-title').textContent.toLowerCase();
                                const descText = card.querySelector('.card-desc').textContent.toLowerCase();
                                if (titleText.includes(query) || descText.includes(query)) {
                                    matchedCards.push({
                                        title: titleText,
                                        element: card.cloneNode(true)
                                    });
                                }
                            });
                        }
                    }
                });
                
                // Sort by title alphabetically
                matchedCards.sort((a, b) => a.title.localeCompare(b.title));
                
                if (matchedCards.length > 0) {
                    matchedCards.forEach(mc => {
                        mc.element.style.display = ''; // Ensure card is visible
                        searchResGrid.appendChild(mc.element);
                    });
                    searchResTitle.style.display = '';
                    searchResTitle.textContent = `Search Results (${matchedCards.length})`;
                    searchResGrid.style.display = '';
                } else {
                    searchResTitle.style.display = '';
                    searchResTitle.textContent = 'No tools found';
                    searchResGrid.style.display = 'none';
                }
            }
        };

        searchInput.addEventListener('input', performSearch);
        if (searchBtn) searchBtn.addEventListener('click', performSearch);
        
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                performSearch();
            });
        });
    }

    // 7. SPECIFIC TOOL LOGIC: Percentage Calculator
    const btnPercentage = document.getElementById('btn-percentage');
    if (btnPercentage) {
        const inputVal1 = document.getElementById('perc-val-1');
        const inputVal2 = document.getElementById('perc-val-2');
        const resultValue = document.querySelector('.result-value');
        const stepOutput = document.querySelector('.result-box p');

        const validateInputs = (v1, v2) => {
            if (v1 === '' || v2 === '') return { valid: false, error: 'Please fill all fields.' };
            const num1 = parseFloat(v1);
            const num2 = parseFloat(v2);
            if (isNaN(num1) || isNaN(num2)) return { valid: false, error: 'Please enter valid numbers.' };
            return { valid: true, num1, num2 };
        };

        const formatNumber = (num) => Number.isInteger(num) ? num : parseFloat(num.toFixed(4));

        const calculatePercentage = () => {
            const val1 = inputVal1.value.trim();
            const val2 = inputVal2.value.trim();
            const validation = validateInputs(val1, val2);

            if (!validation.valid) {
                resultValue.innerHTML = `<span style="color: #ef4444; font-size: 1.1rem;">${validation.error}</span>`;
                stepOutput.innerHTML = '';
                resultValue.style.transform = 'translateX(4px)';
                setTimeout(() => resultValue.style.transform = 'translateX(0)', 150);
                return;
            }

            const { num1, num2 } = validation;
            resultValue.innerHTML = '<span style="opacity: 0.5;">Computing...</span>';
            
            setTimeout(() => {
                // Determine logic
                const percentageOf = (num1 / 100) * num2;
                let whatPercentage = (num2 !== 0) ? (num1 / num2) * 100 : null;
                let percentChange = (num1 !== 0) ? ((num2 - num1) / Math.abs(num1)) * 100 : null;

                let resultHTML = `<div style="font-size: 1.1rem; margin-bottom: 0.75rem;"><strong>${formatNumber(num1)}%</strong> of <strong>${formatNumber(num2)}</strong> = <span style="color: var(--accent-blue);">${formatNumber(percentageOf)}</span></div>`;
                let breakdownHTML = `Calculation: (${formatNumber(num1)} / 100) × ${formatNumber(num2)} = ${formatNumber(percentageOf)}`;

                if (whatPercentage !== null) {
                    resultHTML += `<div style="font-size: 1.1rem; margin-bottom: 0.75rem;"><strong>${formatNumber(num1)}</strong> is <strong><span style="color: var(--accent-violet);">${formatNumber(whatPercentage)}%</span></strong> of <strong>${formatNumber(num2)}</strong></div>`;
                    breakdownHTML += `<br>Calculation: (${formatNumber(num1)} / ${formatNumber(num2)}) × 100 = ${formatNumber(whatPercentage)}%`;
                }

                if (percentChange !== null) {
                    const isIncrease = percentChange >= 0;
                    resultHTML += `<div style="font-size: 1.1rem;">Change from <strong>${formatNumber(num1)}</strong> to <strong>${formatNumber(num2)}</strong> = <strong><span style="color: ${isIncrease ? '#10b981' : '#ef4444'};">${formatNumber(Math.abs(percentChange))}% ${isIncrease ? 'Increase' : 'Decrease'}</span></strong></div>`;
                    breakdownHTML += `<br>Calculation: |${formatNumber(num2)} - ${formatNumber(num1)}| / |${formatNumber(num1)}| × 100 = ${formatNumber(Math.abs(percentChange))}%`;
                }

                resultValue.innerHTML = resultHTML;
                stepOutput.innerHTML = breakdownHTML;
            }, 150);
        };

        btnPercentage.addEventListener('click', calculatePercentage);
        const handleEnter = (e) => { if (e.key === 'Enter') calculatePercentage(); };
        inputVal1.addEventListener('keypress', handleEnter);
        inputVal2.addEventListener('keypress', handleEnter);
    }
});

/* Ratio Calculator Logic */
(() => {
    document.addEventListener('DOMContentLoaded', () => {
        // Only run logic on the Ratio Calculator tool page
        const isRatioPage = document.querySelector('.tool-header h1')?.textContent.includes('Ratio');
        if (!isRatioPage) return;

        // Elements safe selection
        const primaryValueInputEl = document.getElementById('val-1');
        const secondaryValueInputEl = document.getElementById('val-2');
        const computeButtonEl = document.querySelector('.tool-workspace .btn-primary');
        const resultValueContainerEl = document.querySelector('.result-value');
        const resultStepContainerEl = document.querySelector('.result-box p');

        // Only run logic on the Ratio Calculator tool page
        if (!primaryValueInputEl || !secondaryValueInputEl || !computeButtonEl || !resultValueContainerEl || !resultStepContainerEl) return;

        // Core Mathematics
        const findGreatestCommonDivisor = (firstNumber, secondNumber) => {
            let a = Math.abs(firstNumber);
            let b = Math.abs(secondNumber);
            while (b) {
                const temporaryValue = b;
                b = a % b;
                a = temporaryValue;
            }
            return a;
        };

        // Standardized Methods
        const getInputValues = () => {
            return {
                primaryValueText: primaryValueInputEl.value.trim(),
                secondaryValueText: secondaryValueInputEl.value.trim()
            };
        };

        const validateInputs = (values) => {
            if (values.primaryValueText === '' || values.secondaryValueText === '') {
                return { isValid: false, message: 'Please fill all fields' };
            }

            const primaryNumber = parseFloat(values.primaryValueText);
            const secondaryNumber = parseFloat(values.secondaryValueText);

            if (isNaN(primaryNumber) || isNaN(secondaryNumber)) {
                return { isValid: false, message: 'Please enter valid numbers' };
            }

            if (secondaryNumber === 0) {
                return { isValid: false, message: 'Secondary value cannot be zero' };
            }

            return { isValid: true, primaryNumber, secondaryNumber };
        };

        const calculateResult = (primaryNumber, secondaryNumber) => {
            const decimalValue = primaryNumber / secondaryNumber;
            const formattedDecimal = Number(decimalValue.toFixed(4));
            
            let resultPrimary = 0;
            let resultSecondary = 0;
            let calculationSteps = '';

            if (Number.isInteger(primaryNumber) && Number.isInteger(secondaryNumber)) {
                const commonDivisor = findGreatestCommonDivisor(primaryNumber, secondaryNumber);
                resultPrimary = primaryNumber / commonDivisor;
                resultSecondary = secondaryNumber / commonDivisor;
                calculationSteps = `Step 1: Identified both inputs as whole integers.\nStep 2: Calculated Greatest Common Divisor (GCD) as ${commonDivisor}.\nStep 3: Divided parameters by GCD for final ratio.`;
            } else {
                resultPrimary = Number((primaryNumber / secondaryNumber).toFixed(4));
                resultSecondary = 1;
                calculationSteps = `Step 1: Decimal parameters detected. Scaling secondary variable to 1.\nStep 2: Divided primary value by secondary value.\nStep 3: Proportion normalized successfully.`;
            }

            return {
                resultPrimary,
                resultSecondary,
                formattedDecimal,
                calculationSteps
            };
        };

        const renderResult = (validation, calculationData) => {
            if (!validation.isValid) {
                resultValueContainerEl.innerHTML = `<span style="color: #ef4444; font-size: 1.1rem;">${validation.message}</span>`;
                resultStepContainerEl.innerHTML = '';
                return;
            }

            const { resultPrimary, resultSecondary, formattedDecimal, calculationSteps } = calculationData;

            let resultHtmlContent = `<div style="font-size: 1.25rem;">Simplified Ratio: <strong><span style="color: var(--accent-blue);">${resultPrimary} : ${resultSecondary}</span></strong></div>`;
            resultHtmlContent += `<div style="font-size: 1.1rem; margin-top: 0.5rem;">Decimal Value: <strong>${formattedDecimal}</strong></div>`;

            resultValueContainerEl.innerHTML = resultHtmlContent;
            resultStepContainerEl.innerHTML = calculationSteps.replace(/\n/g, '<br>');
        };

        const handleCalculation = () => {
            resultValueContainerEl.style.transform = 'translateY(2px)';
            resultValueContainerEl.innerHTML = '<span style="opacity: 0.5;">Computing...</span>';
            resultStepContainerEl.innerHTML = '';

            setTimeout(() => {
                resultValueContainerEl.style.transform = 'translateY(0)';
                
                const rawValues = getInputValues();
                const validationResult = validateInputs(rawValues);

                if (!validationResult.isValid) {
                    renderResult(validationResult, null);
                    return;
                }

                const calculationResult = calculateResult(validationResult.primaryNumber, validationResult.secondaryNumber);
                renderResult(validationResult, calculationResult);
            }, 150);
        };

        // Event Attachments
        computeButtonEl.addEventListener('click', handleCalculation);

        const handleEnterKey = (event) => {
            if (event.key === 'Enter') {
                handleCalculation();
            }
        };

        primaryValueInputEl.addEventListener('keypress', handleEnterKey);
        secondaryValueInputEl.addEventListener('keypress', handleEnterKey);
    });
})();

/* Quadratic Equation Solver Logic */
(() => {
    document.addEventListener('DOMContentLoaded', () => {
        // Elements safe selection
        // Since many tools might share these IDs, we should ensure we're strictly on the Quadratic Tool page.
        const isQuadraticPage = document.querySelector('.tool-header h1')?.textContent.includes('Quadratic');
        if (!isQuadraticPage) return;

        const primaryValueInputEl = document.getElementById('val-1');
        const secondaryValueInputEl = document.getElementById('val-2');
        const computeButtonEl = document.querySelector('.tool-workspace .btn-primary');
        const resultValueContainerEl = document.querySelector('.result-value');
        const resultStepContainerEl = document.querySelector('.result-box p');

        if (!primaryValueInputEl || !secondaryValueInputEl || !computeButtonEl || !resultValueContainerEl || !resultStepContainerEl) return;

        // Mathematical Parser for Equation Strings (e.g. 2x^2 - 3x + 1)
        const parseExpression = (expression) => {
            let str = expression.replace(/\s+/g, '').replace(/\*/g, '').replace(/-/g, '+-').toLowerCase();
            
            // Normalize any single letter variable to 'x' (handles y^2, z, etc.)
            str = str.replace(/[a-z](\^2)?/g, (match) => match.includes('^2') ? 'x^2' : 'x');
            if (str.startsWith('+')) str = str.slice(1);
            
            const terms = str.split('+');
            let a = 0, b = 0, c = 0;
            
            for (let term of terms) {
                if (!term) continue;
                if (term.includes('x^2')) {
                    let coeff = term.replace('x^2', '');
                    if (coeff === '' || coeff === '+') a += 1;
                    else if (coeff === '-') a -= 1;
                    else a += parseFloat(coeff);
                } else if (term.includes('x')) {
                    let coeff = term.replace('x', '');
                    if (coeff === '' || coeff === '+') b += 1;
                    else if (coeff === '-') b -= 1;
                    else b += parseFloat(coeff);
                } else {
                    const parsed = parseFloat(term);
                    if (!isNaN(parsed)) c += parsed;
                }
            }
            return { a, b, c };
        };

        // Standardized Methods
        const getInputValues = () => {
            return {
                primaryText: primaryValueInputEl.value.trim(),
                secondaryText: secondaryValueInputEl.value.trim()
            };
        };

        const validateInputs = (values) => {
            if (values.primaryText === '' || values.secondaryText === '') {
                return { isValid: false, message: 'Please fill all fields (e.g., LHS and RHS of your equation).' };
            }

            let a = 0, b = 0, c = 0;

            // Strategy 1: Test if user entered comma-separated coefficients (a,b,c) across the two fields
            const combinedString = values.primaryText + ',' + values.secondaryText;
            const commaParts = combinedString.split(',').map(s => s.trim()).filter(s => s !== '');
            const allNumbers = commaParts.length === 3 && commaParts.every(s => !isNaN(parseFloat(s)) && isFinite(s));

            if (allNumbers) {
                a = parseFloat(commaParts[0]);
                b = parseFloat(commaParts[1]);
                c = parseFloat(commaParts[2]);
            } else {
                // Strategy 2: Parse as algebraic equation (LHS in val-1, RHS in val-2)
                const lhs = parseExpression(values.primaryText);
                const rhs = parseExpression(values.secondaryText);
                a = lhs.a - rhs.a;
                b = lhs.b - rhs.b;
                c = lhs.c - rhs.c;
            }

            if (isNaN(a) || isNaN(b) || isNaN(c)) {
                return { isValid: false, message: 'Invalid format. Use algebraic terms (e.g., x^2 - 3x + 2) or comma-separated coefficients (a,b,c).' };
            }

            if (a === 0) {
                return { isValid: false, message: 'Coefficient "a" cannot be 0 for a quadratic equation (it evaluates to linear).' };
            }

            return { isValid: true, a, b, c };
        };

        const calculateResult = (validationValues) => {
            const { a, b, c } = validationValues;
            const discriminant = (b * b) - (4 * a * c);
            const discriminantRounded = Number(discriminant.toFixed(4));
            
            let root1Text = '';
            let root2Text = '';
            let rootType = '';
            
            // Core Logic: Roots categorization
            if (discriminant > 0) {
                const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
                const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
                root1Text = Number(root1.toFixed(4)).toString();
                root2Text = Number(root2.toFixed(4)).toString();
                rootType = 'Real & Distinct Roots';
            } else if (discriminant === 0) {
                const root = -b / (2 * a);
                root1Text = Number(root.toFixed(4)).toString();
                root2Text = root1Text;
                rootType = 'Real & Equal Roots';
            } else {
                const realPart = Number((-b / (2 * a)).toFixed(4));
                const imaginaryPart = Number((Math.sqrt(-discriminant) / (2 * a)).toFixed(4));
                root1Text = `${realPart} + ${Math.abs(imaginaryPart)}i`;
                root2Text = `${realPart} - ${Math.abs(imaginaryPart)}i`;
                rootType = 'Complex Conjugate Roots';
            }

            // High-value calculation for JEE context
            const sumOfRoots = Number((-b / a).toFixed(4));
            const productOfRoots = Number((c / a).toFixed(4));
            
            const calculationSteps = `Step 1: Extracted standard form coefficients (ax² + bx + c = 0)\n` +
                                     `a = ${Number(a.toFixed(4))}, b = ${Number(b.toFixed(4))}, c = ${Number(c.toFixed(4))}\n` +
                                     `Step 2: Evaluated Discriminant (Δ) = b² - 4ac = ${discriminantRounded}\n` +
                                     `Step 3: Determined root nature as ${rootType}\n` +
                                     `Step 4: Sum of Roots (α+β) = ${sumOfRoots}, Product (αβ) = ${productOfRoots}`;

            return {
                rootType,
                root1Text,
                root2Text,
                discriminantRounded,
                calculationSteps
            };
        };

        const renderResult = (validation, calculationData) => {
            if (!validation.isValid) {
                resultValueContainerEl.innerHTML = `<span style="color: #ef4444; font-size: 1.1rem;">${validation.message}</span>`;
                resultStepContainerEl.innerHTML = '';
                return;
            }

            const { rootType, root1Text, root2Text, discriminantRounded, calculationSteps } = calculationData;

            let resultHtmlContent = `
                <div style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 0.5rem;">${rootType} | Δ = ${discriminantRounded}</div>
                <div style="font-size: 1.25rem; margin-bottom: 0.25rem;">Root 1 (α): <strong style="color: var(--accent-blue);">${root1Text}</strong></div>
                <div style="font-size: 1.25rem;">Root 2 (β): <strong style="color: var(--accent-violet);">${root2Text}</strong></div>
            `;

            resultValueContainerEl.innerHTML = resultHtmlContent;
            resultStepContainerEl.innerHTML = calculationSteps.replace(/\n/g, '<br>');
        };

        const handleCalculation = () => {
            // Pre-calculation UX reset
            resultValueContainerEl.style.transform = 'translateY(2px)';
            resultValueContainerEl.innerHTML = '<span style="opacity: 0.5;">Computing...</span>';
            resultStepContainerEl.innerHTML = '';

            setTimeout(() => {
                resultValueContainerEl.style.transform = 'translateY(0)';
                
                const rawValues = getInputValues();
                const validationResult = validateInputs(rawValues);

                if (!validationResult.isValid) {
                    renderResult(validationResult, null);
                    return;
                }

                const calculationResult = calculateResult(validationResult);
                renderResult(validationResult, calculationResult);
            }, 150);
        };

        // Event Attachments
        computeButtonEl.addEventListener('click', handleCalculation);

        const handleEnterKey = (event) => {
            if (event.key === 'Enter') {
                handleCalculation();
            }
        };

        primaryValueInputEl.addEventListener('keypress', handleEnterKey);
        secondaryValueInputEl.addEventListener('keypress', handleEnterKey);
    });
})();

/* Angle Converter Logic */
(() => {
    document.addEventListener('DOMContentLoaded', () => {
        // Run safely only on Angle Converter page
        const isAnglePage = document.querySelector('.tool-header h1')?.textContent.includes('Angle');
        if (!isAnglePage) return;

        const primaryValueInputEl = document.getElementById('val-1');
        const secondaryValueInputEl = document.getElementById('val-2');
        const computeButtonEl = document.querySelector('.tool-workspace .btn-primary');
        const resultValueContainerEl = document.querySelector('.result-value');
        const resultStepContainerEl = document.querySelector('.result-box p');

        if (!primaryValueInputEl || !secondaryValueInputEl || !computeButtonEl || !resultValueContainerEl || !resultStepContainerEl) return;

        const getInputValues = () => ({
            primaryText: primaryValueInputEl.value.trim().toLowerCase(),
            secondaryText: secondaryValueInputEl.value.trim().toLowerCase()
        });

        const validateInputs = (values) => {
            if (values.primaryText === '' || values.secondaryText === '') {
                return { isValid: false, message: 'Please fill all fields. (e.g., Value in field 1, Unit "deg/rad/grad" in field 2)' };
            }

            const angleValue = parseFloat(values.primaryText);
            if (isNaN(angleValue)) {
                return { isValid: false, message: 'Invalid angle. Please enter a numerical value in the primary field.' };
            }

            let currentUnit = 'deg';
            if (values.secondaryText.includes('rad') || values.secondaryText.includes('π') || values.secondaryText.includes('pi')) {
                currentUnit = 'rad';
            } else if (values.secondaryText.includes('grad')) {
                currentUnit = 'grad';
            } else if (values.secondaryText.includes('deg')) {
                currentUnit = 'deg';
            } else {
                return { isValid: false, message: 'Unknown unit. Please enter deg, rad, or grad in the secondary field.' };
            }

            return { isValid: true, angleValue, currentUnit };
        };

        const calculateResult = (validationValues) => {
            const { angleValue, currentUnit } = validationValues;
            let calculatedDeg = 0, calculatedRad = 0, calculatedGrad = 0;

            if (currentUnit === 'deg') {
                calculatedDeg = angleValue;
                calculatedRad = angleValue * (Math.PI / 180);
                calculatedGrad = angleValue * (200 / 180);
            } else if (currentUnit === 'rad') {
                calculatedRad = angleValue;
                calculatedDeg = angleValue * (180 / Math.PI);
                calculatedGrad = angleValue * (200 / Math.PI);
            } else if (currentUnit === 'grad') {
                calculatedGrad = angleValue;
                calculatedDeg = angleValue * (180 / 200);
                calculatedRad = angleValue * (Math.PI / 200);
            }

            return {
                degResult: Number(calculatedDeg.toFixed(4)),
                radResult: Number(calculatedRad.toFixed(4)),
                gradResult: Number(calculatedGrad.toFixed(4)),
                inputVal: angleValue,
                inputUnit: currentUnit
            };
        };

        const renderResult = (validation, calculationData) => {
            if (!validation.isValid) {
                resultValueContainerEl.innerHTML = `<span style="color: #ef4444; font-size: 1.1rem;">${validation.message}</span>`;
                resultStepContainerEl.innerHTML = '';
                return;
            }

            const { degResult, radResult, gradResult, inputVal, inputUnit } = calculationData;

            resultValueContainerEl.innerHTML = `
                <div style="font-size: 1.25rem; margin-bottom: 0.25rem;">Degrees: <strong style="color: var(--accent-blue);">${degResult}°</strong></div>
                <div style="font-size: 1.25rem; margin-bottom: 0.25rem;">Radians: <strong style="color: var(--accent-violet);">${radResult} rad</strong></div>
                <div style="font-size: 1.25rem;">Gradians: <strong style="color: var(--accent-blue);">${gradResult} grad</strong></div>
            `;

            resultStepContainerEl.innerHTML = `Converted ${inputVal} ${inputUnit} using the standard mathematical constant ratio: π rad = 180° = 200 grad.`;
        };

        const handleCalculation = () => {
            resultValueContainerEl.style.transform = 'translateY(2px)';
            resultValueContainerEl.innerHTML = '<span style="opacity: 0.5;">Computing...</span>';
            resultStepContainerEl.innerHTML = '';

            setTimeout(() => {
                resultValueContainerEl.style.transform = 'translateY(0)';
                const rawValues = getInputValues();
                const validationResult = validateInputs(rawValues);

                if (!validationResult.isValid) {
                    renderResult(validationResult, null);
                    return;
                }

                const calculationResult = calculateResult(validationResult);
                renderResult(validationResult, calculationResult);
            }, 150);
        };

        computeButtonEl.addEventListener('click', handleCalculation);
        
        const handleEnterKey = (event) => {
            if (event.key === 'Enter') {
                handleCalculation();
            }
        };

        primaryValueInputEl.addEventListener('keypress', handleEnterKey);
        secondaryValueInputEl.addEventListener('keypress', handleEnterKey);
    });
})();

/* Time Calculator Logic */
(() => {
    document.addEventListener('DOMContentLoaded', () => {
        // Run safely only on Time Calculator page
        const isTimePage = document.querySelector('.tool-header h1')?.textContent.includes('Time');
        if (!isTimePage) return;

        const primaryValueInputEl = document.getElementById('val-1');
        const secondaryValueInputEl = document.getElementById('val-2');
        const computeButtonEl = document.querySelector('.tool-workspace .btn-primary');
        const resultValueContainerEl = document.querySelector('.result-value');
        const resultStepContainerEl = document.querySelector('.result-box p');

        if (!primaryValueInputEl || !secondaryValueInputEl || !computeButtonEl || !resultValueContainerEl || !resultStepContainerEl) return;

        const getInputValues = () => ({
            primaryText: primaryValueInputEl.value.trim().toLowerCase(),
            secondaryText: secondaryValueInputEl.value.trim().toLowerCase()
        });

        // Parser for multiple formats ("2h 30m" | "2:30" | "150") -> always returns minutes
        const parseToMinutes = (timeStr) => {
            if (/^\d+(\.\d+)?$/.test(timeStr)) return parseFloat(timeStr); // Treat plain numbers as minutes
            
            let totalMinutes = 0;
            const hourMatch = timeStr.match(/(\d+(?:\.\d+)?)\s*(h|hr|hour)/);
            const minMatch = timeStr.match(/(\d+(?:\.\d+)?)\s*(m|min)/);
            
            if (hourMatch || minMatch) {
                if (hourMatch) totalMinutes += parseFloat(hourMatch[1]) * 60;
                if (minMatch) totalMinutes += parseFloat(minMatch[1]);
                return totalMinutes;
            }

            // Fallback for HH:MM parsing
            const timeParts = timeStr.split(':');
            if (timeParts.length === 2) {
                return parseFloat(timeParts[0]) * 60 + parseFloat(timeParts[1]);
            }

            return NaN;
        };

        const formatMinutesToString = (totalMins) => {
            const isNegative = totalMins < 0;
            const absMins = Math.abs(totalMins);
            const computedHrs = Math.floor(absMins / 60);
            const computedMins = Number((absMins % 60).toFixed(2));
            
            let timeOutputStr = '';
            if (computedHrs > 0) timeOutputStr += `${computedHrs} hr `;
            timeOutputStr += `${computedMins} min`;
            
            return (isNegative ? '- ' : '') + timeOutputStr.trim();
        };

        const validateInputs = (values) => {
            if (values.primaryText === '' || values.secondaryText === '') {
                return { isValid: false, message: 'Please fill all fields (e.g., "2h 30m" and "45m" or "10:30").' };
            }

            const parsedTime1 = parseToMinutes(values.primaryText);
            const parsedTime2 = parseToMinutes(values.secondaryText);

            if (isNaN(parsedTime1) || isNaN(parsedTime2)) {
                return { isValid: false, message: 'Invalid time format. Use combinations like "2h 30m", "1:45", or plain minutes.' };
            }

            return { isValid: true, parsedTime1, parsedTime2 };
        };

        const calculateResult = (validationValues) => {
            const { parsedTime1, parsedTime2 } = validationValues;
            
            const totalSumMinutes = parsedTime1 + parsedTime2;
            const differenceMinutes = Math.abs(parsedTime1 - parsedTime2);

            return {
                sumFormattedStr: formatMinutesToString(totalSumMinutes),
                diffFormattedStr: formatMinutesToString(differenceMinutes),
                totalSumMinutes: Number(totalSumMinutes.toFixed(2)),
                differenceMinutes: Number(differenceMinutes.toFixed(2))
            };
        };

        const renderResult = (validation, calculationData) => {
            if (!validation.isValid) {
                resultValueContainerEl.innerHTML = `<span style="color: #ef4444; font-size: 1.1rem;">${validation.message}</span>`;
                resultStepContainerEl.innerHTML = '';
                return;
            }

            const { sumFormattedStr, diffFormattedStr, totalSumMinutes, differenceMinutes } = calculationData;

            resultValueContainerEl.innerHTML = `
                <div style="font-size: 1.25rem; margin-bottom: 0.25rem;">Sum (T1 + T2): <strong style="color: var(--accent-blue);">${sumFormattedStr}</strong> <span style="font-size:0.9rem; color:gray;">(${totalSumMinutes} mins)</span></div>
                <div style="font-size: 1.25rem;">Difference (|T1 - T2|): <strong style="color: var(--accent-violet);">${diffFormattedStr}</strong> <span style="font-size:0.9rem; color:gray;">(${differenceMinutes} mins)</span></div>
            `;

            resultStepContainerEl.innerHTML = `Successfully evaluated temporal additions and deltas in standardized bases. Handles absolute discrepancies and standard hour-minute aggregation.`;
        };

        const handleCalculation = () => {
            resultValueContainerEl.style.transform = 'translateY(2px)';
            resultValueContainerEl.innerHTML = '<span style="opacity: 0.5;">Computing...</span>';
            resultStepContainerEl.innerHTML = '';

            setTimeout(() => {
                resultValueContainerEl.style.transform = 'translateY(0)';
                const rawValues = getInputValues();
                const validationResult = validateInputs(rawValues);

                if (!validationResult.isValid) {
                    renderResult(validationResult, null);
                    return;
                }

                const calculationResult = calculateResult(validationResult);
                renderResult(validationResult, calculationResult);
            }, 150);
        };

        computeButtonEl.addEventListener('click', handleCalculation);
        
        const handleEnterKey = (event) => {
            if (event.key === 'Enter') {
                handleCalculation();
            }
        };

        primaryValueInputEl.addEventListener('keypress', handleEnterKey);
        secondaryValueInputEl.addEventListener('keypress', handleEnterKey);
    });
})();
