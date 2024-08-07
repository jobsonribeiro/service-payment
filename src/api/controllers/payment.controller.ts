import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from '../../domain/use-cases/payment.use-case';
import { PaymentDto } from '../dto/payment.dto';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post()
    async createPayment(@Body() paymentDto: PaymentDto) {
        return this.paymentService.createPayment(paymentDto);
    }

    @MessagePattern('order_created')
    async getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
        const { content } = context.getMessage();

        const decodedContent = Buffer.from(content, 'base64').toString('utf-8');
        const requestBodyObject = JSON.parse(decodedContent);
        console.log(requestBodyObject);

        const products = requestBodyObject.data.products.map((product: any) => ({
            orderId: product.orderId,
            productId: product.productId,
            quantity: product.quantity,
            id: product.id,
            price: product.price,
        }));

        const totalAmount = products.reduce((total, product) => {
            return total + (product.price * product.quantity);
        }, 0);

        const paymentDto: PaymentDto = {
            clientId: requestBodyObject.data.clientId,
            clientName: requestBodyObject.data.clientName,
            clientEmail: requestBodyObject.data.clientEmail,
            status: requestBodyObject.data.status,
            orderId: requestBodyObject.data.id,
            totalAmount,
            products,
        };

        return await this.paymentService.createPayment(paymentDto);
    }

    @Post('webhook')
    async handleWebhook(@Body() webhookData: any) {
        return this.paymentService.handleWebhook(webhookData);
    }
}
