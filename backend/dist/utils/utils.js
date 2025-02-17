"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogger = void 0;
const getLogger = (tag) => (...args) => console.log(`[${tag}]`, ...args);
exports.getLogger = getLogger;
