// State Management
let attendanceData = JSON.parse(localStorage.getItem('pkl_attendance')) || [];
let expenseData = JSON.parse(localStorage.getItem('pkl_expenses')) || [];
let journalData = JSON.parse(localStorage.getItem('pkl_journal')) || [];

// DOM Elements - Dashboard
const els = {
    totalHadir: document.getElementById('totalHadir'),
    totalSakit: document.getElementById('totalSakit'),
    totalIzin: document.getElementById('totalIzin'),
    totalAlpa: document.getElementById('totalAlpa'),
    totalExpense: document.getElementById('totalExpense'),
    
    // Forms
    attendanceForm: document.getElementById('attendanceForm'),
    expenseForm: document.getElementById('expenseForm'),
    
    // History Lists
    attendanceHistory: document.getElementById('attendanceHistory'),
    expenseHistory: document.getElementById('expenseHistory'),
    
    // Others
    toast: document.getElementById('toast'),
    resetAttBtn: document.getElementById('resetAttBtn'),
    resetExpBtn: document.getElementById('resetExpBtn'),
    exportAttBtn: document.getElementById('exportAttBtn'),
    exportExpBtn: document.getElementById('exportExpBtn'),
    
    // Journal
    totalJournal: document.getElementById('totalJournal'),
    journalForm: document.getElementById('journalForm'),
    journalHistory: document.getElementById('journalHistory'),
    exportJournalBtn: document.getElementById('exportJournalBtn'),
    resetJournalBtn: document.getElementById('resetJournalBtn')
};

// Format Currency to IDR
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

// Format Date to local string
const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
};

// Update Dashboard Numbers
const updateDashboard = () => {
    // Attendance Stats
    const stats = { Hadir: 0, Sakit: 0, Izin: 0, Alpa: 0 };
    attendanceData.forEach(item => {
        if(stats[item.status] !== undefined) {
            stats[item.status]++;
        }
    });

    els.totalHadir.textContent = stats.Hadir;
    els.totalSakit.textContent = stats.Sakit;
    els.totalIzin.textContent = stats.Izin;
    els.totalAlpa.textContent = stats.Alpa;

    // Expense Stats
    const totalExp = expenseData.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    els.totalExpense.textContent = formatRupiah(totalExp);
    
    // Journal Stats
    els.totalJournal.textContent = journalData.length;
};

// Render Attendance History
const renderAttendanceHistory = () => {
    els.attendanceHistory.innerHTML = '';
    
    if (attendanceData.length === 0) {
        els.attendanceHistory.innerHTML = '<div class="empty-state">Belum ada data kehadiran.</div>';
        return;
    }

    // Show 5 most recent
    const recentData = [...attendanceData].reverse().slice(0, 5);
    
    recentData.forEach(item => {
        const div = document.createElement('div');
        div.className = `history-item item-${item.status.toLowerCase()}`;
        div.innerHTML = `
            <div class="info">
                <span class="title">Status: ${item.status}</span>
                <span class="date">${formatDate(item.date)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div class="value">1 Hari</div>
                <button class="btn-delete-item" data-id="${item.id}" data-type="attendance" title="Hapus"><i class="ph ph-trash"></i></button>
            </div>
        `;
        els.attendanceHistory.appendChild(div);
    });
};

// Render Expense History
const renderExpenseHistory = () => {
    els.expenseHistory.innerHTML = '';
    
    if (expenseData.length === 0) {
        els.expenseHistory.innerHTML = '<div class="empty-state">Belum ada data pengeluaran.</div>';
        return;
    }

    // Show 5 most recent
    const recentData = [...expenseData].reverse().slice(0, 5);
    
    recentData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item item-expense';
        div.innerHTML = `
            <div class="info">
                <span class="title">${item.name}</span>
                <span class="date">${formatDate(item.date)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div class="value">${formatRupiah(item.amount)}</div>
                <button class="btn-delete-item" data-id="${item.id}" data-type="expense" title="Hapus"><i class="ph ph-trash"></i></button>
            </div>
        `;
        els.expenseHistory.appendChild(div);
    });
};

