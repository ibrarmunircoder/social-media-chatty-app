import express, { Express } from 'express';
import { ChattyServer } from './setupServer';
import { MongodbDataSource } from './setupDatabase';
import { config } from './config';

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
  }
}

const app: Application = new Application();
app.initialize();
