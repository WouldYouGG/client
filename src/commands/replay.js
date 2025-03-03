const {EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ActionRowBuilder} = require('discord.js');
const guildModel = require('../util/Models/guildModel');
require("dotenv").config();
const Topgg = require(`@top-gg/sdk`)
const api = new Topgg.Api(process.env.TOPGGTOKEN)

module.exports = {
    requireGuild: true,
    data: new SlashCommandBuilder()
        .setName('replay')
        .setDescription('Edit the replay system.')
        .setDMPermission(false)
        .setDescriptionLocalizations({
            de: 'Bearbeite das Replay System.',
            "es-ES": 'Editar el sistema de repetición.'
        })
        .addSubcommand((subcommand) => subcommand
            .setName('toggle')
            .setDescription('Enable/disable the replay button')
            .addBooleanOption((option) =>
                option
                    .setName('enable')
                    .setDescription('Disable or enable the replay button.')
                    .setRequired(true)
            ))
        .addSubcommand((subcommand) => subcommand
            .setName('cooldown')
            .setDescription('Change the cooldown for the replay button.')
            .addNumberOption((option) =>
                option
                    .setName('cooldown')
                    .setDescription('Change the cooldown for the replay button. Use seconds to determine how long.')
                    .setRequired(true)
            )),

    /**
     * @param {CommandInteraction} interaction
     * @param {WouldYou} client
     * @param {guildModel} guildDb
     */
    async execute(interaction, client, guildDb) {
        if (
            interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)
            || global.checkDebug(guildDb, interaction?.user?.id)
        ) {
            switch (interaction.options.getSubcommand()) {
                case "toggle":
                    const toggle = interaction.options.getBoolean('enable');

                    if (toggle === guildDb.replay) {
                        const alreadyEmbed = new EmbedBuilder()
                            .setColor("#2f3037")
                            .setTitle("Error!")
                            .setDescription(
                                guildDb.replay
                                    ? client.translation.get(guildDb?.language, 'REPLAY.embed.errorAlready2')
                                    : client.translation.get(guildDb?.language, 'REPLAY.embed.errorAlready')
                            );

                        return interaction
                            .reply({
                                embeds: [alreadyEmbed],
                                ephemeral: true,
                            })
                            .catch((err) => {
                                return;
                            });
                    }

                    await client.database.updateGuild(interaction.guildId, {
                        replay: toggle,
                    }, true);

                    const doneEmbed = new EmbedBuilder()
                        .setColor("#2f3037")
                        .setTitle(client.translation.get(guildDb?.language, 'REPLAY.embed.title'))
                        .setDescription(
                            !guildDb.replay
                                ? `${client.translation.get(guildDb?.language, 'REPLAY.embed.description')} **${interaction.options.getBoolean('enable')}**`
                                : client.translation.get(guildDb?.language, 'REPLAY.embed.success')
                        );
                    await interaction
                        .reply({
                            embeds: [doneEmbed],
                            ephemeral: true,
                        })
                        .catch((err) => {
                            return console.log(err)
                        });
                    break;
                case "cooldown":
                    const cooldown = interaction.options.getNumber('cooldown');

                    await client.database.updateGuild(interaction.guildId, {
                        replayCooldown: cooldown * 1000,
                    }, true)

                    const nochannelEmbed = new EmbedBuilder()
                        .setColor("#2f3037")
                        .setTitle("Error!")
                        .setDescription(`${client.translation.get(guildDb?.language, 'REPLAY.embed.cooldownSuccess')}\`${cooldown.toLocaleString()}\`${client.translation.get(guildDb?.language, 'REPLAY.embed.cooldownSuccess2')}`);
                    await interaction
                        .reply({
                            embeds: [nochannelEmbed],
                            ephemeral: true,
                        })
                        .catch((err) => {

                        });
                    break;
            }
        } else {
            const errorembed = new EmbedBuilder()
                .setColor("#F00505")
                .setTitle("Error!")
                .setDescription(client.translation.get(guildDb?.language, 'REPLAY.embed.missingPerms'));

            return interaction
                .reply({
                    embeds: [errorembed],
                    ephemeral: true,
                })
                .catch((err) => {
                    return console.log(err)
                });
        }
    },
};
