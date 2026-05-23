// ========== 配置常量（便于管理和修改） ==========
const CONFIG = {
    // API基础配置
    API_BASE_URL: 'https://api.eyz2021.cn/x/web-interface/card',
    AVATAR_PROXY_URL: 'https://api.eyz2021.cn/proxy/avatar/',
    DEFAULT_UID: 616856644,
    FETCH_TIMEOUT: 20000, // 请求超时时间(ms)
    RETRY_COUNT: 1, // 失败重试次数
    
    // 修改：移除JSONP相关的Accept头，适配纯JSON
    REQUEST_HEADERS: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com/',
        'Accept': 'application/json, */*' // 关键：改为接收JSON
    },
    
    // DOM选择器（新增挂件元素）
    SELECTORS: {
        avatar: '#biliAvatar',
        pendant: '#biliPendant',
        name: '#biliName',
        level: '#biliLevel',
        sign: '#biliSign',
        fans: '#biliFans',
        follow: '#biliFollow',
        video: '#biliVideo',
        like: '#biliLike',
        sex: '#biliSex',
        vip: '#biliVip',
        link: '#biliLink',
        card: '.md\\:w-1\\/2.p-8.border-t.md\\:border-t-0.md\\:border-l.border-gray-100'
    },
    
    // 默认占位符（不变）
    PLACEHOLDERS: {
        avatar: 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 100 100%22%3E%3Crect width%3D%22100%25%22 height%3D%22100%25%22 fill%3D%22%23f0f0f0%22%3E%3C%2Frect%3E%3C%2Fsvg%3E',
        name: '加载中...',
        sign: '加载中...',
        number: '--',
        defaultAvatar: 'res/avatar.jpg'
    },
    
    ALLOWED_AVATAR_DOMAINS: [
        'i0.hdslb.com', 
        'i1.hdslb.com', 
        'i2.hdslb.com', 
        'i3.hdslb.com',
        'face.hdslb.com'
    ]
};

// ========== DOM元素管理（不变） ==========
const DOM = {
    elements: {},
    init() {
        Object.entries(CONFIG.SELECTORS).forEach(([key, selector]) => {
            this.elements[key] = document.querySelector(selector);
        });
        return this;
    },
    get(key) {
        return this.elements[key] || null;
    }
};

// ========== 工具函数（修改：移除JSONP解析，保留其他） ==========
const Utils = {
    formatNumber(num) {
        const n = Number(num) || 0;
        if (n >= 100000000) {
            return (n / 100000000).toFixed(1).replace(/\.0$/, '') + '亿';
        } else if (n >= 10000) {
            return (n / 10000).toFixed(1).replace(/\.0$/, '') + '万';
        }
        return n.toString();
    },
    
    // 移除：不再需要JSONP解析函数
    // parseJsonp(jsonpText) { ... },
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    getProxyAvatarUrl(rawAvatarUrl) {
        if (!rawAvatarUrl || rawAvatarUrl === CONFIG.PLACEHOLDERS.defaultAvatar) {
            return rawAvatarUrl;
        }
        try {
            const urlObj = new URL(rawAvatarUrl);
            if (!CONFIG.ALLOWED_AVATAR_DOMAINS.includes(urlObj.hostname)) {
                console.warn('非B站头像域名，直接使用原始URL:', rawAvatarUrl);
                return rawAvatarUrl;
            }
            return `${CONFIG.AVATAR_PROXY_URL}?url=${encodeURIComponent(rawAvatarUrl)}`;
        } catch (e) {
            console.error('解析头像URL失败:', e);
            return rawAvatarUrl;
        }
    },
    
    loadImageWithTimeout(imgUrl, timeout = 20000) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const timer = setTimeout(() => {
                reject(new Error('图片加载超时'));
            }, timeout);
            img.onload = () => {
                clearTimeout(timer);
                resolve(imgUrl);
            };
            img.onerror = () => {
                clearTimeout(timer);
                reject(new Error('图片加载失败'));
            };
            img.src = imgUrl;
        });
    }
};

