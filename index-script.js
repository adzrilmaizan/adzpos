// CONFIG
const GAS_URL = "https://api.adzcloud.my";
const ADMIN_KEY = "TEDUH2026"; 

let chartInst = null;
let selPeriodType = 'today';
let selFormatType = 'excel';
let menuIdToDelete = null; 
let addonIdToDelete = null;
let allOrders = [];

// ===========================================
// CORE INIT
// ===========================================
document.addEventListener("DOMContentLoaded", () => {
    loadSettings();
    initDashboard();
});

function activateSystem(){
    const e = document.documentElement;
    const r = e.requestFullscreen||e.webkitRequestFullscreen||e.msRequestFullscreen;
    if(r){r.call(e).then(()=>{hideOverlay()}).catch(()=>{hideOverlay()})}else{hideOverlay()}
}
function hideOverlay(){
    const o = document.getElementById("fs-overlay");
    o.style.opacity = "0"; o.style.transition = "opacity 0.5s ease";
    setTimeout(()=>{o.style.display="none"}, 500);
}

function switchTab(id, el) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('tab-' + id).classList.add('active');
    el.classList.add('active');
    
    if(id === 'menu') fetchMenuData();
    if(id === 'addons') fetchAddons();
}

function logout() { 
    localStorage.removeItem('pos_session'); 
    window.location.href = "/"; 
}

function showNoti(t, m, s=true) {
    document.getElementById('noti-title').innerText = t;
    document.getElementById('noti-message').innerText = m;
    document.getElementById('noti-icon').innerHTML = s ? '&#9989;' : '&#10060;';
    document.getElementById('notiModal').style.display='flex';
}

// ===========================================
// DASHBOARD
// ===========================================
function initDashboard() {
    fetch(GAS_URL + "?action=get_all_orders")
    .then(r => r.json())
    .then(data => { 
        allOrders = data; 
        processDashboard(data); 
    }).catch(e => console.error(e));
}

function processDashboard(orders) {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const todayStr = new Date(now.getTime() - offset).toISOString().split('T')[0];
    const monthStr = todayStr.slice(0, 7);

    let todayTotal = 0; let monthTotal = 0; let chartData = {};

    orders.forEach(o => {
        if(o.status === 'PAID') {
            let t = parseFloat(o.total);
            if(o.date === todayStr) todayTotal += t;
            if(o.date.startsWith(monthStr)) monthTotal += t;
            if(o.date) chartData[o.date] = (chartData[o.date]||0) + t;
        }
    });

    document.getElementById('val-today').innerText = "RM " + todayTotal.toFixed(2);
    document.getElementById('val-month').innerText = "RM " + monthTotal.toFixed(2);
    document.getElementById('val-count').innerText = orders.length;

    const sortedDates = Object.keys(chartData).sort();
    const labels = sortedDates.map(d => { const p=d.split('-'); return `${p[2]}/${p[1]}`; });
    const values = sortedDates.map(d => chartData[d]);

    const ctx = document.getElementById('salesChart');
    if(chartInst) chartInst.destroy();
    chartInst = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jualan (RM)', data: values,
                borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2, fill: true, tension: 0.3
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: {legend:{display:false}}, scales: {y:{beginAtZero:true}} }
    });

    const list = document.getElementById('recent-trans-list');
    let html = '';
    orders.slice(0, 15).forEach(r => {
        html += `<div class="trans-row">
            <div><div style="font-weight:700;">#${r.id}</div><div style="font-size:11px; color:#94a3b8;">${r.time.slice(0,5)} • ${r.customer_name || 'Pelanggan'}</div></div>
            <div style="display:flex; align-items:center;"><div style="font-weight:700; color:#10b981;">RM ${parseFloat(r.total).toFixed(2)}</div><button class="btn-print" onclick="printReceipt('${r.id}')" title="Print Resit">📄</button></div>
        </div>`;
    });
    list.innerHTML = html || 'Tiada transaksi';
}

