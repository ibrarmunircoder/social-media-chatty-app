import express, { Express } from 'express';
import { ChattyServer } from '@root/setupServer';
import { MongodbDataSource } from '@root/setupDatabase';
import { config } from '@root/config';

class Application {
  public async initialize(): Promise<void> {
    this.loadConfig();
    const dataSource = new MongodbDataSource();
    await dataSource.connect();
    const app: Express = express();
    const server: ChattyServer = new ChattyServer(app);
    server.start();
  }

  private loadConfig(): void {
    config.validateConfig();
    config.cloudinaryConfig();
  }
}

const app: Application = new Application();
app.initialize();
