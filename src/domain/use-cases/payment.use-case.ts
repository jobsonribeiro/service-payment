// payment.use-case.ts

import { Injectable, Inject } from '@nestjs/common';
import { PaymentRepository } from '../ports/payment.port';
import { PaymentDto } from '../../api/dto/payment.dto';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import axios from 'axios';

@Injectable()
export class PaymentService {
    constructor(
        @Inject('PaymentRepository')
        private readonly paymentRepository: PaymentRepository
    ) { }

    async createPayment(paymentDto: PaymentDto): Promise<{ qrCode: string, paymentData: PaymentDto }> {
        const paymentData = {
            clientId: paymentDto.clientId,
            status: paymentDto.status,
            orderId: paymentDto.orderId,
            totalAmount: paymentDto.totalAmount,
            url_payment: '',
        };

        const client = new MercadoPagoConfig({ accessToken: 'TEST-1053117300537996-060916-c42462323dd7c8b3e1da7ed028bdb524-1849076735', options: { timeout: 5000, idempotencyKey: 'abc' } });

        const preference = new Preference(client);

        const body = {
            items: [],
            notification_url: "https://webhook.site/670b6138-30c4-4273-bdc1-c76200e06d5c",
            external_reference: `${paymentData.orderId}`,
        };

        paymentDto.products.forEach(item => {
            body.items.push({
                id: item.id,
                title: `Product ${item.productId}`,
                quantity: item.quantity,
                unit_price: item.price
            });
        });

        try {
            const result = await preference.create({ body });
            console.log(result);
            paymentData.url_payment = result.sandbox_init_point;

            return this.paymentRepository.create(paymentData);
        } catch (error) {
            console.error('Erro ao processar o pagamento com o Mercado Pago:', error);
            throw new Error('Erro ao processar o pagamento. Por favor, tente novamente mais tarde.');
        }
    }

    async handleWebhook(webhookData: any): Promise<any> {
        const { action, data } = webhookData;

        if (action === 'payment.created' || action === 'payment.updated') {
            const paymentId = data.id;
            try {
                const response = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                    headers: {
                        Authorization: `Bearer TEST-1053117300537996-060916-c42462323dd7c8b3e1da7ed028bdb524-1849076735`
                    }
                });

                const paymentInfo = response.data;
                const externalReference = paymentInfo.external_reference;

                await this.paymentRepository.updateByOrderId(externalReference, {
                    status: paymentInfo.status,
                });

                return { message: 'Payment updated successfully' };
            } catch (error) {
                console.error('Erro ao processar o webhook do Mercado Pago:', error);
                throw new Error('Erro ao processar o webhook. Por favor, tente novamente mais tarde.');
            }
        }

        return { message: 'Action not processed' };
    }
}