// Render Journal History
const renderJournalHistory = () => {
    els.journalHistory.innerHTML = '';
    
    if (journalData.length === 0) {
        els.journalHistory.innerHTML = '<div class="empty-state">Belum ada jurnal harian.</div>';
        return;
    }

    const recentData = [...journalData].reverse().slice(0, 5);
    
    recentData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item item-journal';
        const shortActivity = item.activity.length > 60 ? item.activity.substring(0, 60) + '...' : item.activity;
        div.innerHTML = `
            <div class="info">
                <span class="title">${shortActivity}</span>
                <span class="date">${formatDate(item.date)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <button class="btn-delete-item" data-id="${item.id}" data-type="journal" title="Hapus"><i class="ph ph-trash"></i></button>
            </div>
        `;
        els.journalHistory.appendChild(div);
    });
};

// Show Toast
const showToast = (message) => {
    els.toast.textContent = message;
    els.toast.classList.add('show');
    setTimeout(() => {
        els.toast.classList.remove('show');
    }, 3000);
};

// Handle Item Deletion
const handleItemDelete = (e) => {
    const btn = e.target.closest('.btn-delete-item');
    if (!btn) return;
    
    if (!confirm('Hapus catatan ini?')) return;
    
    const id = parseInt(btn.dataset.id);
    const type = btn.dataset.type;
    
    if (type === 'attendance') {
        attendanceData = attendanceData.filter(item => item.id !== id);
        localStorage.setItem('pkl_attendance', JSON.stringify(attendanceData));
        updateDashboard();
        renderAttendanceHistory();
        showToast('Catatan kehadiran dihapus.');
    } else if (type === 'expense') {
        expenseData = expenseData.filter(item => item.id !== id);
        localStorage.setItem('pkl_expenses', JSON.stringify(expenseData));
        updateDashboard();
        renderExpenseHistory();
        showToast('Catatan pengeluaran dihapus.');
    } else if (type === 'journal') {
        journalData = journalData.filter(item => item.id !== id);
        localStorage.setItem('pkl_journal', JSON.stringify(journalData));
        updateDashboard();
        renderJournalHistory();
        showToast('Catatan jurnal dihapus.');
    }
};

els.attendanceHistory.addEventListener('click', handleItemDelete);
els.expenseHistory.addEventListener('click', handleItemDelete);
els.journalHistory.addEventListener('click', handleItemDelete);

// Event Listeners
els.attendanceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const date = document.getElementById('attDate').value;
    const status = document.querySelector('input[name="attStatus"]:checked').value;
    
    // Check if date already exists to prevent duplicate entries for same day
    const existingIndex = attendanceData.findIndex(item => item.date === date);
    if(existingIndex !== -1) {
        // Update existing
        attendanceData[existingIndex].status = status;
        showToast('Data kehadiran diperbarui!');
    } else {
        // Add new
        attendanceData.push({ id: Date.now(), date, status });
        showToast('Kehadiran berhasil disimpan!');
    }
    
    // Sort by date before saving
    attendanceData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    localStorage.setItem('pkl_attendance', JSON.stringify(attendanceData));
    
    updateDashboard();
    renderAttendanceHistory();
    els.attendanceForm.reset();
    
    // Reset date to today
    document.getElementById('attDate').valueAsDate = new Date();
});

els.expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const date = document.getElementById('expDate').value;
    const name = document.getElementById('expName').value;
    const amount = document.getElementById('expAmount').value;
    
    expenseData.push({ id: Date.now(), date, name, amount });
    
    // Sort by date before saving
    expenseData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    localStorage.setItem('pkl_expenses', JSON.stringify(expenseData));
    
    updateDashboard();
    renderExpenseHistory();
    els.expenseForm.reset();
    
    // Reset date to today
    document.getElementById('expDate').valueAsDate = new Date();
});

// Journal Form
els.journalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const date = document.getElementById('journalDate').value;
    const activity = document.getElementById('journalActivity').value;
    
    journalData.push({ id: Date.now(), date, activity });
    
    journalData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    localStorage.setItem('pkl_journal', JSON.stringify(journalData));
    
    updateDashboard();
    renderJournalHistory();
    els.journalForm.reset();
    
    document.getElementById('journalDate').valueAsDate = new Date();
    showToast('Jurnal harian berhasil disimpan!');
});

