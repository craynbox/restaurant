// ===== SIMPLE CROSS-DEVICE STORAGE =====
// This uses a free cloud service to sync data between devices

const CLOUD_STORAGE_KEY = 'tastybites-orders';
let isOnline = navigator.onLine;

// Check internet connection
window.addEventListener('online', () => {
    isOnline = true;
    console.log('Internet connection restored');
    syncData();
});

window.addEventListener('offline', () => {
    isOnline = false;
    console.log('No internet connection');
});

// Simple cloud storage using free JSON storage
async function saveToCloud(data) {
    if (!isOnline) {
        console.log('Offline - saving locally only');
        await idbKeyval.set('pendingSync', data);
        return false;
    }
    
    try {
        // Using a free JSON storage service
        const response = await fetch('https://api.jsonstorage.net/v1/json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer c2VjcmV0' // Free public key
            },
            body: JSON.stringify({
                ...data,
                timestamp: Date.now()
            })
        });
        
        const result = await response.json();
        console.log('Saved to cloud:', result);
        return true;
    } catch (error) {
        console.log('Cloud save failed, saving locally:', error);
        await idbKeyval.set('pendingSync', data);
        return false;
    }
}

async function loadFromCloud() {
    if (!isOnline) {
        console.log('Offline - loading from local storage');
        const localData = await idbKeyval.get('localData');
        return localData || { orders: [], pendingOrders: [] };
    }
    
    try {
        // Get latest data from cloud
        const response = await fetch('https://api.jsonstorage.net/v1/json/latest');
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Cloud load failed, using local:', error);
        const localData = await idbKeyval.get('localData');
        return localData || { orders: [], pendingOrders: [] };
    }
}

// ===== REPLACE YOUR EXISTING DATA FUNCTIONS =====
// Replace your current data loading with this:

// In your main script, REPLACE the order saving code:
async function saveOrderData() {
    const data = {
        orders: orders,
        pendingOrders: pendingOrders,
        menuItems: menuItems,
        announcements: announcements
    };
    
    // Save to cloud
    const cloudSaved = await saveToCloud(data);
    
    // Also save locally as backup
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
    await idbKeyval.set('localData', data);
    
    return cloudSaved;
}

async function loadOrderData() {
    // Try to load from cloud first
    const cloudData = await loadFromCloud();
    
    if (cloudData && cloudData.orders) {
        // Use cloud data
        orders = cloudData.orders;
        pendingOrders = cloudData.pendingOrders;
        menuItems = cloudData.menuItems || menuItems;
        announcements = cloudData.announcements || announcements;
        console.log('Loaded from cloud');
    } else {
        // Fallback to localStorage
        orders = JSON.parse(localStorage.getItem('orders')) || [];
        pendingOrders = JSON.parse(localStorage.getItem('pendingOrders')) || [];
        console.log('Loaded from localStorage');
    }
}

// ===== AUTO-REFRESH FOR ADMIN =====
// Add auto-refresh to admin panel
let autoRefreshInterval;

function startAutoRefresh() {
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    
    autoRefreshInterval = setInterval(async () => {
        if (document.getElementById('adminPanel')?.classList.contains('active')) {
            await loadOrderData();
            updateAdminStats();
            renderPendingOrders();
            renderVerifiedOrders();
            renderAllOrders();
            console.log('Auto-refreshed admin panel');
        }
    }, 5000); // Refresh every 5 seconds
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

// ===== MODIFY YOUR EXISTING FUNCTIONS =====
// Replace your current processOrderSubmission function with this:

async function processOrderSubmission(orderData, paymentMethod) {
    // ... keep all your existing code ...
    
    // After saving orders, add this line:
    await saveOrderData(); // <-- ADD THIS LINE
    
    // ... rest of your code ...
}

// Replace your verifyOrder function with this:

async function verifyOrder(orderId) {
    // ... keep all your existing code ...
    
    // After saving orders, add this line:
    await saveOrderData(); // <-- ADD THIS LINE
    
    // ... rest of your code ...
}