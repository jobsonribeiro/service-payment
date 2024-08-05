import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './api/controllers/payment.controller';
import { PaymentService } from './domain/use-cases/payment.use-case';
import { PaymentAdapter } from './infrastructure/adapters/payment.adapter';
import { PaymentSchema } from './infrastructure/adapters/payment.schema';
// import { PaymentModule } from './payment.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([{ name: 'Payment', schema: PaymentSchema }]),
    ClientsModule.register([
      {
        name: 'PAYMENT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.URL_AMQP],
          queue: process.env.ORDER_QUEUE,
          queueOptions: {
            durable: false
          },
        },
      },
    ]),    
    // PaymentModule,
    
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    { provide: 'PaymentRepository', useClass: PaymentAdapter },
  ]
})
export class AppModule { }
