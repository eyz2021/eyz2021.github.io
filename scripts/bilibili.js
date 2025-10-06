// 获取B站用户信息和头像
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
                    fetchBiliUserInfo(616856644);
                    // 停止观察
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px 200px 0px' // 提前200px触发
        });
        
        observer.observe(biliCard);
    } else if (biliCard) {
        // 降级方案：直接加载
        setSkeletonState();
        fetchBiliUserInfo(405997794);
    }
}

// 页面加载完成后设置懒加载
window.addEventListener('DOMContentLoaded', setupLazyLoading);

// 获取B站用户信息
async function fetchBiliUserInfo(uid) {
    try {
        // 使用更可靠的CORS代理服务解决跨域问题
        const proxyUrl = 'https://corsproxy.io/';

        const apiUrl = 'https://api.bilibili.com/x/web-interface/card';
        const response = await fetch(
            `${proxyUrl}${apiUrl}?mid=${uid}&jsonp=jsonp&extra=true`,
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
    // 使用统一的CORS代理服务
    const proxy = 'https://corsproxy.io/';
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
    
    tempImg.src = proxy + user.avatar;

    // 基础信息
    biliName.textContent = user.name;
    biliLevel.textContent = `LV.${user.level}`;
    biliSign.textContent = user.sign;

    // 统计数据（格式化大数字）
    biliFans.textContent = formatNumber(user.fans);
    biliFollow.textContent = formatNumber(user.follow);
    biliVideo.textContent = formatNumber(user.video);
    biliLike.textContent = formatNumber(user.like);

    // 性别图标
    biliSex.textContent = '';
    const sexIcon = document.createElement('i');
    if (user.sex === '男') {
        sexIcon.className = 'fa fa-mars text-blue-500';
    } else if (user.sex === '女') {
        sexIcon.className = 'fa fa-venus text-pink-500';
    } else {
        sexIcon.className = 'fa fa-question-circle text-gray-500';
    }
    biliSex.appendChild(sexIcon);

    // VIP状态
    biliVip.textContent = '';
    if (user.vip.status === 1) {
        const vipIcon = document.createElement('span');
        if (user.vip.type === 2) {
            vipIcon.className = 'text-red-500';
            vipIcon.innerHTML = '<i class="fa fa-crown text-lg"></i> 大会员';
        } else {
            vipIcon.className = 'text-green-500';
            vipIcon.innerHTML = '<i class="fa fa-diamond text-lg"></i> 会员';
        }
        biliVip.appendChild(vipIcon);
    } else {
        biliVip.textContent = '非会员';
        biliVip.className = 'text-gray-500';
    }

    // 设置链接
    biliLink.href = `https://space.bilibili.com/${user.uid}`;
}

// 格式化大数字
function formatNumber(num) {
    if (num >= 100000000) {
        return (num / 100000000).toFixed(1) + '亿';
    } else if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    } else {
        return num.toString();
    }
}