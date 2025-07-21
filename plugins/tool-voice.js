const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "aivoice",
    alias: ["vai", "voicex", "voiceai"],
    desc: "Text to speech with different AI voices",
    category: "main",
    react: "🪃",
    filename: __filename
},
async (conn, mek, m, { 
    from, 
    quoted, 
    body, 
    isCmd, 
    command, 
    args, 
    q, 
    isGroup, 
    sender, 
    senderNumber, 
    botNumber2, 
    botNumber, 
    pushname, 
    isMe, 
    isOwner, 
    groupMetadata, 
    groupName, 
    participants, 
    groupAdmins, 
    isBotAdmins, 
    isAdmins, 
    reply 
}) => {
    try {
        // Check if args[0] exists (user provided text)
        if (!args[0]) {
            return reply("Please provide text after the command.\nExample: .aivoice hello");
        }

        // Get the full input text
        const inputText = args.join(' ');

        // Send initial reaction
        await conn.sendMessage(from, {  
            react: { text: '⏳', key: m.key }  
        });

        // Voice model menu
        const voiceModels = [
            { number: "1", name: "Dulantha oshada", model: "dulantha_oshada" },
            { number: "2", name: "Himashi (Exclusive)", model: "himashi" },
            { number: "3", name: "Lankandi", model: "laknadi" },
            { number: "4", name: "Ana (Female)", model: "ana" },
            { number: "5", name: "Optimus Prime", model: "optimus_prime" },
            { number: "6", name: "Dasun", model: "dasun" },
            { number: "7", name: "Taylor Swift", model: "taylor_swift" },
            { number: "8", name: "Elon Musk", model: "elon_musk" },
            { number: "9", name: "Mickey Mouse", model: "mickey_mouse" },
            { number: "10", name: "Pakaya", model: "pakaya" },
            { number: "11", name: "Ponnnaya", model: "ponnaya" },
            { number: "12", name: "Eminem", model: "eminem" }
        ];

        // Create menu text
        let menuText = "𝗔𝗜 𝗩𝗢𝗜𝗖𝗘𝗦\n";
        voiceModels.forEach(model => {
            menuText += `┃▸ ${model.number}. ${model.name}\n`;
        });
        menuText += "╰━━━⪼\n\n";
        menuText += `📌 *Reply with the number to select voice model for:*\n"${inputText}"`;

        // Send menu message with image
        const sentMsg = await conn.sendMessage(from, {  
            image: { url: "https://files.catbox.moe/7zfdcq.jpg" },
            caption: menuText
        }, { quoted: m });

        const messageID = sentMsg.key.id;
        let handlerActive = true;

        // Set timeout to remove handler after 2 minutes
        const handlerTimeout = setTimeout(() => {
            handlerActive = false;
            conn.ev.off("messages.upsert", messageHandler);
            reply("⌛ Voice selection timed out. Please try the command again.");
        }, 120000);

        // Message handler function
        const messageHandler = async (msgData) => {  
            if (!handlerActive) return;
            
            const receivedMsg = msgData.messages[0];  
            if (!receivedMsg || !receivedMsg.message) return;  

            const receivedText = receivedMsg.message.conversation || 
                              receivedMsg.message.extendedTextMessage?.text || 
                              receivedMsg.message.buttonsResponseMessage?.selectedButtonId;  
            const senderID = receivedMsg.key.remoteJid;  
            const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;  

            if (isReplyToBot && senderID === from) {  
                clearTimeout(handlerTimeout);
                conn.ev.off("messages.upsert", messageHandler);
                handlerActive = false;

                await conn.sendMessage(senderID, {  
                    react: { text: '⬇️', key: receivedMsg.key }  
                });  

                const selectedNumber = receivedText.trim();
                const selectedModel = voiceModels.find(model => model.number === selectedNumber);

                if (!selectedModel) {
                    return reply("❌ Invalid option! Please reply with a number from the menu.");
                }

                try {
                    // Show processing message
                    await conn.sendMessage(from, {  
                        text: `🔊 Generating audio with ${selectedModel.name} voice...`  
                    }, { quoted: receivedMsg });

                    // Call the API
                    const apiUrl = `https://api.agatz.xyz/api/voiceover?text=${encodeURIComponent(inputText)}&model=${selectedModel.model}`;
                    const response = await axios.get(apiUrl, {
                        timeout: 30000 // 30 seconds timeout
                    });
                    
                    const data = response.data;

                    if (data.status === 200) {
                        await conn.sendMessage(from, {  
                            audio: { url: data.data.oss_url },  
                            mimetype: "audio/mpeg"
                            // Removed ptt: true to send as regular audio
                        }, { quoted: receivedMsg });
                    } else {
                        reply("❌ Error generating audio. Please try again.");
                    }
                } catch (error) {
                    console.error("API Error:", error);
                    reply("❌ Error processing your request. Please try again.");
                }
            }  
        };

        // Register the handler
        conn.ev.on("messages.upsert", messageHandler);

    } catch (error) {
        console.error("Command Error:", error);
        reply("❌ An error occurred. Please try again.");
    }
});
