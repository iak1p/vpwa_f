// src/services/kickUser.ts
export async function kickUserById(channelId: number, userId: number) {
  const res = await fetch(`http://localhost:3333/api/channels/${channelId}/kick/${userId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.message || 'Kick failed')
  return data as { message: string; appliedBan: boolean; votes: number }
}
