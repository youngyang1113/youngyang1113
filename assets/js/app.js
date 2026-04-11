// 主逻辑 - 状态管理、反应核心、事件绑定

// 全局状态
let pendingReagent = null;
let totalScore = 0, expCount = 0, taskMode = false, currentTaskIdx = 0;
let currentTask = taskBank[currentTaskIdx];
let completedKeys = new Set();
let lastReaction = { type: '', phen: '', eq: '', pair: '' };

// DOM 元素绑定
const vesselWaiting = document.getElementById('vesselWaiting');
const resultArea = document.getElementById('resultArea');
const explainArea = document.getElementById('explainArea');
const scoreValueSpan = document.getElementById('scoreValue');
const expCountSpan = document.getElementById('expCount');
const taskDoneCountSpan = document.getElementById('taskDoneCount');

// 更新等待区显示
function updateWaitingDisplay() {
    if (!vesselWaiting) return;
    if (pendingReagent) {
        let r = reagents.find(x => x.id === pendingReagent);
        vesselWaiting.innerHTML = `<div class="waiting-icon"><i class="fas ${r.icon}"></i><div>${r.name}</div><div style="font-size:12px;">⏳ 等待第二种试剂</div></div>`;
    } else {
        vesselWaiting.innerHTML = `<div class="empty-message"><i class="fas fa-droplet"></i><p>拖放试剂至烧杯中</p></div>`;
    }
}

// 无反应智能提示
function showNoReactionAlert(a, b) {
    const nameA = getReagentName(a);
    const nameB = getReagentName(b);
    const suggestionsA = getSuggestionsForReagent(a);
    const suggestionsB = getSuggestionsForReagent(b);
    let msg = `⚠️ "${nameA}" 和 "${nameB}" 在当前条件下不发生反应。\n\n`;
    if (suggestionsA.length > 0) {
        msg += `💡 "${nameA}" 可以与以下试剂反应：${suggestionsA.join('、')}\n`;
    } else {
        msg += `💡 "${nameA}" 暂无常见反应组合，可尝试酸/碱/盐类。\n`;
    }
    if (suggestionsB.length > 0) {
        msg += `💡 "${nameB}" 可以与以下试剂反应：${suggestionsB.join('、')}`;
    } else {
        msg += `💡 "${nameB}" 暂无常见反应组合，可尝试酸/碱/盐类。`;
    }
    alert(msg);
}

// 更新积分和任务
function updateScoreAndTask(addScore, taskCompleted) {
    scoreValueSpan.innerText = totalScore;
    taskDoneCountSpan.innerText = completedKeys.size;
    updateTaskUI();
}

// 核心反应执行
function performReaction(a, b) {
    clearAnimations();
    expCount++;
    expCountSpan.innerText = expCount;
    
    const reaction = reactions.find(r => (r.a === a && r.b === b) || (r.a === b && r.b === a));
    
    if (!reaction) {
        showNoReactionAlert(a, b);
        addLogRow(a, b, '无明显反应', '无可见现象', '——');
        resultArea.innerHTML = `<i class="fas fa-microscope"></i> <strong>无明显反应</strong> ｜ 两种试剂不反应`;
        resultArea.className = 'status warn';
        explainArea.innerHTML = `<i class="fas fa-comment-dots"></i> 点击「AI讲解」获取建议。`;
        lastReaction = { type: '无明显反应', phen: '无可见现象', eq: '——', pair: `${getReagentName(a)} + ${getReagentName(b)}` };
        updateScoreAndTask(0, false);
        return;
    }
    
    let { type, phen, eq, anim, heat, colorTint } = reaction;
    totalScore += 10;
    let taskCompleted = false;
    
    if (taskMode && currentTask && currentTask.type === type) {
        const key = `${a}|${b}::${type}`;
        if (!completedKeys.has(key)) {
            completedKeys.add(key);
            totalScore += 10;
            taskCompleted = true;
        }
    }
    
    lastReaction = { type, phen, eq, pair: `${getReagentName(a)} + ${getReagentName(b)}` };
    resultArea.innerHTML = `<i class="fas fa-microscope"></i> <strong>${type}</strong> ｜ ${phen}`;
    resultArea.className = 'status ok';
    explainArea.innerHTML = `<i class="fas fa-comment-dots"></i> 反应完成，点击「AI讲解」分析原理。`;
    
    // 特效分发
    if (heat) {
        addExothermicEffect();
    }
    if (anim === 'precipitate') {
        startPrecipitate();
    }
    if (anim === 'bubble') {
        startBubbles(4500, 1.5);
    }
    if (type === '置换反应') {
        addMetalShine();
        if (!heat) startBubbles(3000, 1.2);
    }
    if (colorTint) {
        changeLiquidColor(colorTint);
    }
    // 添加氛围粒子
    createParticles(15);
    
    updateScoreAndTask(0, taskCompleted);
    addLogRow(a, b, type, phen, eq);
}

