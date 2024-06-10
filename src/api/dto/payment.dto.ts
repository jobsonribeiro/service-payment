export class PaymentDto {
    clientId: number;
    status: string;
    orderId: number;
    totalAmount: number;
    products?: { orderId: number, productId: number, quantity: number, id: number, price: number }[];
}
