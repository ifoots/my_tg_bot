const express = require('express');
const app = express();

// 404 页面内容（和原网站一样）
const notFoundHtml = `
<!DOCTYPE html>
<html>
<head>
<title>404 Not Found</title>
</head>
<body>
<center><h1>404 Not Found</h1></center>
<hr>
<center>nginx</center>
<script defer src="https://static.cloudflareinsights.com/beacon.min.js/9e2f649f59d84f8e811820c9bcc335ba" integrity="sha512-ZpsOmlRQV6y907TI0dKBHq9Md29nnaEIPlkf84rnaERnq6zvWvPUqr2ft8M1aS28oN72PdrCzSjY4U6VaAw1EQ==" data-cf-beacon='{"version":"2024.11.0","token":"9e2f649f59d84f8e811820c9bcc335ba","r":1,"server_timing":{"name":{"cfCacheStatus":true,"cfEdge":true,"cfExtPri":true,"cfL4":true,"cfOrigin":true,"cfSpeedBrain":true},"location_startswith":null}}' crossorigin="anonymous"></script>
</body>
</html>
`;

// =============================================
// 群组配置（只存名称和邀请码，提示统一处理）
// =============================================
const groups = {
  'chat': {
    name: '『新』大学生反差私密群',
    inviteCode: 'AuPJqZDiCFdlN2Vh'  // ← 替换成你的真实邀请码
  },
  'saolou': {
    name: '扫楼打胶共享',
    inviteCode: '2TskoPhkURkwMWE5'
  },
  'default': {
    name: '夜半客',
    inviteCode: '0X28B1v7veI0MjMx'
  }
};

