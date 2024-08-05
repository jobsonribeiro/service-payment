export interface PaymentRepository {
    create(payment: any): Promise<any>;
    updateByOrderId(orderId: number, updateData: any): Promise<any>;
}
