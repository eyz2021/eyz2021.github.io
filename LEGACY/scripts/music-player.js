// 创建音频元素
const audio = new Audio();

// 获取DOM元素
const musicPlayer = document.getElementById('musicPlayer');
const musicPlayPause = document.getElementById('musicPlayPause');
const musicProgress = document.getElementById('musicProgress');
const musicVolume = document.getElementById('musicVolume');
const currentTime = document.getElementById('currentTime');
const totalTime = document.getElementById('totalTime');
const songTitle = document.getElementById('songTitle');
const songArtist = document.getElementById('songArtist');
const albumCover = document.getElementById('albumCover');
const prevSong = document.getElementById('prevSong');
const nextSong = document.getElementById('nextSong');
const volumeToggle = document.getElementById('volumeToggle');
const musicListToggle = document.getElementById('musicListToggle');
const closeMusicList = document.getElementById('closeMusicList');
const musicList = document.getElementById('musicList');
const playlistItems = document.getElementById('playlistItems');
const playMode = document.getElementById('playMode');

// 音乐文件列表 - 手动列出musics目录下的所有音乐文件
const musicFiles = [
    'musics/COP,乐正绫 - 碎梦(short ver).mp3',
    'musics/ChiliChill,洛天依Official - 我的悲伤是水做的.mp3',
    'musics/PoKeR,洛天依Official - 歪歪？.mp3',
    'musics/WOVOP,乐正绫 - 我们会在阳光下再次相拥.mp3',
    'musics/WOVOP,乐正绫 - 旧时约.mp3',
    'musics/WOVOP,洛天依 - 淋完这场雨就忘记你吧.mp3',
    'musics/WOVOP,洛天依 - 致我们梦想的舞台.mp3',
    'musics/乐正绫,COP - 世末歌者.mp3',
    'musics/乐正绫,Soda纯白,洛天依Official - 白石溪.mp3',
    'musics/夜踊_Yoodori,洛天依 - 情绪未响应.mp3',
    'musics/洛天依Official - 无夏之城.mp3',
    'musics/洛天依Official - 礼物.mp3',
    'musics/洛天依Official,ilem - 勾指起誓.mp3',
    'musics/洛天依Official,乐正绫 - 霜雪千年 (官方重置版).mp3',
    'musics/清风最梦,洛天依Official - 再次相遇.mp3',
    'musics/莫默OwO,洛天依 - 世末积雨云 洛天依v3.mp3',
    'musics/著小生zoki,洛天依Official - 【洛天依】影子小姐.mp3',
    'musics/闹闹丶,FFF君,欧Ωhm - 老街北.mp3',
    'musics/阿良良木健,洛天依 - iloveu.mp3',
    'musics/阿良良木健,洛天依 - 夏感交响.mp3'
];

// 解析歌曲信息
const parseSongInfo = (fileName) => {
    // 提取文件名（去掉路径）
    const baseName = fileName.split('/').pop();
    // 去掉扩展名
    const nameWithoutExt = baseName.replace(/\.mp3$/, '');
    // 尝试解析歌手和歌曲名
    const parts = nameWithoutExt.split(' - ');
    if (parts.length === 2) {
        return {
            artist: parts[0],
            title: parts[1]
        };
    }
    return {
        artist: 'Unknown',
        title: nameWithoutExt
    };
};

// 播放模式：0-循环播放，1-随机播放，2-单曲循环
let playModeValue = 0;
// 当前播放索引
let currentIndex = 0;
// 当前音量
let currentVolume = 0.7;
// 是否静音
let isMuted = false;

// 设置初始音量
audio.volume = currentVolume;

