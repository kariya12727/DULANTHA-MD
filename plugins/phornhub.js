const axios = require('axios');
const { cmd } = require('../command');

cmd({
  pattern: 'phsearch',
  alias: ['pornhubsearch'],
  use: '.phsearch <keyword>',
  desc: 'Search videos on Pornhub',
  category: 'nsfw',
  filename: __filename
}, async (conn, m, { text, reply }) => {
  if (!text) return reply('Please provide a search keyword. Ex: .phsearch sister');

  try {
    const res = await axios.get(`https://api.agatz.xyz/api/pornhub?message=${encodeURIComponent(text)}`);
    const result = res.data;

    if (!result || result.length === 0) return reply('No results found.');

    let msg = `*Pornhub Search Results for:* ${text}\n\n`;
    for (let i = 0; i < Math.min(result.length, 5); i++) {
      msg += `• *Title:* ${result[i].title}\n`;
      msg += `• *URL:* ${result[i].url}\n\n`;
    }

    reply(msg);
  } catch (e) {
    console.error(e);
    reply('Error occurred while searching.');
  }
});

cmd({
  pattern: 'phdown',
  alias: ['pornhubdl'],
  use: '.phdown <pornhub-url>',
  desc: 'Download Pornhub Video',
  category: 'nsfw',
  filename: __filename
}, async (conn, m, { text, reply }) => {
  if (!text || !text.includes('pornhub.com')) return reply('Please provide a valid Pornhub video URL.');

  try {
    const res = await axios.get(`https://api.agatz.xyz/api/pornhubdown?url=${encodeURIComponent(text)}`);
    const result = res.data;

    if (!result || !result.video_1) return reply('Download link not found.');

    await conn.sendMessage(m.chat, {
      video: { url: result.video_1 },
      caption: `*Title:* ${result.title || "Unknown"}`
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    reply('Error occurred while downloading.');
  }
});