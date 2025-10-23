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
  owner: Owner;
  createdAt: string;
  updatedAt: string;
  joinedAt: string;
  color: string;
}

export interface Message{
  id: number;
  content: string;
  senderId: number;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  username: string;
  name: string | null;
  surname: string | null;
  status: string | null;
  color: string | null;
  email: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  notification?: boolean | null;
}

export interface Owner {
  id: number;
  username: string;
  name: string;
  surname: string;
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
  color: string;
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
