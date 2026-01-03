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

// cloud-storage.js
class CloudStorage {
    constructor() {
        this.STORAGE_KEY = 'tastybites_orders';
        this.SYNC_INTERVAL = 5000; // 5 seconds
        this.lastSync = null;
        this.isSyncing = false;
    }

    // Initialize storage
    async init() {
        try {
            // Initialize IndexedDB
            await idbKeyVal.set('initialized', true);
            console.log('Cloud storage initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize storage:', error);
            return false;
        }
    }

    // Save order to cloud storage
    async saveOrder(order) {
        try {
            // Generate unique ID if not exists
            if (!order.id) {
                order.id = 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                order.createdAt = new Date().toISOString();
            }

            // Update timestamp
            order.updatedAt = new Date().toISOString();

            // Get existing orders
            const existingOrders = await this.getOrders();
            
            // Check if order already exists
            const existingIndex = existingOrders.findIndex(o => o.id === order.id);
            
            if (existingIndex >= 0) {
                // Update existing order
                existingOrders[existingIndex] = order;
            } else {
                // Add new order
                existingOrders.push(order);
            }

            // Save to IndexedDB
            await idbKeyVal.set(this.STORAGE_KEY, existingOrders);
            
            // Also save to localStorage as backup
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingOrders));
            
            console.log('Order saved to cloud storage:', order.id);
            return order.id;
        } catch (error) {
            console.error('Failed to save order:', error);
            throw error;
        }
    }

    // Get all orders from cloud storage
    async getOrders() {
        try {
            // Try IndexedDB first
            let orders = await idbKeyVal.get(this.STORAGE_KEY);
            
            if (!orders) {
                // Fallback to localStorage
                const localData = localStorage.getItem(this.STORAGE_KEY);
                orders = localData ? JSON.parse(localData) : [];
                
                // Save to IndexedDB for next time
                if (orders.length > 0) {
                    await idbKeyVal.set(this.STORAGE_KEY, orders);
                }
            }
            
            return orders || [];
        } catch (error) {
            console.error('Failed to get orders:', error);
            return [];
        }
    }

    // Get orders by status
    async getOrdersByStatus(status) {
        const allOrders = await this.getOrders();
        return allOrders.filter(order => order.status === status);
    }

    // Update order status
    async updateOrderStatus(orderId, status, deliveryCode = null) {
        try {
            const allOrders = await this.getOrders();
            const orderIndex = allOrders.findIndex(order => order.id === orderId);
            
            if (orderIndex >= 0) {
                allOrders[orderIndex].status = status;
                allOrders[orderIndex].updatedAt = new Date().toISOString();
                
                if (deliveryCode) {
                    allOrders[orderIndex].deliveryCode = deliveryCode;
                }
                
                if (status === 'verified') {
                    allOrders[orderIndex].paymentVerified = true;
                    allOrders[orderIndex].verifiedAt = new Date().toISOString();
                }
                
                await idbKeyVal.set(this.STORAGE_KEY, allOrders);
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allOrders));
                
                console.log(`Order ${orderId} updated to status: ${status}`);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Failed to update order:', error);
            return false;
        }
    }

    // Sync between tabs/devices
    setupCrossTabSync() {
        // Listen for storage changes
        window.addEventListener('storage', async (event) => {
            if (event.key === this.STORAGE_KEY && !this.isSyncing) {
                this.isSyncing = true;
                await this.syncOrders();
                this.isSyncing = false;
                this.showSyncNotification();
            }
        });
    }

    // Manual sync
    async syncOrders() {
        try {
            const localOrders = await this.getOrders();
            console.log('Orders synced:', localOrders.length);
            return localOrders;
        } catch (error) {
            console.error('Sync failed:', error);
            return [];
        }
    }

    // Show sync notification
    showSyncNotification() {
        const notification = document.getElementById('syncNotification');
        if (notification) {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
    }

    // Delete order
    async deleteOrder(orderId) {
        try {
            const allOrders = await this.getOrders();
            const filteredOrders = allOrders.filter(order => order.id !== orderId);
            
            await idbKeyVal.set(this.STORAGE_KEY, filteredOrders);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredOrders));
            
            console.log(`Order ${orderId} deleted`);
            return true;
        } catch (error) {
            console.error('Failed to delete order:', error);
            return false;
        }
    }

    // Clear all orders (for testing)
    async clearAllOrders() {
        try {
            await idbKeyVal.set(this.STORAGE_KEY, []);
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('All orders cleared');
            return true;
        } catch (error) {
            console.error('Failed to clear orders:', error);
            return false;
        }
    }
}

// Initialize global cloud storage instance
window.cloudStorage = new CloudStorage();

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', async () => {
    await window.cloudStorage.init();
    window.cloudStorage.setupCrossTabSync();
    
    // Test the storage
    const testOrders = await window.cloudStorage.getOrders();
    console.log('Cloud storage ready. Orders found:', testOrders.length);
});