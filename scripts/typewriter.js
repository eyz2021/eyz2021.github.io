// 打字机效果函数 - 普通线性
function typeWriter(element, text) {
    let i = 0;
    element.textContent = '';
    
    // 定义固定的打字速度（毫秒）
    const typingSpeed = 200;
    
    // 使用setInterval实现固定速度的打字效果
    const typeInterval = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(typeInterval);
        }
    }, typingSpeed);
}

// 页面加载完成后执行打字机效果
document.addEventListener('DOMContentLoaded', () => {
    const titleElement = document.getElementById('typed-title');
    const titleText = "Hello, world!";
    
    // 开始普通线性打字机效果
    typeWriter(titleElement, titleText);
});