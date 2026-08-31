import { getDb } from '../_lib/db';
import { clampMemberGrade, isSuperAdminEmail } from '../../src/data/memberGrades';

// Admin-only member management: list all accounts, change a member's
// grade, or delete an account. All writes (and the list itself, since it
// exposes every member's email) require the ADMIN_API_SECRET header.
export default async function handler(req: any, res: any) {
  const providedSecret = req.headers['x-admin-secret'];
  const expectedSecret = process.env.ADMIN_API_SECRET;
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  let members;
  try {
    const db = await getDb();
    members = db.collection('members');
  } catch (err: any) {
    return res.status(500).json({ error: 'db_unavailable', message: err.message });
  }

  try {
    if (req.method === 'GET') {
      const accounts = await members
        .find({}, { projection: { passwordHash: 0 } })
        .sort({ createdAt: -1 })
        .toArray();
      return res.status(200).json({
        accounts: accounts.map(a => ({
          email: a.email,
          nickname: a.nickname,
          memberGrade: clampMemberGrade(a.memberGrade ?? (isSuperAdminEmail(a.email) ? 7 : 1)),
          isSuperAdmin: Boolean(a.isSuperAdmin) || isSuperAdminEmail(a.email),
          createdAt: a.createdAt,
        })),
      });
    }

    if (req.method === 'PATCH') {
      const { email, memberGrade } = req.body || {};
      const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
      if (!normalizedEmail || typeof memberGrade !== 'number') {
        return res.status(400).json({ error: 'invalid_request' });
      }

      const nextGrade = isSuperAdminEmail(normalizedEmail) ? 7 : clampMemberGrade(memberGrade);
      const result = await members.updateOne(
        { email: normalizedEmail },
        { $set: { memberGrade: nextGrade, isSuperAdmin: isSuperAdminEmail(normalizedEmail) } }
      );
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'not_found' });
      }
      return res.status(200).json({ success: true, memberGrade: nextGrade });
    }

    if (req.method === 'DELETE') {
      const email = req.query?.email || (req.body || {}).email;
      const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
      if (!normalizedEmail) {
        return res.status(400).json({ error: 'invalid_request' });
      }
      if (isSuperAdminEmail(normalizedEmail)) {
        return res.status(403).json({ error: 'cannot_delete_super_admin' });
      }
      await members.deleteOne({ email: normalizedEmail });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err: any) {
    return res.status(500).json({ error: 'query_failed', message: err.message });
  }
}
