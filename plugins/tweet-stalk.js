const { cmd } = require('../command');
const axios = require('axios');

cmd({
  pattern: "xstalk",
  alias: ["twitterstalk", "twtstalk"],
  desc: "Get details about a Twitter/X user.",
  react: "🔍",
  category: "search",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    if (!q) {
      return reply("❌ Please provide a valid Twitter/X username.");
    }

    await conn.sendMessage(from, {
      react: { text: "⏳", key: m.key }
    });

    const apiUrl = `https://delirius-apiofc.vercel.app/tools/xstalk?username=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.status || !data.data) {
      return reply("⚠️ Failed to fetch Twitter/X user details. Ensure the username is correct.");
    }

    const user = data.data;
    const verifiedBadge = user.verified ? "✅" : "❌";

    const caption = `*TWITTER/X STALKER* 

       ╭───────────✇
       │👤 *Name:* ${user.name}
       │🔹 *Username:* @${user.username}
       │ ✔️ *Verified:* ${verifiedBadge}
       │ 👥 *Followers:* ${user.followers_count}
       │👤 *Following:* ${user.following_count}
       │ 📝 *Tweets:* ${user.tweets_count}
       │⏰ *Joined:* ${user.created}
       │🔗 *Profile:* [Click Here](${user.url})
      ╰─────────────────────✇⪼
      > ©ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴜʟᴀɴᴛʜᴀ ᴍᴅ`;
 
    await conn.sendMessage(from, {
      image: { url: user.avatar },
      caption: caption
    }, { quoted: m });

  } catch (error) {
    console.error("Error:", error);
    reply("❌ An error occurred while processing your request. Please try again.");
  }
});
