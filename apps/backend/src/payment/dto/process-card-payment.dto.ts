import { IsNotEmpty, IsOptional, IsString, IsNumber, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessCardPaymentDto {
    @ApiProperty({ description: 'ID do pedido gerado anteriormente' })
    @IsNotEmpty()
    @IsString()
    orderId: string;

    @ApiProperty({ description: 'Token gerado pelo SDK do Mercado Pago no frontend', required: false })
    @IsOptional()
    @IsString()
    token?: string;

    @ApiProperty({ description: 'ID do cartão salvo (se estiver usando um cartão já cadastrado)', required: false })
    @IsOptional()
    @IsString()
    cardId?: string;

    @ApiProperty({ description: 'Salvar este cartão para uso futuro', default: false })
    @IsOptional()
    saveCard?: boolean;

    @ApiProperty({ description: 'Número de parcelas', default: 1 })
    @IsOptional()
    @IsNumber()
    installments?: number;

    @ApiProperty({ description: 'Método de pagamento (visa, master, etc)', default: 'credit_card' })
    @IsOptional()
    @IsString()
    paymentMethodId?: string;
}
