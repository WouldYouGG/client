const {
    EmbedBuilder,
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder, PermissionFlagsBits,
} = require('discord.js');
const guildModel = require('../util/Models/guildModel');

module.exports = {
    requireGuild: true,
    data: new SlashCommandBuilder()
        .setName('neverhaveiever')
        .setDescription('Get a never have I ever message.')
        .setDMPermission(false)
        .setDescriptionLocalizations({
            de: 'Bekomme eine nie habe ich jemals Nachricht.',
            "es-ES": 'Consigue un mensaje Nunca he tenido'
        }),

    /**
     * @param {CommandInteraction} interaction
     * @param {WouldYou} client
     * @param {guildModel} guildDb
     */

    async execute(interaction, client, guildDb) {
        const {Funny, Basic, Young, Food, RuleBreak} = await require(`../data/nhie-${guildDb.language}.json`);
        const neverArray = [...Funny, ...Basic, ...Young, ...Food, ...RuleBreak]
        const randomNever = Math.floor(Math.random() * neverArray.length)

        let ratherembed = new EmbedBuilder()
            .setColor("#0598F6")
            .setFooter({
                text: `Requested by ${interaction.user.username} | Type: Random | ID: ${randomNever}`,
                iconURL: interaction.user.avatarURL()
            })
            .setDescription(neverArray[randomNever]);

        const mainRow = new ActionRowBuilder();
        if (Math.round(Math.random() * 15) < 3) {
            mainRow.addComponents([
                new ButtonBuilder()
                    .setLabel('Invite')
                    .setStyle(5)
                    .setEmoji('1009964111045607525')
                    .setURL(
                        'https://discord.com/oauth2/authorize?client_id=981649513427111957&permissions=275415247936&scope=bot%20applications.commands',
                    )
            ]);
        }
        mainRow.addComponents([
            new ButtonBuilder()
                .setLabel('New Question')
                .setStyle(1)
                .setEmoji('1073954835533156402')
                .setCustomId(`neverhaveiever`)
        ]);
        
    const time = guildDb?.voteCooldown ?? 60_000;
    const three_minutes = 3 * 60 * 1e3;

    const { row, id } = await client.voting.generateVoting(
      interaction.guildId,
      interaction.channelId,
      time < three_minutes ? 0 : ~~((Date.now() + time) / 1000),
      1
    );

    interaction
      .reply({ embeds: [ratherembed], components: [row, mainRow] })
      .catch((err) => {
        return console.log(err);
      });

    },
};
