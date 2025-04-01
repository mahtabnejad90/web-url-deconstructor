
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 3001;

const activeCrawls = new Map();

const allowedOrigins = ['http://localhost:3000'];

app.use(cors());

app.use(express.json());

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

async function crawlWebsite(baseUrl, maxUrls = 100) {
  const crawlId = Date.now().toString();
  
  console.log(`Starting crawl for ${baseUrl} with ID ${crawlId}`);
  
  const crawlProcess = {
    baseUrl,
    discoveredUrls: [],
    visited: new Set(),
    queue: [normalizeUrl(baseUrl)],
    status: 'in-progress',
    progress: 0,
    maxUrls,
    startTime: Date.now(),
    errors: []
  };
  
  activeCrawls.set(crawlId, crawlProcess);
  
  try {
    const baseUrlObj = new URL(baseUrl);
    const baseDomain = baseUrlObj.hostname;
    let count = 0;
    
    while (crawlProcess.queue.length > 0 && count < maxUrls) {
      const currentUrl = crawlProcess.queue.shift();
      
      if (crawlProcess.visited.has(currentUrl)) continue;
      
      crawlProcess.visited.add(currentUrl);
      crawlProcess.discoveredUrls.push(currentUrl);
      
      try {
        console.log(`Crawling (${count + 1}/${maxUrls}): ${currentUrl}`);
        
        const response = await axios.get(currentUrl, {
          headers: {
            'User-Agent': 'URL-Crawler-Bot/1.0',
            'Accept': 'text/html'
          },
          timeout: 8000,
          maxRedirects: 5
        });
        
        const contentType = response.headers['content-type'] || '';
        
        if (contentType.includes('text/html')) {
          const $ = cheerio.load(response.data);
          
          $('a').each((_, link) => {
            let href = $(link).attr('href');
            if (!href) return;
            
            try {
              const absoluteUrl = new URL(href, currentUrl).href;
              const urlObj = new URL(absoluteUrl);
              
              if (urlObj.hostname === baseDomain) {
                const cleanUrl = absoluteUrl.split('#')[0];
                const normalizedUrl = normalizeUrl(cleanUrl);
                
                if (!crawlProcess.visited.has(normalizedUrl) && 
                    !crawlProcess.queue.includes(normalizedUrl)) {
                  crawlProcess.queue.push(normalizedUrl);
                }
              }
            } catch (err) {
            }
          });
        }
      } catch (err) {
        console.error(`Error crawling ${currentUrl}: ${err.message}`);
        crawlProcess.errors.push({
          url: currentUrl,
          error: err.message
        });
      }
      
      count++;
      crawlProcess.progress = (count / maxUrls) * 100;
    }
    
    crawlProcess.status = 'completed';
    crawlProcess.endTime = Date.now();
    crawlProcess.duration = (crawlProcess.endTime - crawlProcess.startTime) / 1000;
    
    console.log(`Crawl completed for ${baseUrl}. Found ${crawlProcess.discoveredUrls.length} URLs in ${crawlProcess.duration} seconds.`);
    
    return {
      id: crawlId,
      baseUrl,
      discoveredUrls: crawlProcess.discoveredUrls,
      totalDiscovered: crawlProcess.discoveredUrls.length,
      crawlComplete: crawlProcess.queue.length === 0,
      limitReached: count >= maxUrls && crawlProcess.queue.length > 0,
      duration: crawlProcess.duration,
      errors: crawlProcess.errors
    };
  } catch (error) {
    crawlProcess.status = 'failed';
    crawlProcess.error = error.message;
    console.error('Crawler failed:', error);
    throw error;
  }
}


app.post('/api/crawl', async (req, res) => {
  console.log('Received crawl request:', req.body);
  const { url, maxUrls = 100 } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  try {
    
    new URL(url);
    
    
    const crawlResult = await crawlWebsite(url, maxUrls);
    res.json(crawlResult);
  } catch (error) {
    console.error('Error processing crawl request:', error);
    res.status(error.message.includes('Invalid URL') ? 400 : 500)
       .json({ error: error.message });
  }
});


app.get('/api/crawl/:id', (req, res) => {
  const { id } = req.params;
  
  if (activeCrawls.has(id)) {
    const crawl = activeCrawls.get(id);
    res.json({
      id,
      status: crawl.status,
      progress: crawl.progress,
      discoveredCount: crawl.discoveredUrls.length,
      baseUrl: crawl.baseUrl
    });
  } else {
    res.status(404).json({ error: 'Crawl job not found' });
  }
});


app.get('/api/crawl/:id/results', (req, res) => {
  const { id } = req.params;
  
  if (activeCrawls.has(id)) {
    const crawl = activeCrawls.get(id);
    
    if (crawl.status === 'completed') {
      res.json({
        id,
        baseUrl: crawl.baseUrl,
        discoveredUrls: crawl.discoveredUrls,
        totalDiscovered: crawl.discoveredUrls.length,
        duration: crawl.duration
      });
    } else {
      res.status(400).json({ 
        error: 'Crawl not completed yet', 
        status: crawl.status,
        progress: crawl.progress 
      });
    }
  } else {
    res.status(404).json({ error: 'Crawl job not found' });
  }
});


app.get('/api/test', (req, res) => {
  res.json({ message: 'Crawler server is running!' });
});


app.listen(PORT, () => {
  console.log(`URL Crawler server running on port ${PORT}`);
});

module.exports = app; 