// 播放指定索引的歌曲
function playSong(index) {
    if (index >= 0 && index < musicFiles.length) {
        currentIndex = index;
        const musicFile = musicFiles[index];
        
        // 对文件路径进行URL编码，解决包含中文字符和特殊字符的文件加载问题
audio.src = encodeURI(musicFile);
        
        // 更新歌曲信息
        const songInfo = parseSongInfo(musicFile);
        songTitle.textContent = songInfo.title;
        songArtist.textContent = songInfo.artist;
        
        // 更新播放列表选中状态
        updatePlaylistSelection();
        
        // 自动播放并处理错误
audio.play().catch(error => {
            console.error('播放音乐时出错:', error);
            // 错误处理已在audio的error事件监听器中统一处理
            musicPlayPause.innerHTML = '<i class="fa fa-play"></i>';
            // 停止CD旋转
            document.querySelector('.music-icon').classList.remove('playing');
        });
        musicPlayPause.innerHTML = '<i class="fa fa-pause"></i>';
        // 开始CD旋转
        document.querySelector('.music-icon').classList.add('playing');
    }
}

// 更新播放列表选中状态
function updatePlaylistSelection() {
    const items = playlistItems.querySelectorAll('li');
    items.forEach((item, index) => {
        if (index === currentIndex) {
            item.classList.add('bg-gray-800');
        } else {
            item.classList.remove('bg-gray-800');
        }
    });
}

