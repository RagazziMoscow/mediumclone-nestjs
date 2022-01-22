import { ConnectionOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

const data: Record<string, string> = dotenv.parse(fs.readFileSync('.env'));
const ormconfig: ConnectionOptions = {
  type: 'postgres',
  database: data.DB_NAME,
  host: data.DB_HOST || 'localhost',
  port: parseInt(data.DB_PORT) || 5432,
  username: data.DB_USER,
  password: data.DB_PASSWORD,
  entities: [ __dirname + '/**/*.entity{.ts,.js}' ],
  synchronize: false,
  migrations: [ __dirname + '/migrations/**/*{.ts,.js}' ],
  cli: {
    migrationsDir: 'src/migrations'
  }
};

export default ormconfig;
