// 记录上一次获取到的提问数量，避免重复渲染
let lastQuestionCount = 0;
let activeQuestionElement = null;
let activeNavItem = null;
const NAV_ACTIVE_CLASS = 'nav-item-active';

function createSidebar() {
    let sidebar = document.getElementById('gemini-nav-sidebar');
    // 如果不存在，才创建
    if (!sidebar) {
        sidebar = document.createElement('div');
        sidebar.id = 'gemini-nav-sidebar';
        document.body.appendChild(sidebar);
    }
    return sidebar; // 确保始终返回该元素
}

function getQuestionText(questionElement) {
    const textSource = questionElement.querySelector('.query-content, .user-query-container, user-query-content');
    const rawText = textSource ? textSource.innerText : questionElement.innerText;
    let normalized = (rawText || '（空提问）').trim().replace(/\s+/g, ' ');
    if (normalized.startsWith('你说')) {
        normalized = normalized.replace(/^你说[:：]?\s*/u, '');
    }
    return normalized || '（空提问）';
}

function activateNav(questionElement, navItem) {
    activeQuestionElement = questionElement;
    if (activeNavItem && activeNavItem !== navItem) {
        activeNavItem.classList.remove(NAV_ACTIVE_CLASS);
    }
    navItem.classList.add(NAV_ACTIVE_CLASS);
    activeNavItem = navItem;
}

function scrollToQuestion(questionElement) {
    questionElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
    });
}

function updateNavigation() {
    const sidebar = createSidebar();
    // 此时 sidebar 永远不会是 undefined
    const questions = Array.from(document.querySelectorAll('user-query'));

    if (questions.length === lastQuestionCount) return;

    lastQuestionCount = questions.length;
    sidebar.innerHTML = ''; // 现在这里安全了

    questions.forEach((questionElement) => {
        const item = document.createElement('div');
        item.className = 'nav-item';
        const label = getQuestionText(questionElement);
        const truncated = label.length > 30 ? label.substring(0, 30) + '…' : label;
        item.innerText = truncated;
        item.title = label;
        item.addEventListener('click', () => {
            scrollToQuestion(questionElement);
            activateNav(questionElement, item);
        });

        if (activeQuestionElement && activeQuestionElement === questionElement) {
            item.classList.add(NAV_ACTIVE_CLASS);
            activeNavItem = item;
        }
        sidebar.appendChild(item);
    });
}

// 监听页面 DOM 变化（因为 Gemini 是单页应用，对话会动态加载）
const observer = new MutationObserver(() => {
    updateNavigation();
});

// 开始观察对话容器
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// 初始执行一次
updateNavigation();
