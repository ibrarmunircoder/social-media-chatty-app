import mongoose from 'mongoose';
import bunyan from 'bunyan';
import { config } from './config';

const log: bunyan = config.createLogger('setupDatabase');

export class MongodbDataSource {
  constructor() {
    mongoose.connection.on('disconnect', this.connect);
  }

  public async connect() {
    try {
      await mongoose.connect(`${config.DATABASE_URL}`);
      log.info(`Successfully connected to the host ${mongoose.connection.host}`);
    } catch (error) {
      log.error('Error connecting to database', error);
    }
  }
}
