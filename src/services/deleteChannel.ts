import { useChannelsStore } from "src/stores/channels";
import { storeToRefs } from "pinia";

export async function deleteChannel() {
  const channelsStore = useChannelsStore();
  const { activeChannelId } = storeToRefs(channelsStore);

  if (!activeChannelId.value) {
    return { ok: false, message: "Select a channel first" };
  }

  try {
    const res = await fetch(`http://localhost:3333/api/channels/${activeChannelId.value}/delete`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { ok: false, message: data?.message || `Error ${res.status}` };
    }

    channelsStore.removeChannel(activeChannelId.value);

    return { ok: true, message: data?.message || "Channel deleted" };
  } catch (e: any) {
    return { ok: false, message: e?.message || "Network error" };
  }
}
