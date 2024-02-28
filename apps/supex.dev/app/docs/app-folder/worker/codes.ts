export default `import browser from 'webextension-polyfill';

browser.runtime.onInstalled.addListener(() => {
  browser.tabs.create({ url: 'https://example.com/welcome.html' });
});`;
