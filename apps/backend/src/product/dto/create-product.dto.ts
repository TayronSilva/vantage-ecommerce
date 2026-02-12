import { Type, Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { CreateStockDto } from 'src/stock/dto/create-stock.dto';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @Type(() => Number)
  @IsNumber()
  weight: number;

  @Type(() => Number)
  @IsNumber()
  width: number;

  @Type(() => Number)
  @IsNumber()
  height: number;

  @Type(() => Number)
  @IsNumber()
  length: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStockDto)
  stocks?: CreateStockDto[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  oldPrice?: number;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isBestSeller?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;
}