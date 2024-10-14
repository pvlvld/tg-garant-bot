import cfg from "../../config.js";

function maintenance_cmd() {
    return cfg.MAINTENANCE.toggle();
}

export { maintenance_cmd };
