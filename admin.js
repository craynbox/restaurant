
        // ===== MENU MANAGEMENT DATA =====
        let menuItems = JSON.parse(localStorage.getItem('menuItems')) || [
            {
                id: 1,
                name: "Margherita Pizza",
                description: "Classic pizza with tomato sauce, mozzarella, and fresh basil",
                price: 12.99,
                image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
                available: true
            },
            {
                id: 2,
                name: "Grilled Salmon",
                description: "Fresh salmon with lemon butter sauce and seasonal vegetables",
                price: 18.50,
                image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
                available: true
            },
            {
                id: 3,
                name: "Beef Burger",
                description: "Juicy beef patty with cheese, lettuce, tomato, and special sauce",
                price: 14.75,
                image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1398&q=80",
                available: true
            },
            {
                id: 4,
                name: "Caesar Salad",
                description: "Crisp romaine lettuce with Caesar dressing, croutons, and parmesan",
                price: 9.99,
                image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
                available: true
            },
            {
                id: 5,
                name: "Chicken Tikka Masala",
                description: "Tender chicken in a rich, creamy tomato and spice sauce",
                price: 16.25,
                image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&auto=format&fit=crop&w=1371&q=80",
                available: true
            },
            {
                id: 6,
                name: "Chocolate Lava Cake",
                description: "Warm chocolate cake with a molten center, served with vanilla ice cream",
                price: 8.50,
                image: "https://images.unsplash.com/photo-1624353365286-3f8d62dadadf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1376&q=80",
                available: true
            }
        ];

        let announcements = JSON.parse(localStorage.getItem('announcements')) || [
            {
                id: 1,
                text: "🎉 Special Offer: Get 20% off on all orders above $30!",
                timestamp: new Date().toISOString(),
                active: true
            },
            {
                id: 2,
                text: "🚚 Free delivery on orders above $25 within city limits",
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                active: true
            }
        ];

        // ===== MENU MANAGEMENT FUNCTIONS =====
        function renderMenuManagement() {
            const container = document.getElementById('menuManagementTab');
            if (!container) return;
            
            container.innerHTML = `
                <div class="announcement-management">
                    <h3 style="color: #2d3436; margin-bottom: 25px; font-size: 24px;">
                        <i class="fas fa-bullhorn"></i> Announcements
                    </h3>
                    
                    <form class="announcement-form" id="announcementForm">
                        <div class="form-group">
                            <label for="announcementText">New Announcement</label>
                            <textarea id="announcementText" class="form-control" rows="3" 
                                      placeholder="Enter announcement text (e.g., Special offers, updates, etc.)" required></textarea>
                        </div>
                        
                        <button type="submit" class="btn btn-warning" style="align-self: flex-start;">
                            <i class="fas fa-paper-plane"></i> Post Announcement
                        </button>
                    </form>
                    
                    <div class="announcement-preview">
                        <h4>Live Preview:</h4>
                        <div class="announcement-preview-content" id="announcementPreview">
                            No announcement yet
                        </div>
                    </div>
                    
                    <div class="announcement-list" id="announcementList">
                        <!-- Announcements will be populated here -->
                    </div>
                </div>
                
                <h3 style="color: #2d3436; margin: 40px 0 25px; font-size: 24px;">
                    <i class="fas fa-utensils"></i> Menu Items
                </h3>
                
                <div class="menu-management-grid" id="menuItemsGrid">
                    <!-- Menu items will be populated here -->
                </div>
                
                <div class="menu-management-grid">
                    <div class="add-item-btn" id="addMenuItemBtn">
                        <i class="fas fa-plus-circle"></i>
                        <h3>Add New Item</h3>
                        <p>Click to add a new item to the menu</p>
                    </div>
                </div>
            `;
            
            // Render menu items
            renderMenuItemsGrid();
            
            // Render announcements
            renderAnnouncementsList();
            
            // Setup event listeners for menu management
            setupMenuManagementEvents();
        }
        
        function renderMenuItemsGrid() {
            const container = document.getElementById('menuItemsGrid');
            if (!container) return;
            
            container.innerHTML = '';
            
            menuItems.forEach(item => {
                const menuItemCard = document.createElement('div');
                menuItemCard.className = `menu-item-card ${item.available ? '' : 'out-of-stock'}`;
                menuItemCard.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="menu-item-image">
                    <div class="menu-item-content">
                        <div class="menu-item-header">
                            <h4 class="menu-item-name">${item.name}</h4>
                            <div class="menu-item-price">$${item.price.toFixed(2)}</div>
                        </div>
                        <p class="menu-item-description">${item.description}</p>
                        <div class="menu-item-actions">
                            <button class="btn-action btn-edit-menu" onclick="editMenuItem(${item.id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn-action btn-toggle-stock" onclick="toggleMenuItemStock(${item.id})">
                                <i class="fas fa-toggle-${item.available ? 'on' : 'off'}"></i> 
                                ${item.available ? 'In Stock' : 'Out of Stock'}
                            </button>
                            <button class="btn-action btn-delete-menu" onclick="deleteMenuItem(${item.id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
                container.appendChild(menuItemCard);
            });
        }
        
        function renderAnnouncementsList() {
            const container = document.getElementById('announcementList');
            const preview = document.getElementById('announcementPreview');
            
            if (!container || !preview) return;
            
            // Update preview with the latest active announcement
            const activeAnnouncements = announcements.filter(a => a.active);
            if (activeAnnouncements.length > 0) {
                const latest = activeAnnouncements[activeAnnouncements.length - 1];
                preview.textContent = latest.text;
            } else {
                preview.textContent = 'No active announcements';
            }
            
            // Render announcement list
            container.innerHTML = '';
            
            if (announcements.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #636e72;">
                        <i class="fas fa-bullhorn" style="font-size: 48px; margin-bottom: 20px; opacity: 0.3;"></i>
                        <p>No announcements yet. Add your first announcement above.</p>
                    </div>
                `;
                return;
            }
            
            announcements.forEach(announcement => {
                const announcementItem = document.createElement('div');
                announcementItem.className = 'announcement-item';
                announcementItem.innerHTML = `
                    <div class="announcement-item-content">
                        <div class="announcement-item-text">${announcement.text}</div>
                        <div class="announcement-item-time">
                            ${formatDateTime(announcement.timestamp)}
                            ${announcement.active ? ' • 🟢 Active' : ' • 🔴 Inactive'}
                        </div>
                    </div>
                    <div class="announcement-item-actions">
                        <button class="btn-remove-announcement" onclick="toggleAnnouncementStatus(${announcement.id})" 
                                title="${announcement.active ? 'Deactivate' : 'Activate'}">
                            <i class="fas fa-toggle-${announcement.active ? 'on' : 'off'}"></i>
                        </button>
                        <button class="btn-remove-announcement" onclick="deleteAnnouncement(${announcement.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                container.appendChild(announcementItem);
            });
        }
        
        function setupMenuManagementEvents() {
            // Add menu item button
            const addMenuItemBtn = document.getElementById('addMenuItemBtn');
            if (addMenuItemBtn) {
                addMenuItemBtn.addEventListener('click', () => openMenuForm());
            }
            
            // Announcement form
            const announcementForm = document.getElementById('announcementForm');
            const announcementText = document.getElementById('announcementText');
            
            if (announcementForm && announcementText) {
                // Preview announcement as user types
                announcementText.addEventListener('input', function() {
                    const preview = document.getElementById('announcementPreview');
                    if (preview) {
                        preview.textContent = this.value || 'No announcement yet';
                    }
                });
                
                // Submit announcement form
                announcementForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const text = announcementText.value.trim();
                    if (!text) {
                        showToast('error', 'Empty Announcement', 'Please enter announcement text.');
                        return;
                    }
                    
                    const newAnnouncement = {
                        id: Date.now(),
                        text: text,
                        timestamp: new Date().toISOString(),
                        active: true
                    };
                    
                    announcements.unshift(newAnnouncement);
                    localStorage.setItem('announcements', JSON.stringify(announcements));
                    
                    // Update website announcement banner
                    updateWebsiteAnnouncement();
                    
                    // Reset form
                    announcementText.value = '';
                    
                    // Update UI
                    renderAnnouncementsList();
                    
                    // Show success message
                    showToast('success', 'Announcement Posted', 'Your announcement is now live on the website!');
                    
                    // Notify other tabs
                    sendToOtherTabs({
                        type: 'announcement_updated',
                        timestamp: Date.now()
                    });
                });
            }
            
            // Menu item form
            const menuItemForm = document.getElementById('menuItemForm');
            const menuItemImage = document.getElementById('menuItemImage');
            const menuItemImageUpload = document.getElementById('menuItemImageUpload');
            const imagePreview = document.getElementById('imagePreview');
            
            if (menuItemForm) {
                // Image URL change
                if (menuItemImage) {
                    menuItemImage.addEventListener('input', function() {
                        updateImagePreview(this.value);
                    });
                }
                
                // Image upload
                if (menuItemImageUpload) {
                    menuItemImageUpload.addEventListener('change', function(e) {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = function(e) {
                                updateImagePreview(e.target.result);
                                // Also update the URL field
                                if (menuItemImage) {
                                    menuItemImage.value = e.target.result;
                                }
                            };
                            reader.readAsDataURL(file);
                        }
                    });
                }
                
                // Form submission
                menuItemForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const id = parseInt(document.getElementById('menuItemId').value);
                    const name = document.getElementById('menuItemName').value.trim();
                    const price = parseFloat(document.getElementById('menuItemPrice').value);
                    const description = document.getElementById('menuItemDescription').value.trim();
                    const image = document.getElementById('menuItemImage').value.trim();
                    const available = document.getElementById('menuItemAvailable').checked;
                    
                    if (!name || !price || !description) {
                        showToast('error', 'Missing Information', 'Please fill in all required fields.');
                        return;
                    }
                    
                    if (id) {
                        // Update existing item
                        const index = menuItems.findIndex(item => item.id === id);
                        if (index !== -1) {
                            menuItems[index] = {
                                id: id,
                                name: name,
                                description: description,
                                price: price,
                                image: image || menuItems[index].image,
                                available: available
                            };
                            
                            showToast('success', 'Menu Item Updated', `${name} has been updated successfully.`);
                        }
                    } else {
                        // Add new item
                        const newId = menuItems.length > 0 ? Math.max(...menuItems.map(item => item.id)) + 1 : 1;
                        const newItem = {
                            id: newId,
                            name: name,
                            description: description,
                            price: price,
                            image: image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80',
                            available: available
                        };
                        
                        menuItems.push(newItem);
                        showToast('success', 'Menu Item Added', `${name} has been added to the menu.`);
                    }
                    
                    // Save to localStorage
                    localStorage.setItem('menuItems', JSON.stringify(menuItems));
                    
                    // Close form
                    closeMenuForm();
                    
                    // Update UI
                    renderMenuItemsGrid();
                    updateCustomerMenu();
                    
                    // Notify other tabs
                    sendToOtherTabs({
                        type: 'menu_updated',
                        timestamp: Date.now()
                    });
                });
            }
            
            // Cancel menu form button
            const cancelMenuForm = document.getElementById('cancelMenuForm');
            if (cancelMenuForm) {
                cancelMenuForm.addEventListener('click', closeMenuForm);
            }
        }
        
        function openMenuForm(itemId = null) {
            const formModal = document.getElementById('menuFormModal');
            const formTitle = document.getElementById('menuFormTitle');
            const formSubtitle = document.getElementById('menuFormSubtitle');
            const form = document.getElementById('menuItemForm');
            
            if (!formModal || !formTitle || !formSubtitle || !form) return;
            
            if (itemId) {
                // Edit existing item
                const item = menuItems.find(item => item.id === itemId);
                if (item) {
                    formTitle.textContent = 'Edit Menu Item';
                    formSubtitle.textContent = 'Update the details below';
                    
                    document.getElementById('menuItemId').value = item.id;
                    document.getElementById('menuItemName').value = item.name;
                    document.getElementById('menuItemPrice').value = item.price;
                    document.getElementById('menuItemDescription').value = item.description;
                    document.getElementById('menuItemImage').value = item.image;
                    document.getElementById('menuItemAvailable').checked = item.available;
                    
                    updateImagePreview(item.image);
                }
            } else {
                // Add new item
                formTitle.textContent = 'Add New Menu Item';
                formSubtitle.textContent = 'Fill in the details below';
                
                form.reset();
                document.getElementById('menuItemId').value = '';
                updateImagePreview('');
            }
            
            formModal.classList.add('active');
        }
        
        function closeMenuForm() {
            const formModal = document.getElementById('menuFormModal');
            if (formModal) {
                formModal.classList.remove('active');
            }
        }
        
        function updateImagePreview(imageUrl) {
            const preview = document.getElementById('imagePreview');
            if (!preview) return;
            
            if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('data:'))) {
                preview.innerHTML = `<img src="${imageUrl}" alt="Preview">`;
            } else {
                preview.innerHTML = `
                    <div class="image-preview-placeholder">
                        <i class="fas fa-image"></i>
                        <p>Image preview will appear here</p>
                    </div>
                `;
            }
        }
        
        function editMenuItem(itemId) {
            openMenuForm(itemId);
        }
        
        function toggleMenuItemStock(itemId) {
            const item = menuItems.find(item => item.id === itemId);
            if (!item) return;
            
            item.available = !item.available;
            localStorage.setItem('menuItems', JSON.stringify(menuItems));
            
            // Update UI
            renderMenuItemsGrid();
            updateCustomerMenu();
            
            // Show notification
            showToast('success', 'Stock Updated', 
                `${item.name} is now ${item.available ? 'available' : 'out of stock'}.`);
            
            // Notify other tabs
            sendToOtherTabs({
                type: 'menu_updated',
                timestamp: Date.now()
            });
        }
        
        function deleteMenuItem(itemId) {
            if (!confirm('Are you sure you want to delete this menu item? This action cannot be undone.')) {
                return;
            }
            
            const item = menuItems.find(item => item.id === itemId);
            if (!item) return;
            
            // Remove from menu
            menuItems = menuItems.filter(item => item.id !== itemId);
            localStorage.setItem('menuItems', JSON.stringify(menuItems));
            
            // Update UI
            renderMenuItemsGrid();
            updateCustomerMenu();
            
            // Show notification
            showToast('success', 'Menu Item Deleted', `${item.name} has been removed from the menu.`);
            
            // Notify other tabs
            sendToOtherTabs({
                type: 'menu_updated',
                timestamp: Date.now()
            });
        }
        
        function toggleAnnouncementStatus(announcementId) {
            const announcement = announcements.find(a => a.id === announcementId);
            if (!announcement) return;
            
            announcement.active = !announcement.active;
            localStorage.setItem('announcements', JSON.stringify(announcements));
            
            // Update website announcement banner
            updateWebsiteAnnouncement();
            
            // Update UI
            renderAnnouncementsList();
            
            // Show notification
            showToast('success', 'Announcement Updated', 
                `Announcement ${announcement.active ? 'activated' : 'deactivated'}.`);
            
            // Notify other tabs
            sendToOtherTabs({
                type: 'announcement_updated',
                timestamp: Date.now()
            });
        }
        
        function deleteAnnouncement(announcementId) {
            if (!confirm('Are you sure you want to delete this announcement?')) {
                return;
            }
            
            const announcement = announcements.find(a => a.id === announcementId);
            if (!announcement) return;
            
            // Remove announcement
            announcements = announcements.filter(a => a.id !== announcementId);
            localStorage.setItem('announcements', JSON.stringify(announcements));
            
            // Update website announcement banner
            updateWebsiteAnnouncement();
            
            // Update UI
            renderAnnouncementsList();
            
            // Show notification
            showToast('success', 'Announcement Deleted', 'Announcement has been removed.');
            
            // Notify other tabs
            sendToOtherTabs({
                type: 'announcement_updated',
                timestamp: Date.now()
            });
        }
        
        function updateWebsiteAnnouncement() {
            const announcementBanner = document.getElementById('announcementBanner');
            const announcementText = document.getElementById('announcementText');
            
            if (!announcementBanner || !announcementText) return;
            
            // Find the latest active announcement
            const activeAnnouncements = announcements.filter(a => a.active);
            if (activeAnnouncements.length > 0) {
                const latest = activeAnnouncements[activeAnnouncements.length - 1];
                announcementText.textContent = latest.text;
                announcementBanner.style.display = 'block';
            } else {
                announcementBanner.style.display = 'none';
            }
        }
        
        function updateCustomerMenu() {
            // This function updates the customer-facing menu on the website
            // Check if we're on home or menu page and update if needed
            const homePage = document.getElementById('home');
            const menuPage = document.getElementById('menu');
            
            if (homePage && homePage.classList.contains('active')) {
                const homeMenuContainer = homePage.querySelector('.menu-highlight');
                if (homeMenuContainer) {
                    renderMenuItems(homeMenuContainer);
                }
            }
            
            if (menuPage && menuPage.classList.contains('active')) {
                const menuPageContainer = menuPage.querySelector('.menu-highlight');
                if (menuPageContainer) {
                    renderMenuItems(menuPageContainer);
                }
            }
        }
        
        // ===== ENHANCED ADMIN TABS =====
        // Update admin tabs initialization
        document.addEventListener('DOMContentLoaded', function() {
            // ... existing initialization code ...
            
            // Add new admin tab for menu management
            const adminTabsContainer = document.querySelector('.admin-tabs');
            if (adminTabsContainer) {
                // Add Menu Management tab
                const menuTab = document.createElement('button');
                menuTab.className = 'admin-tab';
                menuTab.setAttribute('data-tab', 'menuManagement');
                menuTab.innerHTML = '<i class="fas fa-utensils"></i> Menu & Announcements';
                adminTabsContainer.appendChild(menuTab);
                
                // Add Menu Management content area
                const adminContainer = document.querySelector('.admin-container');
                if (adminContainer) {
                    const menuManagementTab = document.createElement('div');
                    menuManagementTab.className = 'admin-content';
                    menuManagementTab.id = 'menuManagementTab';
                    adminContainer.appendChild(menuManagementTab);
                }
                
                // Update tab switching logic
                const allAdminTabs = document.querySelectorAll('.admin-tab');
                const allAdminContents = document.querySelectorAll('.admin-content');
                
                allAdminTabs.forEach(tab => {
                    tab.addEventListener('click', function() {
                        const tabId = this.getAttribute('data-tab');
                        
                        // Update active tab
                        allAdminTabs.forEach(t => t.classList.remove('active'));
                        this.classList.add('active');
                        
                        // Show corresponding content
                        allAdminContents.forEach(content => {
                            content.classList.remove('active');
                            if (content.id === `${tabId}Tab`) {
                                content.classList.add('active');
                                
                                // Load specific content for each tab
                                if (tabId === 'menuManagement') {
                                    renderMenuManagement();
                                } else if (tabId === 'pending') {
                                    renderPendingOrders();
                                } else if (tabId === 'verified') {
                                    renderVerifiedOrders();
                                } else if (tabId === 'all') {
                                    renderAllOrders();
                                }
                            }
                        });
                    });
                });
            }
            
            // Initialize website announcement
            updateWebsiteAnnouncement();
            
            // ... rest of initialization code ...
        });
        
        // ===== CROSS-TAB MENU UPDATES =====
        // Update cross-tab message handler
        function handleCrossTabMessage(data) {
            // ... existing order verification code ...
            
            if (data.type === 'menu_updated') {
                // Update menu in current tab
                if (typeof renderMenuManagement === 'function') {
                    renderMenuManagement();
                }
                updateCustomerMenu();
                showSyncNotification('Menu Updated', 'Menu items have been updated.');
            }
            
            if (data.type === 'announcement_updated') {
                // Update announcements in current tab
                if (typeof renderMenuManagement === 'function') {
                    renderMenuManagement();
                }
                updateWebsiteAnnouncement();
                showSyncNotification('Announcement Updated', 'Website announcements have been updated.');
            }
        }
        
        // ===== ENHANCED RENDER MENU ITEMS FUNCTION =====
        // Update the existing renderMenuItems function to use stored menuItems
        function renderMenuItems(container) {
            if (!container) return;

            container.innerHTML = '';

            // Use the stored menuItems array
            const availableItems = menuItems.filter(item => item.available);

            if (availableItems.length === 0) {
                container.innerHTML = '<p class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">No menu items available at the moment. Please check back later.</p>';
                return;
            }

            availableItems.forEach(item => {
                const menuItem = document.createElement('div');
                menuItem.className = 'menu-item';
                menuItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="menu-item-content">
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                        <div class="menu-item-price">
                            <span class="price">$${item.price.toFixed(2)}</span>
                            <button class="add-to-cart" data-id="${item.id}">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                `;

                container.appendChild(menuItem);
            });

            // Add event listeners to add-to-cart buttons
            container.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', function () {
                    const itemId = parseInt(this.getAttribute('data-id'));
                    addToCart(itemId);
                });
            });
        }
