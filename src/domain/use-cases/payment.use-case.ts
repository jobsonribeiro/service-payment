import { Injectable, Inject } from '@nestjs/common';
import { PaymentRepository } from '../ports/payment.port';
import { PaymentDto } from '../../api/dto/payment.dto';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import axios from 'axios';
import * as sgMail from '@sendgrid/mail';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class PaymentService {
    private client: ClientProxy;

    constructor(
        @Inject('PaymentRepository')
        private readonly paymentRepository: PaymentRepository
    ) {
        this.client = ClientProxyFactory.create({
            transport: Transport.RMQ,
            options: {
                urls: [process.env.URL_AMQP],
                queue: process.env.PAYMENT_QUEUE, 
                queueOptions: {
                    durable: false,
                },
            },
        });

        // Set your SendGrid API key
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }

    async createPayment(paymentDto: PaymentDto): Promise<{ qrCode: string, paymentData: PaymentDto }> {
        const paymentData = {
            clientId: paymentDto.clientId,
            status: paymentDto.status,
            orderId: paymentDto.orderId,
            totalAmount: paymentDto.totalAmount,
            url_payment: '',
        };

        const metadata = {
            clientEmail: paymentDto.clientEmail,
            clientName: paymentDto.clientName,
        }

        const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_TOKEN, options: { timeout: 5000, idempotencyKey: 'abc' } });

        const preference = new Preference(client);

        const body = {
            items: [],
            notification_url: process.env.WEBHOOK_URL,
            external_reference: `${paymentData.orderId}`,
            metadata: metadata,
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
                        Authorization: `Bearer ${process.env.MERCADOPAGO_TOKEN}`
                    }
                });

                const paymentInfo = response.data;
                const externalReference = paymentInfo.external_reference;
                await this.paymentRepository.updateByOrderId(externalReference, {
                    status: paymentInfo.status,
                });

                // Send notification email to client
                await this.sendEmailNotification(paymentInfo.metadata.client_email, paymentInfo.status);

                if (paymentInfo.status === 'approved') {
                    await this.client.emit('payment_confirm', { orderId: externalReference }).toPromise(); 
                }
                return { message: 'Payment updated and notification sent successfully' };
            } catch (error) {
                console.error('Erro ao processar o webhook do Mercado Pago:', error);
                throw new Error('Erro ao processar o webhook. Por favor, tente novamente mais tarde.');
            }
        }

        return { message: 'Action not processed' };
    }

    private async sendEmailNotification(email: string, status: string): Promise<void> {
        let subject: string;
        let text: string;

        if (status === 'approved') {
            subject = 'Seu pagamento foi aprovado!';
            text = 'Obrigado por seu pagamento. Seu pedido está sendo processado.';
        } else if (status === 'rejected') {
            subject = 'Seu pagamento foi rejeitado';
            text = 'Infelizmente, seu pagamento foi rejeitado. Por favor, tente novamente.';
        } else {
            subject = 'Atualização do status do seu pagamento';
            text = `O status do seu pagamento é: ${status}`;
        }

        const msg = {
            to: email,
            from: process.env.EMAIL_FROM,
            subject: subject,
            text: text,
        };

        try {
            await sgMail.send(msg);
        } catch (error) {
            console.error('Erro ao enviar email:', error);
        }
    } 
}
