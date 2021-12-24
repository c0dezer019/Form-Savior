import injectButtons from "./core/injectButtons";

chrome.tabs.onActivated.addListener(activeInfo => {
   chrome.scripting.executeScript({
      target: { tabId: activeInfo.tabId },
      function: injectButtons(),
   });
})