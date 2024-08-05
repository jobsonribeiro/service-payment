export class PaymentDto {
    clientId: number;
    clientName: string;
    clientEmail: string;
    status: string;
    orderId: number;
    totalAmount: number;
    products?: { orderId: number, productId: number, quantity: number, id: number, price: number }[];
}
