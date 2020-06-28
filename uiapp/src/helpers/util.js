//some snippets from https://github.com/webrtc/apprtc/blob/master/src/web_app/js/util.js

export function trace(text) {
  // This function is used for logging.
  if (text[text.length - 1] === '\n') {
    text = text.substring(0, text.length - 1);
  }
  if (window.performance) {
    var now = (window.performance.now() / 1000).toFixed(3);
    console.log(now + ': ' + text);
  } else {
    console.log(text);
  }
}

// Returns true if the code is running in a packaged Chrome App.
export function isChromeApp() {
  return (typeof chrome !== 'undefined' &&
          typeof chrome.storage !== 'undefined' &&
          typeof chrome.storage.local !== 'undefined');
}

// Start shims for fullscreen
export function setUpFullScreen() {
  if (isChromeApp()) {
    document.cancelFullScreen = function() {
      chrome.app.window.current().restore();
    };
  } else {
    document.cancelFullScreen = document.webkitCancelFullScreen ||
        document.mozCancelFullScreen || document.cancelFullScreen;
  }

  if (isChromeApp()) {
    document.body.requestFullScreen = function() {
      chrome.app.window.current().fullscreen();
    };
  } else {
    document.body.requestFullScreen = document.body.webkitRequestFullScreen ||
        document.body.mozRequestFullScreen || document.body.requestFullScreen;
  }

  document.onfullscreenchange = document.onfullscreenchange ||
        document.onwebkitfullscreenchange || document.onmozfullscreenchange;
}

export function isFullScreen() {
  if (isChromeApp()) {
    return chrome.app.window.current().isFullscreen();
  }

  return !!(document.webkitIsFullScreen || document.mozFullScreen ||
    document.isFullScreen); // if any defined and true
}

export function fullScreenElement() {
  return document.webkitFullScreenElement ||
      document.webkitCurrentFullScreenElement ||
      document.mozFullScreenElement ||
      document.fullScreenElement;
}

// Parse the supplied JSON, or return null if parsing fails.
export function parseJSON(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    trace('Error parsing json: ' + json);
  }
  return null;
}