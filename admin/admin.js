document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginSection = document.getElementById('login-section');
    const adminDashboard = document.getElementById('admin-dashboard');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    // Tab Elements
    const tabLinks = document.querySelectorAll('.sidebar-menu li');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const topbarTitle = document.querySelector('.topbar-title');
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    // Profile Dropdown Elements
    const userProfile = document.getElementById('user-profile');
    const profileDropdown = document.getElementById('profile-dropdown');
    const dropdownLogout = document.getElementById('dropdown-logout');

    // Default Credentials
    const ADMIN_USER = 'admin';
    const ADMIN_PASS = 'password123';

    // Check if already logged in via LocalStorage
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showDashboard();
    }

    // Login Form Submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;

        if (user === ADMIN_USER && pass === ADMIN_PASS) {
            localStorage.setItem('adminLoggedIn', 'true');
            showDashboard();
            loginError.style.display = 'none';
        } else {
            loginError.style.display = 'block';
            // Simple animation for error
            loginForm.classList.add('shake');
            setTimeout(() => {
                loginForm.classList.remove('shake');
            }, 500);
        }
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('adminLoggedIn');
        hideDashboard();
    });

    // Tab Switching Logic
    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Remove active class from all links
            tabLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            link.classList.add('active');

            // Hide all tab panes
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Show the target tab pane
            const targetId = link.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');

            // Update topbar title
            topbarTitle.textContent = link.textContent.trim();

            // Mobile: Close sidebar after selection
            if (window.innerWidth <= 991) {
                closeMobileSidebar();
            }
        });
    });

    // Mobile Navigation Toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
            // Change icon
            const icon = menuToggle.querySelector('i');
            if (sidebar.classList.contains('active')) {
                icon.classList.replace('fa-bars', 'fa-times');
            } else {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeMobileSidebar);
    }

    function closeMobileSidebar() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        if (menuToggle) {
            const icon = menuToggle.querySelector('i');
            icon.classList.replace('fa-times', 'fa-bars');
        }
    }

    // Profile Dropdown Toggle
    if (userProfile) {
        userProfile.addEventListener('click', (e) => {
            e.stopPropagation();
            userProfile.classList.toggle('active');
            profileDropdown.classList.toggle('active');
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        if (userProfile && userProfile.classList.contains('active')) {
            userProfile.classList.remove('active');
            profileDropdown.classList.remove('active');
        }
    });

    // Profile Dropdown Actions
    if (dropdownLogout) {
        dropdownLogout.addEventListener('click', (e) => {
            e.stopPropagation();
            localStorage.removeItem('adminLoggedIn');
            hideDashboard();
            // Reset dropdown state
            userProfile.classList.remove('active');
            profileDropdown.classList.remove('active');
        });
    }

    // Other dropdown items
    const dropdownItems = document.querySelectorAll('.dropdown-item:not(.logout-item)');
    dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = item.getAttribute('data-action');

            if (action === 'contact') {
                // Switch to contact tab
                tabLinks.forEach(l => l.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));

                const targetTab = document.getElementById('tab-contact');
                if (targetTab) {
                    targetTab.classList.add('active');
                    topbarTitle.textContent = 'Contact Information';
                }
            } else if (action === 'profile') {
                openProfileModal();
            } else {
                alert(`Opening ${action} settings... (Feature coming soon)`);
            }

            userProfile.classList.remove('active');
            profileDropdown.classList.remove('active');
        });
    });

    // ===== Profile Update Modal Logic =====
    const profileModalOverlay = document.getElementById('profile-modal-overlay');
    const profileModalClose = document.getElementById('profile-modal-close');
    const btnCancelProfile = document.getElementById('btn-cancel-profile');
    const btnSaveProfile = document.getElementById('btn-save-profile');
    const profilePicInput = document.getElementById('profile-pic-input');
    const profilePicPreview = document.getElementById('profile-pic-preview');
    const profilePicPlaceholder = document.getElementById('profile-pic-placeholder');
    const btnRemoveProfilePic = document.getElementById('btn-remove-profile-pic');
    const profileDisplayName = document.getElementById('profile-display-name');
    const profileAdminEmail = document.getElementById('profile-admin-email');

    // Tracks the newly-selected image (base64) before saving
    let pendingProfilePic = null;

    function openProfileModal() {
        if (!profileModalOverlay) return;

        // Load saved values
        const savedPic = localStorage.getItem('adminProfilePic');
        const savedName = localStorage.getItem('adminDisplayName') || 'Admin';
        const savedEmail = localStorage.getItem('adminEmail') || '';

        profileDisplayName.value = savedName;
        profileAdminEmail.value = savedEmail;
        pendingProfilePic = null;

        if (savedPic) {
            profilePicPreview.src = savedPic;
            profilePicPreview.classList.add('visible');
            profilePicPlaceholder.style.display = 'none';
            btnRemoveProfilePic.style.display = 'flex';
        } else {
            profilePicPreview.src = '';
            profilePicPreview.classList.remove('visible');
            profilePicPlaceholder.style.display = 'flex';
            btnRemoveProfilePic.style.display = 'none';
        }

        profileModalOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeProfileModal() {
        if (!profileModalOverlay) return;
        profileModalOverlay.style.display = 'none';
        document.body.style.overflow = '';
        pendingProfilePic = null;
        if (profilePicInput) profilePicInput.value = '';
        // Always reset the Save button to its original state
        if (btnSaveProfile) {
            btnSaveProfile.innerHTML = '<i class="fas fa-save"></i> Save Profile';
            btnSaveProfile.style.backgroundColor = '';
        }
    }

    // Close on overlay background click
    if (profileModalOverlay) {
        profileModalOverlay.addEventListener('click', (e) => {
            if (e.target === profileModalOverlay) closeProfileModal();
        });
    }
    if (profileModalClose) profileModalClose.addEventListener('click', closeProfileModal);
    if (btnCancelProfile) btnCancelProfile.addEventListener('click', closeProfileModal);

    // Profile picture file selection
    if (profilePicInput) {
        profilePicInput.addEventListener('change', function () {
            const file = this.files[0];
            if (!file) return;

            if (file.size > 3 * 1024 * 1024) {
                alert('Image is too large. Please choose a file smaller than 3 MB.');
                this.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                pendingProfilePic = e.target.result;
                profilePicPreview.src = pendingProfilePic;
                profilePicPreview.classList.add('visible');
                profilePicPlaceholder.style.display = 'none';
                btnRemoveProfilePic.style.display = 'flex';
            };
            reader.readAsDataURL(file);
        });
    }

    // Remove profile picture
    if (btnRemoveProfilePic) {
        btnRemoveProfilePic.addEventListener('click', () => {
            pendingProfilePic = '__REMOVE__';
            profilePicPreview.src = '';
            profilePicPreview.classList.remove('visible');
            profilePicPlaceholder.style.display = 'flex';
            btnRemoveProfilePic.style.display = 'none';
            if (profilePicInput) profilePicInput.value = '';
        });
    }

    // Save profile
    if (btnSaveProfile) {
        btnSaveProfile.addEventListener('click', function () {
            // Guard against multiple clicks during animation
            if (this.innerHTML.includes('Saving') || this.innerHTML.includes('Saved')) return;

            const name = profileDisplayName.value.trim();
            const email = profileAdminEmail.value.trim();

            if (!name) {
                profileDisplayName.focus();
                profileDisplayName.style.borderColor = 'var(--danger-color)';
                setTimeout(() => profileDisplayName.style.borderColor = '', 1500);
                return;
            }

            // Save text fields
            localStorage.setItem('adminDisplayName', name);
            localStorage.setItem('adminEmail', email);

            // Save / remove picture
            if (pendingProfilePic === '__REMOVE__') {
                localStorage.removeItem('adminProfilePic');
            } else if (pendingProfilePic) {
                localStorage.setItem('adminProfilePic', pendingProfilePic);
            }

            // Update the topbar "Welcome, <name>" text
            const welcomeStrong = document.querySelector('.user-info strong');
            if (welcomeStrong) welcomeStrong.textContent = name;

            // Update the topbar avatar if a picture is stored
            const finalPic = localStorage.getItem('adminProfilePic');
            const avatarIcon = document.querySelector('.user-info .fa-user-circle');
            if (finalPic && avatarIcon) {
                const existing = document.querySelector('.topbar-profile-pic');
                if (existing) {
                    existing.src = finalPic;
                } else {
                    const img = document.createElement('img');
                    img.className = 'topbar-profile-pic';
                    img.src = finalPic;
                    img.style.cssText = 'width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid var(--primary-color);';
                    avatarIcon.replaceWith(img);
                }
            } else if (!finalPic) {
                const existing = document.querySelector('.topbar-profile-pic');
                if (existing) {
                    const icon = document.createElement('i');
                    icon.className = 'fas fa-user-circle';
                    existing.replaceWith(icon);
                }
            }

            // Visual feedback — close modal after brief confirmation
            this.innerHTML = '<i class="fas fa-check"></i> Saved!';
            this.style.backgroundColor = '#4cc9f0';
            setTimeout(() => {
                closeProfileModal(); // button is reset inside closeProfileModal
            }, 900);
        });
    }

    // On page load: restore profile picture in topbar
    (function restoreTopbarPic() {
        const savedPic = localStorage.getItem('adminProfilePic');
        if (!savedPic) return;
        const avatarIcon = document.querySelector('.user-info .fa-user-circle');
        if (avatarIcon) {
            const img = document.createElement('img');
            img.className = 'topbar-profile-pic';
            img.src = savedPic;
            img.style.cssText = 'width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid var(--primary-color);';
            avatarIcon.replaceWith(img);
        }
    })();

    // Show/Hide Dashboard Functions
    function showDashboard() {
        loginSection.style.display = 'none';
        adminDashboard.style.display = 'flex';
    }

    function hideDashboard() {
        adminDashboard.style.display = 'none';
        loginSection.style.display = 'flex';
        // Clear login form
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }

    // --- SAVE BUTTONS LOGIC ---

    /**
     * We filter out buttons that have dedicated listeners defined elsewhere 
     * (like Hero, Profile, and dynamic items) to prevent visual feedback conflicts.
     */
    const saveBtns = document.querySelectorAll('.btn-save:not(#btn-save-hero):not(#btn-save-profile):not([id^="btn-save-about"]):not([id^="btn-save-objective"]):not([id^="btn-save-education"]):not([id^="btn-save-skill"]):not([id^="btn-save-project"]):not([id^="btn-save-experience"]):not([id^="btn-save-certificate"]):not(.contact-save-btn)');

    // Load existing data from LocalStorage
    const heroName = localStorage.getItem('heroName');
    const heroTitle = localStorage.getItem('heroTitle');
    const heroTagline = localStorage.getItem('heroTagline');

    if (heroName) {
        document.getElementById('hero-name-input').value = heroName;
    } else {
        document.getElementById('hero-name-input').value = 'Yub Raj Kaucha';
    }

    if (heroTitle) {
        document.getElementById('hero-title-input').value = heroTitle;
    } else {
        document.getElementById('hero-title-input').value = 'Electronics & Communication Engineer';
    }

    if (heroTagline) {
        document.getElementById('hero-tagline-input').value = heroTagline;
    } else {
        document.getElementById('hero-tagline-input').value = 'I am an Electronics and Communication Engineer with a passion for designing and developing hardware and software solutions.';
    }

    // Save Hero Section
    const btnSaveHero = document.getElementById('btn-save-hero');
    if (btnSaveHero) {
        btnSaveHero.addEventListener('click', function () {
            // Guard against multiple clicks during animation
            if (this.innerHTML.includes('Saving') || this.innerHTML.includes('Saved')) return;

            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            this.style.opacity = '0.8';

            // Save to localStorage
            localStorage.setItem('heroName', document.getElementById('hero-name-input').value);
            localStorage.setItem('heroTitle', document.getElementById('hero-title-input').value);
            localStorage.setItem('heroTagline', document.getElementById('hero-tagline-input').value);

            // Mock delay
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-check"></i> Saved!';
                this.style.backgroundColor = '#4cc9f0'; // Success color

                // Revert after 2 seconds
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.style.backgroundColor = '';
                    this.style.opacity = '1';
                }, 2000);
            }, 800);
        });
    }

    saveBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Guard against multiple clicks during animation
            if (this.innerHTML.includes('Saving') || this.innerHTML.includes('Saved')) return;

            const originalText = this.innerHTML;

            // Visual feedback for saving
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            this.style.opacity = '0.8';

            // Mock delay
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-check"></i> Saved!';
                this.style.backgroundColor = '#4cc9f0'; // Success color

                // Revert after 2 seconds
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.style.backgroundColor = '';
                    this.style.opacity = '1';
                }, 2000);
            }, 800);
        });
    });

    // Delete buttons functionality mock
    const deleteBtns = document.querySelectorAll('.btn-delete');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            if (confirm('Are you sure you want to delete this item?')) {
                const item = this.closest('.list-item');
                item.style.opacity = '0.5';
                setTimeout(() => {
                    item.remove();
                }, 300);
            }
        });
    });
    // --- ABOUT SECTION RENDER & SAVE ---
    const aboutParagraphsList = document.getElementById('about-paragraphs-list');
    const btnAddAbout = document.getElementById('btn-add-about');
    const btnSaveAboutParagraphs = document.getElementById('btn-save-about-paragraphs');

    // New form elements
    const aboutFormContainer = document.getElementById('about-form-container');
    const aboutFormTitle = document.getElementById('about-form-title');
    const aboutItemIndex = document.getElementById('about-item-index');
    const aboutHeadingInput = document.getElementById('about-heading-input');
    const aboutTextInput = document.getElementById('about-text-input');
    const btnSaveAboutItem = document.getElementById('btn-save-about-item');
    const btnCancelAboutItem = document.getElementById('btn-cancel-about-item');

    // Default paragraphs if none in localStorage
    const defaultParagraphs = [
        { heading: "Professional Summary", text: "I am a dedicated Electronics & Communication Engineer with a strong foundation in communication systems, digital electronics, and embedded systems. My passion lies in developing innovative solutions that bridge the gap between hardware and software." },
        { heading: "", text: "With hands-on experience in various programming languages and industry-standard tools, I strive to create efficient and scalable electronic systems. I am constantly learning and adapting to new technologies to stay ahead in this rapidly evolving field." }
    ];

    let aboutParagraphs = [];
    try {
        const stored = localStorage.getItem('aboutParagraphs');
        if (stored) {
            const parsed = JSON.parse(stored);
            // Convert legacy strings to objects
            aboutParagraphs = parsed.map(item => typeof item === 'string' ? { heading: '', text: item } : item);
        } else {
            aboutParagraphs = [...defaultParagraphs];
        }
    } catch (e) {
        aboutParagraphs = [...defaultParagraphs];
    }

    function saveAboutToStorage() {
        localStorage.setItem('aboutParagraphs', JSON.stringify(aboutParagraphs));
    }

    let aboutEditingIndex = -1;

    function renderAboutParagraphs() {
        if (!aboutParagraphsList) return;
        aboutParagraphsList.innerHTML = '';
        aboutParagraphs.forEach((item, index) => {
            if (index === aboutEditingIndex) {
                const itemHTML = `
                    <div class="list-item" style="flex-direction: column; align-items: stretch; background: #f8f9fa; border: 1px solid #e9ecef; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <h4 style="margin-bottom: 15px; color: #4361ee;"><i class="fas fa-edit"></i> Edit Paragraph</h4>
                        <div class="form-group" style="margin-bottom: 10px;">
                            <label style="font-size: 0.8rem; color: #6c757d;">Heading</label>
                            <input type="text" id="inline-about-heading" value="${item.heading || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 10px;">
                            <label style="font-size: 0.8rem; color: #6c757d;">Paragraph Content</label>
                            <textarea id="inline-about-text" rows="4" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">${item.text || ''}</textarea>
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button type="button" class="btn-save inline-btn-save-about">Save Changes</button>
                            <button type="button" class="btn-logout inline-btn-cancel-about" style="width: auto; padding: 12px 25px;">Cancel</button>
                        </div>
                    </div>
                `;
                aboutParagraphsList.insertAdjacentHTML('beforeend', itemHTML);
            } else {
                const displayHeading = item.heading ? item.heading : `Paragraph ${index + 1}`;
                const itemHTML = `
                    <div class="list-item">
                        <div class="item-details" style="flex:1; margin-right: 15px;">
                            <h4>${displayHeading}</h4>
                            <p style="white-space: pre-wrap;">${item.text}</p>
                        </div>
                        <div class="item-actions">
                            <button class="btn-edit btn-edit-about" data-index="${index}"><i class="fas fa-edit"></i></button>
                            <button class="btn-delete btn-delete-about" data-index="${index}"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
                aboutParagraphsList.insertAdjacentHTML('beforeend', itemHTML);
            }
        });

        document.querySelectorAll('.btn-edit-about').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                aboutFormContainer.style.display = 'none'; // Ensure top add form is hidden
                aboutEditingIndex = parseInt(this.getAttribute('data-index'));
                renderAboutParagraphs();
            });
        });

        document.querySelectorAll('.btn-delete-about').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const idx = parseInt(this.getAttribute('data-index'));
                if (confirm('Are you sure you want to delete this item?')) {
                    aboutParagraphs.splice(idx, 1);
                    saveAboutToStorage();
                    renderAboutParagraphs();
                }
            });
        });

        // Inline form buttons logic for About
        const btnSaveInlineAbout = document.querySelector('.inline-btn-save-about');
        if (btnSaveInlineAbout) {
            btnSaveInlineAbout.addEventListener('click', function (e) {
                e.preventDefault();
                const textVal = document.getElementById('inline-about-text').value.trim();

                if (!textVal) {
                    alert("Paragraph content is required.");
                    return;
                }

                aboutParagraphs[aboutEditingIndex] = {
                    heading: document.getElementById('inline-about-heading').value.trim(),
                    text: textVal
                };

                saveAboutToStorage();

                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i> Saved!';
                this.style.backgroundColor = '#4cc9f0';
                setTimeout(() => {
                    aboutEditingIndex = -1;
                    renderAboutParagraphs();
                }, 400);
            });
        }

        const btnCancelInlineAbout = document.querySelector('.inline-btn-cancel-about');
        if (btnCancelInlineAbout) {
            btnCancelInlineAbout.addEventListener('click', function (e) {
                e.preventDefault();
                aboutEditingIndex = -1;
                renderAboutParagraphs();
            });
        }
    }

    // Initial render
    renderAboutParagraphs();

    // Show form to add new item
    if (btnAddAbout && aboutFormContainer) {
        btnAddAbout.addEventListener('click', (e) => {
            e.preventDefault();
            aboutEditingIndex = -1; // Close any open inline edit form
            renderAboutParagraphs();

            aboutItemIndex.value = "-1";
            aboutHeadingInput.value = '';
            aboutTextInput.value = '';
            aboutFormTitle.textContent = "Add New Item";
            aboutFormContainer.style.display = 'block';
            aboutHeadingInput.focus();
        });
    }

    // Hide form
    if (btnCancelAboutItem && aboutFormContainer) {
        btnCancelAboutItem.addEventListener('click', (e) => {
            e.preventDefault();
            aboutFormContainer.style.display = 'none';
        });
    }

    // Save form (for adding new)
    if (btnSaveAboutItem) {
        btnSaveAboutItem.addEventListener('click', function (e) {
            e.preventDefault();

            const textValue = aboutTextInput.value.trim();
            if (!textValue) {
                alert("Paragraph content is required!");
                return;
            }

            const newItem = {
                heading: aboutHeadingInput.value.trim(),
                text: textValue
            };

            // This form is exclusively for adding new now
            aboutParagraphs.push(newItem);
            saveAboutToStorage();

            // Visual feedback on the Save Item button
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Added!';
            this.style.backgroundColor = '#4cc9f0';

            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.backgroundColor = '';
                aboutFormContainer.style.display = 'none';
                renderAboutParagraphs();
            }, 800);
        });
    }

    // Backward compatibility for the main "Save Paragraphs" button (optional now that we save on edit/add)
    if (btnSaveAboutParagraphs) {
        btnSaveAboutParagraphs.addEventListener('click', function (e) {
            e.preventDefault();
            saveAboutToStorage();
        });
    }

    // --- ABOUT OBJECTIVES SECTION RENDER & SAVE ---
    const aboutObjectivesList = document.getElementById('about-objectives-list');
    const btnAddObjective = document.getElementById('btn-add-objective');

    // New form elements
    const objectiveFormContainer = document.getElementById('objective-form-container');
    const objectiveFormTitle = document.getElementById('objective-form-title');
    const objectiveItemIndex = document.getElementById('objective-item-index');
    const objectiveHeadingInput = document.getElementById('objective-heading-input');
    const objectiveIconInput = document.getElementById('objective-icon-input');
    const objectiveTextInput = document.getElementById('objective-text-input');
    const btnSaveObjectiveItem = document.getElementById('btn-save-objective-item');
    const btnCancelObjectiveItem = document.getElementById('btn-cancel-objective-item');

    const defaultObjective = {
        heading: "Career Objective",
        icon: "fas fa-bullseye",
        text: "To leverage my technical expertise in electronics and communication engineering to contribute to innovative projects in a dynamic organization, while continuously enhancing my skills and knowledge in emerging technologies."
    };

    let aboutObjectives = [];
    try {
        const stored = localStorage.getItem('aboutObjectives');
        if (stored) {
            aboutObjectives = JSON.parse(stored);
        } else {
            // Check legacy string
            const legacyStr = localStorage.getItem('aboutObjective');
            if (legacyStr) {
                aboutObjectives = [{ ...defaultObjective, text: legacyStr }];
            } else {
                aboutObjectives = [defaultObjective];
            }
        }
    } catch (e) {
        aboutObjectives = [defaultObjective];
    }

    function saveObjectivesToStorage() {
        localStorage.setItem('aboutObjectives', JSON.stringify(aboutObjectives));
    }

    let objectiveEditingIndex = -1;

    function renderAboutObjectives() {
        if (!aboutObjectivesList) return;
        aboutObjectivesList.innerHTML = '';
        aboutObjectives.forEach((item, index) => {
            if (index === objectiveEditingIndex) {
                const itemHTML = `
                    <div class="list-item" style="flex-direction: column; align-items: stretch; background: #f8f9fa; border: 1px solid #e9ecef; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <h4 style="margin-bottom: 15px; color: #4361ee;"><i class="fas fa-edit"></i> Edit Objective Card</h4>
                        <div class="form-group" style="margin-bottom: 10px;">
                            <label style="font-size: 0.8rem; color: #6c757d;">Heading</label>
                            <input type="text" id="inline-obj-heading" value="${item.heading || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 10px;">
                            <label style="font-size: 0.8rem; color: #6c757d;">Icon (FontAwesome Class)</label>
                            <input type="text" id="inline-obj-icon" value="${item.icon || 'fas fa-bullseye'}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 10px;">
                            <label style="font-size: 0.8rem; color: #6c757d;">Paragraph Content</label>
                            <textarea id="inline-obj-text" rows="4" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">${item.text || ''}</textarea>
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button type="button" class="btn-save inline-btn-save-obj">Save Changes</button>
                            <button type="button" class="btn-logout inline-btn-cancel-obj" style="width: auto; padding: 12px 25px;">Cancel</button>
                        </div>
                    </div>
                `;
                aboutObjectivesList.insertAdjacentHTML('beforeend', itemHTML);
            } else {
                const displayHeading = item.heading ? item.heading : `Objective ${index + 1}`;
                const displayIcon = item.icon || 'fas fa-bullseye';
                const itemHTML = `
                    <div class="list-item">
                        <div class="item-details" style="flex:1; margin-right: 15px;">
                            <h4><i class="${displayIcon}"></i> ${displayHeading}</h4>
                            <p style="white-space: pre-wrap;">${item.text}</p>
                        </div>
                        <div class="item-actions">
                            <button class="btn-edit btn-edit-objective" data-index="${index}"><i class="fas fa-edit"></i></button>
                            <button class="btn-delete btn-delete-objective" data-index="${index}"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
                aboutObjectivesList.insertAdjacentHTML('beforeend', itemHTML);
            }
        });

        document.querySelectorAll('.btn-edit-objective').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                objectiveFormContainer.style.display = 'none'; // Ensure top add form is hidden
                objectiveEditingIndex = parseInt(this.getAttribute('data-index'));
                renderAboutObjectives();
            });
        });

        document.querySelectorAll('.btn-delete-objective').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const idx = parseInt(this.getAttribute('data-index'));
                if (confirm('Are you sure you want to delete this objective card?')) {
                    aboutObjectives.splice(idx, 1);
                    saveObjectivesToStorage();
                    renderAboutObjectives();
                }
            });
        });

        // Inline form buttons logic for Objectives
        const btnSaveInlineObj = document.querySelector('.inline-btn-save-obj');
        if (btnSaveInlineObj) {
            btnSaveInlineObj.addEventListener('click', function (e) {
                e.preventDefault();
                const textVal = document.getElementById('inline-obj-text').value.trim();

                if (!textVal) {
                    alert("Paragraph content is required.");
                    return;
                }

                aboutObjectives[objectiveEditingIndex] = {
                    heading: document.getElementById('inline-obj-heading').value.trim() || 'Career Objective',
                    icon: document.getElementById('inline-obj-icon').value.trim() || 'fas fa-bullseye',
                    text: textVal
                };

                saveObjectivesToStorage();

                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i> Saved!';
                this.style.backgroundColor = '#4cc9f0';
                setTimeout(() => {
                    objectiveEditingIndex = -1;
                    renderAboutObjectives();
                }, 400);
            });
        }

        const btnCancelInlineObj = document.querySelector('.inline-btn-cancel-obj');
        if (btnCancelInlineObj) {
            btnCancelInlineObj.addEventListener('click', function (e) {
                e.preventDefault();
                objectiveEditingIndex = -1;
                renderAboutObjectives();
            });
        }
    }

    // Initial render
    renderAboutObjectives();

    if (btnAddObjective && objectiveFormContainer) {
        btnAddObjective.addEventListener('click', (e) => {
            e.preventDefault();
            objectiveEditingIndex = -1; // Close any open inline edit form
            renderAboutObjectives();

            objectiveItemIndex.value = "-1";
            objectiveHeadingInput.value = '';
            objectiveIconInput.value = 'fas fa-bullseye';
            objectiveTextInput.value = '';
            objectiveFormTitle.textContent = "Add New Objective Card";
            objectiveFormContainer.style.display = 'block';
            objectiveHeadingInput.focus();
        });
    }

    if (btnCancelObjectiveItem) {
        btnCancelObjectiveItem.addEventListener('click', (e) => {
            e.preventDefault();
            objectiveFormContainer.style.display = 'none';
        });
    }

    if (btnSaveObjectiveItem) {
        btnSaveObjectiveItem.addEventListener('click', function (e) {
            e.preventDefault();

            const textValue = objectiveTextInput.value.trim();
            if (!textValue) {
                alert("Paragraph content is required!");
                return;
            }

            const newItem = {
                heading: objectiveHeadingInput.value.trim() || 'Career Objective',
                icon: objectiveIconInput.value.trim() || 'fas fa-bullseye',
                text: textValue
            };

            // This form is exclusively for adding new now
            aboutObjectives.push(newItem);
            saveObjectivesToStorage();

            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Added!';
            this.style.backgroundColor = '#4cc9f0';

            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.backgroundColor = '';
                objectiveFormContainer.style.display = 'none';
                renderAboutObjectives();
            }, 800);
        });
    }


    // --- EDUCATION SECTION RENDER & SAVE ---
    const educationList = document.getElementById('education-list');
    const btnAddEducation = document.getElementById('btn-add-education');

    // Form elements
    const educationFormContainer = document.getElementById('education-form-container');
    const educationFormTitle = document.getElementById('education-form-title');
    const educationItemIndex = document.getElementById('education-item-index');
    const educationLevelInput = document.getElementById('education-level-input');
    const educationCourseInput = document.getElementById('education-course-input');
    const educationYearInput = document.getElementById('education-year-input');
    const educationPercentageInput = document.getElementById('education-percentage-input');
    const educationUniversityInput = document.getElementById('education-university-input');
    const btnSaveEducationItem = document.getElementById('btn-save-education-item');
    const btnCancelEducationItem = document.getElementById('btn-cancel-education-item');

    // Default mock data
    const defaultEducation = [
        {
            level: "Schooling", course: "S.L.C.", year: "2012-2014",
            percentage: "68%", university: ""
        },
        {
            level: "Diploma", course: "Diploma in E.C.E.", year: "2014-2017",
            percentage: "65%", university: "HSBTE"
        },
        {
            level: "B.Tech", course: "Electronics & Communication Engineering", year: "2017-2021",
            percentage: "6.61/10", university: "Jawarlal Nehru Technological University Hyderabad(JNTUH)"
        }
    ];

    let educationItems = [];
    try {
        const stored = localStorage.getItem('educationItems');
        if (stored) {
            educationItems = JSON.parse(stored);
        } else {
            educationItems = [...defaultEducation];
        }
    } catch (e) {
        educationItems = [...defaultEducation];
    }

    function saveEducationToStorage() {
        localStorage.setItem('educationItems', JSON.stringify(educationItems));
    }

    let educationEditingIndex = -1;

    function renderEducationItems() {
        if (!educationList) return;
        educationList.innerHTML = '';
        educationItems.forEach((item, index) => {
            if (index === educationEditingIndex) {
                const itemHTML = `
                    <div class="list-item" style="flex-direction: column; align-items: stretch; background: #f8f9fa; border: 1px solid #e9ecef; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <h4 style="margin-bottom: 15px; color: #4361ee;"><i class="fas fa-edit"></i> Edit Education</h4>
                        <div class="form-group" style="margin-bottom: 10px;">
                            <label style="font-size: 0.8rem; color: #6c757d;">Level / Category</label>
                            <input type="text" id="inline-edu-level" value="${item.level || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 10px;">
                            <label style="font-size: 0.8rem; color: #6c757d;">Course Name</label>
                            <input type="text" id="inline-edu-course" value="${item.course || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 10px;">
                            <label style="font-size: 0.8rem; color: #6c757d;">Year</label>
                            <input type="text" id="inline-edu-year" value="${item.year || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 10px;">
                            <label style="font-size: 0.8rem; color: #6c757d;">Percentage / CGPA</label>
                            <input type="text" id="inline-edu-percent" value="${item.percentage || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 10px;">
                            <label style="font-size: 0.8rem; color: #6c757d;">University / Board</label>
                            <input type="text" id="inline-edu-univ" value="${item.university || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button type="button" class="btn-save inline-btn-save-edu">Save Changes</button>
                            <button type="button" class="btn-logout inline-btn-cancel-edu" style="width: auto; padding: 12px 25px;">Cancel</button>
                        </div>
                    </div>
                `;
                educationList.insertAdjacentHTML('beforeend', itemHTML);
            } else {
                const displayTitle = item.course || item.level || `Education ${index + 1}`;
                const displaySub = `${item.level ? item.level + ' - ' : ''}${item.percentage || ''}`;
                const itemHTML = `
                    <div class="list-item">
                        <div class="item-details" style="flex:1; margin-right: 15px;">
                            <h4>${displayTitle} (${item.year})</h4>
                            <p>${displaySub}</p>
                        </div>
                        <div class="item-actions">
                            <button class="btn-edit btn-edit-education" data-index="${index}"><i class="fas fa-edit"></i></button>
                            <button class="btn-delete btn-delete-education" data-index="${index}"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
                educationList.insertAdjacentHTML('beforeend', itemHTML);
            }
        });

        document.querySelectorAll('.btn-edit-education').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                educationFormContainer.style.display = 'none'; // Ensure top add form is hidden
                educationEditingIndex = parseInt(this.getAttribute('data-index'));
                renderEducationItems(); // Re-render to show inline form for this index
            });
        });

        document.querySelectorAll('.btn-delete-education').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const idx = parseInt(this.getAttribute('data-index'));
                if (confirm('Are you sure you want to delete this education item?')) {
                    educationItems.splice(idx, 1);
                    saveEducationToStorage();
                    renderEducationItems();
                }
            });
        });

        // Inline form buttons logic
        const btnSaveInlineEdu = document.querySelector('.inline-btn-save-edu');
        if (btnSaveInlineEdu) {
            btnSaveInlineEdu.addEventListener('click', function (e) {
                e.preventDefault();
                const levelVal = document.getElementById('inline-edu-level').value.trim();
                const courseVal = document.getElementById('inline-edu-course').value.trim();

                if (!levelVal && !courseVal) {
                    alert("Please provide at least a Level or Course Name.");
                    return;
                }

                educationItems[educationEditingIndex] = {
                    level: levelVal,
                    course: courseVal,
                    year: document.getElementById('inline-edu-year').value.trim(),
                    percentage: document.getElementById('inline-edu-percent').value.trim(),
                    university: document.getElementById('inline-edu-univ').value.trim()
                };

                saveEducationToStorage();

                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i> Saved!';
                this.style.backgroundColor = '#4cc9f0';
                setTimeout(() => {
                    educationEditingIndex = -1;
                    renderEducationItems();
                }, 400);
            });
        }

        const btnCancelInlineEdu = document.querySelector('.inline-btn-cancel-edu');
        if (btnCancelInlineEdu) {
            btnCancelInlineEdu.addEventListener('click', function (e) {
                e.preventDefault();
                educationEditingIndex = -1;
                renderEducationItems();
            });
        }
    }

    renderEducationItems();

    if (btnAddEducation && educationFormContainer) {
        btnAddEducation.addEventListener('click', (e) => {
            e.preventDefault();
            educationEditingIndex = -1; // Close any open inline edit form
            renderEducationItems();

            educationItemIndex.value = "-1";
            educationLevelInput.value = '';
            educationCourseInput.value = '';
            educationYearInput.value = '';
            educationPercentageInput.value = '';
            educationUniversityInput.value = '';

            educationFormTitle.textContent = "Add New Education";
            educationFormContainer.style.display = 'block';
            educationFormContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            educationLevelInput.focus();
        });
    }

    if (btnCancelEducationItem) {
        btnCancelEducationItem.addEventListener('click', (e) => {
            e.preventDefault();
            educationFormContainer.style.display = 'none';
        });
    }

    if (btnSaveEducationItem) {
        btnSaveEducationItem.addEventListener('click', function (e) {
            e.preventDefault();

            const levelVal = educationLevelInput.value.trim();
            const courseVal = educationCourseInput.value.trim();
            const yearVal = educationYearInput.value.trim();

            if (!levelVal && !courseVal) {
                alert("Please provide at least a Level or Course Name.");
                return;
            }

            const newItem = {
                level: levelVal,
                course: courseVal,
                year: yearVal,
                percentage: educationPercentageInput.value.trim(),
                university: educationUniversityInput.value.trim()
            };

            // This form is exclusively for adding new now
            educationItems.push(newItem);
            saveEducationToStorage();

            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Added!';
            this.style.backgroundColor = '#4cc9f0';

            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.backgroundColor = '';
                educationFormContainer.style.display = 'none';
                renderEducationItems();
            }, 800);
        });
    }

    // --- SKILLS SECTION RENDER & SAVE ---
    const skillsList = document.getElementById('skills-list');
    const btnAddSkill = document.getElementById('btn-add-skill');

    // Form elements
    const skillFormContainer = document.getElementById('skill-form-container');
    const skillFormTitle = document.getElementById('skill-form-title');
    const skillItemIndex = document.getElementById('skill-item-index');
    const skillCategoryInput = document.getElementById('skill-category-input');
    const skillIconInput = document.getElementById('skill-icon-input');
    const skillNameInput = document.getElementById('skill-name-input');
    const skillPercentageInput = document.getElementById('skill-percentage-input');
    const btnSaveSkillItem = document.getElementById('btn-save-skill-item');
    const btnCancelSkillItem = document.getElementById('btn-cancel-skill-item');

    // Default mock data (to simulate index.html structure)
    const defaultSkills = [
        { category: "Electronics", icon: "fas fa-microchip", name: "Communication Systems", percentage: "85" },
        { category: "Electronics", icon: "fas fa-microchip", name: "Digital Electronics", percentage: "90" },
        { category: "Electronics", icon: "fas fa-microchip", name: "Embedded Systems", percentage: "80" },
        { category: "Electronics", icon: "fas fa-microchip", name: "Signal Processing", percentage: "75" },
        { category: "Programming Languages", icon: "fas fa-code", name: "C/C++", percentage: "85" },
        { category: "Programming Languages", icon: "fas fa-code", name: "Python", percentage: "80" },
        { category: "Programming Languages", icon: "fas fa-code", name: "Embedded C", percentage: "75" },
        { category: "Programming Languages", icon: "fas fa-code", name: "VHDL/Verilog", percentage: "70" },
        { category: "Tools & Software", icon: "fas fa-wrench", name: "MATLAB", percentage: "85" },
        { category: "Tools & Software", icon: "fas fa-wrench", name: "Proteus", percentage: "80" },
        { category: "Tools & Software", icon: "fas fa-wrench", name: "Multisim", percentage: "75" },
        { category: "Tools & Software", icon: "fas fa-wrench", name: "Git/GitHub", percentage: "80" }
    ];

    let skillsItems = [];
    try {
        const stored = localStorage.getItem('skillsItems');
        if (stored) {
            skillsItems = JSON.parse(stored);
        } else {
            skillsItems = [...defaultSkills];
        }
    } catch (e) {
        skillsItems = [...defaultSkills];
    }

    function saveSkillsToStorage() {
        localStorage.setItem('skillsItems', JSON.stringify(skillsItems));
    }

    let skillEditingIndex = -1;
    let currentSkillCategory = null;

    function renderSkillsItems() {
        if (!skillsList) return;
        skillsList.innerHTML = '';

        if (currentSkillCategory === null) {
            // Render CATEGORY SELECTION VIEW
            const categories = {};
            skillsItems.forEach(item => {
                const catName = item.category || 'General';
                if (!categories[catName]) {
                    categories[catName] = {
                        icon: item.icon || 'fas fa-star',
                        count: 0
                    };
                }
                categories[catName].count++;
            });

            const gridHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; padding: 10px;">
                    ${Object.keys(categories).map(catName => `
                        <div class="category-card btn-open-category" data-category="${catName}" style="background: white; padding: 25px; border-radius: 12px; border: 1px solid #e1e7ff; text-align: center; cursor: pointer; transition: transform 0.2s, box-shadow: 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            <div style="width: 50px; height: 50px; background: #f1f4ff; color: #4361ee; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-size: 1.5rem;">
                                <i class="${categories[catName].icon}"></i>
                            </div>
                            <h4 style="margin-bottom: 5px; color: #333;">${catName}</h4>
                            <p style="font-size: 0.8rem; color: #6c757d;">${categories[catName].count} Skills</p>
                        </div>
                    `).join('')}
                    <div class="category-card" id="btn-create-new-cat" style="background: #f8f9fa; padding: 25px; border-radius: 12px; border: 1px dashed #ced4da; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <i class="fas fa-plus-circle" style="font-size: 1.5rem; color: #6c757d; margin-bottom: 10px;"></i>
                        <h4 style="color: #6c757d;">New Category</h4>
                    </div>
                </div>
            `;
            skillsList.innerHTML = gridHTML;

            // Event listeners for category selection
            document.querySelectorAll('.btn-open-category').forEach(card => {
                card.addEventListener('click', function () {
                    currentSkillCategory = this.getAttribute('data-category');
                    renderSkillsItems();
                });
            });

            document.getElementById('btn-create-new-cat').addEventListener('click', function () {
                skillEditingIndex = -1;
                skillItemIndex.value = "-1";
                skillCategoryInput.value = '';
                skillIconInput.value = 'fas fa-briefcase';
                skillNameInput.value = '';
                skillPercentageInput.value = '';

                skillFormTitle.textContent = "Create New Skill Category";
                skillFormContainer.style.display = 'block';
                skillFormContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                skillCategoryInput.focus();
            });

        } else {
            // Render SPECIFIC CATEGORY VIEW
            const catItems = skillsItems
                .map((item, index) => ({ ...item, originalIndex: index }))
                .filter(item => item.category === currentSkillCategory);

            const catIcon = catItems.length > 0 ? catItems[0].icon : 'fas fa-star';

            const headerHTML = `
                <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 15px;">
                    <button id="btn-back-to-categories" class="btn-back">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                    <h3 style="margin: 0; color: #4361ee;"><i class="${catIcon}"></i> ${currentSkillCategory}</h3>
                    <button class="btn-add" id="btn-add-skill-to-this-cat" style="margin-left: auto; padding: 8px 15px; font-size: 0.85rem;">
                        <i class="fas fa-plus"></i> Add Skill
                    </button>
                </div>
                <div class="list-container" id="category-specific-list"></div>
            `;
            skillsList.innerHTML = headerHTML;

            const listContainer = document.getElementById('category-specific-list');

            catItems.forEach(item => {
                const index = item.originalIndex;
                if (index === skillEditingIndex) {
                    const itemHTML = `
                        <div class="list-item" style="flex-direction: column; align-items: stretch; background: #fffdf5; border-left: 4px solid #4cc9f0; padding: 20px;">
                            <h5 style="margin-bottom: 15px; color: #4361ee;"><i class="fas fa-edit"></i> Edit Skill Details</h5>
                            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px; margin-bottom: 10px;">
                                <div class="form-group">
                                    <label style="font-size: 0.75rem;">Skill Name</label>
                                    <input type="text" id="inline-skill-name" value="${item.name || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                </div>
                                <div class="form-group">
                                    <label style="font-size: 0.75rem;">Percentage (%)</label>
                                    <input type="number" id="inline-skill-percent" value="${item.percentage || ''}" min="0" max="100" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                </div>
                            </div>
                            <div style="display: flex; gap: 10px; margin-top: 10px;">
                                <button type="button" class="btn-save inline-btn-save-skill" style="padding: 8px 20px; font-size: 0.85rem;">Save Changes</button>
                                <button type="button" class="btn-logout inline-btn-cancel-skill" style="padding: 8px 20px; font-size: 0.85rem; width: auto;">Cancel</button>
                            </div>
                        </div>
                    `;
                    listContainer.insertAdjacentHTML('beforeend', itemHTML);
                } else {
                    const itemHTML = `
                        <div class="list-item">
                            <div class="item-details" style="flex:1;">
                                <h4 style="margin: 0;">${item.name || 'Unnamed Skill'}</h4>
                                <p style="margin: 5px 0 0;">Proficiency: ${item.percentage || 0}%</p>
                            </div>
                            <div class="item-actions">
                                <button class="btn-edit btn-edit-skill" data-index="${index}"><i class="fas fa-edit"></i></button>
                                <button class="btn-delete btn-delete-skill" data-index="${index}"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    `;
                    listContainer.insertAdjacentHTML('beforeend', itemHTML);
                }
            });

            document.getElementById('btn-back-to-categories').addEventListener('click', function () {
                currentSkillCategory = null;
                skillEditingIndex = -1;
                renderSkillsItems();
            });

            document.getElementById('btn-add-skill-to-this-cat').addEventListener('click', function () {
                skillEditingIndex = -1;
                skillItemIndex.value = "-1";
                skillCategoryInput.value = currentSkillCategory;
                skillIconInput.value = catIcon;
                skillNameInput.value = '';
                skillPercentageInput.value = '';

                skillFormTitle.textContent = `Add New Skill to ${currentSkillCategory}`;
                skillFormContainer.style.display = 'block';
                skillFormContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                skillNameInput.focus();
            });

            document.querySelectorAll('.btn-edit-skill').forEach(btn => {
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    skillFormContainer.style.display = 'none';
                    skillEditingIndex = parseInt(this.getAttribute('data-index'));
                    renderSkillsItems();
                });
            });

            document.querySelectorAll('.btn-delete-skill').forEach(btn => {
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    const idx = parseInt(this.getAttribute('data-index'));
                    if (confirm('Are you sure you want to delete this skill?')) {
                        skillsItems.splice(idx, 1);
                        saveSkillsToStorage();
                        renderSkillsItems();
                    }
                });
            });

            // Inline form buttons logic
            const btnSaveInlineSkill = document.querySelector('.inline-btn-save-skill');
            if (btnSaveInlineSkill) {
                btnSaveInlineSkill.addEventListener('click', function (e) {
                    e.preventDefault();
                    const nameVal = document.getElementById('inline-skill-name').value.trim();
                    if (!nameVal) {
                        alert("Please provide at least a Skill Name.");
                        return;
                    }

                    skillsItems[skillEditingIndex] = {
                        ...skillsItems[skillEditingIndex],
                        name: nameVal,
                        percentage: document.getElementById('inline-skill-percent').value.trim()
                    };

                    saveSkillsToStorage();

                    this.innerHTML = '<i class="fas fa-check"></i> Saved!';
                    this.style.backgroundColor = '#4cc9f0';
                    setTimeout(() => {
                        skillEditingIndex = -1;
                        renderSkillsItems();
                    }, 400);
                });
            }

            const btnCancelInlineSkill = document.querySelector('.inline-btn-cancel-skill');
            if (btnCancelInlineSkill) {
                btnCancelInlineSkill.addEventListener('click', function (e) {
                    e.preventDefault();
                    skillEditingIndex = -1;
                    renderSkillsItems();
                });
            }
        }
    }

    renderSkillsItems();

    if (btnCancelSkillItem) {
        btnCancelSkillItem.addEventListener('click', (e) => {
            e.preventDefault();
            skillFormContainer.style.display = 'none';
        });
    }

    if (btnSaveSkillItem) {
        btnSaveSkillItem.addEventListener('click', function (e) {
            e.preventDefault();

            const nameVal = skillNameInput.value.trim();
            const catVal = skillCategoryInput.value.trim();

            if (!nameVal || !catVal) {
                alert("Please provide both a Category and Skill Name.");
                return;
            }

            const newItem = {
                category: catVal,
                icon: skillIconInput.value.trim() || 'fas fa-code',
                name: nameVal,
                percentage: skillPercentageInput.value.trim() || '0'
            };

            skillsItems.push(newItem);
            saveSkillsToStorage();

            this.innerHTML = '<i class="fas fa-check"></i> Added!';
            this.style.backgroundColor = '#4cc9f0';

            setTimeout(() => {
                this.innerHTML = 'Save Skill';
                this.style.backgroundColor = '';
                skillFormContainer.style.display = 'none';
                currentSkillCategory = catVal; // Go to the category we just added to
                renderSkillsItems();
            }, 800);
        });
    }

    // --- PROJECTS MANAGEMENT ---
    const projectsList = document.getElementById('projects-list');
    const projectFormContainer = document.getElementById('project-form-container');
    const projectFormTitle = document.getElementById('project-form-title');
    const projectItemIndex = document.getElementById('project-item-index');
    const projectCategoryInput = document.getElementById('project-category-input');
    const projectIconInput = document.getElementById('project-icon-input');
    const projectTitleInput = document.getElementById('project-title-input');
    const projectDescriptionInput = document.getElementById('project-description-input');
    const projectImageInput = document.getElementById('project-image-input');
    const projectTagsInput = document.getElementById('project-tags-input');
    const projectGithubInput = document.getElementById('project-github-input');
    const projectDemoInput = document.getElementById('project-demo-input');
    const btnSaveProjectItem = document.getElementById('btn-save-project-item');
    const btnCancelProjectItem = document.getElementById('btn-cancel-project-item');

    const defaultProjects = [
        {
            category: "IoT",
            icon: "fas fa-home",
            title: "Smart Home Automation System",
            description: "Developed an IoT-based home automation system using ESP32 and sensors for controlling lights, fans, and monitoring temperature.",
            image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=400&fit=crop",
            tags: "ESP32, Arduino, IoT, Mobile App",
            github: "https://github.com",
            demo: "#"
        },
        {
            category: "Software",
            icon: "fas fa-file-audio",
            title: "Digital Signal Processing for Audio",
            description: "Implemented various DSP algorithms for audio signal processing including noise reduction, equalization, and compression using MATLAB and Python.",
            image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=400&fit=crop",
            tags: "MATLAB, Python, DSP, Audio",
            github: "https://github.com",
            demo: "#"
        },
        {
            category: "Embedded",
            icon: "fas fa-id-card",
            title: "RFID-Based Attendance System",
            description: "Created an automated attendance system using RFID technology and Arduino. Integrated with a database for real-time tracking.",
            image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
            tags: "RFID, Arduino, MySQL, C++",
            github: "https://github.com",
            demo: "#"
        },
        {
            category: "Electronics",
            icon: "fas fa-bolt",
            title: "Wireless Power Transfer System",
            description: "Designed and implemented a wireless power transfer system based on electromagnetic induction principles for charging small electronic devices.",
            image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=400&fit=crop",
            tags: "Circuit Design, Power Electronics, Proteus",
            github: "https://github.com",
            demo: "#"
        },
        {
            category: "Robotics",
            icon: "fas fa-robot",
            title: "Voice-Controlled Robot",
            description: "Built a voice-controlled mobile robot using speech recognition modules and motor drivers. Programmed with Arduino.",
            image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop",
            tags: "Arduino, Speech Recognition, Robotics, C",
            github: "https://github.com",
            demo: "#"
        },
        {
            category: "Healthcare",
            icon: "fas fa-heartbeat",
            title: "Heart Rate Monitoring System",
            description: "Developed a portable heart rate monitoring device using pulse sensor and Arduino. Displays real-time data on LCD.",
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
            tags: "Arduino, Sensors, Healthcare, Embedded C",
            github: "https://github.com",
            demo: "#"
        }
    ];

    let projectsItems = JSON.parse(localStorage.getItem('projectsItems')) || defaultProjects;
    let projectEditingIndex = -1;
    let currentProjectCategory = null;

    function saveProjectsToStorage() {
        localStorage.setItem('projectsItems', JSON.stringify(projectsItems));
    }

    function renderProjectsItems() {
        if (!projectsList) return;
        projectsList.innerHTML = '';

        if (currentProjectCategory === null) {
            // CATEGORY VIEW
            const categories = {};
            projectsItems.forEach(item => {
                const catName = item.category || 'Other';
                if (!categories[catName]) {
                    categories[catName] = { icon: item.icon || 'fas fa-project-diagram', count: 0 };
                }
                categories[catName].count++;
            });

            const gridHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; padding: 10px;">
                    ${Object.keys(categories).map(catName => `
                        <div class="category-card btn-open-project-category" data-category="${catName}" style="background: white; padding: 25px; border-radius: 12px; border: 1px solid #e1e7ff; text-align: center; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            <div style="width: 50px; height: 50px; background: #fff4e1; color: #f39c12; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-size: 1.5rem;">
                                <i class="${categories[catName].icon}"></i>
                            </div>
                            <h4 style="margin-bottom: 5px; color: #333;">${catName}</h4>
                            <p style="font-size: 0.8rem; color: #6c757d;">${categories[catName].count} Projects</p>
                        </div>
                    `).join('')}
                    <div class="category-card" id="btn-create-new-project-cat" style="background: #f8f9fa; padding: 25px; border-radius: 12px; border: 1px dashed #ced4da; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <i class="fas fa-plus-circle" style="font-size: 1.5rem; color: #6c757d; margin-bottom: 10px;"></i>
                        <h4 style="color: #6c757d;">New Category</h4>
                    </div>
                </div>
            `;
            projectsList.innerHTML = gridHTML;

            document.querySelectorAll('.btn-open-project-category').forEach(card => {
                card.addEventListener('click', function () {
                    currentProjectCategory = this.getAttribute('data-category');
                    renderProjectsItems();
                });
            });

            document.getElementById('btn-create-new-project-cat').addEventListener('click', function () {
                projectEditingIndex = -1;
                projectItemIndex.value = "-1";
                projectCategoryInput.value = '';
                projectIconInput.value = 'fas fa-project-diagram';
                projectTitleInput.value = '';
                projectDescriptionInput.value = '';
                projectImageInput.value = '';
                projectTagsInput.value = '';
                projectGithubInput.value = '';
                projectDemoInput.value = '';

                projectFormTitle.textContent = "Create New Project Category";
                projectFormContainer.style.display = 'block';
                projectFormContainer.scrollIntoView({ behavior: 'smooth' });
            });

        } else {
            // PROJECT VIEW
            const catItems = projectsItems
                .map((item, index) => ({ ...item, originalIndex: index }))
                .filter(item => item.category === currentProjectCategory);

            const catIcon = catItems.length > 0 ? catItems[0].icon : 'fas fa-project-diagram';

            const headerHTML = `
                <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 15px;">
                    <button id="btn-back-to-project-categories" class="btn-back">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                    <h3 style="margin: 0; color: #f39c12;"><i class="${catIcon}"></i> ${currentProjectCategory}</h3>
                    <button class="btn-add" id="btn-add-project-to-this-cat" style="margin-left: auto; padding: 8px 15px; font-size: 0.85rem; background: #f39c12;">
                        <i class="fas fa-plus"></i> Add Project
                    </button>
                </div>
                <div class="list-container" id="category-specific-projects"></div>
            `;
            projectsList.innerHTML = headerHTML;

            const listContainer = document.getElementById('category-specific-projects');

            catItems.forEach(item => {
                const index = item.originalIndex;
                if (index === projectEditingIndex) {
                    const itemHTML = `
                        <div class="list-item" style="flex-direction: column; align-items: stretch; background: #fffdf5; border-left: 4px solid #f39c12; padding: 20px;">
                            <h5 style="margin-bottom: 15px; color: #f39c12;"><i class="fas fa-edit"></i> Edit Project Details</h5>
                            <div class="form-group" style="margin-bottom: 10px;">
                                <label style="font-size: 0.75rem;">Project Title</label>
                                <input type="text" id="inline-project-title" value="${item.title || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            <div class="form-group" style="margin-bottom: 10px;">
                                <label style="font-size: 0.75rem;">Description</label>
                                <textarea id="inline-project-desc" rows="2" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">${item.description || ''}</textarea>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px;">
                                <div class="form-group">
                                    <label style="font-size: 0.75rem;">Image URL</label>
                                    <input type="text" id="inline-project-image" value="${item.image || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                </div>
                                <div class="form-group">
                                    <label style="font-size: 0.75rem;">Tech Stack / Tags</label>
                                    <input type="text" id="inline-project-tags" value="${item.tags || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px;">
                                <div class="form-group">
                                    <label style="font-size: 0.75rem;">GitHub URL</label>
                                    <input type="text" id="inline-project-github" value="${item.github || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                </div>
                                <div class="form-group">
                                    <label style="font-size: 0.75rem;">Demo URL</label>
                                    <input type="text" id="inline-project-demo" value="${item.demo || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                </div>
                            </div>
                            <div style="display: flex; gap: 10px; margin-top: 10px;">
                                <button type="button" class="btn-save inline-btn-save-project" style="padding: 8px 20px; font-size: 0.85rem; background: #f39c12;">Save Changes</button>
                                <button type="button" class="btn-logout inline-btn-cancel-project" style="padding: 8px 20px; font-size: 0.85rem; width: auto;">Cancel</button>
                            </div>
                        </div>
                    `;
                    listContainer.insertAdjacentHTML('beforeend', itemHTML);
                } else {
                    const itemHTML = `
                        <div class="list-item" style="padding: 15px 20px;">
                            <div style="width: 60px; height: 60px; overflow: hidden; border-radius: 4px; margin-right: 15px;">
                                <img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover; border: 1px solid #eee;">
                            </div>
                            <div class="item-details" style="flex:1;">
                                <h4 style="margin: 0;">${item.title || 'Project'}</h4>
                                <p style="margin: 5px 0 0; font-size: 0.8rem; color: #666;">${item.tags}</p>
                            </div>
                            <div class="item-actions">
                                <button class="btn-edit btn-edit-project" data-index="${index}"><i class="fas fa-edit"></i></button>
                                <button class="btn-delete btn-delete-project" data-index="${index}"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    `;
                    listContainer.insertAdjacentHTML('beforeend', itemHTML);
                }
            });

            document.getElementById('btn-back-to-project-categories').addEventListener('click', function () {
                currentProjectCategory = null;
                projectEditingIndex = -1;
                renderProjectsItems();
            });

            document.getElementById('btn-add-project-to-this-cat').addEventListener('click', function () {
                projectEditingIndex = -1;
                projectItemIndex.value = "-1";
                projectCategoryInput.value = currentProjectCategory;
                projectIconInput.value = catIcon;
                projectTitleInput.value = '';
                projectDescriptionInput.value = '';
                projectImageInput.value = '';
                projectTagsInput.value = '';
                projectGithubInput.value = '';
                projectDemoInput.value = '';

                projectFormTitle.textContent = `Add Project to ${currentProjectCategory}`;
                projectFormContainer.style.display = 'block';
                projectFormContainer.scrollIntoView({ behavior: 'smooth' });
                projectTitleInput.focus();
            });

            document.querySelectorAll('.btn-edit-project').forEach(btn => {
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    projectFormContainer.style.display = 'none';
                    projectEditingIndex = parseInt(this.getAttribute('data-index'));
                    renderProjectsItems();
                });
            });

            document.querySelectorAll('.btn-delete-project').forEach(btn => {
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    const idx = parseInt(this.getAttribute('data-index'));
                    if (confirm('Are you sure you want to delete this project?')) {
                        projectsItems.splice(idx, 1);
                        saveProjectsToStorage();
                        renderProjectsItems();
                    }
                });
            });

            const btnSaveInlineProject = document.querySelector('.inline-btn-save-project');
            if (btnSaveInlineProject) {
                btnSaveInlineProject.addEventListener('click', function (e) {
                    e.preventDefault();
                    const titleVal = document.getElementById('inline-project-title').value.trim();
                    if (!titleVal) {
                        alert("Please provide a Project Title.");
                        return;
                    }

                    projectsItems[projectEditingIndex] = {
                        ...projectsItems[projectEditingIndex],
                        title: titleVal,
                        description: document.getElementById('inline-project-desc').value.trim(),
                        image: document.getElementById('inline-project-image').value.trim(),
                        tags: document.getElementById('inline-project-tags').value.trim(),
                        github: document.getElementById('inline-project-github').value.trim(),
                        demo: document.getElementById('inline-project-demo').value.trim()
                    };

                    saveProjectsToStorage();
                    projectEditingIndex = -1;
                    renderProjectsItems();
                });
            }

            const btnCancelInlineProject = document.querySelector('.inline-btn-cancel-project');
            if (btnCancelInlineProject) {
                btnCancelInlineProject.addEventListener('click', function (e) {
                    e.preventDefault();
                    projectEditingIndex = -1;
                    renderProjectsItems();
                });
            }
        }
    }

    renderProjectsItems();

    if (btnSaveProjectItem) {
        btnSaveProjectItem.addEventListener('click', function (e) {
            e.preventDefault();
            const titleVal = projectTitleInput.value.trim();
            const catVal = projectCategoryInput.value.trim();

            if (!titleVal || !catVal) {
                alert("Please provide Category and Title.");
                return;
            }

            const newItem = {
                category: catVal,
                icon: projectIconInput.value.trim() || 'fas fa-project-diagram',
                title: titleVal,
                description: projectDescriptionInput.value.trim(),
                image: projectImageInput.value.trim() || 'https://via.placeholder.com/600x400',
                tags: projectTagsInput.value.trim(),
                github: projectGithubInput.value.trim() || '#',
                demo: projectGithubInput.value.trim() || '#'
            };

            projectsItems.push(newItem);
            saveProjectsToStorage();

            this.innerHTML = '<i class="fas fa-check"></i> Added!';
            this.style.backgroundColor = '#4cc9f0';

            setTimeout(() => {
                this.innerHTML = 'Save Project';
                this.style.backgroundColor = '';
                projectFormContainer.style.display = 'none';
                currentProjectCategory = catVal;
                renderProjectsItems();
            }, 800);
        });
    }

    if (btnCancelProjectItem) {
        btnCancelProjectItem.addEventListener('click', (e) => {
            e.preventDefault();
            projectFormContainer.style.display = 'none';
        });
    }

    // --- EXPERIENCE MANAGEMENT ---
    const experienceList = document.getElementById('experience-list');
    const experienceFormContainer = document.getElementById('experience-form-container');
    const experienceFormTitle = document.getElementById('experience-form-title');
    const experienceItemIndex = document.getElementById('experience-item-index');
    const experienceBadgeInput = document.getElementById('experience-badge-input');
    const experienceIconInput = document.getElementById('experience-icon-input');
    const experienceTitleInput = document.getElementById('experience-title-input');
    const experienceDurationInput = document.getElementById('experience-duration-input');
    const experienceCompanyInput = document.getElementById('experience-company-input');
    const experienceDescriptionInput = document.getElementById('experience-description-input');
    const experienceTagsInput = document.getElementById('experience-tags-input');
    const btnSaveExperienceItem = document.getElementById('btn-save-experience-item');
    const btnCancelExperienceItem = document.getElementById('btn-cancel-experience-item');

    const defaultExperience = [
        {
            badge: "Full Time Job",
            icon: "fas fa-calendar-check",
            duration: "January 2023 - Till Date",
            title: "Trainer & IT Support Engineer",
            company: "Citizen Infotech Pvt. Ltd.",
            description: "Full-time Software Trainer responsible for delivering hands-on IT and software training, curriculum development, student mentoring, project guidance, and skill evaluation.",
            tags: "eHMIS, EHR, IDMS, MCH, IDSP"
        },
        {
            badge: "Full Time Job",
            icon: "fas fa-briefcase",
            duration: "November 2021 - July 2023",
            title: "IT Officer",
            company: "Hamro Madhyaworti Saving & Credit Co-operative Society Ltd.",
            description: "Managed IT infrastructure, cooperative software systems, data security, technical support, backups, networking, and digitization of operations.",
            tags: "IT infrastructure, Cybersecurity, Systems, Database"
        },
        {
            badge: "Full Time Job",
            icon: "fas fa-tools",
            duration: "October 2021 to Present",
            title: "Technical Support",
            company: "Highway Techno Institute Pvt. Ltd.",
            description: "Technical Support Officer responsible for system setup, troubleshooting, lab management, user support, networking, and technical assistance.",
            tags: "Operating Systems, Cybersecurity, Troubleshooting, Networking"
        },
        {
            badge: "Workshop",
            icon: "fas fa-award",
            duration: "January 2020",
            title: "ROBOTC Compitition",
            company: "JNTUH",
            description: "Participated in a hands-on workshop focusing on Arduino and ARM microcontroller programming, sensor interfacing, and real-time embedded applications.",
            tags: "Arduino, ARM, Sensors, Microcontrollers"
        },
        {
            badge: "Internship",
            icon: "fas fa-award",
            duration: "June 2020 - July 2020",
            title: "IMU Section, IT, Transmission & Mobile Project",
            company: "Nepal Telecom",
            description: "Certified in IMU Section, IT, Transmission & Mobile Project. Gained exposure to telecom infrastructure and mobile networking.",
            tags: "IMU, IT, Transmission, Mobile Networking"
        },
        {
            badge: "Training",
            icon: "fas fa-calendar-alt",
            duration: "1 June 2016 - 15 July 2016",
            title: "Embedded Systems Design & Programming",
            company: "NetMax Technology Pvt.Ltd.",
            description: "Completed comprehensive training in VLSI design covering RTL design, synthesis, and verification.",
            tags: "VLSI, Verilog, FPGA, RTL Design"
        },
        {
            badge: "Internship",
            icon: "fas fa-briefcase",
            duration: "June 2015 - August 2015",
            title: "Electronics Design Intern",
            company: "Tech Solutions Pvt. Ltd.",
            description: "Worked on PCB design and testing for IoT devices. Collaborated with senior engineers on embedded systems development.",
            tags: "PCB Design, Embedded Systems, Testing, IoT"
        }
    ];

    let experienceItems = JSON.parse(localStorage.getItem('experienceItems')) || defaultExperience;
    let experienceEditingIndex = -1;
    let currentExperienceCategory = null;

    function saveExperienceToStorage() {
        localStorage.setItem('experienceItems', JSON.stringify(experienceItems));
    }

    function renderExperienceItems() {
        if (!experienceList) return;
        experienceList.innerHTML = '';

        if (currentExperienceCategory === null) {
            // CATEGORY VIEW
            const categories = {};
            experienceItems.forEach(item => {
                const catName = item.badge || 'Experience';
                if (!categories[catName]) {
                    categories[catName] = { icon: item.icon || 'fas fa-briefcase', count: 0 };
                }
                categories[catName].count++;
            });

            const gridHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; padding: 10px;">
                    ${Object.keys(categories).map(catName => `
                        <div class="category-card btn-open-experience-category" data-category="${catName}" style="background: white; padding: 25px; border-radius: 12px; border: 1px solid #e1e7ff; text-align: center; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            <div style="width: 50px; height: 50px; background: #e1f5fe; color: #03a9f4; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-size: 1.5rem;">
                                <i class="${categories[catName].icon}"></i>
                            </div>
                            <h4 style="margin-bottom: 5px; color: #333;">${catName}</h4>
                            <p style="font-size: 0.8rem; color: #6c757d;">${categories[catName].count} Items</p>
                        </div>
                    `).join('')}
                    <div class="category-card" id="btn-create-new-experience-cat" style="background: #f8f9fa; padding: 25px; border-radius: 12px; border: 1px dashed #ced4da; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <i class="fas fa-plus-circle" style="font-size: 1.5rem; color: #6c757d; margin-bottom: 10px;"></i>
                        <h4 style="color: #6c757d;">New Type</h4>
                    </div>
                </div>
            `;
            experienceList.innerHTML = gridHTML;

            document.querySelectorAll('.btn-open-experience-category').forEach(card => {
                card.addEventListener('click', function () {
                    currentExperienceCategory = this.getAttribute('data-category');
                    renderExperienceItems();
                });
            });

            document.getElementById('btn-create-new-experience-cat').addEventListener('click', function () {
                experienceEditingIndex = -1;
                experienceBadgeInput.value = '';
                experienceIconInput.value = 'fas fa-briefcase';
                experienceTitleInput.value = '';
                experienceDurationInput.value = '';
                experienceCompanyInput.value = '';
                experienceDescriptionInput.value = '';
                experienceTagsInput.value = '';

                experienceFormTitle.textContent = "Add New Experience Type";
                experienceFormContainer.style.display = 'block';
                experienceFormContainer.scrollIntoView({ behavior: 'smooth' });
            });

        } else {
            // DETAIL VIEW
            const catItems = experienceItems
                .map((item, index) => ({ ...item, originalIndex: index }))
                .filter(item => item.badge === currentExperienceCategory);

            const catIcon = catItems.length > 0 ? catItems[0].icon : 'fas fa-briefcase';

            const headerHTML = `
                <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 15px;">
                    <button id="btn-back-to-experience-categories" class="btn-back">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                    <h3 style="margin: 0; color: #03a9f4;"><i class="${catIcon}"></i> ${currentExperienceCategory}</h3>
                    <button class="btn-add" id="btn-add-experience-to-this-cat" style="margin-left: auto; padding: 8px 15px; font-size: 0.85rem; background: #03a9f4;">
                        <i class="fas fa-plus"></i> Add ${currentExperienceCategory}
                    </button>
                </div>
                <div class="list-container" id="category-specific-experience"></div>
            `;
            experienceList.innerHTML = headerHTML;

            const listContainer = document.getElementById('category-specific-experience');

            catItems.forEach(item => {
                const index = item.originalIndex;
                if (index === experienceEditingIndex) {
                    const itemHTML = `
                        <div class="list-item" style="flex-direction: column; align-items: stretch; background: #fffdf5; border-left: 4px solid #03a9f4; padding: 20px;">
                            <h5 style="margin-bottom: 15px; color: #03a9f4;"><i class="fas fa-edit"></i> Edit Details</h5>
                            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px; margin-bottom: 10px;">
                                <div class="form-group">
                                    <label style="font-size: 0.75rem;">Title / Role</label>
                                    <input type="text" id="inline-exp-title" value="${item.title || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                </div>
                                <div class="form-group">
                                    <label style="font-size: 0.75rem;">Duration</label>
                                    <input type="text" id="inline-exp-duration" value="${item.duration || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                </div>
                            </div>
                            <div class="form-group" style="margin-bottom: 10px;">
                                <label style="font-size: 0.75rem;">Company / Organization</label>
                                <input type="text" id="inline-exp-company" value="${item.company || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            <div class="form-group" style="margin-bottom: 10px;">
                                <label style="font-size: 0.75rem;">Description</label>
                                <textarea id="inline-exp-desc" rows="3" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">${item.description || ''}</textarea>
                            </div>
                            <div class="form-group" style="margin-bottom: 10px;">
                                <label style="font-size: 0.75rem;">Skills / Tags</label>
                                <input type="text" id="inline-exp-tags" value="${item.tags || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            <div style="display: flex; gap: 10px; margin-top: 10px;">
                                <button type="button" class="btn-save inline-btn-save-experience" style="padding: 8px 20px; font-size: 0.85rem; background: #03a9f4;">Save Changes</button>
                                <button type="button" class="btn-logout inline-btn-cancel-experience" style="padding: 8px 20px; font-size: 0.85rem; width: auto;">Cancel</button>
                            </div>
                        </div>
                    `;
                    listContainer.insertAdjacentHTML('beforeend', itemHTML);
                } else {
                    const itemHTML = `
                        <div class="list-item" style="padding: 15px 20px;">
                            <div class="item-details" style="flex:1;">
                                <h4 style="margin: 0;">${item.title || 'Experience'}</h4>
                                <p style="margin: 5px 0 0; font-size: 0.85rem; color: #666;">${item.company} | ${item.duration}</p>
                            </div>
                            <div class="item-actions">
                                <button class="btn-edit btn-edit-experience" data-index="${index}"><i class="fas fa-edit"></i></button>
                                <button class="btn-delete btn-delete-experience" data-index="${index}"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    `;
                    listContainer.insertAdjacentHTML('beforeend', itemHTML);
                }
            });

            document.getElementById('btn-back-to-experience-categories').addEventListener('click', function () {
                currentExperienceCategory = null;
                experienceEditingIndex = -1;
                renderExperienceItems();
            });

            document.getElementById('btn-add-experience-to-this-cat').addEventListener('click', function () {
                experienceEditingIndex = -1;
                experienceBadgeInput.value = currentExperienceCategory;
                experienceIconInput.value = catIcon;
                experienceTitleInput.value = '';
                experienceDurationInput.value = '';
                experienceCompanyInput.value = '';
                experienceDescriptionInput.value = '';
                experienceTagsInput.value = '';

                experienceFormTitle.textContent = `Add ${currentExperienceCategory}`;
                experienceFormContainer.style.display = 'block';
                experienceFormContainer.scrollIntoView({ behavior: 'smooth' });
                experienceTitleInput.focus();
            });

            document.querySelectorAll('.btn-edit-experience').forEach(btn => {
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    experienceFormContainer.style.display = 'none';
                    experienceEditingIndex = parseInt(this.getAttribute('data-index'));
                    renderExperienceItems();
                });
            });

            document.querySelectorAll('.btn-delete-experience').forEach(btn => {
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    const idx = parseInt(this.getAttribute('data-index'));
                    if (confirm('Are you sure you want to delete this experience?')) {
                        experienceItems.splice(idx, 1);
                        saveExperienceToStorage();
                        renderExperienceItems();
                    }
                });
            });

            const btnSaveInlineExperience = document.querySelector('.inline-btn-save-experience');
            if (btnSaveInlineExperience) {
                btnSaveInlineExperience.addEventListener('click', function (e) {
                    e.preventDefault();
                    const titleVal = document.getElementById('inline-exp-title').value.trim();
                    if (!titleVal) {
                        alert("Please provide a Title.");
                        return;
                    }

                    experienceItems[experienceEditingIndex] = {
                        ...experienceItems[experienceEditingIndex],
                        title: titleVal,
                        duration: document.getElementById('inline-exp-duration').value.trim(),
                        company: document.getElementById('inline-exp-company').value.trim(),
                        description: document.getElementById('inline-exp-desc').value.trim(),
                        tags: document.getElementById('inline-exp-tags').value.trim()
                    };

                    saveExperienceToStorage();
                    experienceEditingIndex = -1;
                    renderExperienceItems();
                });
            }

            const btnCancelInlineExperience = document.querySelector('.inline-btn-cancel-experience');
            if (btnCancelInlineExperience) {
                btnCancelInlineExperience.addEventListener('click', function (e) {
                    e.preventDefault();
                    experienceEditingIndex = -1;
                    renderExperienceItems();
                });
            }
        }
    }

    renderExperienceItems();

    if (btnSaveExperienceItem) {
        btnSaveExperienceItem.addEventListener('click', function (e) {
            e.preventDefault();
            const titleVal = experienceTitleInput.value.trim();
            const badgeVal = experienceBadgeInput.value.trim();

            if (!titleVal || !badgeVal) {
                alert("Please provide Type and Title.");
                return;
            }

            const newItem = {
                badge: badgeVal,
                icon: experienceIconInput.value.trim() || 'fas fa-briefcase',
                title: titleVal,
                duration: experienceDurationInput.value.trim(),
                company: experienceCompanyInput.value.trim(),
                description: experienceDescriptionInput.value.trim(),
                tags: experienceTagsInput.value.trim()
            };

            experienceItems.push(newItem);
            saveExperienceToStorage();

            this.innerHTML = '<i class="fas fa-check"></i> Added!';
            this.style.backgroundColor = '#4cc9f0';

            setTimeout(() => {
                this.innerHTML = 'Save Experience';
                this.style.backgroundColor = '';
                experienceFormContainer.style.display = 'none';
                currentExperienceCategory = badgeVal;
                renderExperienceItems();
            }, 800);
        });
    }

    if (btnCancelExperienceItem) {
        btnCancelExperienceItem.addEventListener('click', (e) => {
            e.preventDefault();
            experienceFormContainer.style.display = 'none';
        });
    }

    // --- CERTIFICATES MANAGEMENT ---
    const certificatesList = document.getElementById('certificates-list');
    const certificatesFormContainer = document.getElementById('certificate-form-container');
    const certificatesFormTitle = document.getElementById('certificate-form-title');
    const certificateItemIndex = document.getElementById('certificate-item-index');
    const certificateIssuerInput = document.getElementById('certificate-issuer-input');
    const certificateIconInput = document.getElementById('certificate-icon-input');
    const certificateNameInput = document.getElementById('certificate-name-input');
    const certificateYearInput = document.getElementById('certificate-year-input');
    const certificateDescriptionInput = document.getElementById('certificate-description-input');
    const certificateTagsInput = document.getElementById('certificate-tags-input');
    const btnSaveCertificateItem = document.getElementById('btn-save-certificate-item');
    const btnCancelCertificateItem = document.getElementById('btn-cancel-certificate-item');

    const defaultCertificates = [
        {
            name: "Embedded Systems Certification",
            issuer: "Coursera",
            year: "2023",
            icon: "fas fa-award",
            description: "A comprehensive certification covering embedded systems architecture, RTOS, and hardware-software integration.",
            tags: "Embedded Systems, RTOS, C, Architecture"
        },
        {
            name: "Python for Data Science",
            issuer: "edX",
            year: "2023",
            icon: "fas fa-award",
            description: "Learned data manipulation, visualization, and basic machine learning using Python, Pandas, and Scikit-Learn.",
            tags: "Python, Data Science, Pandas, Visualization"
        },
        {
            name: "Digital Signal Processing",
            issuer: "NPTEL",
            year: "2022",
            icon: "fas fa-award",
            description: "Advanced course on discrete-time signals, filter design, and spectral analysis for electronics engineering.",
            tags: "DSP, Signal Processing, Filters, MATLAB"
        },
        {
            name: "PCB Design Fundamentals",
            issuer: "Udemy",
            year: "2022",
            icon: "fas fa-award",
            description: "Hands-on training in schematic capture and multi-layer PCB layout design using industry-standard tools.",
            tags: "PCB Design, Altium, Eagle, Hardware"
        },
        {
            name: "Robotics Trainning",
            issuer: "JNTUH",
            year: "2020",
            icon: "fas fa-award",
            description: "Participated in a hands-on workshop focusing on Arduino and ARM microcontroller programming and robotic control systems.",
            tags: "Robotics, Arduino, ARM, Control Systems"
        },
        {
            name: "Embedded Systems Design & Programming",
            issuer: "NetMax Technology",
            year: "2017",
            icon: "fas fa-award",
            description: "Industrial training on 8051 and PIC microcontrollers with practical projects on automation.",
            tags: "8051, PIC, Automation, Programming"
        },
        {
            name: "Certified in IMU Section, IT, Transmission & Mobile Project",
            issuer: "Nepal Telecom",
            year: "2020",
            icon: "fas fa-award",
            description: "Technical certification of industrial training at Nepal Telecom, covering transmission systems and mobile projects.",
            tags: "Telecom, Networking, Transmission, Mobile"
        }
    ];

    let certificatesItems = JSON.parse(localStorage.getItem('certificatesItems'));

    // Migration: If no certs OR if certs exist but are the old "simple" version (missing description), 
    // force reset to the new detailed defaultCertificates.
    if (!certificatesItems || (certificatesItems.length > 0 && !certificatesItems[0].description)) {
        certificatesItems = defaultCertificates;
        saveCertificatesToStorage();
    }

    let certificateEditingIndex = -1;
    let currentCertificateCategory = null;

    function saveCertificatesToStorage() {
        localStorage.setItem('certificatesItems', JSON.stringify(certificatesItems));
    }

    function renderCertificatesItems() {
        if (!certificatesList) return;
        certificatesList.innerHTML = '';

        if (currentCertificateCategory === null) {
            // CATEGORY VIEW (By Issuer)
            const categories = {};
            certificatesItems.forEach(item => {
                const catName = item.issuer || 'Other';
                if (!categories[catName]) {
                    categories[catName] = { icon: item.icon || 'fas fa-award', count: 0 };
                }
                categories[catName].count++;
            });

            const gridHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; padding: 10px;">
                    ${Object.keys(categories).map(catName => `
                        <div class="category-card btn-open-certificate-category" data-category="${catName}" style="background: white; padding: 25px; border-radius: 12px; border: 1px solid #e1e7ff; text-align: center; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            <div style="width: 50px; height: 50px; background: #fff8e1; color: #ffab00; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-size: 1.5rem;">
                                <i class="${categories[catName].icon}"></i>
                            </div>
                            <h4 style="margin-bottom: 5px; color: #333;">${catName}</h4>
                            <p style="font-size: 0.8rem; color: #6c757d;">${categories[catName].count} Certificates</p>
                        </div>
                    `).join('')}
                    <div class="category-card" id="btn-create-new-certificate-cat" style="background: #f8f9fa; padding: 25px; border-radius: 12px; border: 1px dashed #ced4da; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <i class="fas fa-plus-circle" style="font-size: 1.5rem; color: #6c757d; margin-bottom: 10px;"></i>
                        <h4 style="color: #6c757d;">New Issuer</h4>
                    </div>
                </div>
            `;
            certificatesList.innerHTML = gridHTML;

            document.querySelectorAll('.btn-open-certificate-category').forEach(card => {
                card.addEventListener('click', function () {
                    currentCertificateCategory = this.getAttribute('data-category');
                    renderCertificatesItems();
                });
            });

            document.getElementById('btn-create-new-certificate-cat').addEventListener('click', function () {
                certificateEditingIndex = -1;
                certificateIssuerInput.value = '';
                certificateIconInput.value = 'fas fa-award';
                certificateNameInput.value = '';
                certificateYearInput.value = '';
                certificateDescriptionInput.value = '';
                certificateTagsInput.value = '';

                certificatesFormTitle.textContent = "Add New Issuer / Certificate";
                certificatesFormContainer.style.display = 'block';
                certificatesFormContainer.scrollIntoView({ behavior: 'smooth' });
            });

        } else {
            // DETAIL VIEW
            const catItems = certificatesItems
                .map((item, index) => ({ ...item, originalIndex: index }))
                .filter(item => item.issuer === currentCertificateCategory);

            const catIcon = catItems.length > 0 ? catItems[0].icon : 'fas fa-award';

            const headerHTML = `
                <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 15px;">
                    <button id="btn-back-to-certificate-categories" class="btn-back">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                    <h3 style="margin: 0; color: #ffab00;"><i class="${catIcon}"></i> ${currentCertificateCategory}</h3>
                    <button class="btn-add" id="btn-add-certificate-to-this-cat" style="margin-left: auto; padding: 8px 15px; font-size: 0.85rem; background: #ffab00;">
                        <i class="fas fa-plus"></i> Add Certificate
                    </button>
                </div>
                <div class="list-container" id="category-specific-certificates"></div>
            `;
            certificatesList.innerHTML = headerHTML;

            const listContainer = document.getElementById('category-specific-certificates');

            catItems.forEach(item => {
                const index = item.originalIndex;
                if (index === certificateEditingIndex) {
                    const itemHTML = `
                        <div class="list-item" style="flex-direction: column; align-items: stretch; background: #fffdf5; border-left: 4px solid #ffab00; padding: 20px;">
                            <h5 style="margin-bottom: 15px; color: #ffab00;"><i class="fas fa-edit"></i> Edit Certificate Details</h5>
                            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px; margin-bottom: 15px;">
                                <div class="form-group">
                                    <label style="font-size: 0.75rem;">Certificate Name</label>
                                    <input type="text" id="inline-cert-name" value="${item.name || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                </div>
                                <div class="form-group">
                                    <label style="font-size: 0.75rem;">Year</label>
                                    <input type="text" id="inline-cert-year" value="${item.year || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                </div>
                            </div>
                            <div class="form-group" style="margin-bottom: 10px;">
                                <label style="font-size: 0.75rem;">Description</label>
                                <textarea id="inline-cert-desc" rows="2" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">${item.description || ''}</textarea>
                            </div>
                            <div class="form-group" style="margin-bottom: 10px;">
                                <label style="font-size: 0.75rem;">Skills / Tags</label>
                                <input type="text" id="inline-cert-tags" value="${item.tags || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            <div style="display: flex; gap: 10px; margin-top: 10px;">
                                <button type="button" class="btn-save inline-btn-save-certificate" style="padding: 8px 20px; font-size: 0.85rem; background: #ffab00;">Save Changes</button>
                                <button type="button" class="btn-logout inline-btn-cancel-certificate" style="padding: 8px 20px; font-size: 0.85rem; width: auto;">Cancel</button>
                            </div>
                        </div>
                    `;
                    listContainer.insertAdjacentHTML('beforeend', itemHTML);
                } else {
                    const itemHTML = `
                        <div class="list-item" style="padding: 15px 20px;">
                            <div class="item-details" style="flex:1;">
                                <h4 style="margin: 0;">${item.name || 'Certificate'}</h4>
                                <p style="margin: 5px 0 0; font-size: 0.85rem; color: #666;">${item.year}</p>
                            </div>
                            <div class="item-actions">
                                <button class="btn-edit btn-edit-certificate" data-index="${index}"><i class="fas fa-edit"></i></button>
                                <button class="btn-delete btn-delete-certificate" data-index="${index}"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    `;
                    listContainer.insertAdjacentHTML('beforeend', itemHTML);
                }
            });

            document.getElementById('btn-back-to-certificate-categories').addEventListener('click', function () {
                currentCertificateCategory = null;
                certificateEditingIndex = -1;
                renderCertificatesItems();
            });

            document.getElementById('btn-add-certificate-to-this-cat').addEventListener('click', function () {
                certificateEditingIndex = -1;
                certificateIssuerInput.value = currentCertificateCategory;
                certificateIconInput.value = catIcon;
                certificateNameInput.value = '';
                certificateYearInput.value = '';
                certificateDescriptionInput.value = '';
                certificateTagsInput.value = '';

                certificatesFormTitle.textContent = `Add Certificate to ${currentCertificateCategory}`;
                certificatesFormContainer.style.display = 'block';
                certificatesFormContainer.scrollIntoView({ behavior: 'smooth' });
                certificateNameInput.focus();
            });

            document.querySelectorAll('.btn-edit-certificate').forEach(btn => {
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    certificatesFormContainer.style.display = 'none';
                    certificateEditingIndex = parseInt(this.getAttribute('data-index'));
                    renderCertificatesItems();
                });
            });

            document.querySelectorAll('.btn-delete-certificate').forEach(btn => {
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    const idx = parseInt(this.getAttribute('data-index'));
                    if (confirm('Are you sure you want to delete this certificate?')) {
                        certificatesItems.splice(idx, 1);
                        saveCertificatesToStorage();
                        renderCertificatesItems();
                    }
                });
            });

            const btnSaveInlineCertificate = document.querySelector('.inline-btn-save-certificate');
            if (btnSaveInlineCertificate) {
                btnSaveInlineCertificate.addEventListener('click', function (e) {
                    e.preventDefault();
                    const nameVal = document.getElementById('inline-cert-name').value.trim();
                    if (!nameVal) {
                        alert("Please provide a name.");
                        return;
                    }

                    certificatesItems[certificateEditingIndex] = {
                        ...certificatesItems[certificateEditingIndex],
                        name: nameVal,
                        year: document.getElementById('inline-cert-year').value.trim(),
                        description: document.getElementById('inline-cert-desc').value.trim(),
                        tags: document.getElementById('inline-cert-tags').value.trim()
                    };

                    saveCertificatesToStorage();
                    certificateEditingIndex = -1;
                    renderCertificatesItems();
                });
            }

            const btnCancelInlineCertificate = document.querySelector('.inline-btn-cancel-certificate');
            if (btnCancelInlineCertificate) {
                btnCancelInlineCertificate.addEventListener('click', function (e) {
                    e.preventDefault();
                    certificateEditingIndex = -1;
                    renderCertificatesItems();
                });
            }
        }
    }

    renderCertificatesItems();

    if (btnSaveCertificateItem) {
        btnSaveCertificateItem.addEventListener('click', function (e) {
            e.preventDefault();
            const nameVal = certificateNameInput.value.trim();
            const issuerVal = certificateIssuerInput.value.trim();

            if (!nameVal || !issuerVal) {
                alert("Please provide Issuer and Certificate Name.");
                return;
            }

            const newItem = {
                issuer: issuerVal,
                icon: certificateIconInput.value.trim() || 'fas fa-award',
                name: nameVal,
                year: certificateYearInput.value.trim(),
                description: certificateDescriptionInput.value.trim(),
                tags: certificateTagsInput.value.trim()
            };

            certificatesItems.push(newItem);
            saveCertificatesToStorage();

            this.innerHTML = '<i class="fas fa-check"></i> Added!';
            this.style.backgroundColor = '#4cc9f0';

            setTimeout(() => {
                this.innerHTML = 'Save Certificate';
                this.style.backgroundColor = '';
                certificatesFormContainer.style.display = 'none';
                currentCertificateCategory = issuerVal;
                renderCertificatesItems();
            }, 800);
        });
    }

    if (btnCancelCertificateItem) {
        btnCancelCertificateItem.addEventListener('click', (e) => {
            e.preventDefault();
            certificatesFormContainer.style.display = 'none';
        });
    }

    // --- CONTACT SECTION SAVE ---
    const contactForm = document.getElementById('contact-form');
    const contactEmailInput = document.getElementById('contact-email');
    const contactPhoneInput = document.getElementById('contact-phone');
    const contactLocationInput = document.getElementById('contact-location');

    // Load Contact Data
    function loadContactData() {
        if (!contactEmailInput) return;
        contactEmailInput.value = localStorage.getItem('contactEmail') || 'Yubrajkaucha2@gmail.com';
        contactPhoneInput.value = localStorage.getItem('contactPhone') || '+358 449290992';
        contactLocationInput.value = localStorage.getItem('contactLocation') || 'Helsinki, Finland';
    }

    loadContactData();

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const saveBtn = this.querySelector('.btn-save');

            // Guard against multiple clicks during animation
            if (saveBtn.innerHTML.includes('Saving') || saveBtn.innerHTML.includes('Saved')) return;

            const originalText = saveBtn.innerHTML;

            // Visual feedback
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            saveBtn.style.opacity = '0.8';

            // Save to LocalStorage
            localStorage.setItem('contactEmail', contactEmailInput.value.trim());
            localStorage.setItem('contactPhone', contactPhoneInput.value.trim());
            localStorage.setItem('contactLocation', contactLocationInput.value.trim());

            setTimeout(() => {
                saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
                saveBtn.style.backgroundColor = '#4cc9f0';

                setTimeout(() => {
                    saveBtn.innerHTML = originalText;
                    saveBtn.style.backgroundColor = '';
                    saveBtn.style.opacity = '1';
                }, 2000);
            }, 800);
        });
    }

});
