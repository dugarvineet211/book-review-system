//util file for commonly used utility functions
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET;

//function to hash password before storing in database
const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};
//function to create JWT Token with 2 days expiry
const createToken = (user: { id: number, email: string }) => {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '2 days' });
};

export {hashPassword, createToken};