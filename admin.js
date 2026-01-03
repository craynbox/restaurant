function addAdminRefreshButton() {
    const adminHeader = document.querySelector('.admin-header');
    if (adminHeader && !document.getElementById('refreshOrdersBtn')) {
        const refreshBtn = document.createElement('button');
        refreshBtn.id = 'refreshOrdersBtn';
        refreshBtn.className = 'btn btn-info';
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Orders';
        refreshBtn.style.marginLeft = '15px';
        refreshBtn.onclick = async function() {
            await loadOrderData();
            updateAdminStats();
            renderPendingOrders();
            renderVerifiedOrders();
            renderAllOrders();
            showToast('success', 'Refreshed', 'Order list updated from cloud');
        };
        adminHeader.appendChild(refreshBtn);
    }
}

// Call this in your admin panel initialization