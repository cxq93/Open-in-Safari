// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openInSafariContextMenu",
    title: "在 Safari 中打开",
    contexts: ["page", "link"]
  });
});

// 处理右键菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
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

// 核心发送逻辑
function sendToSafari(url) {
  if (url && url.startsWith('http')) {
    console.log("正在尝试发送 URL 到 Safari:", url);
    // 重置badge
    chrome.action.setBadgeText({ text: '' });
    
    chrome.runtime.sendNativeMessage(
      'com.tabbit.open_in_safari',
      { url: url },
      (response) => {
        if (chrome.runtime.lastError) {
          // 错误会显示在扩展程序的“查看视图：Service Worker”控制台中
          const errMsg = chrome.runtime.lastError.message;
          console.error("Native Messaging 错误:", errMsg);
          // 在图标上显示错误提示
          chrome.action.setBadgeText({ text: 'ERR' });
          chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
        } else {
          console.log("Safari 响应成功:", response);
        }
      }
    );
  }
}