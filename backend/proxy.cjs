const express = require('express');
const axios = require('axios');
const cors = require('cors');
const xml2js = require('xml2js');

const app = express();
app.use(cors());

// Endpoint to fetch and parse the RSS feed
app.get('/api/elanko-dse', async (req, res) => {
  try {
    const rssUrl = 'https://djthamilan.blogspot.com/feeds/posts/default?alt=rss';
    const response = await axios.get(rssUrl);
    const xml = response.data;

    xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to parse RSS' });
      const items = result.rss.channel.item;
      res.json(items);
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`)); 