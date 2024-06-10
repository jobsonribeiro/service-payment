import { Injectable } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { PaymentService } from './domain/use-cases/payment.use-case';
import { PaymentDto } from './api/dto/payment.dto';

@Injectable()
export class PaymentQueueConsumer {
    constructor(private readonly paymentService: PaymentService) { }

    @EventPattern('order_created')
    async handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
        const { clientId, status, id, products } = data;
        console.log("payment queue");
        const totalAmount = products.reduce((acc, product) => acc + product.price * product.quantity, 0);
        const paymentData: PaymentDto = {
            clientId,
            status,
            orderId: id,
            totalAmount,
            products,
        };
        await this.paymentService.createPayment(paymentData);
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        channel.ack(originalMsg);
    }
}