function printReceipt(id) {
    const order = allOrders.find(o => o.id == id);
    if(!order) return showNoti("Ralat", "Order tidak dijumpai", false);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [80, 150] });
    const shopName = document.getElementById('set-shop').value || "AdzPOS";
    const shopAddr = document.getElementById('set-addr').value || "";

    doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.text(shopName, 40, 10, { align: "center" });
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    if(shopAddr) doc.text(shopAddr, 40, 15, { align: "center" });
    doc.text("INVOIS JUALAN (COPY)", 40, 22, { align: "center" });
    doc.text(`Tarikh: ${order.date}`, 5, 30); doc.text(`No. Order: #${order.id}`, 5, 35);
    
    let t = order.customer_name || '-';
    if(t.includes('BUNGKUS')) t = t.replace('BUNGKUS - ', 'Bungkus: ');
    doc.text(`Pelanggan: ${t}`, 5, 40); doc.line(5, 43, 75, 43); 

    let y = 48; let items = []; try { items = JSON.parse(order.items); } catch(e) { items = []; }
    items.forEach(item => {
        let name = item.name;
        if(name.length > 25) name = name.substring(0, 25) + "...";
        doc.text(`${item.qty} x ${name}`, 5, y);
        const price = (parseFloat(item.finalPrice) * item.qty).toFixed(2);
        doc.text(price, 75, y, { align: "right" }); y += 5;
        if(item.addons && item.addons.length > 0) {
            doc.setFontSize(7); doc.text(`+ ${item.addons.map(a=>a.label).join(', ')}`, 10, y-1); doc.setFontSize(8); y += 4;
        }
        if(item.remark) {
            doc.setFontSize(7); doc.setFont("helvetica", "italic");
            doc.text(`Nota: ${item.remark}`, 10, y-1); doc.setFontSize(8); doc.setFont("helvetica", "normal"); y += 4;
        }
    });
    doc.line(5, y, 75, y); y += 5;
    doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.text("TOTAL", 5, y+2);
    doc.text(`RM ${parseFloat(order.total).toFixed(2)}`, 75, y+2, { align: "right" });
    y += 10; doc.setFontSize(8); doc.setFont("helvetica", "italic");
    doc.text("Terima Kasih!", 40, y, { align: "center" }); doc.text("Reprinted by Admin", 40, y+5, { align: "center" });
    doc.save(`Resit_${order.id}.pdf`);
}

