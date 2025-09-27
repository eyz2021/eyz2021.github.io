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

// 延迟获取B站用户信息，让页面先渲染完成
window.addEventListener('load', () => {
    // 再延迟1秒执行，确保页面其他元素完全加载
    setTimeout(() => {
        fetchBiliUserInfo('616856644');
    }, 1000);
});

// 获取B站用户信息
async function fetchBiliUserInfo(uid) {
    try {
        // 使用CORS代理解决跨域问题
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
    // 设置头像（通过代理加载）
    const proxy = 'https://corsproxy.io/';
    biliAvatar.src = proxy + user.avatar;
    biliAvatar.alt = `${user.name}的B站头像`;

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