els.exportAttBtn.addEventListener('click', () => {
    if (attendanceData.length === 0) {
        showToast('Tidak ada data kehadiran untuk diexport.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Laporan Kehadiran PKL', 14, 20);
    
    const tableData = attendanceData.map((item, index) => [
        index + 1,
        formatDate(item.date),
        item.status
    ]);
    
    doc.autoTable({
        startY: 30,
        head: [['No', 'Tanggal', 'Status Kehadiran']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
    });
    
    // Monthly Summary
    const monthlyStats = {};
    attendanceData.forEach(item => {
        const dateObj = new Date(item.date);
        const monthYear = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        if (!monthlyStats[monthYear]) {
            monthlyStats[monthYear] = { Hadir: 0, Sakit: 0, Izin: 0, Alpa: 0 };
        }
        if(monthlyStats[monthYear][item.status] !== undefined) {
            monthlyStats[monthYear][item.status]++;
        }
    });
    
    const monthlyTableData = Object.keys(monthlyStats).map((month, index) => [
        index + 1,
        month,
        monthlyStats[month].Hadir,
        monthlyStats[month].Sakit,
        monthlyStats[month].Izin,
        monthlyStats[month].Alpa
    ]);
    
    if (monthlyTableData.length > 0) {
        doc.setFontSize(14);
        doc.text('Ringkasan Per Bulan', 14, doc.lastAutoTable.finalY + 15);
        
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            head: [['No', 'Bulan', 'Hadir', 'Sakit', 'Izin', 'Alpa']],
            body: monthlyTableData,
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129] }
        });
    }
    
    doc.save('Laporan_Kehadiran_PKL.pdf');
    showToast('Data kehadiran berhasil diexport ke PDF!');
});

els.exportExpBtn.addEventListener('click', () => {
    if (expenseData.length === 0) {
        showToast('Tidak ada data pengeluaran untuk diexport.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Laporan Pengeluaran PKL', 14, 20);
    
    const tableData = expenseData.map((item, index) => [
        index + 1,
        formatDate(item.date),
        item.name,
        formatRupiah(item.amount)
    ]);
    
    const totalExp = expenseData.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    
    doc.autoTable({
        startY: 30,
        head: [['No', 'Tanggal', 'Keterangan', 'Nominal']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [14, 165, 233] },
        foot: [['', '', 'Total Pengeluaran:', formatRupiah(totalExp)]],
        footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
    });
    
    // Monthly Summary
    const monthlyStats = {};
    expenseData.forEach(item => {
        const dateObj = new Date(item.date);
        const monthYear = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        if (!monthlyStats[monthYear]) {
            monthlyStats[monthYear] = 0;
        }
        monthlyStats[monthYear] += parseFloat(item.amount);
    });
    
    const monthlyTableData = Object.keys(monthlyStats).map((month, index) => [
        index + 1,
        month,
        formatRupiah(monthlyStats[month])
    ]);
    
    if (monthlyTableData.length > 0) {
        doc.setFontSize(14);
        doc.text('Ringkasan Per Bulan', 14, doc.lastAutoTable.finalY + 15);
        
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            head: [['No', 'Bulan', 'Total Pengeluaran']],
            body: monthlyTableData,
            theme: 'grid',
            headStyles: { fillColor: [139, 92, 246] }
        });
    }
    
    doc.save('Laporan_Pengeluaran_PKL.pdf');
    showToast('Data pengeluaran berhasil diexport ke PDF!');
});

els.resetAttBtn.addEventListener('click', () => {
    if(confirm('Apakah Anda yakin ingin menghapus semua data KEHADIRAN? Aksi ini tidak dapat dibatalkan.')) {
        localStorage.removeItem('pkl_attendance');
        attendanceData = [];
        
        updateDashboard();
        renderAttendanceHistory();
        
        showToast('Data kehadiran berhasil dihapus.');
    }
});

els.resetExpBtn.addEventListener('click', () => {
    if(confirm('Apakah Anda yakin ingin menghapus semua data PENGELUARAN? Aksi ini tidak dapat dibatalkan.')) {
        localStorage.removeItem('pkl_expenses');
        expenseData = [];
        
        updateDashboard();
        renderExpenseHistory();
        
        showToast('Data pengeluaran berhasil dihapus.');
    }
});