// ========== API请求服务（核心修改：移除JSONP解析，直接解析JSON） ==========
const ApiService = {
    async fetchBiliUserInfo(uid = CONFIG.DEFAULT_UID, retry = 0) {
        try {
            // 构建请求URL（移除：jsonp=jsonp参数，因为代理返回纯JSON）
            const params = new URLSearchParams({
                mid: uid,
                extra: 'true',
                t: Date.now() // 防止缓存
            });
            const url = `${CONFIG.API_BASE_URL}?${params.toString()}`;
            
            // 创建AbortController处理超时
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT);
            
            // 发起请求
            const response = await fetch(url, {
                method: 'GET',
                headers: CONFIG.REQUEST_HEADERS,
                signal: controller.signal,
                cache: 'no-cache'
            });
            
            clearTimeout(timeoutId);
            
            // 检查响应状态
            if (!response.ok) {
                throw new Error(`请求失败 [${response.status}] ${response.statusText}`);
            }
            
            // 关键修改：直接解析JSON，不再解析JSONP
            const result = await response.json();
            
            // 检查接口返回码
            if (result.code !== 0) {
                throw new Error(`接口错误 [${result.code}]：${result.message || '获取用户信息失败'}`);
            }
            
            // 数据校验和格式化
            return this.formatUserData(result.data);
            
        } catch (error) {
            console.error(`获取用户信息失败 (重试${retry}/${CONFIG.RETRY_COUNT}):`, error.message);
            
            // 重试逻辑
            if (retry < CONFIG.RETRY_COUNT) {
                await Utils.delay(500 * (retry + 1));
                return this.fetchBiliUserInfo(uid, retry + 1);
            }
            
            throw error;
        }
    },
    
    formatUserData(rawData) {
        const card = rawData.card || {};
        const levelInfo = card.level_info || {};
        
        return {
            uid: card.mid || CONFIG.DEFAULT_UID,
            name: card.name || '未知用户',
            avatar: card.face || CONFIG.PLACEHOLDERS.defaultAvatar,
            level: levelInfo.current_level || 0,
            sign: card.sign || '未设置签名',
            sex: card.sex || '未知',
            fans: card.fans || 0,
            follow: card.attention || 0,
            video: rawData.archive_count || 0,
            like: rawData.like_num || 0,
            vip: {
                type: card.vip?.type || 0,
                status: card.vip?.status || 0
            },
            pendant: card.pendant?.image || ''
        };
    }
};

