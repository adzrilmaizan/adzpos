@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

/* --- OVERLAY START SCREEN --- */
.overlay-start {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: #0f172a; z-index: 9999999; display: flex; 
    flex-direction: column; align-items: center; justify-content: center; 
    color: white; font-family: 'Inter', sans-serif;
}
.icon-bounce { font-size: 60px; margin-bottom: 20px; animation: bounce 2s infinite; }
.btn-start {
    background: #2563eb; color: white; border: none; padding: 18px 40px; 
    border-radius: 16px; font-weight: 800; font-size: 16px; cursor: pointer; 
    box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4); 
    display: flex; align-items: center; gap: 10px;
}
@keyframes bounce{0%,100%,20%,50%,80%{transform:translateY(0)}40%{transform:translateY(-20px)}60%{transform:translateY(-10px)}}

/* --- MAIN APP --- */
#admin-app {
    font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #334155;
    position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1000;
    display: flex; overflow: hidden;
}
#admin-app * { box-sizing: border-box; }

/* SIDEBAR */
.sidebar {
    width: 250px; background: #0f172a; color: white; padding: 20px;
    display: flex; flex-direction: column; border-right: 1px solid #1e293b;
}
.brand { font-size: 20px; font-weight: 800; margin-bottom: 40px; color: white; }
.nav-item {
    padding: 12px 15px; border-radius: 12px; margin-bottom: 5px; cursor: pointer;
    color: #94a3b8; font-weight: 600; display: flex; align-items: center; gap: 10px; transition: 0.2s;
}
.nav-item:hover, .nav-item.active { background: #1e293b; color: white; }

/* MAIN CONTENT */
.main { flex: 1; padding: 30px; overflow-y: auto; position: relative; }
.header-flex { display:flex; justify-content:space-between; align-items:center; margin-bottom:30px; }
h2 { margin-top: 0; margin-bottom: 25px; color: #0f172a; }

/* DASHBOARD GRID */
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
.stat-card { background: white; padding: 25px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.stat-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
.stat-value { font-size: 32px; font-weight: 800; color: #0f172a; margin-top: 10px; }

.content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; height: 450px; }
.chart-box, .table-box { background: white; padding: 25px; border-radius: 16px; border: 1px solid #e2e8f0; height: 100%; overflow: hidden; display: flex; flex-direction: column; }
.table-box { overflow-y: auto; }

/* TABLE & LISTS */
.trans-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
.adm-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px; }
.adm-table th { background: #f8fafc; padding: 10px; text-align: left; font-weight: 700; position: sticky; top:0; color:#475569; }
.adm-table td { padding: 10px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
tr.sold-out td { color: #94a3b8; }
tr.sold-out img { opacity: 0.5; filter: grayscale(100%); }

/* BUTTONS & INPUTS */
.btn-accent { background: #0f172a; color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 13px; }
.btn-sm { padding: 5px 10px; font-size: 11px; border-radius: 6px; border: none; cursor: pointer; }
.btn-del { background: #fee2e2; color: #ef4444; }
.btn-print { background: #e0e7ff; color: #4338ca; border:none; padding:5px 8px; border-radius:6px; cursor:pointer; margin-left:10px; font-size:14px; }
.btn-print:hover { background: #c7d2fe; }

.input { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0; outline: none; background: #f8fafc; }
.label { display: block; font-size: 12px; font-weight: 700; margin-bottom: 5px; color: #334155; }

/* TOGGLES */
.switch { position: relative; display: inline-block; width: 40px; height: 22px; margin-right: 8px; vertical-align: middle; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ef4444; transition: .4s; border-radius: 34px; }
.slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
input:checked + .slider { background-color: #10b981; }
input:checked + .slider:before { transform: translateX(18px); }
.status-text { font-size: 11px; font-weight: 800; display: inline-block; width: 45px; }

/* MODALS */
.modal-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px); z-index: 2000; display: none; align-items: center; justify-content: center; }
.modal-box { background: white; padding: 25px; border-radius: 20px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; position: relative; }

/* STATEMENT UI */
.period-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
.period-btn { padding: 15px; border: 1px solid #e2e8f0; border-radius: 10px; background: white; cursor: pointer; font-weight: 600; font-size: 12px; text-align: center; color: #334155; transition: 0.2s; }
.period-btn:hover { border-color: #3b82f6; color: #3b82f6; }
.period-btn.active { background: #eff6ff; border-color: #3b82f6; color: #3b82f6; font-weight: 800; }

.format-grid { display: flex; gap: 10px; margin-top: 20px; }
.fmt-btn { flex: 1; padding: 12px; border-radius: 10px; font-weight: 700; cursor: pointer; border: 1px solid transparent; background: #f1f5f9; display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 13px; }
.fmt-btn.active[data-fmt="excel"] { background: #10b981; color: white; }
.fmt-btn.active[data-fmt="csv"] { background: #0891b2; color: white; }
.fmt-btn.active[data-fmt="pdf"] { background: #f43f5e; color: white; }

/* UTILS */
.addon-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 20px; }
.table-responsive { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.section { display: none; }
.section.active { display: block; }

/* RESPONSIVE */
@media (max-width: 800px) {
    #admin-app { flex-direction: column; position: absolute; height: auto; min-height: 100vh; }
    .sidebar { width: 100%; flex-direction: row; justify-content: space-around; padding: 10px; position: fixed; bottom: 0; z-index: 100; border-top: 1px solid #ccc; }
    .brand, .nav-item span { display: none; }
    .main { padding-bottom: 80px; }
    .stats-grid { grid-template-columns: 1fr; }
    .content-grid { grid-template-columns: 1fr; height: auto; }
    .chart-box, .table-box { height: 400px; }
    .addon-grid { grid-template-columns: 1fr; }
}
