import bcrypt from 'bcryptjs';
import { getDb } from '../_lib/db';
import { isSuperAdminEmail, MemberGrade } from '../../src/data/memberGrades';

// Creates a member account in MongoDB. Passwords are hashed server-side
// with bcrypt before being stored — the client sends the plaintext
// password over HTTPS, same as any standard login form.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const { email, password, nickname } = req.body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const trimmedNickname = typeof nickname === 'string' ? nickname.trim() : '';

  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return res.status(400).json({ error: 'invalid_email' });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'invalid_password' });
  }
  if (!trimmedNickname) {
    return res.status(400).json({ error: 'invalid_nickname' });
  }

  let members;
  try {
    const db = await getDb();
    members = db.collection('members');
  } catch (err: any) {
    return res.status(500).json({ error: 'db_unavailable', message: err.message });
  }

  try {
    const existing = await members.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'email_taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const isSuperAdmin = isSuperAdminEmail(normalizedEmail);
    const memberGrade: MemberGrade = isSuperAdmin ? 7 : 1;

    await members.insertOne({
      email: normalizedEmail,
      passwordHash,
      nickname: trimmedNickname,
      memberGrade,
      isSuperAdmin,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      email: normalizedEmail,
      nickname: trimmedNickname,
      memberGrade,
      isSuperAdmin,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'query_failed', message: err.message });
  }
}
