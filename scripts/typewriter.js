// 打字机效果函数 - 普通线性
// 保存初始默认字体大小，以便每次都能基于这个原始值计算
let initialDefaultFontSize = null;
// 跟踪打字状态，防止重复点击
let isTyping = false;
// 全局变量，存储当前显示的文本
let currentText = null;

function typeWriter(element, text) {
    // 如果正在打字，不允许重复触发
    if (isTyping) {
        return;
    }

    let i = 0;
    element.textContent = '';

    // 先重置字体大小为默认值，防止多次调用导致字体大小不断变小
    element.style.fontSize = '';

    // 设置为打字中状态
    isTyping = true;

    // 确保浏览器有足够时间重新计算默认样式
    // 使用setTimeout来确保样式重置生效后再计算新的字体大小
    setTimeout(() => {
        // 根据文本字数动态计算打字速度，确保总时长不超过5秒
        const maxDuration = 5000; // 最大5秒
        const minSpeed = 50; // 最小打字速度（毫秒）
        const maxSpeed = 200; // 最大打字速度（毫秒）

        // 计算合适的打字速度
        let typingSpeed = Math.min(maxDuration / text.length, maxSpeed);
        typingSpeed = Math.max(typingSpeed, minSpeed); // 确保不小于最小速度

        // 如果是第一次调用，保存初始默认字体大小
        if (!initialDefaultFontSize) {
            const computedInitial = getComputedStyle(element).fontSize;
            initialDefaultFontSize = parseFloat(computedInitial);
        }

        // 根据文本长度动态计算字体大小调整系数
        // 确保每种长度都对应不同的大小，最大字体大小保持不变
        let fontSizeAdjustment = 1;

        // 更精细的字体大小调整逻辑
        if (text.length < 10) {
            fontSizeAdjustment = 1.1; // 最短文本使用最大字体
        } else if (text.length < 20) {
            fontSizeAdjustment = 1.05; // 较短文本使用次大字体
        } else if (text.length < 30) {
            fontSizeAdjustment = 1.0; // 中等长度文本使用原始字体
        } else if (text.length < 40) {
            fontSizeAdjustment = 0.9; // 较长文本缩小一点
        } else if (text.length < 50) {
            fontSizeAdjustment = 0.7; // 长文本进一步缩小
        } else {
            fontSizeAdjustment = 0.5; // 最长文本缩小最多
        }

        // 应用字体大小调整，始终基于初始默认字体大小计算
        element.style.fontSize = (initialDefaultFontSize * fontSizeAdjustment) + 'px';

        // 使用setInterval实现打字效果
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
                // 保留调整后的字体大小，不再恢复到原始大小

                // 打字完成，重置状态
                isTyping = false;

                // 更新当前显示的文本
                if (element === document.getElementById('typed-title')) {
                    currentText = text;
                }
            }
        }, typingSpeed);
    }, 0);
}

// 页面加载完成后执行打字机效果
document.addEventListener('DOMContentLoaded', () => {
    const titleElement = document.getElementById('typed-title');
    const titleText = "Hello, world!";

    // 设置初始当前文本
    currentText = titleText;

    // 开始普通线性打字机效果
    typeWriter(titleElement, titleText);

    // 设置点击效果
    const textOptions = ["“无言。只是，我曾有一个人，如果可以的话，那是我最想带来这里、于此刻与我同行的人。“", "Hello, world!", "when nothing's going right, turn left.","知我者，谓我心忧；不知我者，谓我何求"];

    titleElement.style.cursor = 'pointer';
    titleElement.style.transition = 'all 0.3s ease';
    titleElement.style.userSelect = 'none';

    titleElement.addEventListener('mouseenter', () => {
        titleElement.style.transform = 'scale(1.02)';
    });

    titleElement.addEventListener('mouseleave', () => {
        titleElement.style.transform = 'scale(1)';
    });

    titleElement.addEventListener('click', () => {
        // 如果只有一个文本选项，直接使用
        if (textOptions.length <= 1) {
            typeWriter(titleElement, textOptions[0]);
            return;
        }

        // 随机选择文本，但确保与当前文本不同
        let randomText;
        do {
            randomText = textOptions[Math.floor(Math.random() * textOptions.length)];
        } while (randomText === currentText);

        // 重新应用打字机效果
        typeWriter(titleElement, randomText);
    });
});