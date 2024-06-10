import { Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // Cria o microserviço RabbitMQ
  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI],
      queue: 'order_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  microservice.listen();

  // Cria o servidor HTTP
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3030;
  await app.listen(port, () => {
    Logger.log(`HTTP server is running on port ${port}`);
  });
}

bootstrap();
