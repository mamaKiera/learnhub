var bcrypt = require("bcryptjs");

export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);

  return bcrypt.hashSync(password, salt);
}

export function compareHash(password: string, hashPassword: string): boolean {
  return bcrypt.compare(password, hashPassword);
}
