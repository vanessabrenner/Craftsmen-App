"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
class AuthManager {
    constructor() {
        this.secret = "";
        // Load the secret from the environment
        this.secret = process.env.JWT_SECRET || "";
        if (this.secret === "") {
            throw new Error("JWT_SECRET is not set in the environment");
        }
    }
    generateToken(username) {
        return jsonwebtoken_1.default.sign({ username }, this.secret, { expiresIn: "1h" });
    }
    verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.secret);
        }
        catch (error) {
            return "";
        }
    }
}
exports.default = AuthManager;
;
