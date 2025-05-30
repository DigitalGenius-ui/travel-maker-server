import bcrypt from "bcrypt";

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

export const comparePass = async (newPass, pass) => {
  return await bcrypt.compare(newPass, pass);
};
