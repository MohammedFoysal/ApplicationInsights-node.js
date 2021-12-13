// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.

// Don't reference modules from these directly. Use only for types.
// This is to avoid requiring the actual module if the NO_DIAGNOSTIC_CHANNEL env is present
import * as DiagChannelPublishers from "diagnostic-channel-publishers";
import * as DiagChannel from "diagnostic-channel";
import Logging = require("../../Library/Logging");
import { JsonConfig } from "../../Library/JsonConfig";

export const IsInitialized = !JsonConfig.getInstance().noDiagnosticChannel;
const TAG = "DiagnosticChannel";

if (IsInitialized) {
    const publishers: typeof DiagChannelPublishers = require("diagnostic-channel-publishers");
    const individualOptOuts: string = JsonConfig.getInstance().noPatchModules;
    const unpatchedModules = individualOptOuts.split(",");
    const modules: { [key: string]: any } = {
        bunyan: publishers.bunyan,
        console: publishers.console,
        mongodb: publishers.mongodb,
        mongodbCore: publishers.mongodbCore,
        mysql: publishers.mysql,
        redis: publishers.redis,
        pg: publishers.pg,
        pgPool: publishers.pgPool,
        winston: publishers.winston,
        azuresdk: publishers.azuresdk
    };
    for (const mod in modules) {
        if (unpatchedModules.indexOf(mod) === -1) {
            modules[mod].enable();
            Logging.info(TAG, `Subscribed to ${mod} events`);
        }
    }
    if (unpatchedModules.length > 0) {
        Logging.info(TAG, "Some modules will not be patched", unpatchedModules);
    }
} else {
    Logging.info(TAG, "Not subscribing to dependency auto collection because APPLICATION_INSIGHTS_NO_DIAGNOSTIC_CHANNEL was set");
}