// ===========================================
// REPORT DOWNLOAD
// ===========================================
function openStatementModal() { document.getElementById('statementModal').style.display = 'flex'; }
function selPeriod(type, el) {
    selPeriodType = type;
    document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('month-picker').style.display = type==='monthly'?'block':'none';
    document.getElementById('custom-picker').style.display = type==='custom'?'block':'none';
}
function selFormat(fmt, el) {
    selFormatType = fmt;
    document.querySelectorAll('.fmt-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
}
function generateStatement() {
    const btn = document.getElementById('btn-gen-stmt'); btn.innerText = "Processing..."; btn.disabled = true;
    fetch(GAS_URL + "?action=get_all_orders").then(r => r.json()).then(data => { processDownload(data); })
    .catch(() => { showNoti("Ralat", "Gagal sambung.", false); btn.innerText = "DOWNLOAD"; btn.disabled = false; });
}
function processDownload(data) {
    const btn = document.getElementById('btn-gen-stmt');
    const now = new Date(); const offset = now.getTimezoneOffset() * 60000;
    const todayStr = new Date(now.getTime() - offset).toISOString().split('T')[0];
    let filtered = [];
    if(selPeriodType === 'all') filtered = data;
    else if(selPeriodType === 'today') filtered = data.filter(o => o.date === todayStr);
    else {
        const d = new Date();
        if(selPeriodType === '7days') d.setDate(now.getDate()-7);
        if(selPeriodType === '30days') d.setDate(now.getDate()-30);
        const limit = new Date(d.getTime() - offset).toISOString().split('T')[0];
        if(selPeriodType === 'monthly') { const m = document.getElementById('inp-month').value; if(m) filtered = data.filter(o => o.date && o.date.startsWith(m)); }
        else if(selPeriodType === 'custom') { const f = document.getElementById('inp-from').value; const t = document.getElementById('inp-to').value; if(f && t) filtered = data.filter(o => o.date >= f && o.date <= t); }
        else { filtered = data.filter(o => o.date >= limit); }
    }
    if(filtered.length === 0) { showNoti("Tiada Data", "Tiada rekod.", false); btn.innerText = "DOWNLOAD"; btn.disabled = false; return; }
    if(selFormatType === 'excel') downloadExcel(filtered); else if(selFormatType === 'csv') downloadCSV(filtered); else downloadPDF(filtered);
    btn.innerText = "DOWNLOAD"; btn.disabled = false; document.getElementById('statementModal').style.display = 'none';
}
function calcSum(data) {
    let cash=0, qr=0, online=0, total=0;
    data.forEach(r => { if(r.status==='PAID') { let t=parseFloat(r.total); total+=t; let m=(r.payment_method||'').toUpperCase(); if(m.includes('TUNAI')||m.includes('CASH')) cash+=t; else if(m.includes('QR')) qr+=t; else online+=t; } });
    return {cash, qr, online, total};
}
function downloadExcel(data) {
    const s = calcSum(data);
    const rows = data.map(r => ({ "ID": r.id, "Date": r.date, "Time": r.time, "Cust": r.customer_name || '-', "Total": parseFloat(r.total), "Method": r.payment_method }));
    rows.push({}, {"Cust": "TUNAI", "Total": s.cash}, {"Cust": "QR", "Total": s.qr}, {"Cust": "ONLINE", "Total": s.online}, {"Cust": "GRAND TOTAL", "Total": s.total});
    const ws = XLSX.utils.json_to_sheet(rows); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Report"); XLSX.writeFile(wb, "Sales_Report.xlsx");
}
function downloadCSV(data) {
    const s = calcSum(data); let csv = "ID,Date,Time,Customer,Total,Method\n";
    data.forEach(r => csv += `${r.id},${r.date},${r.time},"${r.customer_name || '-'}",${parseFloat(r.total).toFixed(2)},${r.payment_method}\n`);
    csv += `\n,,,TOTAL TUNAI,${s.cash}\n,,,TOTAL QR,${s.qr}\n,,,GRAND TOTAL,${s.total}`;
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = "Sales_Report.csv"; link.click();
}
function downloadPDF(data) {
    const { jsPDF } = window.jspdf; const doc = new jsPDF(); const s = calcSum(data); const shop = document.getElementById('set-shop').value || "AdzPOS";
    doc.setFontSize(16); doc.text(shop + " - Laporan Jualan", 14, 15); doc.setFontSize(10); doc.text("Generated: " + new Date().toLocaleString(), 14, 22);
    const body = data.map(r => [r.id, r.date, r.time, r.customer_name || '-', parseFloat(r.total).toFixed(2), r.status, r.payment_method||'-']);
    doc.autoTable({ head: [['ID', 'Date', 'Time', 'Cust', 'Total', 'Status', 'Method']], body: body, startY: 30, theme: 'grid', headStyles: { fillColor: [15, 23, 42] } });
    const y = doc.lastAutoTable.finalY + 10;
    doc.text(`Total Tunai: RM ${s.cash.toFixed(2)}`, 140, y); doc.text(`Total QR: RM ${s.qr.toFixed(2)}`, 140, y+5);
    doc.text(`Total Online: RM ${s.online.toFixed(2)}`, 140, y+10); doc.setFont(undefined, 'bold'); doc.text(`GRAND TOTAL: RM ${s.total.toFixed(2)}`, 140, y+20);
    doc.save("Sales_Report.pdf");
}
function previewPaymentQR() {
    const url = document.getElementById('set-qr-pay-img').value;
    if(url) { document.getElementById('img-qr-preview').src = url; document.getElementById('payment-qr-preview').style.display = 'block'; } else document.getElementById('payment-qr-preview').style.display = 'none';
}
function generatePreviewQR() {
    const url = document.getElementById('set-maps-url').value; const cont = document.getElementById('qr-preview'); cont.innerHTML = '';
    if(url) new QRCode(cont, { text: url, width: 100, height: 100 });
}

// ===========================================
// MENU CRUD
// ===========================================
function fetchMenuData() {
    const el = document.getElementById('menu-tbody'); el.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading...</td></tr>';
    fetch(GAS_URL + "?action=get_menu_data").then(r=>r.json()).then(d=>{ window.menuData = d.menus; renderMenuTable(); updateMenuStats(); });
}

function renderMenuTable() {
    const term = document.getElementById('search-menu').value.toLowerCase();
    const tbody = document.getElementById('menu-tbody'); tbody.innerHTML = '';
    const filtered = window.menuData.filter(m => m.name.toLowerCase().includes(term));
    
    if(filtered.length === 0) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">Tiada menu dijumpai.</td></tr>'; return; }
    
    filtered.forEach(m => {
        const isLive = (m.status !== 'SOLD'); const rowClass = isLive ? '' : 'sold-out'; const labelText = isLive ? 'ADA' : 'HABIS'; const labelColor = isLive ? '#10b981' : '#ef4444';
        const tr = document.createElement('tr'); tr.className = rowClass;
        tr.innerHTML = `<td><img src="${m.img||'https://via.placeholder.com/40'}" style="width:40px; height:40px; border-radius:6px; background:#eee; object-fit:cover;"></td>
        <td><strong>${m.name}</strong></td>
        <td><span style="font-size:12px; background:#f1f5f9; padding:2px 8px; border-radius:4px; color:#475569;">${m.cat}</span></td>
        <td>RM ${parseFloat(m.price).toFixed(2)}</td>
        <td><span style="font-size:11px; color:#64748b;">${m.group ? 'G: '+m.group : '-'}</span></td>
        <td><div style="display:flex; align-items:center;"><label class="switch"><input type="checkbox" onchange="toggleStatus('${m.id}', this)" ${isLive ? 'checked' : ''}><span class="slider round"></span></label><span class="status-text" style="color:${labelColor}">${labelText}</span></div></td>
        <td style="text-align:right;">
            <button class="btn-sm" style="border:1px solid #ddd; background:white; margin-right:5px;" onclick="openMenuForm('${m.id}')">✏️</button>
            <button class="btn-sm btn-del" onclick="confirmDeleteMenu('${m.id}')">🗑️</button>
        </td>`;
        tbody.appendChild(tr);
    });
}

function updateMenuStats() {
    if(!window.menuData) return;
    document.getElementById('cnt-total').innerText = window.menuData.length;
    document.getElementById('cnt-active').innerText = window.menuData.filter(m => m.status !== 'SOLD').length;
    document.getElementById('cnt-sold').innerText = window.menuData.filter(m => m.status === 'SOLD').length;
}

async function toggleStatus(id, el) {
    const newStatus = el.checked ? 'ACTIVE' : 'SOLD';
    const row = el.closest('tr'); const label = el.parentElement.nextElementSibling;
    if (newStatus === 'ACTIVE') { row.classList.remove('sold-out'); label.innerText = "ADA"; label.style.color = "#10b981"; } 
    else { row.classList.add('sold-out'); label.innerText = "HABIS"; label.style.color = "#ef4444"; }
    const fd = new FormData(); fd.append('action', 'update_menu_status'); fd.append('id', id); fd.append('status', newStatus);
    
    try { await fetch(GAS_URL, {method:'POST', headers:{'x-admin-token': ADMIN_KEY}, body:fd}); const m = window.menuData.find(x => x.id === id); if(m) m.status = newStatus; updateMenuStats(); } 
    catch(e) { showNoti("Ralat", "Gagal update status.", false); el.checked = !el.checked; }
}

function openMenuForm(id=null) {
    const btnDel = document.getElementById('btn-delete-menu');
    if(id) {
        const m = window.menuData.find(x => x.id == id);
        document.getElementById('inp-id').value = m.id; document.getElementById('inp-name').value = m.name; document.getElementById('inp-price').value = m.price; document.getElementById('inp-cat').value = m.cat; document.getElementById('inp-img').value = m.img; document.getElementById('inp-group').value = m.group || '';
        document.getElementById('inp-desc').value = m.desc || ''; 
        if(btnDel) btnDel.style.display = 'block'; 
    } else {
        document.getElementById('inp-id').value = 'M' + Date.now(); document.getElementById('inp-name').value = ''; document.getElementById('inp-price').value = ''; document.getElementById('inp-cat').value = ''; document.getElementById('inp-img').value = ''; document.getElementById('inp-group').value = '';
        document.getElementById('inp-desc').value = ''; 
        if(btnDel) btnDel.style.display = 'none';
    }
    document.getElementById('menuModal').style.display = 'flex';
}

function confirmDeleteMenu(id, name = null) {
    if (!name) { 
        const m = window.menuData.find(x => x.id === id); 
        if (!m) return showNoti("Ralat", "Menu tidak dijumpai", false); 
        name = m.name; 
    }
    menuIdToDelete = id;
    document.getElementById('del-msg').innerHTML = `Anda akan memadam menu: <b>${name}</b>.<br>Tindakan ini tidak boleh diundur.`;
    document.getElementById('deleteConfirmModal').style.display = 'flex';
}

function deleteMenuItem() { 
    const id = document.getElementById('inp-id').value; 
    const name = document.getElementById('inp-name').value; 
    confirmDeleteMenu(id, name); 
}

function executeDeleteMenu() {
    document.getElementById('deleteConfirmModal').style.display = 'none'; showNoti("Memproses", "Sedang memadam menu...", true);
    const fd = new FormData(); fd.append('action', 'delete_menu_item'); fd.append('id', menuIdToDelete);
    
    fetch(GAS_URL, {method:'POST', headers:{'x-admin-token': ADMIN_KEY}, body:fd}).then(r => r.json()).then(d => {
        if(d.status === 'success') { document.getElementById('menuModal').style.display = 'none'; fetchMenuData(); showNoti("Berjaya", "Menu dipadam."); } 
        else { showNoti("Ralat", d.msg || "Gagal padam.", false); }
    }).catch(e => { showNoti("Ralat", "Tiada sambungan.", false); });
}

function saveMenuItem() {
    const name = document.getElementById('inp-name').value;
    const price = document.getElementById('inp-price').value;

    if (!name.trim()) return showNoti("Ralat", "Sila masukkan nama menu.", false);
    if (!price || parseFloat(price) <= 0) return showNoti("Ralat", "Harga mesti lebih dari RM 0.00", false);

    const fd = new FormData();
    fd.append('action', 'save_menu_item'); 
    fd.append('id', document.getElementById('inp-id').value); 
    fd.append('name', name); 
    fd.append('price', price); 
    fd.append('cat', document.getElementById('inp-cat').value.toUpperCase()); 
    fd.append('img', document.getElementById('inp-img').value); 
    fd.append('group', document.getElementById('inp-group').value);
    fd.append('description', document.getElementById('inp-desc').value);

    fetch(GAS_URL, {method:'POST', headers:{'x-admin-token': ADMIN_KEY}, body:fd}).then(r=>r.json()).then(d=>{
        if(d.status==='success') { document.getElementById('menuModal').style.display='none'; fetchMenuData(); showNoti("Berjaya", "Menu disimpan."); }
        else { showNoti("Ralat", d.msg || "Gagal simpan.", false); }
    });
}

// ===========================================
// ADDONS & SETTINGS
// ===========================================
function fetchAddons() {
    const tb = document.getElementById('addon-tbody'); 
    tb.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading...</td></tr>';
    
    fetch(GAS_URL + "?action=get_addons_list")
        .then(r=>r.json())
        .then(d=>{
            if(d.data.length===0) { tb.innerHTML='<tr><td colspan="4" style="text-align:center;">Tiada data.</td></tr>'; return; }
            let h=''; 
            d.data.forEach(a => { 
                h+=`<tr><td><b>${a.group_id}</b></td><td>${a.label}</td><td>${a.price.toFixed(2)}</td><td><button class="btn-sm btn-del" onclick="delAddon(${a.id})">🗑️</button></td></tr>`; 
            }); 
            tb.innerHTML=h;
        })
        .catch(e => {
            tb.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red;">Gagal memuat turun data.</td></tr>';
            showNoti("Ralat", "Gagal load addon.", false);
        });
}

function saveAddon() {
    const g=document.getElementById('add-group').value; const l=document.getElementById('add-label').value; const p=document.getElementById('add-price').value;
    if(!g||!l) return showNoti("Info", "Isi Group & Label", false);
    const fd=new FormData(); fd.append('action','save_addon'); fd.append('group_id',g); fd.append('label',l); fd.append('price',p||0);
    
    fetch(GAS_URL,{method:'POST', headers:{'x-admin-token': ADMIN_KEY}, body:fd}).then(r=>r.json()).then(d=>{
        if(d.status==='success') { document.getElementById('add-label').value=''; fetchAddons(); showNoti("Berjaya", "Addon ditambah."); }
        else { showNoti("Ralat", d.msg || "Gagal simpan addon.", false); }
    });
}

function delAddon(id) { addonIdToDelete = id; document.getElementById('deleteAddonModal').style.display = 'flex'; }

function executeDeleteAddon() {
    document.getElementById('deleteAddonModal').style.display = 'none'; showNoti("Memproses", "Sedang memadam add-on...", true);
    const fd = new FormData(); fd.append('action', 'delete_addon'); fd.append('id', addonIdToDelete);
    
    fetch(GAS_URL, {method:'POST', headers:{'x-admin-token': ADMIN_KEY}, body:fd}).then(r => r.json()).then(d => {
        if(d.status === 'success') { fetchAddons(); showNoti("Berjaya", "Add-on dipadam."); } 
        else { showNoti("Ralat", d.msg || "Gagal padam.", false); }
    }).catch(() => showNoti("Ralat", "Tiada sambungan.", false));
}

async function loadSettings() {
    try {
        const response = await fetch(GAS_URL + "?action=get_shop_settings"); const res = await response.json();
        if (res.status === 'success') {
            const s = res.data;
            document.getElementById('set-shop').value = s.shop_name || ''; document.getElementById('set-addr').value = s.shop_address || ''; document.getElementById('set-maps-url').value = s.maps_url || ''; document.getElementById('set-qr-pay-img').value = s.qr_pay_img || ''; document.getElementById('set-toyyib-key').value = s.toyyib_key || ''; document.getElementById('set-toyyib-cat').value = s.toyyib_cat || ''; document.getElementById('absorb-fee-toggle').checked = (s.absorb_fee === '1');
            document.getElementById('set-open-time').value = s.shop_open_time || ''; document.getElementById('set-close-time').value = s.shop_close_time || '';
        }
    } catch (e) { console.error(e); }
    generatePreviewQR(); previewPaymentQR();
}

async function saveSettings() {
    const shopName = document.getElementById('set-shop').value; const address = document.getElementById('set-addr').value; const mapsUrl = document.getElementById('set-maps-url').value; const qrUrl = document.getElementById('set-qr-pay-img').value; const toyyibKey = document.getElementById('set-toyyib-key').value; const toyyibCat = document.getElementById('set-toyyib-cat').value; const absorbFee = document.getElementById('absorb-fee-toggle').checked ? '1' : '0';
    const openTime = document.getElementById('set-open-time').value; const closeTime = document.getElementById('set-close-time').value;
    showNoti("Simpan", "Mengemaskini database cloud...", true);
    const fd = new FormData();
    fd.append('action', 'save_shop_settings'); fd.append('shop_name', shopName); fd.append('shop_address', address); fd.append('maps_url', mapsUrl); fd.append('qr_pay_img', qrUrl); fd.append('toyyib_key', toyyibKey); fd.append('toyyib_cat', toyyibCat); fd.append('absorb_fee', absorbFee); fd.append('shop_open_time', openTime); fd.append('shop_close_time', closeTime);
    
    try {
        const response = await fetch(GAS_URL, { method: 'POST', headers: {'x-admin-token': ADMIN_KEY}, body: fd });
        const d = await response.json();
        if (d.status === 'success') { showNoti("Berjaya", "Tetapan & ToyyibPay disimpan."); } 
        else { showNoti("Ralat", d.msg || "Gagal hantar data.", false); }
    } catch (e) { showNoti("Ralat", "Masalah sambungan.", false); }
}

function openCleanupModal() { document.getElementById('cleanupModal').style.display = 'flex'; }

function executeCleanup() {
    document.getElementById('cleanupModal').style.display = 'none';
    showNoti("Memproses", "Sedang membersihkan database...", true);
    const fd = new FormData(); fd.append('action', 'cleanup_database');
    
    fetch(GAS_URL, {method:'POST', headers:{'x-admin-token': ADMIN_KEY}, body:fd}).then(r => r.json()).then(d => {
        if(d.status === 'success') { showNoti("Selesai", `Pembersihan berjaya. ${d.deleted_rows} rekod dipadam.`); initDashboard(); } 
        else showNoti("Ralat", d.msg || "Gagal memadam data.", false);
    }).catch(() => showNoti("Ralat", "Tiada sambungan.", false));
}
