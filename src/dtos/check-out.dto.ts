import {
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckoutAddonDto {
  @IsUUID()
  productId: string;

  // Eğer ürünün varyasyonları varsa, seçilen fiyatın ID'si
  @IsOptional()
  @IsUUID()
  selectedPriceId?: string;
}

export class CheckoutDto {
  @ApiProperty({
    example: 'f60fed05-75be-4e47-9272-a86b77dde94a',
    description: "Şirketin bağlı olduğu eyalet ID'si",
  })
  @IsUUID()
  @IsOptional()
  stateId?: string;

  @ApiProperty({
    example: 'f6a18738-8d3a-479d-aa44-8d5098a6cae5',
    description: 'Şirketin tipi (LLC, C-Corp vb.)',
  })
  @IsUUID()
  @IsOptional()
  companyTypeId?: string;


  @ApiProperty({ example: 'Better Corporation', description: 'Şirket adı' })
  @IsString()
  companyName: string;

  @ApiProperty({ example: 'LLC', description: 'Şirket tipinin belirteci' })
  @IsString()
  designator: string;

  @ApiProperty({ example: 'f6a18738-8d3a-479d-aa44-8d5098a6cae5', description: 'Satın alınan paketin idsi' })
  @IsUUID()
  pricingPlanId: string;


@ApiProperty({ example: 'f6a18738-8d3a-479d-aa44-8d5098a6cae5', description: 'Seçilen eyaletin state fee si' })
  @IsUUID()
  stateFeeId: string;

  @ApiProperty({ example: 'f6a18738-8d3a-479d-aa44-8d5098a6cae5', description: 'Seçilen eyaletin expeditedFeeId si' })
  @IsUUID()
  expeditedFeeId: string;

  @ApiProperty({
    type: [CheckoutAddonDto], // Array olduğu için köşeli parantez içinde veriyoruz
    description: 'Seçilen Addonların listesi',
    example: [
      {
        productId: "6ab02e6b-9694-4820-bc92-df7d9d1a8846",
        productPriceId: "2af10df3-4147-4d32-a7cd-3520808f59ea",
      },
      {
        productId: "3ac92be6-9a3d-4820-bd12-d3e7f9d1a776",
        productPriceId: "5fb10df3-4122-4e98-a3bc-1c3088a3d452",
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutAddonDto)
  addons: CheckoutAddonDto[];
}



export class CreateCheckoutSessionDto {
  @ApiPropertyOptional({ 
    description: 'Stripe Customer ID (eğer mevcutsa)',
    example: 'cus_1234567890abcdef',
  })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ description: 'Müşterinin e-posta adresi', example: 'user@example.com' })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({
    description: 'Abonelik (recurring) için kullanılacak Stripe Price ID',
    example: 'price_1QrhXCJuNLcMU2PoybJYqRpC',
  })
  @IsString()
  @IsNotEmpty()
  recurringPriceId: string;

  @ApiPropertyOptional({
    description: 'Tek seferlik (setup fee) ücret (cents cinsinden). Örneğin, 10000 = 100 USD',
    example: 10000,
  })
  @IsOptional()
  @IsNumber()
  oneTimeFee?: number;

  @ApiProperty({
    description: 'Ödeme başarılı olduğunda yönlendirilecek URL',
    example: 'https://example.com/success',
  })
  @IsString()
  @IsNotEmpty()
  successUrl: string;

  @ApiProperty({
    description: 'Ödeme iptal olduğunda yönlendirilecek URL',
    example: 'https://example.com/cancel',
  })
  @IsString()
  @IsNotEmpty()
  cancelUrl: string;
}


export class RestartCheckoutSessionDto {
  @ApiProperty({ 
    description: 'Company Id',
    example: 'f60fed05-75be-4e47-9272-a86b77dde94a',
  })
  @IsString()
  companyId: string;
}

export class PurchareSingleItemDataDto {
  @ApiProperty({ example: 'f60fed05-75be-4e47-9272-a86b77dde94a', description: 'Ürün ID' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 'f60fed05-75be-4e47-9272-a86b77dde94a', description: 'Fiyat ID' })
  @IsUUID()
  priceId: string;

  @ApiProperty({ example: 'f60fed05-75be-4e47-9272-4kdkdfewakd', description: 'Company ID' })
  @IsUUID()
  companyId: string;

}


export class CreateSubscriptionDto {
  @ApiProperty({ example: 'f60fed05-75be-4e47-9272-a86b77dde94a', description: 'Ürün ID' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 'f60fed05-75be-4e47-9272-a86b77dde94a', description: 'Fiyat ID' })
  @IsUUID()
  priceId: string;

  @ApiProperty({ example: 'f60fed05-75be-4e47-9272-4kdkdfewakd', description: 'Company ID' })
  @IsUUID()
  companyId: string;

  @ApiProperty({ example: '2025-03-07', description: 'Abonelik başlangıç tarihi' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiPropertyOptional({ example: '2025-03-07', description: 'Abonelik başlangıç tarihi' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
  


}