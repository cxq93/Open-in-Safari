chrome.action.onClicked.addListener((tab) => {
    if (tab && tab.url && tab.url.startsWith('http')) {
      console.log("正在尝试发送 URL 到 Safari:", tab.url);
      
      chrome.runtime.sendNativeMessage(
        'com.tabbit.open_in_safari',
        { url: tab.url },
        (response) => {
          if (chrome.runtime.lastError) {
            // 错误会显示在扩展程序的“查看视图：Service Worker”控制台中
            console.error("Native Messaging 错误:", chrome.runtime.lastError.message);
          } else {
            console.log("Safari 响应成功:", response);
          }
        }
      );
    }
  });
  