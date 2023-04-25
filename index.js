const Discord = require('discord.js');
const config = require('./config.json');
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});
client.commands = new Collection();

// Importações do comandos
const fs = require("node:fs")
const path = require("node:path")
const commandsPath = path.join(__dirname, "commands")
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"))

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)
    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command)
    } else {
        console.log(`Esse comando em ${filePath} está com "data" ou "execute ausentes"`)
    }
}
// Importações do comandos

const { ActivityType } = require('discord.js');

client.once(Events.ClientReady, c => {
    console.log(`🚀 Login realizado como ${client.user.username}`)

    c.user.setActivity('JavaScript', { type: ActivityType.Watching })
    c.user.setStatus('online')
});

const { joinVoiceChannel } = require('@discordjs/voice');

client.on("ready", () => {
    let canal = client.channels.cache.get("1071486139984265346") // Coloque o ID do canal de voz
    if (!canal) return console.log("❌ Não foi possível entrar no canal de voz.")
    if (canal.type !== Discord.ChannelType.GuildVoice) return console.log(`❌ Não foi possível entrar no canal [ ${canal.name} ].`)

    try {

        joinVoiceChannel({
            channelId: canal.id, // ID do canal de voz
            guildId: canal.guild.id, // ID do servidor
            adapterCreator: canal.guild.voiceAdapterCreator,
        })
        console.log(`✅ Entrei no canal de voz [ ${canal.name} ] com sucesso!`)

    } catch (e) {
        console.log(`❌ Não foi possível entrar no canal [ ${canal.name} ].`)
    }

})

client.login(config.token);

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isStringSelectMenu()) {
        const selected = interaction.values[0]
        if (selected == "javascript") {
            await interaction.reply("Documentação do Javascript: https://developer.mozilla.org/en-US/docs/Web/JavaScript")
        } else if (selected == "python") {
            await interaction.reply("Documentação do Python: https://www.python.org")
        } else if (selected == "csharp") {
            await interaction.reply("Documentação do C#: https://learn.microsoft.com/en-us/dotnet/csharp/")
        } else if (selected == "discordjs") {
            await interaction.reply("Documentação do Discord.js: https://discordjs.guide/#before-you-begin")
        }
    }
    if (!interaction.isChatInputCommand()) return
    const command = interaction.client.commands.get(interaction.commandName)
    if (!command) {
        console.error("Comando não encontrado")
        return
    }
    try {
        await command.execute(interaction)
    }
    catch (error) {
        console.error(error)
        await interaction.reply("Houve um erro ao executar esse comando!")
    }
})

client.on("messageCreate", (message) => {
    if (message.author.bot) return;

    let mencoes = [`<@${client.user.id}>`, `<@!${client.user.id}>`]

    mencoes.forEach(element => {
        if (message.content === element) {

            //(message.content.includes(element))

            let embed = new Discord.EmbedBuilder()
            .setColor("Aqua") // Blurple ou Aqua
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`🛠 Olá ${message.author}, utilize \`/help\` para ver meus comandos!`)

            message.reply({ embeds: [embed] })
        }
    })
})