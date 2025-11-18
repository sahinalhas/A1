import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { logger } from '../../utils/logger.js';
import { mebbisTransferManager } from '../../features/mebbis-transfer/services/mebbis-transfer-manager.service.js';

let io: SocketIOServer | null = null;

export function initializeMEBBISWebSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    path: '/socket.io'
  });

  mebbisTransferManager.setSocketIO(io);

  io.on('connection', (socket) => {
    logger.info(`Client connected to MEBBIS socket: ${socket.id}`, 'MEBBISSocket');

    socket.on('mebbis:subscribe', (transferId: string) => {
      socket.join(`transfer-${transferId}`);
      logger.info(`Client ${socket.id} subscribed to transfer: ${transferId}`, 'MEBBISSocket');
      
      const status = mebbisTransferManager.getStatus(transferId);
      if (status) {
        socket.emit('mebbis:progress', status.progress);
      }
    });

    socket.on('mebbis:unsubscribe', (transferId: string) => {
      socket.leave(`transfer-${transferId}`);
      logger.info(`Client ${socket.id} unsubscribed from transfer: ${transferId}`, 'MEBBISSocket');
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected from MEBBIS socket: ${socket.id}`, 'MEBBISSocket');
    });
  });

  logger.info('MEBBIS WebSocket server initialized', 'MEBBISSocket');
  return io;
}

export function getMEBBISSocketIO(): SocketIOServer | null {
  return io;
}
