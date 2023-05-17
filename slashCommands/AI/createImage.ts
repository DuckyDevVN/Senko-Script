import Nostal from "Nostal";
import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { NostalSlashCommand } from "modules/command";
import { BaseExceptions, MusicExceptions } from "modules/exceptions";
import createImage from "modules/images/createImage";

async function createImageCommad(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild()) return;

    const nostal = interaction.client as Nostal;
    const prompt = interaction.options.getString("prompt", true);
    await interaction.reply({
        content: "chờ xíu nha...",
        fetchReply: true
    })

    await interaction.editReply({
        content: "",
        files: [await createImage(prompt)]
    })
}

export default new NostalSlashCommand({
    // @ts-ignore lmeo ồn ào nhếu nháo nó chạy đc kìa typescript succ
    data: new SlashCommandBuilder()
        .setName("image")
        .setDescription("Chuyển chữ sang hình ảnh")
        .addStringOption(option => option.setName("prompt").setDescription("Hã mô ta ra cách tạo bức ảnh và nó chông thế nào").setRequired(true)),
    run: createImageCommad,
});
