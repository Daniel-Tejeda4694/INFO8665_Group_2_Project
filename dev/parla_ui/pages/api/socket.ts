// pages/api/socket.ts
import { Server } from 'socket.io'
import type { NextApiRequest, NextApiResponse  } from 'next';
import type { Server as HTTPServer } from "http";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: HTTPServer &{
      io?: Server;
    };
  };
};

const roomParticipants: Record<string, Record<string, { streamURL: string; userName: string, audioEnabled: boolean, videoEnabled: boolean }>> = {};

export default function handler(req: NextApiRequest,
  res: NextApiResponseWithSocket) {
  if (!res.socket) {
    return res.status(500).end("No socket!");
  }

  // const server = res.socket.server as NonNullable<typeof res.socket.server>;
  const server = res.socket.server;

  if (!server.io) {
    const io = new Server(server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    server.io = io;

    io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`)
      let currentRoom: string | null = null;

      socket.on('join-room', ({ roomId, userName, streamURL, audioEnabled, videoEnabled }) => {
        currentRoom = roomId;
        socket.join(roomId)

        // if (!roomParticipants[roomId]) {
        //   roomParticipants[roomId] = {};
        // }
        roomParticipants[roomId] = roomParticipants[roomId] || {};
        roomParticipants[roomId][socket.id] = { streamURL, userName, audioEnabled, videoEnabled };

        // Send existing users to the new client
        const existingUsers = Object.entries(roomParticipants[roomId])
          .filter(([id]) => id !== socket.id)
          .map(([id, info]) => ({
            id,
            url: info.streamURL,
            name: info.userName,
            audio: info.audioEnabled,
            video: info.videoEnabled
          }));

        socket.emit("existing-users", existingUsers);

        // Notify others in the room
        socket.to(roomId).emit("user-joined", {
          id: socket.id,
          url: streamURL,
          name: userName,
          audio: audioEnabled,
          video: videoEnabled
        });
      });
      // })

      socket.on("toggle-camera", ({ roomId, userId, video }) => {
        // if (roomParticipants[roomId] && roomParticipants[roomId][userId]) {
        if (roomParticipants[roomId]?.[userId]) {
          roomParticipants[roomId][userId].videoEnabled = video;
        }

        socket.to(roomId).emit("camera-toggled", {
          id: userId,
          video,
        });
      });

      socket.on("toggle-microphone", ({ roomId, userId, audio }) => {
        // if (roomParticipants[roomId] && roomParticipants[roomId][userId]) {
        if (roomParticipants[roomId]?.[userId]) {
          roomParticipants[roomId][userId].audioEnabled = audio;
        }

        socket.to(roomId).emit("microphone-toggled", {
          id: userId,
          audio,
        });
      });
            
      // socket.on('signal', ({ roomId, signal, to }) => {
      //   io.to(to || roomId).emit('signal', {
      //     from: socket.id,
      //     signal,
      //   })
      // })

      // socket.on('return-signal', ({ to, signal }) => {
      //     io.to(to).emit('return-signal', {
      //       from: socket.id,
      //       signal,
      //     });
      // });

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`)

        if (currentRoom && roomParticipants[currentRoom]) {
          delete roomParticipants[currentRoom][socket.id];

          if (Object.keys(roomParticipants[currentRoom]).length === 0) {
            delete roomParticipants[currentRoom];
          }

          socket.to(currentRoom).emit("user-left", socket.id);
        }
        // socket.broadcast.emit('user-left', socket.id);
      })
      
    })
  }

  res.status(200).end()
}