// ========== UI渲染逻辑（不变） ==========
const UIRenderer = {
    setSkeletonState() {
        const avatarEl = DOM.get('avatar');
        const pendantEl = DOM.get('pendant');
        const nameEl = DOM.get('name');
        const signEl = DOM.get('sign');
        if (avatarEl) avatarEl.src = CONFIG.PLACEHOLDERS.avatar;
        if (pendantEl) {
            pendantEl.src = '';
            pendantEl.classList.add('hidden');
        }
        if (nameEl) nameEl.textContent = CONFIG.PLACEHOLDERS.name;
        if (signEl) signEl.textContent = CONFIG.PLACEHOLDERS.sign;
        ['fans', 'follow', 'video', 'like'].forEach(key => {
            const el = DOM.get(key);
            if (el) el.textContent = CONFIG.PLACEHOLDERS.number;
        });
        this.toggleSkeletonAnimation(true);
    },
    removeSkeletonState() {
        this.toggleSkeletonAnimation(false);
    },
    toggleSkeletonAnimation(enable) {
        const elements = [
            DOM.get('name'), DOM.get('sign'),
            DOM.get('fans'), DOM.get('follow'),
            DOM.get('video'), DOM.get('like')
        ].filter(Boolean);
        elements.forEach(el => {
            if (enable) {
                el.classList.add('animate-pulse');
            } else {
                el.classList.remove('animate-pulse');
            }
        });
    },
    renderUserInfo(userData) {
        this.removeSkeletonState();
        this.renderAvatar(userData.avatar, userData.name);
        this.renderPendant(userData.pendant);
        const nameEl = DOM.get('name');
        const levelEl = DOM.get('level');
        const signEl = DOM.get('sign');
        const linkEl = DOM.get('link');
        if (nameEl) nameEl.textContent = userData.name;
        if (levelEl) levelEl.textContent = `LV.${userData.level}`;
        if (signEl) signEl.textContent = userData.sign;
        if (linkEl) linkEl.href = `https://space.bilibili.com/${userData.uid}`;
        ['fans', 'follow', 'video', 'like'].forEach(key => {
            const el = DOM.get(key);
            if (el) el.textContent = Utils.formatNumber(userData[key]);
        });
        this.renderSexIcon(userData.sex);
        this.renderVipStatus(userData.vip);
    },
    async renderAvatar(avatarUrl, userName) {
        const avatarEl = DOM.get('avatar');
        if (!avatarEl) return;
        avatarEl.style.transition = 'opacity 0.5s ease-in-out';
        avatarEl.style.opacity = '0';
        const proxyAvatarUrl = Utils.getProxyAvatarUrl(avatarUrl);
        try {
            await Utils.loadImageWithTimeout(proxyAvatarUrl, 20000);
            avatarEl.src = proxyAvatarUrl;
            avatarEl.alt = `${userName}的B站头像`;
            setTimeout(() => {
                avatarEl.style.opacity = '1';
            }, 10);
        } catch (error) {
            console.warn('头像加载失败（原因：', error.message, '），使用默认头像');
            avatarEl.src = CONFIG.PLACEHOLDERS.defaultAvatar;
            avatarEl.alt = '默认头像';
            setTimeout(() => {
                avatarEl.style.opacity = '1';
            }, 10);
        }
    },
    renderPendant(pendantUrl) {
        const pendantEl = DOM.get('pendant');
        if (!pendantEl) return;
        if (!pendantUrl) {
            pendantEl.classList.add('hidden');
            return;
        }
        const proxy = Utils.getProxyAvatarUrl(pendantUrl);
        // 尝试代理加载，失败则回退原地址
        Utils.loadImageWithTimeout(proxy, 20000)
            .then(() => {
                pendantEl.src = proxy;
                pendantEl.classList.remove('hidden');
            })
            .catch(err => {
                console.warn('挂件代理加载失败，尝试直连：', err.message);
                Utils.loadImageWithTimeout(pendantUrl, 20000)
                    .then(() => {
                        pendantEl.src = pendantUrl;
                        pendantEl.classList.remove('hidden');
                    })
                    .catch(err2 => {
                        console.warn('挂件直连失败：', err2.message);
                        pendantEl.classList.add('hidden');
                    });
            });
    },

    renderSexIcon(sex) {
        const sexEl = DOM.get('sex');
        if (!sexEl) return;
        sexEl.innerHTML = '';
        const icon = document.createElement('i');
        switch (sex) {
            case '男':
                icon.className = 'fa fa-mars text-blue-500';
                break;
            case '女':
                icon.className = 'fa fa-venus text-pink-500';
                break;
            default:
                icon.className = 'fa fa-question-circle text-gray-500';
        }
        sexEl.appendChild(icon);
    },
    renderVipStatus(vipInfo) {
        const vipEl = DOM.get('vip');
        if (!vipEl) return;
        vipEl.innerHTML = '';
        if (vipInfo.status === 1) {
            const vipIcon = document.createElement('span');
            if (vipInfo.type === 2) {
                vipIcon.className = 'text-red-500';
                vipIcon.innerHTML = '<i class="fa fa-crown text-lg"></i> 大会员';
            } else {
                vipIcon.className = 'text-green-500';
                vipIcon.innerHTML = '<i class="fa fa-diamond text-lg"></i> 会员';
            }
            vipEl.appendChild(vipIcon);
        } else {
            vipEl.textContent = '非会员';
            vipEl.className = 'text-gray-500';
        }
    },
    renderErrorState(message = '获取信息失败') {
        this.removeSkeletonState();
        const nameEl = DOM.get('name');
        const signEl = DOM.get('sign');
        if (nameEl) nameEl.textContent = message;
        if (signEl) signEl.textContent = '请稍后重试';
    }
};

// ========== 懒加载逻辑（不变） ==========
const LazyLoader = {
    init() {
        const cardEl = DOM.get('card');
        if (!cardEl) {
            console.warn('目标元素不存在，直接加载数据');
            this.loadUserData();
            return;
        }
        UIRenderer.setSkeletonState();
        if ('IntersectionObserver' in window) {
            this.setupObserver(cardEl);
        } else {
            this.loadUserData();
        }
    },
    setupObserver(target) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadUserData();
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px 200px 0px',
            threshold: 0.1
        });
        observer.observe(target);
    },
    async loadUserData() {
        try {
            const userData = await ApiService.fetchBiliUserInfo(CONFIG.DEFAULT_UID);
            UIRenderer.renderUserInfo(userData);
        } catch (error) {
            UIRenderer.renderErrorState(error.message);
        }
    }
};

// ========== 初始化（不变） ==========
document.addEventListener('DOMContentLoaded', () => {
    DOM.init();
    LazyLoader.init();
});

// ========== 暴露全局方法（不变） ==========
window.BiliUserCard = {
    reload: () => LazyLoader.loadUserData(),
    loadByUid: (uid) => ApiService.fetchBiliUserInfo(uid).then(UIRenderer.renderUserInfo),
    setSkeleton: () => UIRenderer.setSkeletonState(),
    setAvatar: (url) => UIRenderer.renderAvatar(url, '测试用户')
};