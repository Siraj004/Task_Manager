import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User, Role } from '../models';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET as string;

interface AuthenticatedSocket extends Socket {
  userId?: number;
  username?: string;
  userRoles?: string[];
}

// ✅ Extend Server type with custom broadcast functions
declare module 'socket.io' {
  interface Server {
    broadcastTaskCreated: (
      projectId: string | number,
      taskData: any,
      creatorName: string,
      excludeUserId: number
    ) => void;

    broadcastTaskUpdated: (
      projectId: string | number,
      taskData: any,
      updaterName: string,
      excludeUserId: number
    ) => void;

    broadcastCommentAdded: (
      projectId: string | number,
      commentData: any,
      commenterName: string,
      excludeUserId: number
    ) => void;
  }
}

export const initializeSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:3000',
        'https://task-manager-ehbh.onrender.com',
        'https://larklabs-ai.onrender.com'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // 🔐 Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('No token provided'));

      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;
      const user = await User.findByPk(decoded.id, { include: [Role] });

      if (!user) return next(new Error('User not found'));

      socket.userId = user.id;
      socket.username = user.username;
      socket.userRoles = (user as any).Roles?.map((role: any) => role.name) || [];

      console.log(`✅ Socket authenticated: ${user.username} (${socket.id})`);
      next();
    } catch (err) {
      console.error('Socket auth error:', err);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`🔌 User connected: ${socket.username} (${socket.id})`);

    // Join user personal room
    socket.join(`user:${socket.userId}`);

    // Project room joins/leaves
    socket.on('joinProject', (projectId: string | number) => {
      socket.join(`project:${projectId}`);
      console.log(`🏠 ${socket.username} joined project ${projectId}`);
    });

    socket.on('leaveProject', (projectId: string | number) => {
      socket.leave(`project:${projectId}`);
      console.log(`🚪 ${socket.username} left project ${projectId}`);
    });

    // 🔄 Task created from frontend socket event (optional)
    socket.on('newTask', (data: any) => {
      console.log(`📋 Broadcasting task creation by ${socket.username}`);
      socket.to(`project:${data.projectId}`).emit('newTask', {
        task: data.task,
        projectName: data.projectName,
        projectId: data.projectId,
        createdBy: socket.username,
        createdById: socket.userId,
        timestamp: new Date()
      });
    });

    // 🔄 Task updated
    socket.on('taskUpdated', (data: any) => {
      console.log(`📝 Broadcasting task update by ${socket.username}`);
      socket.to(`project:${data.projectId}`).emit('taskUpdated', {
        ...data,
        updatedBy: socket.username,
        updatedById: socket.userId,
        timestamp: new Date()
      });

      if (data.assigneeId && data.assigneeId !== socket.userId) {
        socket.to(`user:${data.assigneeId}`).emit('taskAssigned', {
          task: data,
          projectName: data.projectName,
          assignedBy: socket.username
        });
      }
    });

    // 💬 Comment added
    socket.on('commentAdded', (data: any) => {
      console.log(`💬 Broadcasting comment by ${socket.username}`);
      socket.to(`project:${data.projectId}`).emit('commentAdded', {
        comment: data.comment,
        task: data.task,
        taskTitle: data.taskTitle,
        username: socket.username,
        userId: socket.userId,
        timestamp: new Date()
      });
    });

    // ✅ Status changed
    socket.on('taskStatusChanged', (data: any) => {
      console.log(`🔄 Broadcasting status change by ${socket.username}`);
      socket.to(`project:${data.projectId}`).emit('taskUpdated', {
        ...data,
        updatedBy: socket.username,
        updatedById: socket.userId,
        timestamp: new Date()
      });
    });

    // 🧪 Task tested
    socket.on('taskTested', (data: any) => {
      console.log(`🧪 Broadcasting task tested by ${socket.username}`);
      socket.to(`project:${data.projectId}`).emit('taskTested', {
        task: data.task,
        testedBy: socket.username,
        testedById: socket.userId,
        timestamp: new Date()
      });
    });

    // 🗑️ Task deleted
    socket.on('taskDeleted', (data: any) => {
      console.log(`🗑️ Broadcasting task deletion by ${socket.username}`);
      socket.to(`project:${data.projectId}`).emit('taskDeleted', {
        ...data,
        deletedBy: socket.username,
        deletedById: socket.userId,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', (reason: string) => {
      console.log(`❌ User disconnected: ${socket.username} (${reason})`);
    });

    socket.on('error', (err: Error) => {
      console.error(`Socket error for ${socket.username}:`, err);
    });
  });

  // 🌐 Global Broadcast Functions for use in Controllers
  io.broadcastTaskCreated = (projectId, taskData, creatorName, excludeUserId) => {
    io.to(`project:${projectId}`).except(`user:${excludeUserId}`).emit('taskCreated', {
      task: taskData,
      projectId,
      createdBy: creatorName,
      createdById: excludeUserId,
      timestamp: new Date()
    });
  };

  io.broadcastTaskUpdated = (projectId, taskData, updaterName, excludeUserId) => {
    io.to(`project:${projectId}`).except(`user:${excludeUserId}`).emit('taskUpdated', {
      ...taskData,
      updatedBy: updaterName,
      timestamp: new Date()
    });
  };

  io.broadcastCommentAdded = (projectId, commentData, commenterName, excludeUserId) => {
    io.to(`project:${projectId}`).except(`user:${excludeUserId}`).emit('commentAdded', {
      ...commentData,
      username: commenterName,
      timestamp: new Date()
    });
  };

  console.log('🚀 Socket.IO server initialized');
  return io;
};
