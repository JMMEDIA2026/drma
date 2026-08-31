import bcrypt from 'bcryptjs';
import { getDb } from '../_lib/db';
import { clampMemberGrade, isSuperAdminEmail } from '../../src/data/memberGrades';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const { email, password } = req.body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!normalizedEmail || typeof password !== 'string') {
    return res.status(400).json({ error: 'invalid_request' });
  }

  let members;
  try {
    const db = await getDb();
    members = db.collection('members');
  } catch (err: any) {
    return res.status(500).json({ error: 'db_unavailable', message: err.message });
  }

  try {
    const account = await members.findOne({ email: normalizedEmail });
    if (!account) {
      return res.status(404).json({ error: 'not_found' });
    }

    const passwordMatches = await bcrypt.compare(password, account.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'wrong_password' });
    }

    const memberGrade = clampMemberGrade(
      account.memberGrade ?? (isSuperAdminEmail(normalizedEmail) ? 7 : 1)
    );
    const isSuperAdmin = Boolean(account.isSuperAdmin) || isSuperAdminEmail(normalizedEmail);

    return res.status(200).json({
      email: account.email,
      nickname: account.nickname,
      memberGrade,
      isSuperAdmin: isSuperAdmin && memberGrade === 7,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'query_failed', message: err.message });
  }
}