// =============================================
// 主路由：匹配 /chat、/saolou、/ 等
// =============================================
app.get('/:path?', (req, res) => {
  const path = req.params.path;
  
// 根路径 / 或路径为空 → 返回 404
  if (!path) {
    return res.status(404).send(notFoundHtml);
  }

  const group = groups[path];

  // 不存在的路径也返回 404
  if (!group) {
    return res.status(404).send(notFoundHtml);
  }

  const ua = req.headers['user-agent'] || '';
  const isAndroid = /android/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isMobile = isAndroid || isIOS;

  // 桌面/PC：直接 302 重定向到 https://t.me/+
  if (!isMobile) {
    const httpsLink = `https://t.me/+${group.inviteCode}`;
    return res.redirect(302, httpsLink);
  }

  // 移动端：tg://join?invite=xxxxxx 并 Base64 编码
  const tgLink = `tg://join?invite=${group.inviteCode}`;
  const encodedLink = Buffer.from(tgLink).toString('base64');

  // 根据设备生成提示（统一逻辑）
  let deviceTipHtml = '';

  if (isAndroid) {
    deviceTipHtml = `
      <div class="device-tip info">
        <strong>🤖 安卓用户必读：</strong><br>
        如无法查看色情消息，<a href="https://t.me/ym_ass/19" target="_blank">点击查看开启R18配置方法 &gt;&gt;</a>
      </div>
    `;
  } else if (isIOS) {
    deviceTipHtml = `
      <div class="device-tip warning">
        <strong>🍎 iOS 用户必读：</strong><br>
        如群组被限制无法查看，<a href="https://t.me/ym_ass/19" target="_blank">点击查看解除限制教程 &gt;&gt;</a>
      </div>
    `;
  } else {
    deviceTipHtml = `
      <div class="device-tip info">
        <strong>提示：</strong><br>
        推荐使用 Telegram 官方 App 加入群组。
      </div>
    `;
  }

  // 完整 HTML 模板
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>${group.name}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<meta property="og:title" content="${group.name}">
<meta property="og:description" content="View in Telegram">
<meta property="og:image" content="https://telegram.org/img/t_logo.png">
<link rel="icon" type="image/png" href="https://telegram.org/img/website_icon.svg">
<style>
:root {
  --bg-color: #17212b;
  --card-bg: #242f3d;
  --text-primary: #ffffff;
  --text-secondary: #7e8c9d;
  --accent-color: #5288c1;
  --warning-bg: #3f2e2e;
  --warning-text: #ff6b6b;
  --info-bg: #2b3847;
  --info-text: #64b5f6;
}
body {
  margin: 0; padding: 0;
  background-color: var(--bg-color);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, "Roboto", "Helvetica Neue", sans-serif;
  display: flex; justify-content: center; align-items: center;
  min-height: 100vh;
}
.container {
  text-align: center; max-width: 420px; width: 90%;
  padding: 30px 20px;
}
.tg-logo {
  width: 80px; height: 80px;
  background-color: var(--accent-color);
  border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}
.tg-logo svg { width: 42px; height: 42px; fill: white; transform: translateX(-2px); }
h1 { font-size: 22px; font-weight: 600; margin: 0 0 12px 0; letter-spacing: 0.5px; }
.desc {
  color: var(--text-secondary);
  font-size: 15px; line-height: 1.6; margin: 0 0 25px;
}
.desc a { color: var(--accent-color); text-decoration: none; }
.device-tip {
  font-size: 13px; text-align: left; padding: 12px 15px;
  border-radius: 8px; margin-bottom: 25px; line-height: 1.5;
}
.device-tip a { font-weight: bold; text-decoration: underline; }
.device-tip.warning { background: var(--warning-bg); color: var(--warning-text); border: 1px solid rgba(255,107,107,0.2); }
.device-tip.warning a { color: var(--warning-text); }
.device-tip.info { background: var(--info-bg); color: var(--info-text); border: 1px solid rgba(100,181,246,0.2); }
.device-tip.info a { color: var(--info-text); }
.btn {
  display: flex; align-items: center; justify-content: center;
  width: 100%;
  background-color: var(--accent-color);
  color: white;
  text-decoration: none;
  padding: 16px 0;
  border-radius: 12px;
  font-weight: 600; font-size: 17px;
  border: none; cursor: pointer;
  transition: transform 0.1s, opacity 0.2s;
  box-shadow: 0 4px 12px rgba(82, 136, 193, 0.3);
  position: relative;
}
.btn:active { transform: scale(0.98); opacity: 0.9; }
.spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 10px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.footer-note { margin-top: 20px; font-size: 13px; color: #536375; }
</style>
<script>
window.onload = function() {
  var timeLeft = 3;
  var btnText = document.getElementById('btnText');
  var targetUrl = decodeURIComponent(escape(atob("${encodedLink}")));
  var interval = setInterval(function() {
    timeLeft--;
    if (timeLeft > 0) {
      btnText.innerText = "View in Telegram (" + timeLeft + "s)";
    } else {
      clearInterval(interval);
      btnText.innerText = "Opening Telegram...";
      window.location.replace(targetUrl);
    }
  }, 1000);
  document.getElementById('mainBtn').onclick = function() {
    window.location.href = targetUrl;
  }
}
</script>
</head>
<body>
<div class="container">
<div class="tg-logo"><svg viewBox="0 0 24 24"><path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42l10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001l-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15l4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/></svg></div>
<h1>${group.name}</h1>
<div class="desc">Click the button below to join the channel.<br>点击下方按钮加入群组。</div>
${deviceTipHtml}
<button id="mainBtn" class="btn">
<div class="spinner"></div>
<span id="btnText">View in Telegram (3s)</span>
</button>
<div class="footer-note">If you are not redirected automatically,<br>please click the button above.<br><span style="font-size:12px; opacity:0.7">如果您没有自动跳转，请点击上方按钮</span></div>
</div>
<script defer src="https://static.cloudflareinsights.com/beacon.min.js/9e2f649f59d84f8e811820c9bcc335ba" data-cf-beacon='{"token": "9e2f649f59d84f8e811820c9bcc335ba", "version": "2024.11.0"}' crossorigin="anonymous"></script>
</body>
</html>
  `;

  res.send(html);
});

// Vercel Serverless 导出
module.exports = app;

// 本地开发
if (require.main === module) {
  const port = process.env.PORT || 3000;
  // 添加 '0.0.0.0' 让局域网其他设备（手机）可以访问
  app.listen(port, '0.0.0.0', () => {
    console.log(`服务已启动！`);
    console.log(`电脑本地访问: http://localhost:${port}`);
    console.log(`手机局域网访问，请使用你的电脑IP，例如: http://192.168.x.x:${port}`);
  });
}