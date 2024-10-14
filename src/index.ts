import moment from "moment";
import { GrammyError, HttpError } from "grammy";
import { run } from "@grammyjs/runner";
import bot from "./bot.js";
import cfg from "./config.js";
import { regHandlers } from "./handlers/index.js";
import { regCommands } from "./commands/index.js";

moment.locale("uk-UA");

process.on("uncaughtException", function (err) {
    console.error("You Shall Not Pass!");
    console.error(err);
});

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
        console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
        console.error("Could not contact Telegram:", e);
    } else {
        console.error("Unknown error:", e);
    }
});

async function main() {
    let runner: ReturnType<typeof run>;

    const allowed_updates = ["message", "chat_member", "my_chat_member", "callback_query"] as const;

    regHandlers();
    regCommands();

    //REMOVE!
    bot.on("chat_member", async (ctx) => {
        console.log("new:");
        console.log(ctx.chatMember.new_chat_member);
        console.log("\nold:");
        console.log(ctx.chatMember.old_chat_member);
    });

    // Added / remove from a Channel
    bot.on("my_chat_member", async (ctx) => {
        const oldStatus = ctx.myChatMember.old_chat_member.status;
        const newStatus = ctx.myChatMember.new_chat_member.status;
        if (oldStatus === newStatus) return; // updated admin rights
        if (newStatus === "left") {
            const msg = `#Left Channel: ${ctx.chat.title}\nUsername: ${
                ctx.chat.username ?? "-"
            }\nID: ${ctx.chat.id}\nOwner: -`;
            ctx.api
                .sendMessage(cfg.ADMIN_CHAT, msg, {
                    message_thread_id: cfg.ADMIN_CHAT_THREADS.logs,
                })
                .catch((e) => {
                    console.error("Error sending #left channel log.");
                    console.log(msg);
                });
            return;
        }

        if (newStatus == "administrator") {
            const msg = `#Join Channel: ${ctx.chat.title}\nUsername: ${
                ctx.chat.username ?? "-"
            }\nID: ${ctx.chat.id}\nOwner: -`;
            ctx.api
                .sendMessage(cfg.ADMIN_CHAT, msg, {
                    message_thread_id: cfg.ADMIN_CHAT_THREADS.logs,
                })
                .catch((e) => {
                    console.error("Error sending #join channel log.");
                    console.log(msg);
                });
            return;
        }

        bot.on("chat_member", async (ctx) => {
            const oldStatus = ctx.chatMember.old_chat_member.status;
            const newStatus = ctx.chatMember.new_chat_member.status;
            // if (oldStatus !== "creator" && newStatus !== "creator") return;
            console.log("Old member:");
            console.log(ctx.chatMember.old_chat_member);
            console.log("New member:");
            console.log(ctx.chatMember.new_chat_member);
            console.log("\n\n\n");
        });
        console.log("MY new:");
        console.log(ctx.myChatMember.new_chat_member);
        console.log("\nMY old:");
        console.log(ctx.myChatMember.old_chat_member);
    });

    bot.api.deleteWebhook({ drop_pending_updates: true }).then(async () => {
        run(bot, { runner: { fetch: { allowed_updates } } });
        console.log("Bot is started using long polling.");

        bot.api.sendAnimation(cfg.ADMIN_CHAT, cfg.MEDIA.ANIMATIONS.ThePrimeagen, {
            caption: "Бота запущено!",
        });
    });

    process.on("SIGINT", async () => await shutdown());
    process.on("SIGTERM", async () => await shutdown());

    let isShuttingDown = false;

    async function shutdown() {
        if (isShuttingDown) return;
        console.log("Shutting down.");
        isShuttingDown = true;

        await runner?.stop();

        await bot.stop().then(() => {
            console.log("- Bot stopped.");
        });

        await bot.api.deleteWebhook({ drop_pending_updates: true }).then(() => {
            console.log("Webhook removed");
        });

        console.log("Done.");
        console.log(`Running NodeJS ${process.version}`);
        process.exit();
    }
}

main();
