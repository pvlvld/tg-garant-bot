import { Bot } from "grammy";
import type { IContext } from "./types/context.js";
import cfg from "./config.js";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";

const bot = new Bot<IContext>(cfg.BOT_TOKEN);

bot.api.config.use(parseMode("HTML"));

bot.use(hydrateReply);

export default bot;
