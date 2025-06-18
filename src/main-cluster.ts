import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { cpus } from 'os';
import cluster from 'node:cluster';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log(`Worker ${process.pid} started`);
  console.log(`🚀 Server running at http://localhost:3000 - Worker PID: ${process.pid}`);
}

// ✅ Use isMaster for older TypeScript versions
if (cluster.isMaster) {
  const cpuCount = cpus().length;
  console.log(`📢 Master process is setting up ${cpuCount} workers`);
    console.log(`Primary ${process.pid} is running`);
  for (let i = 0; i < cpuCount; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`⚠️ Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
    console.log(`Primary ${process.pid} is running`);
  bootstrap();
}
