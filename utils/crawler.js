const { URL } = require('url');


function normalizeUrl(url) {
  try {
    const urlObj = new URL(url);
    
    let normalized = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
    normalized = normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
    
    
    if (urlObj.search) {
      normalized += urlObj.search;
    }
    
    return normalized;
  } catch (error) {
    return url; 
  }
}


function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}


function isSameDomain(url, baseDomain) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === baseDomain;
  } catch (error) {
    return false;
  }
}

module.exports = {
  normalizeUrl,
  isValidUrl,
  isSameDomain
};