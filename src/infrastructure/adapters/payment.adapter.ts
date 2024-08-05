import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentRepository } from '../../domain/ports/payment.port';

@Injectable()
export class PaymentAdapter implements PaymentRepository {
    constructor(@InjectModel('Payment') private readonly paymentModel: Model<any>) { }

    async create(payment: any): Promise<any> {
        const createdPayment = new this.paymentModel(payment);        
        return createdPayment.save();
    }

    async updateByOrderId(orderId: number, updateData: any): Promise<any> {
        return this.paymentModel.updateOne({ orderId }, { $set: updateData }).exec();
    }
}
