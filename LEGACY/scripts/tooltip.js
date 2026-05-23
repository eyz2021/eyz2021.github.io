// 获取元素
// 获取所有的tooltip容器
const tooltipContainers = document.querySelectorAll('.tooltip-container');

// 为每个tooltip容器添加事件监听器
tooltipContainers.forEach(container => {
    let delayTimer;
    
    // 找到容器内的tooltip元素
    const tooltip = container.querySelector('.tooltip');
    
    if (tooltip) {
        // 鼠标进入 - 延迟显示提示
        container.addEventListener('mouseenter', () => {
            // 设置500ms延迟显示（可调整时间）
            delayTimer = setTimeout(() => {
                tooltip.classList.add('show');
            }, 500);
        });

        // 鼠标离开 - 立即隐藏提示并清除计时器
        container.addEventListener('mouseleave', () => {
            clearTimeout(delayTimer);
            tooltip.classList.remove('show');
        });
    }
});
