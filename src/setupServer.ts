import { Application, json, urlencoded, Request, NextFunction, Response } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieSession from 'cookie-session';
import compression from 'compression';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import 'express-async-errors';
import { config } from '@root/config';
import applicationRoutes from '@root/routes';
import { CustomError, NotFoundError } from '@globals/helpers/error-handler';
import HTTP_STATUS from 'http-status-codes';
import bunyan from 'bunyan';
import { SocketIOPostHandler } from '@sockets/post';
import { SocketIOFollowerHandler } from '@sockets/follower';
import { SocketIOUserHandler } from '@sockets/user';
import { SocketIONotificationHandler } from '@sockets/notification';
import { SocketIOImageHandler } from '@sockets/image';

const SERVER_PORT = process.env.SERVER_PORT || 5000;
const log: bunyan = config.createLogger('server');

export class ChattyServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRETE_KEY_ONE!, config.SECRETE_KEY_TWO!],
        maxAge: 24 * 7 * 3600 * 1000, // 7 days
        secure: false,
        httpOnly: config.NODE_ENV !== 'development'
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
      })
    );
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(
      json({
        limit: '50mb'
      })
    );
    app.use(urlencoded({ extended: true, limit: '50mb' }));
  }

  private routesMiddleware(app: Application): void {
    applicationRoutes(app);
  }

  private globalErrorHandler(app: Application): void {
    app.all('*', (req: Request) => {
      throw new NotFoundError(`${req.originalUrl} not found`);
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
      log.error(error);
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({
          errors: error.serializeErrors()
        });
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        errors: [{ message: 'Something went wrong. Please try later!' }]
      });
    });
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIO: Server = await this.createSocketIO(httpServer);
      this.startHttpServer(httpServer);
      this.socketIOConnections(socketIO);
    } catch (error) {
      log.error(error);
    }
  }

  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
      }
    });
    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }

  private startHttpServer(httpServer: http.Server): void {
    log.info(`Server has started with process ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Server running on port ${SERVER_PORT}`);
    });
  }

  private socketIOConnections(io: Server): void {
    const postSocketHandler: SocketIOPostHandler = new SocketIOPostHandler(io);
    const followerSocketHandler: SocketIOFollowerHandler = new SocketIOFollowerHandler(io);
    const socketIOUserHandler: SocketIOUserHandler = new SocketIOUserHandler(io);
    const socketIONotificationHandler: SocketIONotificationHandler = new SocketIONotificationHandler();
    const socketIOImageHandler: SocketIOImageHandler = new SocketIOImageHandler();
    postSocketHandler.listen();
    followerSocketHandler.listen();
    socketIOUserHandler.listen();
    socketIONotificationHandler.listen(io);
    socketIOImageHandler.listen(io);
  }
}
