// UI 控制 - 试剂库渲染、教师控制台、任务模式、二维码等

// 渲染试剂库
function renderPalette() {
    const container = document.getElementById('reagentPalette');
    if (!container) return;
    container.innerHTML = '';
    reagents.forEach(r => {
        let div = document.createElement('div');
        div.className = 'chem-badge';
        div.setAttribute('data-id', r.id);
        div.draggable = true;
        div.innerHTML = `<i class="fas ${r.icon}"></i><span>${r.name}</span>`;
        div.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', r.id));
        div.addEventListener('click', () => window.addReagentToVessel?.(r.id));
        container.appendChild(div);
    });
}

// 添加日志到教师控制台
function addLogRow(a, b, type, phen, eq) {
    const tbody = document.getElementById('logBody');
    if (!tbody) return;
    const idx = tbody.children.length + 1;
    const iconA = `<i class="fas ${getIconClass(a)}"></i>`;
    const iconB = `<i class="fas ${getIconClass(b)}"></i>`;
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${idx}</td>
        <td>${iconA} ${getReagentName(a)} + ${iconB} ${getReagentName(b)}</td>
        <td>${type}</td>
        <td>${phen}</td>
        <td style="font-size:0.65rem;">${eq}</td>
    `;
    tbody.prepend(row);
}

// 更新任务UI
function updateTaskUI() {
    const taskMode = window.taskMode || false;
    const currentTask = window.currentTask;
    const completedKeys = window.completedKeys || new Set();
    const taskText = document.getElementById('taskText');
    const taskHint = document.getElementById('taskHint');
    const taskProgress = document.getElementById('taskProgress');
    if (!taskText) return;
    if (!taskMode) {
        taskText.innerText = '✨ 自由探索模式';
        taskHint.innerText = '任意组合自动记录';
        taskProgress.style.width = '0%';
        return;
    }
    if (currentTask) {
        taskText.innerHTML = `<i class="fas fa-bullseye"></i> ${currentTask.name}`;
        taskHint.innerText = currentTask.hint;
        let total = reactions.filter(r => r.type === currentTask.type).length;
        let done = Array.from(completedKeys).filter(k => k.includes(`::${currentTask.type}`)).length;
        let percent = total ? Math.min(100, Math.round(done / total * 100)) : 0;
        taskProgress.style.width = percent + '%';
        taskHint.innerText = `${currentTask.hint}  (进度 ${done}/${total})`;
    }
}

// 常见反应库表格
function buildRefTable() {
    const tbody = document.getElementById('refTableBody');
    if (!tbody) return;
    const data = [
        ['🧪 中和反应（发热）', '酸 + 碱', '放热，pH变化', 'HCl + NaOH → NaCl + H₂O'],
        ['💨 产气反应', '酸 + 碳酸盐', '连续气泡，CO₂', '2HCl + CaCO₃ → CaCl₂ + CO₂↑'],
        ['🧂 沉淀反应', '可溶盐+可溶盐', '沉淀从底部生长', 'AgNO₃ + NaCl → AgCl↓'],
        ['⚙️ 置换反应', '金属+盐/酸', '析出固体或H₂', 'Fe + CuSO₄ → FeSO₄ + Cu'],
        ['🔥 金属氧化物+酸', '氧化物+酸', '固体溶解变色', 'CuO + H₂SO₄ → CuSO₄ + H₂O']
    ];
    tbody.innerHTML = data.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('');
}

// 二维码相关
function genQR() {
    const input = document.getElementById('qrInput');
    const img = document.getElementById('qrImg');
    let url = input.value.trim();
    if (url) img.src = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(url)}`;
    else alert('请输入链接');
}
function fillCurrentURL() {
    const input = document.getElementById('qrInput');
    input.value = location.href;
    genQR();
}
async function copyLink() {
    const input = document.getElementById('qrInput');
    let val = input.value || location.href;
    try {
        await navigator.clipboard.writeText(val);
        alert('链接已复制');
    } catch (e) {
        alert('手动复制');
    }
}

// 拖拽高亮
function setupDragHighlight() {
    const vessel = document.getElementById('reactionVessel');
    if (!vessel) return;
    vessel.addEventListener('dragenter', (e) => {
        e.preventDefault();
        vessel.classList.add('drag-over');
    });
    vessel.addEventListener('dragleave', () => {
        vessel.classList.remove('drag-over');
    });
    vessel.addEventListener('drop', () => {
        vessel.classList.remove('drag-over');
    });
}