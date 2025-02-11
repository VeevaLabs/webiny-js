const path = require("path");
const { Worker } = require("worker_threads");
const chalk = require("chalk");

const parseMessage = message => {
    try {
        return JSON.parse(message);
    } catch (e) {
        return {
            type: "error",
            message: `Could not parse received build result (JSON): ${message}`
        };
    }
};

module.exports = async ({ projectApplication, inputs, context }) => {
    const start = new Date();

    const { env, debug } = inputs;
    const multipleBuilds = projectApplication.packages.length > 1;
    if (multipleBuilds) {
        context.info(`Building ${context.info.hl(projectApplication.packages.length)} packages...`);
    } else {
        context.info(`Building ${context.info.hl(projectApplication.packages[0].name)} package...`);
    }

    const log = (packageName, message) => {
        let prefix = "";
        if (multipleBuilds) {
            prefix = chalk.blueBright(packageName) + ": ";
        }

        if (Array.isArray(message)) {
            message = message.filter(Boolean);
            if (message.length) {
                const [first, ...rest] = message;
                console.log(prefix + first, ...rest);
            }
        } else {
            console.log(prefix + message);
        }
    };

    console.log();

    const promises = [];
    const stats = { success: 0, warning: 0, error: 0 };
    for (let i = 0; i < projectApplication.packages.length; i++) {
        const current = projectApplication.packages[i];
        const config = current.config;
        if (typeof config.commands.build !== "function") {
            stats.warning++;
            context.warning(
                `Skipping build of ${context.warning.hl(
                    current.name
                )} package - ${context.warning.hl(
                    "build"
                )} command missing. Check package's ${context.warning.hl("webiny.config.ts")} file.`
            );
            continue;
        }

        const start = new Date();

        promises.push(
            new Promise(resolve => {
                const worker = new Worker(path.join(__dirname, "./worker.js"));
                worker.on("message", threadMessage => {
                    const { type, message } = parseMessage(threadMessage);

                    if (type === "error") {
                        stats.error++;
                        context.error(current.name);
                        console.log(message);
                        console.log();
                        return resolve({
                            package: current,
                            error: message
                        });
                    }

                    if (type === "success") {
                        if (multipleBuilds) {
                            stats.success++;
                            const duration = (new Date() - start) / 1000 + "s";
                            context.success(`${current.name} (${context.success.hl(duration)})`);
                        }

                        return resolve({
                            package: current,
                            error: message
                        });
                    }

                    log(current.name, message);
                });

                worker.on("error", () => {
                    stats.error++;
                    context.error(
                        `An unknown error occurred while building ${context.error.hl(
                            current.name
                        )}:`
                    );

                    resolve({
                        package: current,
                        result: {
                            message: `An unknown error occurred.`
                        }
                    });
                });

                let enableLogs = inputs.logs;
                if (typeof enableLogs === "undefined") {
                    enableLogs = !multipleBuilds;
                }

                worker.postMessage(
                    JSON.stringify({
                        options: { env, debug, logs: enableLogs },
                        package: current
                    })
                );
            })
        );
    }

    await Promise.all(promises);

    console.log();

    if (stats.error) {
        throw new Error(
            `Failed to build all packages (${context.error.hl(stats.error)} error(s) occurred).`
        );
    }

    const duration = (new Date() - start) / 1000 + "s";

    if (multipleBuilds) {
        context.success(
            `Successfully built ${context.success.hl(
                projectApplication.packages.length
            )} packages in ${context.success.hl(duration)}.`
        );
    } else {
        context.success(
            `Successfully built ${context.success.hl(
                projectApplication.packages[0].name
            )} in ${context.success.hl(duration)}.`
        );
    }
};
