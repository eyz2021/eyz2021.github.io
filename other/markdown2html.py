import os
from datetime import datetime
import math

def generate_blog_article():
    """
    根据模板生成博客文章HTML文件，自动处理日期和阅读时间，询问分类
    """
    # 获取用户输入
    title = input("请输入文章标题: ")
    category = input("请输入文章分类(如: programming, cube, minecraft, life): ")
    
    # 读取正文内容（可以从文件读取或直接输入）
    print("\n请输入文章正文内容（输入空行结束）:")
    content_lines = []
    while True:
        line = input()
        if not line:
            break
        content_lines.append(line)
    content = "\n".join(content_lines)
    
    # 自动生成日期（当前日期）
    publish_date = datetime.now().strftime("%Y-%m-%d")
    
    # 自动估算阅读时间（假设每分钟阅读300字）
    word_count = len(content.split())
    read_time = math.ceil(word_count / 300) if word_count > 0 else 1
    read_time_str = f"{read_time}分钟阅读"
    
    # 生成HTML文件名
    html_filename = f"article-{title.lower().replace(' ', '-')}.html"
    
    # 模板内容
    template = f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - eyz2021的博客</title>
    <!-- 引入外部资源 -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" rel="stylesheet">
    
    <!-- Tailwind 配置 -->
    <script>
        tailwind.config = {{
            theme: {{
                extend: {{
                    colors: {{
                        primary: '#3B82F6',
                    }},
                    fontFamily: {{
                        sans: ['Inter', 'system-ui', 'sans-serif'],
                    }},
                }}
            }}
        }}
    </script>
    
    <!-- 全局样式 -->
    <style>
        .page-background {{
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            overflow: hidden;
        }}
        
        .page-background .bg-image {{
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: blur(3px);
            transform: scale(1.02);
        }}
        
        .page-background .bg-overlay {{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.05);
        }}
        
        .blur-transparent {{
            background-color: rgba(255, 255, 255, 0.5);
            backdrop-filter: blur(6px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 4px 20px 0 rgba(31, 38, 135, 0.1);
        }}
        
        .content-container {{
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
        }}
        
        .article-content {{
            min-height: 60vh;
            line-height: 1.8;
        }}
        
        pre {{
            background-color: #f5f5f5;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin: 1rem 0;
        }}
        
        code {{
            font-family: 'Consolas', 'Monaco', monospace;
        }}
        
        img {{
            max-width: 100%;
            height: auto;
            margin: 1.5rem auto;
            display: block;
            border-radius: 0.5rem;
        }}
    </style>
</head>

<body class="bg-gray-50 min-h-screen font-sans">
    <!-- 背景图 -->
    <div class="page-background">
        <img src="../../res/bg.jpg" alt="背景图" class="bg-image">
        <div class="bg-overlay"></div>
    </div>

    <div class="content-container">
        <!-- 顶部导航条 -->
        <nav class="blur-transparent rounded-xl p-4 mb-8 flex flex-wrap justify-between items-center">
            <div class="flex items-center">
                <div class="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img src="../../res/avatar.jpg" alt="头像" class="w-full h-full object-cover">
                </div>
                <h1 class="text-xl font-bold text-gray-800">eyz2021的博客</h1>
            </div>
            
            <div class="flex space-x-6 mt-4 sm:mt-0">
                <a href="../../Blog/index.html" class="text-gray-700 hover:text-primary transition-colors flex items-center">
                    <i class="fa fa-home mr-1"></i> 首页
                </a>
                <a href="../../index.html" class="text-gray-700 hover:text-primary transition-colors flex items-center">
                    <i class="fa fa-user mr-1"></i> 关于我
                </a>
            </div>
        </nav>

        <!-- 正文内容区 -->
        <article class="blur-transparent rounded-xl p-8 article-content">
            <!-- 文章标题区域 -->
            <div class="mb-10">
                <h1 class="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
                <div class="flex items-center text-sm text-gray-500">
                    <span><i class="fa fa-calendar-o mr-1"></i> {publish_date}</span>
                    <span class="mx-3">•</span>
                    <span><i class="fa fa-clock-o mr-1"></i> {read_time_str}</span>
                    <span class="mx-3">•</span>
                    <span><i class="fa fa-tag mr-1"></i> {category}</span>
                </div>
            </div>

            <!-- 正文内容 -->
            <div class="prose max-w-none text-gray-700 space-y-6">
                {content}
            </div>
        </article>

        <!-- 页脚 -->
        <div class="mt-12 text-center text-gray-500 text-sm py-6">
            <p>© 2025 eyz2021的博客 | <a href="../../" class="text-primary hover:underline">个人名片</a></p>
        </div>
    </div>
</body>
</html>'''
    
    # 创建articles目录（如果不存在）
    if not os.path.exists('articles'):
        os.makedirs('articles')
    
    # 保存生成的HTML文件
    output_path = os.path.join('articles', html_filename)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(template)
    
    print(f"\n文章生成成功！已保存至: {output_path}")
    
    # 生成可添加到主页的元数据
    print("\n请将以下内容添加到博客主页的articlesData数组中：")
    print(f'''{{
    "htmlFile": "{html_filename}",
    "title": "{title}",
    "excerpt": "请添加文章摘要...",
    "category": "{category}",
    "date": "{publish_date}",
    "readTime": "{read_time_str}",
    "image": "请替换为文章图片文件名.jpg"
}}''')

if __name__ == "__main__":
    generate_blog_article()
