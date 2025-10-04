import { storeToRefs } from "pinia";
import { useChatsStore } from "src/stores/chats";

const chatsStore = useChatsStore();
const { chats } = storeToRefs(chatsStore);

export const sendSystemMessage = async (message: string) => {
  const generalChatId = chats.value.find((chat) => chat.title == "general")?.id;

  try {
    const res = await fetch(
      `http://localhost:3333/api/messages/${generalChatId}/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          content: message,
          type: "system",
        }),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Failed to send");
    console.log(data);
  } catch (err) {
    console.error(err);
  }
};
