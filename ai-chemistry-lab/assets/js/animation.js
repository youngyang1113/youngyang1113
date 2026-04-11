// 动画引擎 - 管理所有视觉特效

let activeAnimInterval = null;

// 清除所有动画
function clearAnimations() {
    const animLayer = document.getElementById('animationLayer');
    if (animLayer) animLayer.innerHTML = '';
    if (activeAnimInterval) clearInterval(activeAnimInterval);
    activeAnimInterval = null;
    // 重置液体颜色（渐变恢复默认）
    const liquid = document.querySelector('.vessel-liquid');
    if (liquid) liquid.style.background = 'linear-gradient(180deg, #4facfe, #00f2fe)';
}

// 气泡动画（产气/普通反应）
function startBubbles(duration = 4000, intensity = 1.2) {
    clearAnimations();
    const animLayer = document.getElementById('animationLayer');
    if (!animLayer) return;
    const interval = setInterval(() => {
        let count = Math.floor(3 * intensity);
        for (let i = 0; i < count; i++) {
            let bubble = document.createElement('div');
            bubble.className = 'bubble-sim';
            let sz = 6 + Math.random() * 18;
            bubble.style.width = sz + 'px';
            bubble.style.height = sz + 'px';
            bubble.style.left = Math.random() * 90 + 5 + '%';
            bubble.style.bottom = '0px';
            bubble.style.animationDuration = 1 + Math.random() * 1.8 + 's';
            animLayer.appendChild(bubble);
            setTimeout(() => bubble.remove(), 2800);
        }
    }, 140);
    activeAnimInterval = interval;
    setTimeout(() => {
        if (activeAnimInterval) clearInterval(activeAnimInterval);
        activeAnimInterval = null;
    }, duration);
}

// 沉淀动画（沉淀反应专用）
function startPrecipitate() {
    clearAnimations();
    const animLayer = document.getElementById('animationLayer');
    if (!animLayer) return;
    const precip = document.createElement('div');
    precip.className = 'precipitate-layer';
    animLayer.appendChild(precip);
    requestAnimationFrame(() => { precip.style.height = '60%'; });
    // 颗粒沉降
    for (let i = 0; i < 30; i++) {
        let part = document.createElement('div');
        part.className = 'sediment-particle';
        part.style.left = (10 + Math.random() * 80) + '%';
        part.style.bottom = '0px';
        animLayer.appendChild(part);
        setTimeout(() => part.remove(), 800);
    }
    setTimeout(() => {
        if (precip && precip.parentNode) precip.remove();
    }, 3200);
}

// 发热反应特效：火焰 + 热浪
function addExothermicEffect() {
    const animLayer = document.getElementById('animationLayer');
    if (!animLayer) return;
    let flame = document.createElement('div');
    flame.className = 'flame-real';
    animLayer.appendChild(flame);
    // 热浪扭曲层
    let heatWave = document.createElement('div');
    heatWave.style.position = 'absolute';
    heatWave.style.bottom = '0';
    heatWave.style.left = '0';
    heatWave.style.width = '100%';
    heatWave.style.height = '70%';
    heatWave.style.background = 'radial-gradient(ellipse, rgba(255,100,0,0.2), transparent)';
    heatWave.style.pointerEvents = 'none';
    heatWave.style.animation = 'flickerIntense 0.5s infinite alternate';
    animLayer.appendChild(heatWave);
    setTimeout(() => {
        if (flame) flame.remove();
        if (heatWave) heatWave.remove();
    }, 2200);
}

// 金属光泽（置换反应辅助）
function addMetalShine() {
    const animLayer = document.getElementById('animationLayer');
    if (!animLayer) return;
    let shine = document.createElement('div');
    shine.className = 'metal-shine';
    animLayer.appendChild(shine);
    setTimeout(() => shine.remove(), 1800);
}

// 粒子系统（通用氛围）
function createParticles(count = 20) {
    const animLayer = document.getElementById('animationLayer');
    if (!animLayer) return;
    for (let i = 0; i < count; i++) {
        let p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.bottom = '0px';
        p.style.animationDuration = 1 + Math.random() * 2 + 's';
        animLayer.appendChild(p);
        setTimeout(() => p.remove(), 3000);
    }
}

// 改变液体颜色（渐变）
function changeLiquidColor(gradient) {
    const liquid = document.querySelector('.vessel-liquid');
    if (liquid) liquid.style.background = gradient;
    // 3秒后恢复默认
    setTimeout(() => {
        if (liquid) liquid.style.background = 'linear-gradient(180deg, #4facfe, #00f2fe)';
    }, 3000);
}