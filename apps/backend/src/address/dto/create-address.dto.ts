import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateAddressDto {
    @ApiProperty({ example: 'João Silva' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: '00000-000' })
    @IsString()
    @IsNotEmpty()
    zipCode: string;

    @ApiProperty({ example: '(11) 98888-8888' })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({ example: 'Rua das Flores' })
    @IsString()
    @IsNotEmpty()
    street: string;

    @ApiProperty({ example: '123' })
    @IsString()
    @IsNotEmpty()
    number: string;

    @ApiProperty({ example: 'Centro' })
    @IsString()
    @IsNotEmpty()
    neighborhood: string;

    @ApiProperty({ example: 'São Paulo' })
    @IsString()
    @IsNotEmpty()
    city: string;

    @ApiProperty({ example: 'SP' })
    @IsString()
    @IsNotEmpty()
    state: string;

    @ApiProperty({ example: 'Apto 10', required: false })
    @IsString()
    @IsOptional()
    additional?: string;

    @ApiProperty({ example: 'Próximo ao mercado', required: false })
    @IsString()
    @IsOptional()
    reference?: string;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}
