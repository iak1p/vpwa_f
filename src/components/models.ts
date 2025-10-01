export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

// export interface Chat {
//   id: number;
//   title: string;
// }

export interface Channel {
  id: number;
  name: string;
  description: string | null;
  isPrivate: boolean;
  owner: any;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  id: number;
  title: string;
  lastMessageId: number | null;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Sender {
  username: string;
  name: string;
  surname: string;
  status: string;
  id: number;
}

export interface Message {
  id: number;
  content: string;
  senderId: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  sender: Sender;
}