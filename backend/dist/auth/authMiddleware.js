"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthMiddleware = createAuthMiddleware;
async function createAuthMiddleware(service) {
    return async (ctx, next) => {
        var _a;
        const token = (_a = ctx.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            ctx.status = 401;
            ctx.body = { message: "Unauthorized" };
            return;
        }
        const decodedToken = service.verifyToken(token);
        if (!decodedToken || typeof decodedToken === "string") {
            ctx.status = 401;
            ctx.body = { message: "Unauthorized" };
            return;
        }
        const username = decodedToken.username;
        if (!service.checkLoggedIn(token)) {
            ctx.status = 401;
            ctx.body = { message: "Unauthorized" };
            return;
        }
        ctx.state.username = username;
        ctx.state.token = token;
        await next();
    };
}
