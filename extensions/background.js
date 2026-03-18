// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openInSafariContextMenu",
    title: "在 Safari 中打开",
    contexts: ["page", "link"]
  });
});

// 处理右键菜单点击事件
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "openInSafariContextMenu") {
    // 如果是链接，则打开链接URL，否则打开当前页面URL
    const urlToOpen = info.linkUrl || info.pageUrl;
    if (urlToOpen) {
      sendToSafari(urlToOpen);
    }
  }
});

// 处理扩展图标点击和快捷键触发
chrome.action.onClicked.addListener((tab) => {
  if (tab && tab.url) {
    sendToSafari(tab.url);
  }
});

function showErrorState(message) {
  chrome.action.setBadgeText({ text: 'ERR' });
  chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
  chrome.action.setTitle({
    title: `打开失败\n扩展ID: ${chrome.runtime.id}\n${message}`
  });
}

function showSuccessState() {
  chrome.action.setBadgeText({ text: 'OK' });
  chrome.action.setBadgeBackgroundColor({ color: '#0B8043' });
  chrome.action.setTitle({ title: "在 Safari 中打开（最近一次成功）" });
  setTimeout(() => chrome.action.setBadgeText({ text: '' }), 1200);
}

function sendToSafari(url) {
  if (!url || !url.startsWith('http')) {
    chrome.action.setBadgeText({ text: 'NO' });
    chrome.action.setBadgeBackgroundColor({ color: '#888888' });
    chrome.action.setTitle({ title: "仅支持 http/https 链接" });
    return;
  }

  chrome.action.setBadgeText({ text: '' });
  chrome.action.setTitle({ title: "正在通过 Native Messaging 调用 Safari..." });
  chrome.runtime.sendNativeMessage(
    'com.tabbit.open_in_safari',
    { url: url },
    (response) => {
      if (chrome.runtime.lastError) {
        const errMsg = chrome.runtime.lastError.message;
        console.error("Native Messaging 错误:", errMsg, "当前扩展 ID:", chrome.runtime.id, "主机名:", "com.tabbit.open_in_safari");
        showErrorState(errMsg);
        return;
      }

      if (!response || response.status !== "success") {
        console.error("Safari 响应异常:", response);
        showErrorState("本地脚本返回异常响应");
        return;
      }

      showSuccessState();
    }
  );
}