// 创建播放列表
function createPlaylist() {
    playlistItems.innerHTML = '';
    
    // 为每首歌曲获取时长信息
    const getSongDuration = (filePath) => {
        return new Promise((resolve) => {
            const tempAudio = new Audio();
            tempAudio.preload = 'metadata';
            
            tempAudio.addEventListener('loadedmetadata', () => {
                tempAudio.remove(); // 加载完成后移除临时音频元素
                if (!isNaN(tempAudio.duration)) {
                    resolve(formatTime(tempAudio.duration));
                } else {
                    resolve('--:--');
                }
            });
            
            tempAudio.addEventListener('error', () => {
                tempAudio.remove();
                resolve('--:--');
            });
            
            // 对文件路径进行URL编码，解决包含中文字符和特殊字符的文件加载问题
            tempAudio.src = encodeURI(filePath);
        });
    };
    
    // 为每首歌曲创建列表项并异步获取时长
    musicFiles.forEach(async (file, index) => {
        const songInfo = parseSongInfo(file);
        const li = document.createElement('li');
        li.className = 'py-2 px-3 hover:bg-gray-800 transition-colors cursor-pointer';
        
        // 先显示默认时长，稍后更新
        li.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <div class="text-sm font-medium">${songInfo.title}</div>
                    <div class="text-xs text-gray-400">${songInfo.artist}</div>
                </div>
                <span class="text-xs text-gray-500 duration-span">--:--</span>
            </div>
        `;
        
        li.addEventListener('click', () => playSong(index));
        playlistItems.appendChild(li);
        
        // 异步获取并更新时长
        try {
            const duration = await getSongDuration(file);
            const durationSpan = li.querySelector('.duration-span');
            if (durationSpan) {
                durationSpan.textContent = duration;
            }
        } catch (error) {
            console.error('获取歌曲时长失败:', error);
        }
    });
}

// 播放/暂停按钮点击事件
musicPlayPause.addEventListener('click', () => {
    if (audio.paused) {
        if (!audio.src) {
            // 如果还没有加载歌曲，则播放第一首
            playSong(0);
        } else {
            audio.play().catch(error => console.error('播放音乐时出错:', error));
            musicPlayPause.innerHTML = '<i class="fa fa-pause"></i>';
            // 开始CD旋转
            document.querySelector('.music-icon').classList.add('playing');
        }
    } else {
        audio.pause();
        musicPlayPause.innerHTML = '<i class="fa fa-play"></i>';
        // 停止CD旋转
        document.querySelector('.music-icon').classList.remove('playing');
    }
});

// 上一曲按钮点击事件
prevSong.addEventListener('click', () => {
    if (playModeValue === 1) {
        // 随机播放模式
        const randomIndex = Math.floor(Math.random() * musicFiles.length);
        playSong(randomIndex);
    } else {
        // 正常模式
        playSong((currentIndex - 1 + musicFiles.length) % musicFiles.length);
    }
});

// 下一曲按钮点击事件
nextSong.addEventListener('click', () => {
    if (playModeValue === 1) {
        // 随机播放模式
        const randomIndex = Math.floor(Math.random() * musicFiles.length);
        playSong(randomIndex);
    } else {
        // 正常模式
        playSong((currentIndex + 1) % musicFiles.length);
    }
});

// 播放模式切换
playMode.addEventListener('click', () => {
    playModeValue = (playModeValue + 1) % 3;
    switch (playModeValue) {
        case 0: // 顺序播放
            playMode.innerHTML = '<i class="fa fa-list-ol"></i>';
            break;
        case 1: // 随机播放
            playMode.innerHTML = '<i class="fa fa-random"></i>';
            break;
        case 2: // 单曲循环
            playMode.innerHTML = '<i class="fa fa-repeat"></i>';
            break;
    }
});

// 音量切换
volumeToggle.addEventListener('click', () => {
    isMuted = !isMuted;
    audio.muted = isMuted;
    if (isMuted) {
        volumeToggle.innerHTML = '<i class="fa fa-volume-off"></i>';
    } else {
        volumeToggle.innerHTML = '<i class="fa fa-volume-up"></i>';
    }
});

// 播放列表显示/隐藏 - 确保播放器先显示
musicListToggle.addEventListener('click', () => {
    if (!isPlayerVisible) {
        showPlayer();
    }
    musicList.classList.toggle('hidden');
});

closeMusicList.addEventListener('click', () => {
    musicList.classList.add('hidden');
});

// 音频元数据加载完成后更新总时长
audio.addEventListener('loadedmetadata', () => {
    if (!isNaN(audio.duration)) {
        totalTime.textContent = formatTime(audio.duration);
    }
});

// 音频播放位置更新时更新进度条
audio.addEventListener('timeupdate', () => {
    if (!isNaN(audio.duration)) {
        const progress = (audio.currentTime / audio.duration) * 100;
        musicProgress.style.width = progress + '%';
        currentTime.textContent = formatTime(audio.currentTime);
    }
});

// 音频播放结束时
audio.addEventListener('ended', () => {
    if (playModeValue === 2) {
        // 单曲循环
audio.currentTime = 0;
        audio.play().catch(error => {
            console.error('单曲循环播放时出错:', error);
            setTimeout(() => nextSong.click(), 1000);
        });
    } else {
        // 循环播放或随机播放
        nextSong.click();
    }
});

// 添加错误事件监听器
audio.addEventListener('error', (event) => {
    console.error('音频加载错误:', event);
    // 显示加载错误提示
    songTitle.textContent = '加载失败';
    songArtist.textContent = '尝试下一首';
    // 延迟后尝试下一首
    setTimeout(() => nextSong.click(), 1500);
});

// 获取滑块元素
const musicProgressHandle = document.getElementById('musicProgressHandle');
const musicVolumeHandle = document.getElementById('musicVolumeHandle');
let isDraggingProgress = false;
let isDraggingVolume = false;

// 进度条事件处理
function updateProgressBar(pos) {
    if (!isNaN(audio.duration)) {
        audio.currentTime = pos * audio.duration;
        musicProgress.style.width = (pos * 100) + '%';
        updateProgressHandlePosition(pos);
    }
}

function updateProgressHandlePosition(pos) {
    musicProgressHandle.style.left = (pos * 100) + '%';
    musicProgressHandle.style.transform = 'translate(-50%, -50%)';
}

// 音量条事件处理
function updateVolumeBar(pos) {
    currentVolume = Math.max(0, Math.min(1, pos));
    audio.volume = currentVolume;
    musicVolume.style.width = (currentVolume * 100) + '%';
    updateVolumeHandlePosition(pos);
    
    // 如果当前是静音状态，取消静音
    if (isMuted) {
        isMuted = false;
        audio.muted = false;
        volumeToggle.innerHTML = '<i class="fa fa-volume-up"></i>';
    }
}

function updateVolumeHandlePosition(pos) {
    musicVolumeHandle.style.left = (pos * 100) + '%';
    musicVolumeHandle.style.transform = 'translate(-50%, -50%)';
}

// 进度条点击事件
musicProgress.parentElement.addEventListener('click', (e) => {
    if (!isDraggingProgress && !isDraggingVolume) {
        const rect = musicProgress.parentElement.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        updateProgressBar(pos);
    }
});

// 音量条点击事件
musicVolume.parentElement.addEventListener('click', (e) => {
    if (!isDraggingProgress && !isDraggingVolume) {
        const rect = musicVolume.parentElement.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        updateVolumeBar(pos);
    }
});

// 进度条拖动事件
musicProgress.parentElement.addEventListener('mousedown', (e) => {
    isDraggingProgress = true;
    musicProgressHandle.style.opacity = '1';
    
    const rect = musicProgress.parentElement.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    updateProgressBar(pos);
    
    // 阻止默认行为，避免选中文本
    e.preventDefault();
});

// 音量条拖动事件
musicVolume.parentElement.addEventListener('mousedown', (e) => {
    isDraggingVolume = true;
    musicVolumeHandle.style.opacity = '1';
    
    const rect = musicVolume.parentElement.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    updateVolumeBar(pos);
    
    // 阻止默认行为，避免选中文本
    e.preventDefault();
});

// 全局鼠标移动事件处理拖动
document.addEventListener('mousemove', (e) => {
    if (isDraggingProgress) {
        const rect = musicProgress.parentElement.getBoundingClientRect();
        let pos = (e.clientX - rect.left) / rect.width;
        // 限制在0-1范围内
        pos = Math.max(0, Math.min(1, pos));
        updateProgressBar(pos);
    } else if (isDraggingVolume) {
        const rect = musicVolume.parentElement.getBoundingClientRect();
        let pos = (e.clientX - rect.left) / rect.width;
        // 限制在0-1范围内
        pos = Math.max(0, Math.min(1, pos));
        updateVolumeBar(pos);
    }
});

// 全局鼠标释放事件结束拖动
document.addEventListener('mouseup', () => {
    if (isDraggingProgress) {
        isDraggingProgress = false;
        // 鼠标悬停时再显示滑块
        setTimeout(() => {
            if (!isHoveringProgress) {
                musicProgressHandle.style.opacity = '0';
            }
        }, 300);
    } else if (isDraggingVolume) {
        isDraggingVolume = false;
        // 鼠标悬停时再显示滑块
        setTimeout(() => {
            if (!isHoveringVolume) {
                musicVolumeHandle.style.opacity = '0';
            }
        }, 300);
    }
});

// 鼠标悬停事件，显示滑块
let isHoveringProgress = false;
let isHoveringVolume = false;

musicProgress.parentElement.addEventListener('mouseenter', () => {
    isHoveringProgress = true;
    musicProgressHandle.style.opacity = '1';
});

musicProgress.parentElement.addEventListener('mouseleave', () => {
    isHoveringProgress = false;
    if (!isDraggingProgress) {
        musicProgressHandle.style.opacity = '0';
    }
});

musicVolume.parentElement.addEventListener('mouseenter', () => {
    isHoveringVolume = true;
    musicVolumeHandle.style.opacity = '1';
});

musicVolume.parentElement.addEventListener('mouseleave', () => {
    isHoveringVolume = false;
    if (!isDraggingVolume) {
        musicVolumeHandle.style.opacity = '0';
    }
});

// 初始化滑块位置
updateProgressHandlePosition(0);
updateVolumeHandlePosition(currentVolume);

// 格式化时间
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 初始化播放列表
createPlaylist();

// 播放器焦点隐藏功能实现
let isPlayerVisible = false;
const bottomSensitivityArea = 50; // 底部敏感区域高度（像素）- 已减小20px
let hideTimer = null; // 隐藏播放器的定时器

// 确保播放器默认是隐藏的
musicPlayer.style.transform = 'translate(-50%, 100%)';

// 显示播放器
function showPlayer() {
    // 清除之前的隐藏定时器
    if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
    }
    
    if (!isPlayerVisible) {
        musicPlayer.style.transform = 'translate(-50%, 0)';
        isPlayerVisible = true;
        // 显示时重置播放列表的位置
        if (!musicList.classList.contains('hidden')) {
            musicList.style.bottom = '90px';
        }
    }
}

// 隐藏播放器到底部
function hidePlayer() {
    if (isPlayerVisible) {
        musicPlayer.style.transform = 'translate(-50%, 100%)';
        isPlayerVisible = false;
        // 隐藏时也要隐藏播放列表
        if (!musicList.classList.contains('hidden')) {
            musicList.classList.add('hidden');
        }
    }
}

// 创建鼠标跟踪函数，只在鼠标精确悬浮在播放器位置时显示
function trackMousePosition(e) {
    // 获取播放器应该出现的位置区域
    const rect = musicPlayer.getBoundingClientRect();
    const playerAreaWidth = 300; // 播放器区域宽度（像素）
    const playerAreaHeight = bottomSensitivityArea; // 播放器区域高度
    
    // 计算播放器应该出现的精确位置（底部中央）
    const playerCenterX = window.innerWidth / 2;
    const playerLeft = playerCenterX - playerAreaWidth / 2;
    const playerRight = playerCenterX + playerAreaWidth / 2;
    const playerBottom = window.innerHeight;
    const playerTop = playerBottom - playerAreaHeight;
    
    // 检查鼠标是否精确位于播放器应该出现的位置
    const isOverPlayerPosition = e.clientX >= playerLeft && 
                                e.clientX <= playerRight && 
                                e.clientY >= playerTop && 
                                e.clientY <= playerBottom;
    
    if (isOverPlayerPosition && !isPlayerVisible) {
        // 如果鼠标在播放器应该出现的位置且播放器当前是隐藏的，则显示播放器
        showPlayer();
    }
}

// 为播放器添加鼠标进入事件，清除隐藏定时器
musicPlayer.addEventListener('mouseenter', function() {
    if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
    }
});

// 为播放器添加鼠标离开事件
musicPlayer.addEventListener('mouseleave', function() {
    // 清除之前的定时器（如果有）
    if (hideTimer) {
        clearTimeout(hideTimer);
    }
    
    // 延迟一小段时间，让用户有时间将鼠标移回播放器
    hideTimer = setTimeout(() => {
        // 直接检查鼠标位置，不再依赖mousemove事件
        const rect = musicPlayer.getBoundingClientRect();
        const x = window.event?.clientX || 0;
        const y = window.event?.clientY || 0;
        
        // 如果播放列表是打开的，则不隐藏播放器
        if (musicList.classList.contains('hidden')) {
            // 检查鼠标是否在播放器区域外
            if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                hidePlayer();
            }
        }
    }, 500); // 500毫秒的延迟，给用户足够的反应时间
});

// 为播放列表添加鼠标离开事件 - 当播放列表打开时不隐藏播放器
musicList.addEventListener('mouseleave', function() {
    // 当播放列表打开时，不自动隐藏播放器
    // 用户需要手动关闭播放列表或点击其他区域
});

// 监听整个文档的鼠标移动事件
document.addEventListener('mousemove', trackMousePosition);

// 关闭播放列表时的处理
closeMusicList.addEventListener('click', function() {
    musicList.classList.add('hidden');
    // 延迟隐藏播放器，给用户足够的时间反应
    // 清除之前的定时器（如果有）
    if (hideTimer) {
        clearTimeout(hideTimer);
    }
    
    hideTimer = setTimeout(() => {
        // 检查播放列表是否真的关闭了
        if (musicList.classList.contains('hidden')) {
            hidePlayer();
        }
    }, 1000);
});