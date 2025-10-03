import { useChannelsStore } from "src/stores/channels";

export async function joinChannel(name: string, isPrivate = false) {
  const channelName = (name || "").trim();
  if (!channelName) return { ok: false, message: "Channel name required" };

  const channelsStore = useChannelsStore();

  try {
    const resFind = await fetch(
      `http://localhost:3333/api/channels/by-name/${encodeURIComponent(channelName)}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } }
    );
    const dataFind = await resFind.json().catch(() => ({} as any));

    if (resFind.status === 404) {
      const resCreate = await fetch(`http://localhost:3333/api/channels/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ name: channelName, is_private: isPrivate }),
      });
      const dataCreate = await resCreate.json().catch(() => ({} as any));

      if (!resCreate.ok) {
        return { ok: false, message: dataCreate?.message || `Error ${resCreate.status}` };
      }

      const channel = dataCreate?.channel;
      if (channel) {
        if (!channelsStore.channels.some(c => c.id === channel.id)) {
          channelsStore.addChannel(channel);
        }
        channelsStore.setActiveChannel(channel.id, channel.name);
      }

      return { ok: true, message: isPrivate ? "Private channel created" : "Channel created" };
    }

    if (!resFind.ok) {
      return { ok: false, message: dataFind?.message || `Error ${resFind.status}` };
    }

    const channelId = dataFind?.id as number | undefined;
    const channelIsPrivate = !!dataFind?.isPrivate;

    if (channelIsPrivate) {
      return { ok: false, message: "Cannot join a private channel, ask owner for invite" };
    }

    const resJoin = await fetch(`http://localhost:3333/api/channels/join/${channelId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify({ private: false }),
    });
    const dataJoin = await resJoin.json().catch(() => ({} as any));

    if (!resJoin.ok) {
      return { ok: false, message: dataJoin?.message || `Error ${resJoin.status}` };
    }


    if (dataJoin?.message === "Already a member") {
      if (channelId) {
        const existing = channelsStore.channels.find(c => c.id === channelId);
        if (existing) channelsStore.setActiveChannel(existing.id, existing.name);
      }
      return { ok: true, message: "Already a member" };
    }

    if (dataJoin?.joined && dataJoin?.channel) {
      if (!channelsStore.channels.some(c => c.id === dataJoin.channel.id)) {
        channelsStore.addChannel(dataJoin.channel);
      }
      channelsStore.setActiveChannel(dataJoin.channel.id, dataJoin.channel.name);
      return { ok: true, message: "Joined channel" };
    }

    return { ok: true, message: dataJoin?.message || "OK" };
  } catch (e: any) {
    return { ok: false, message: e?.message || "Network error" };
  }
}
