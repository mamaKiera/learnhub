"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareHash = exports.hashPassword = void 0;
var bcrypt = require("bcryptjs");
function hashPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
}
exports.hashPassword = hashPassword;
function compareHash(password, hashPassword) {
    return bcrypt.compare(password, hashPassword);
}
exports.compareHash = compareHash;
//# sourceMappingURL=becrypt.js.map