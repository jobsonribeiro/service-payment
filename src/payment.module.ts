import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentService } from './domain/use-cases/payment.use-case';
import { PaymentAdapter } from './infrastructure/adapters/payment.adapter';
import { PaymentSchema } from './infrastructure/adapters/payment.schema';
import { PaymentController } from './api/controllers/payment.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PaymentQueueConsumer } from './payment.queue';
import { Model } from 'mongoose';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Payment', schema: PaymentSchema }]),
        ClientsModule.register([
            {
                name: 'RABBITMQ_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.URL_AMQP],
                    queue: process.env.ORDER_QUEUE,
                    queueOptions: {
                        durable: true,
                    },
                },
            },
        ]),
    ],
    controllers: [PaymentController],
    providers: [
        PaymentService,
        PaymentAdapter,
        PaymentQueueConsumer,
        { provide: 'PaymentRepository', useClass: PaymentAdapter },
        Model,
    ],
})
export class PaymentModule { }
