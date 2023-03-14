const {Client, IntentsBitField} = require("discord.js")
require("dotenv").config()
const _TOKEN_ = process.env.__TOKEN
const _TRIVIA_API_TOKEN_ = process.env.__TRIVIA_API_TOKEN


const bot = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessageReactions
    ]
})


bot.on("ready", (b) => {
    console.log(`🙂 ${b.user.username} is ready!`)
})

bot.login(_TOKEN_)

module.exports = {
    bot: bot
}