// 添加试剂到烧杯
function addReagentToVessel(id) {
    if (pendingReagent === null) {
        pendingReagent = id;
        updateWaitingDisplay();
    } else {
        let first = pendingReagent;
        pendingReagent = null;
        updateWaitingDisplay();
        performReaction(first, id);
    }
}

// 重置实验
function resetExperiment() {
    pendingReagent = null;
    updateWaitingDisplay();
    clearAnimations();
    resultArea.innerHTML = '<i class="fas fa-info-circle"></i> 实验已重置';
    resultArea.className = 'status warn';
    explainArea.innerHTML = '<i class="fas fa-brain"></i> AI讲解就绪';
    lastReaction = { type: '', phen: '', eq: '', pair: '' };
}

// 任务模式
function toggleTaskMode() {
    taskMode = !taskMode;
    document.getElementById('taskToggleText').innerText = taskMode ? '开启' : '关闭';
    updateTaskUI();
}
function nextTask() {
    currentTaskIdx = (currentTaskIdx + 1) % taskBank.length;
    currentTask = taskBank[currentTaskIdx];
    completedKeys.clear();
    updateTaskUI();
    taskDoneCountSpan.innerText = 0;
}

// AI讲解
function aiExplain() {
    if (!lastReaction.type || lastReaction.type === '无明显反应') {
        explainArea.innerHTML = `<i class="fas fa-chalkboard"></i> 🤖 AI建议：尝试酸+碳酸盐（产生气泡）、酸碱中和（发热）或生成沉淀的组合（如AgNO₃+NaCl）。`;
        explainArea.className = 'status ok';
        return;
    }
    let msg = '';
    if (lastReaction.type === '中和反应') msg = `中和反应：H⁺ + OH⁻ → H₂O，放热。方程式：${lastReaction.eq}`;
    else if (lastReaction.type === '产气反应') msg = `气体生成：酸与碳酸盐产生CO₂，气泡连续。方程式：${lastReaction.eq}`;
    else if (lastReaction.type === '沉淀反应') msg = `离子沉淀：生成难溶物从溶液中析出，底部沉淀累积。方程式：${lastReaction.eq}`;
    else if (lastReaction.type === '置换反应') msg = `置换反应：活泼金属置换，基于金属活动性顺序。方程式：${lastReaction.eq}`;
    else msg = `反应类型：${lastReaction.type}，现象：${lastReaction.phen}，方程式：${lastReaction.eq}`;
    explainArea.innerHTML = `<i class="fas fa-robot"></i> <strong>AI深度讲解：</strong><br>${msg}<div class="small" style="margin-top:6px;">✨ 教学提示：结合离子方程式理解本质。</div>`;
    explainArea.className = 'status ok';
}

// 拖拽事件
function allowDrop(e) { e.preventDefault(); }
function handleDropOnVessel(e) {
    e.preventDefault();
    let data = e.dataTransfer.getData('text/plain');
    if (data) addReagentToVessel(data);
}

// 初始化所有事件监听
function init() {
    renderPalette();
    buildRefTable();
    fillCurrentURL();
    updateTaskUI();
    
    // 绑定全局函数
    window.addReagentToVessel = addReagentToVessel;
    window.resetExperiment = resetExperiment;
    window.toggleTaskMode = toggleTaskMode;
    window.nextTask = nextTask;
    window.aiExplain = aiExplain;
    window.genQR = genQR;
    window.fillCurrentURL = fillCurrentURL;
    window.copyLink = copyLink;
    
    // 绑定DOM事件
    const resetBtn = document.getElementById('resetBtn');
    const taskToggleBtn = document.getElementById('taskToggleBtn');
    const nextTaskBtn = document.getElementById('nextTaskBtn');
    const aiExplainBtn = document.getElementById('aiExplainBtn');
    const genQRBtn = document.getElementById('genQRBtn');
    const currentUrlBtn = document.getElementById('currentUrlBtn');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const vessel = document.getElementById('reactionVessel');
    
    if (resetBtn) resetBtn.addEventListener('click', resetExperiment);
    if (taskToggleBtn) taskToggleBtn.addEventListener('click', toggleTaskMode);
    if (nextTaskBtn) nextTaskBtn.addEventListener('click', nextTask);
    if (aiExplainBtn) aiExplainBtn.addEventListener('click', aiExplain);
    if (genQRBtn) genQRBtn.addEventListener('click', genQR);
    if (currentUrlBtn) currentUrlBtn.addEventListener('click', fillCurrentURL);
    if (copyLinkBtn) copyLinkBtn.addEventListener('click', copyLink);
    if (vessel) {
        vessel.addEventListener('drop', handleDropOnVessel);
        vessel.addEventListener('dragover', allowDrop);
    }
    setupDragHighlight();
}

// 启动应用
init();