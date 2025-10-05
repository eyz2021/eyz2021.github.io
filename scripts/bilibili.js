// 获取B站用户信息相关DOM
const biliAvatar = document.getElementById('biliAvatar');
const biliName = document.getElementById('biliName');
const biliLevel = document.getElementById('biliLevel');
const biliSign = document.getElementById('biliSign');
const biliFans = document.getElementById('biliFans');
const biliFollow = document.getElementById('biliFollow');
const biliVideo = document.getElementById('biliVideo');
const biliLike = document.getElementById('biliLike');
const biliSex = document.getElementById('biliSex');
const biliVip = document.getElementById('biliVip');
const biliLink = document.getElementById('biliLink');
const biliCard = document.querySelector('.md\\:w-1\\/2.p-8.border-t.md\\:border-t-0.md\\:border-l.border-gray-100');

// 设置骨架屏数据
function setSkeletonState() {
    // 显示骨架屏状态
    biliAvatar.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 100 100%22%3E%3Crect width%3D%22100%25%22 height%3D%22100%25%22 fill%3D%22%23f0f0f0%22%3E%3C%2Frect%3E%3C%2Fsvg%3E';
    biliName.textContent = '加载中...';
    biliSign.textContent = '加载中...';
    biliFans.textContent = '--';
    biliFollow.textContent = '--';
    biliVideo.textContent = '--';
    biliLike.textContent = '--';
    
    // 添加骨架屏动画效果
    const skeletonElements = [biliName, biliSign, biliFans, biliFollow, biliVideo, biliLike];
    skeletonElements.forEach(el => {
        el.classList.add('animate-pulse');
    });
}

// 移除骨架屏状态
function removeSkeletonState() {
    const skeletonElements = [biliName, biliSign, biliFans, biliFollow, biliVideo, biliLike];
    skeletonElements.forEach(el => {
        el.classList.remove('animate-pulse');
    });
}

// 使用Intersection Observer实现懒加载
function setupLazyLoading() {
    if ('IntersectionObserver' in window && biliCard) {
        // 设置骨架屏
        setSkeletonState();
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 元素可见时加载数据
                    fetchBiliUserInfo('616856644');
                    // 只观察一次
                    observer.unobserve(entry.target);
                }
            });
        }, {
            // 设置根边距，让元素在进入视口前就开始加载
            rootMargin: '200px 0px',
            threshold: 0.1
        });
        
        observer.observe(biliCard);
    } else {
        // 降级处理：如果浏览器不支持Intersection Observer，则使用传统方式加载
        window.addEventListener('load', () => {
            setTimeout(() => {
                fetchBiliUserInfo('616856644');
            }, 1000);
        });
    }
}

// 页面加载完成后设置懒加载
window.addEventListener('DOMContentLoaded', setupLazyLoading);

// 获取B站用户信息
async function fetchBiliUserInfo(uid) {
    try {
        // 使用统一的CORS代理服务解决跨域问题
        const proxyUrl = 'https://api.allorigins.win/raw?url=';

        const apiUrl = 'https://api.bilibili.com/x/web-interface/card';
        const response = await fetch(
            `${proxyUrl}${encodeURIComponent(apiUrl + '?mid=' + uid + '&jsonp=jsonp&extra=true')}`,
            {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0 Safari/537.36',
                    'Referer': 'https://www.bilibili.com/'
                }
            }
        );

        const result = await response.json();

        if (result.code !== 0) {
            throw new Error(result.message || '获取B站用户信息失败');
        }

        // 提取并渲染用户数据
        const data = result.data;
        const card = data.card;

        renderBiliUserInfo({
            uid: card.mid,
            name: card.name,
            avatar: card.face,
            level: card.level_info.current_level,
            sign: card.sign || '未设置签名',
            sex: card.sex || '未知',
            fans: card.fans || 0,
            follow: card.attention || 0,
            video: data.archive_count || 0,
            like: data.like_num || 0,
            vip: {
                type: card.vip.type,
                status: card.vip.status
            }
        });

    } catch (err) {
        console.error('获取B站用户信息出错:', err);
        biliName.textContent = '获取信息失败';
    }
}

// 渲染B站用户信息
function renderBiliUserInfo(user) {
    // 移除骨架屏状态
    removeSkeletonState();
    
    // 设置头像（通过代理加载，添加加载动画和错误处理）
    // 使用另一个更可靠的CORS代理服务
    const proxy = 'https://api.allorigins.win/raw?url=';
    const tempImg = new Image();
    
    // 先设置过渡效果和初始透明度
    biliAvatar.style.transition = 'opacity 0.5s ease-in-out';
    biliAvatar.style.opacity = '0';
    
    tempImg.onload = function() {
        // 头像加载完成后再显示，避免闪烁
        biliAvatar.src = this.src;
        biliAvatar.alt = `${user.name}的B站头像`;
        // 使用setTimeout确保图片源设置完成后再显示
        setTimeout(() => {
            biliAvatar.style.opacity = '1';
        }, 10);
    };
    
    tempImg.onerror = function() {
        // 头像加载失败时显示默认头像
        biliAvatar.src = 'res/avatar.jpg';
        biliAvatar.alt = '默认头像';
        setTimeout(() => {
            biliAvatar.style.opacity = '1';
        }, 10);
        console.warn('B站头像加载失败，使用默认头像');
    };
    
    tempImg.src = proxy + encodeURIComponent(user.avatar);

    // 基础信息
    biliName.textContent = user.name;
    biliLevel.textContent = `LV.${user.level}`;
    biliSign.textContent = user.sign;

    // 统计数据（格式化大数字）
    biliFans.textContent = formatNumber(user.fans);
    biliFollow.textContent = formatNumber(user.follow);
    biliVideo.textContent = formatNumber(user.video);
    biliLike.textContent = formatNumber(user.like);

    // 性别信息
    biliSex.textContent = user.sex === '男' ? '男性' : user.sex === '女' ? '女性' : '未知';

    // 会员状态
    if (user.vip.status === 1) {
        biliVip.innerHTML = user.vip.type === 2
            ? '<span class="text-orange-500 font-medium">大会员</span>'
            : '<span class="text-bili-pink font-medium">普通会员</span>';
    } else {
        biliVip.textContent = '非会员';
    }

    // 空间链接
    biliLink.href = `https://space.bilibili.com/${user.uid}`;
}

// 格式化数字（1000→1k，10000→1w）
function formatNumber(num) {
    if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿';
    if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
}