els.resetJournalBtn.addEventListener('click', () => {
    if(confirm('Apakah Anda yakin ingin menghapus semua data JURNAL HARIAN? Aksi ini tidak dapat dibatalkan.')) {
        localStorage.removeItem('pkl_journal');
        journalData = [];
        
        updateDashboard();
        renderJournalHistory();
        
        showToast('Data jurnal berhasil dihapus.');
    }
});

// Export Journal PDF
els.exportJournalBtn.addEventListener('click', () => {
    if (journalData.length === 0) {
        showToast('Tidak ada data jurnal untuk diexport.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Laporan Jurnal Harian PKL', 14, 20);
    
    const tableData = journalData.map((item, index) => [
        index + 1,
        formatDate(item.date),
        item.activity
    ]);
    
    doc.autoTable({
        startY: 30,
        head: [['No', 'Tanggal', 'Kegiatan yang Dilakukan']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [244, 114, 182] },
        columnStyles: { 2: { cellWidth: 110 } },
        styles: { cellPadding: 4, fontSize: 10 }
    });
    
    // Monthly Summary
    const monthlyStats = {};
    journalData.forEach(item => {
        const dateObj = new Date(item.date);
        const monthYear = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        if (!monthlyStats[monthYear]) {
            monthlyStats[monthYear] = 0;
        }
        monthlyStats[monthYear]++;
    });
    
    const monthlyTableData = Object.keys(monthlyStats).map((month, index) => [
        index + 1,
        month,
        monthlyStats[month] + ' catatan'
    ]);
    
    if (monthlyTableData.length > 0) {
        doc.setFontSize(14);
        doc.text('Ringkasan Per Bulan', 14, doc.lastAutoTable.finalY + 15);
        
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            head: [['No', 'Bulan', 'Jumlah Jurnal']],
            body: monthlyTableData,
            theme: 'grid',
            headStyles: { fillColor: [244, 114, 182] }
        });
    }
    
    doc.save('Laporan_Jurnal_PKL.pdf');
    showToast('Data jurnal berhasil diexport ke PDF!');
});

// Initialization
const init = () => {
    // Set default dates to today
    document.getElementById('attDate').valueAsDate = new Date();
    document.getElementById('expDate').valueAsDate = new Date();
    document.getElementById('journalDate').valueAsDate = new Date();
    
    updateDashboard();
    renderAttendanceHistory();
    renderExpenseHistory();
    renderJournalHistory();
};

// Theme Toggle
const themeToggleBtn = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const rootElement = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem('pkl_theme') || 'dark';
if (savedTheme === 'light') {
    rootElement.setAttribute('data-theme', 'light');
    themeIcon.classList.remove('ph-sun');
    themeIcon.classList.add('ph-moon');
}

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = rootElement.getAttribute('data-theme');
    if (currentTheme === 'light') {
        rootElement.removeAttribute('data-theme');
        localStorage.setItem('pkl_theme', 'dark');
        themeIcon.classList.remove('ph-moon');
        themeIcon.classList.add('ph-sun');
    } else {
        rootElement.setAttribute('data-theme', 'light');
        localStorage.setItem('pkl_theme', 'light');
        themeIcon.classList.remove('ph-sun');
        themeIcon.classList.add('ph-moon');
    }
});

// Login Logic
const loginOverlay = document.getElementById('loginOverlay');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const appContainer = document.querySelector('.app-container');

if (sessionStorage.getItem('isLoggedIn') === 'true') {
    if (loginOverlay && appContainer) {
        loginOverlay.style.display = 'none';
        appContainer.style.display = 'block';
    }
    init();
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value.trim().toLowerCase();
        const pass = document.getElementById('password').value.trim().toLowerCase();

        if (user === 'admin' && pass === 'radif') {
            sessionStorage.setItem('isLoggedIn', 'true');
            loginOverlay.style.display = 'none';
            appContainer.style.display = 'block';
            init();
        } else {
            loginError.textContent = 'Username atau password salah!';
        }
    });
}
