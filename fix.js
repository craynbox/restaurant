// TEMPORARY FIX - Add to your admin panel
function forceRefreshOrders() {
    // Manually trigger a refresh every time admin panel opens
    updateAdminStats();
    renderPendingOrders();
    renderVerifiedOrders();
    renderAllOrders();
}

// Modify your admin tab click event:
adminTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        
        // Update active tab
        adminTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        // Show corresponding content
        adminContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabId}Tab`) {
                content.classList.add('active');
                
                // Force refresh when opening any order tab
                if (tabId === 'pending' || tabId === 'verified' || tabId === 'all') {
                    forceRefreshOrders();
                }
                
                // Load specific content for each tab
                if (tabId === 'menuManagement') {
                    renderMenuManagement();
                }
            }
        });
    });
});