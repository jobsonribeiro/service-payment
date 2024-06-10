import { Schema } from 'mongoose';

export const PaymentSchema = new Schema({
    clientId: Number,
    status: String,
    orderId: Number,
    totalAmount: Number,
    url_payment: String,
});
