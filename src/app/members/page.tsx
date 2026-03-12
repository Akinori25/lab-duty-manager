export const dynamic = 'force-dynamic'
export const revalidate = 0

import { getMembersWithStats } from '../actions/members';
import MembersClientPage from './MembersClientPage';

export default async function MembersPage() {
  const members = await getMembersWithStats();

  return (
    <div>
      <h1 className="page-title">Members Management</h1>
      <MembersClientPage initialMembers={members} />
    </div>
  );
}