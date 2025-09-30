import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket() {
  if (!socket) {
    socket = io('http://localhost:3333', {
    //   auth: () => ({ token: localStorage.getItem('token') || '' }),
    autoConnect: false
    })
  }
  return socket
}

export function connectSocket() {
  const s = getSocket()
  if (!s.connected) s.connect()
  return s
}

export function disconnectSocket() {
  const s = getSocket()
  if (s.connected) s.disconnect()
}
