import bot from "../bot.js";
import cfg from "../config.js";
import { maintenance_cmd } from "./staff/maintenance.js";

function regCommands() {
    const botAdmin = bot.filter((ctx) => !!ctx.from?.id && cfg.ADMINS.indexOf(ctx.from.id) !== -1);

    botAdmin.hears("!maintenance", async (ctx) => {
        ctx.reply(`Maintenance status set to the ${maintenance_cmd()}`);
    });
}

export { regCommands };
