
        // ===== CROSS-TAB COMMUNICATION SOLUTION =====
        
        // Create a unique channel ID for this browser session
        const CHANNEL_ID = 'tastybites_order_updates_' + (localStorage.getItem('session_id') || 
            (localStorage.setItem('session_id', Date.now().toString(36) + Math.random().toString(36).substr(2)), 
            localStorage.getItem('session_id')));
        
        // Broadcast Channel API for modern browsers
        let broadcastChannel = null;
        if ('BroadcastChannel' in window) {
            broadcastChannel = new BroadcastChannel(CHANNEL_ID);
        }
        
        // Storage event listener for older browsers
        let isListeningToStorage = false;
        
        // Initialize cross-tab communication
        function initCrossTabCommunication() {
            // Method 1: Broadcast Channel API (modern browsers)
            if (broadcastChannel) {
                broadcastChannel.onmessage = function(event) {
                    handleCrossTabMessage(event.data);
                };
            }
            
            // Method 2: Storage events (fallback for older browsers)
            if (!broadcastChannel && !isListeningToStorage) {
                window.addEventListener('storage', handleStorageEvent);
                isListeningToStorage = true;
            }
            
            // Method 3: Periodic checking as backup
            startPeriodicSyncCheck();
        }
        
        // Send message to other tabs
        function sendToOtherTabs(message) {
            // Method 1: Broadcast Channel
            if (broadcastChannel) {
                broadcastChannel.postMessage(message);
            }
            
            // Method 2: Storage event (trigger by changing localStorage)
            try {
                const eventKey = 'tab_msg_' + Date.now();
                localStorage.setItem(eventKey, JSON.stringify({
                    ...message,
                    timestamp: Date.now(),
                    sender: CHANNEL_ID
                }));
                // Clean up old messages
                setTimeout(() => {
                    localStorage.removeItem(eventKey);
                }, 1000);
            } catch (e) {
                console.log('Storage event method failed:', e);
            }
        }
        
        // Handle messages from other tabs
        function handleCrossTabMessage(data) {
            console.log('Received cross-tab message:', data);
            
            if (data.type === 'order_verified') {
                // Check if this is the current customer's order
                const currentOrderId = sessionStorage.getItem('currentOrderId');
                if (currentOrderId && currentOrderId === data.orderId) {
                    // Update the customer's view
                    updateCustomerOrderStatus(data.orderId, data.deliveryCode);
                    
                    // Show sync notification
                    showSyncNotification('Order Verified!', 'Your payment has been verified and delivery code generated.');
                }
                
                // Update admin stats if admin panel is open
                if (typeof updateAdminStats === 'function') {
                    updateAdminStats();
                    if (typeof renderPendingOrders === 'function') renderPendingOrders();
                    if (typeof renderVerifiedOrders === 'function') renderVerifiedOrders();
                    if (typeof renderAllOrders === 'function') renderAllOrders();
                }
            }
            else if (data.type === 'order_updated') {
                // Update any open admin panels
                if (typeof updateAdminStats === 'function') {
                    updateAdminStats();
                    if (typeof renderPendingOrders === 'function') renderPendingOrders();
                    if (typeof renderVerifiedOrders === 'function') renderVerifiedOrders();
                    if (typeof renderAllOrders === 'function') renderAllOrders();
                }
            }
        }
        
        // Handle storage events (for older browsers)
        function handleStorageEvent(event) {
            if (event.key && event.key.startsWith('tab_msg_')) {
                try {
                    const data = JSON.parse(event.newValue);
                    if (data && data.sender !== CHANNEL_ID) {
                        handleCrossTabMessage(data);
                    }
                } catch (e) {
                    console.log('Error parsing storage event:', e);
                }
            }
        }
        
        // Periodic sync check as backup
        let syncCheckInterval = null;
        function startPeriodicSyncCheck() {
            if (syncCheckInterval) clearInterval(syncCheckInterval);
            syncCheckInterval = setInterval(checkForOrderUpdates, 5000); // Check every 5 seconds
        }
        
        function checkForOrderUpdates() {
            const currentOrderId = sessionStorage.getItem('currentOrderId');
            if (!currentOrderId) return;
            
            // Check if order has been verified
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const order = orders.find(o => o.orderId === currentOrderId);
            
            if (order && order.paymentVerified && order.deliveryCode) {
                // Order has been verified - update view
                updateCustomerOrderStatus(order.orderId, order.deliveryCode);
            }
        }
        
        // Update customer order status
        function updateCustomerOrderStatus(orderId, deliveryCode) {
            // Find the order in localStorage
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const order = orders.find(o => o.orderId === orderId);
            
            if (!order) return;
            
            // Update session storage
            sessionStorage.setItem('currentOrderId', orderId);
            
            // Check if checkout overlay is open
            const checkoutOverlay = document.getElementById('checkoutOverlay');
            if (checkoutOverlay && checkoutOverlay.classList.contains('active')) {
                // Show delivery code in checkout overlay
                if (typeof showDeliveryCodeToCustomer === 'function') {
                    showDeliveryCodeToCustomer(order);
                }
            }
            
            // Update any open checkout page
            const checkoutPage = document.getElementById('checkout');
            if (checkoutPage && checkoutPage.classList.contains('active')) {
                // If on checkout page, update the view
                setTimeout(() => {
                    if (typeof showDeliveryCodeToCustomer === 'function') {
                        showDeliveryCodeToCustomer(order);
                    }
                }, 100);
            }
        }
        
        // Show sync notification
        function showSyncNotification(title, message) {
            const notification = document.getElementById('syncNotification');
            if (!notification) return;
            
            notification.querySelector('strong').textContent = title;
            notification.querySelector('div > div').textContent = message;
            
            notification.classList.add('show');
            notification.classList.remove('hide');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                notification.classList.add('hide');
                setTimeout(() => {
                    notification.classList.remove('show');
                    notification.classList.remove('hide');
                }, 500);
            }, 5000);
        }
        
        // ===== MODIFIED VERIFY ORDER FUNCTION =====
        // Replace the existing verifyOrder function with this updated version
        function verifyOrder(orderId) {
            if (!confirm('Are you sure you want to verify this payment and generate delivery code?')) {
                return;
            }

            // Find order in pendingOrders
            const orderIndex = pendingOrders.findIndex(o => o.orderId === orderId);
            if (orderIndex === -1) {
                alert('Order not found!');
                return;
            }

            const order = pendingOrders[orderIndex];
            
            // Generate delivery code (4-digit number)
            const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();
            
            // Update order with verification details
            order.paymentVerified = true;
            order.deliveryCode = deliveryCode;
            order.verifiedTime = new Date().toISOString();
            
            // Move from pendingOrders to orders
            pendingOrders.splice(orderIndex, 1);
            orders.push(order);
            
            // Save to localStorage
            localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
            localStorage.setItem('orders', JSON.stringify(orders));
            
            // Update UI in current tab
            updateAdminStats();
            renderPendingOrders();
            renderVerifiedOrders();
            renderAllOrders();
            
            // Close details modal if open
            orderDetailsModal.classList.remove('active');
            
            // Send notification to other tabs
            sendToOtherTabs({
                type: 'order_verified',
                orderId: orderId,
                deliveryCode: deliveryCode,
                customerName: order.customerName,
                timestamp: Date.now()
            });
            
            // Show success message
            showToast('success', 'Order Verified!', `Delivery Code: ${deliveryCode} - Sent to customer`);
            
            // Update customer's view if they're in the same tab (unlikely but possible)
            if (window.updateCustomerDeliveryCode) {
                window.updateCustomerDeliveryCode(order, deliveryCode);
            }
        }
        
        // ===== MODIFIED CHECKOUT FORM SUBMISSION =====
        // Update the processOrderSubmission function inside checkout form event listener
        function processOrderSubmission(orderData, paymentMethod) {
            if (paymentMethod === 'Card') {
                showPaymentState(paymentProcessing);
                updateProgressSteps(1);

                setTimeout(() => {
                    const isSuccess = Math.random() > 0.2;

                    if (isSuccess) {
                        // For card payments, automatically verify and generate delivery code
                        const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();
                        orderData.paymentVerified = true;
                        orderData.deliveryCode = deliveryCode;
                        orderData.paymentStatus = 'verified';
                        
                        orders.push(orderData);
                        localStorage.setItem('orders', JSON.stringify(orders));

                        currentOrderId = orderData.orderId;
                        sessionStorage.setItem('currentOrderId', orderData.orderId);

                        // Save order ID to localStorage for cross-tab recovery
                        localStorage.setItem('lastOrderId', orderData.orderId);
                        
                        // Notify other tabs
                        sendToOtherTabs({
                            type: 'order_verified',
                            orderId: orderData.orderId,
                            deliveryCode: deliveryCode,
                            customerName: orderData.customerName,
                            timestamp: Date.now()
                        });
                        
                        showDeliveryCodeToCustomer(orderData);
                        updateAdminStats();
                        renderVerifiedOrders();
                        renderAllOrders();
                    } else {
                        showPaymentState(paymentFailed);
                        document.getElementById('failureReason').textContent = "Card payment declined. Please check your card details or try another payment method.";
                    }
                }, 3000);
            } else {
                showPaymentState(paymentPending);
                updateProgressSteps(1);

                orderData.paymentStatus = 'awaiting_transfer';
                pendingOrders.push(orderData);
                localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));

                document.getElementById('pendingOrderId').textContent = orderData.orderId;

                currentOrderId = orderData.orderId;
                sessionStorage.setItem('currentOrderId', orderData.orderId);
                
                // Save order ID to localStorage for cross-tab recovery
                localStorage.setItem('lastOrderId', orderData.orderId);
                
                // Notify other tabs about new pending order
                sendToOtherTabs({
                    type: 'order_updated',
                    orderId: orderData.orderId,
                    status: 'pending',
                    timestamp: Date.now()
                });

                startOrderUpdateChecker();
                updateAdminStats();
                renderPendingOrders();
                renderAllOrders();
            }

            // Clear cart after successful order submission
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            renderOrderSummary();
        }
        
        // ===== PAGE LOAD RECOVERY =====
        // Add this function to handle page reloads
        function recoverOrderOnPageLoad() {
            // Check if there's a recent order
            const lastOrderId = localStorage.getItem('lastOrderId');
            if (!lastOrderId) return;
            
            // Check if this order exists in orders (verified) or pendingOrders
            const allOrders = JSON.parse(localStorage.getItem('orders')) || [];
            const pending = JSON.parse(localStorage.getItem('pendingOrders')) || [];
            
            const verifiedOrder = allOrders.find(o => o.orderId === lastOrderId);
            const pendingOrder = pending.find(o => o.orderId === lastOrderId);
            
            if (verifiedOrder) {
                // Order is verified - set as current order
                sessionStorage.setItem('currentOrderId', lastOrderId);
                
                // If user is on checkout page or has checkout overlay open, show delivery code
                setTimeout(() => {
                    if (window.showDeliveryCodeToCustomer) {
                        showDeliveryCodeToCustomer(verifiedOrder);
                    }
                }, 1000);
            } 
            else if (pendingOrder) {
                // Order is still pending - set as current order
                sessionStorage.setItem('currentOrderId', lastOrderId);
                
                // If user is on checkout page, show pending status
                setTimeout(() => {
                    const checkoutPage = document.getElementById('checkout');
                    if (checkoutPage && checkoutPage.classList.contains('active')) {
                        // You might want to show a message that order is still pending
                        showToast('info', 'Order Pending', `Your order ${lastOrderId} is still awaiting payment verification.`);
                    }
                }, 1000);
            }
        }
        
        // ===== MODIFIED INITIALIZATION =====
        // Update the DOMContentLoaded event listener initialization
        document.addEventListener('DOMContentLoaded', function() {
            // ... existing initialization code ...
            
            // Initialize cross-tab communication
            initCrossTabCommunication();
            
            // Try to recover order on page load
            recoverOrderOnPageLoad();
            
            // ... rest of initialization code ...
        });
        
        // ===== NAVIGATION FIX =====
        // Prevent home page reset on checkout page reload
        // Update the navigation click event listener
        navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();

                // Update active nav link
                navLinks.forEach(link => link.classList.remove('active'));
                this.classList.add('active');

                const pageId = this.getAttribute('data-page');

                // Show the corresponding page
                pages.forEach(page => {
                    page.classList.remove('active');
                    if (page.id === pageId) {
                        page.classList.add('active');

                        // Load specific content for each page
                        if (pageId === 'home') {
                            const menuContainer = page.querySelector('.menu-highlight');
                            if (menuContainer) renderMenuItems(menuContainer);
                        } else if (pageId === 'menu') {
                            const menuContainer = page.querySelector('.menu-highlight');
                            if (menuContainer) renderMenuItems(menuContainer);
                        } else if (pageId === 'checkout') {
                            renderOrderSummary();
                            
                            // Check if there's a current order and update view
                            const currentOrderId = sessionStorage.getItem('currentOrderId');
                            if (currentOrderId) {
                                const orders = JSON.parse(localStorage.getItem('orders')) || [];
                                const order = orders.find(o => o.orderId === currentOrderId);
                                if (order && order.paymentVerified) {
                                    setTimeout(() => {
                                        if (typeof showDeliveryCodeToCustomer === 'function') {
                                            showDeliveryCodeToCustomer(order);
                                        }
                                    }, 500);
                                }
                            }
                        }
                    }
                });

                // Close checkout overlay if open
                if (checkoutOverlay.classList.contains('active')) {
                    closeCheckoutOverlay();
                }
            });
        });
        
        // ===== PAGE VISIBILITY API =====
        // Add this to detect when tab becomes active
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                // Tab is now visible - check for updates
                checkForOrderUpdates();
                
                // If on checkout page, refresh order summary
                const checkoutPage = document.getElementById('checkout');
                if (checkoutPage && checkoutPage.classList.contains('active')) {
                    renderOrderSummary();
                }
            }
        });
   