const requiredEnv = [
    "BOT_TOKEN",
    "MAIN_CHAT",
    // "DB_HOST",
    // "DB_USER",
    // "DB_PASSWORD",
    // "DB_DATABASE",
] as const;

const ANIMATIONS = Object.freeze({
    no_stats: "CgACAgQAAx0Cf9EqrAACDUJmaJE8Jw9eTnlvmTG_GLslPqJJ8gACeQMAAr3JBFN7f2AJi52nTTUE",
    ThePrimeagen: "CgACAgQAAx0Cf9EqrAACDU1maJUfleSUmeFFT8YYGIC5FzrIDgACxAQAAvRCfVMq7ofhhIVE6zUE",
});

const MEDIA = Object.freeze({
    ANIMATIONS,
});
let _log_lvl = 0;
const LOG_LVL = {
    get: () => {
        return _log_lvl;
    },
    set: (lvl: number) => {
        _log_lvl = lvl;
        return _log_lvl;
    },
};

type ICfg = Record<(typeof requiredEnv)[number], string> & {
    ADMINS: number[];
    STATUSES: { LEFT_STATUSES: string[] };
    ADMIN_CHAT: number;
    ADMIN_CHAT_THREADS: Record<"logs" | "money_flow" | "general" | "broadcast" | "stats", number>;
    MEDIA: typeof MEDIA;
    LOG_LVL: typeof LOG_LVL;
    MAINTENANCE: { STATUS: boolean; toggle: () => boolean };
};

function getCfg() {
    const cfg = {} as ICfg;

    for (const e of requiredEnv) {
        if (e in process.env) {
            cfg[e] = process.env[e]!;
            continue;
        }
        throw new Error(`Bruh, fix your .env! Where's the ${e}?`);
    }
    cfg.ADMINS = (process.env.ADMINS?.split(" ") || []).map((id) => Number(id));
    cfg.STATUSES ??= {} as any;
    cfg.STATUSES.LEFT_STATUSES = ["kicked", "left"];
    cfg.ADMIN_CHAT = Number(process.env.MAIN_CHAT);
    if (Number.isNaN(cfg.ADMIN_CHAT)) throw new Error("Invalid ADMIN_CHAT env");
    cfg.ADMIN_CHAT_THREADS = { general: 1, broadcast: 14, logs: 3, money_flow: 10, stats: 7 };
    cfg.MEDIA = MEDIA;
    cfg.LOG_LVL = LOG_LVL;
    cfg.MAINTENANCE = {
        STATUS: false,
        toggle: () => (cfg.MAINTENANCE.STATUS = !cfg.MAINTENANCE.STATUS),
    };

    return Object.freeze(cfg);
}

const cfg = getCfg();

export default cfg;
