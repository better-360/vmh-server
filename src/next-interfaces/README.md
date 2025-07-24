# Next.js Interfaces

Bu klasör, NestJS DTO'larından dönüştürülmüş TypeScript interface'lerini içerir. Bu interface'ler Next.js projelerinde tip güvenliği sağlamak için kullanılabilir.

## Kullanım

### Tek bir interface'i import etme
```typescript
import { ICreateUser } from './src/next-interfaces/user.interface';
```

### Birden fazla interface'i import etme
```typescript
import { 
  ICreateUser, 
  IUpdateUser, 
  ISafeUser 
} from './src/next-interfaces/user.interface';
```

### Tüm interface'leri import etme
```typescript
import * from './src/next-interfaces';
```

## Dosya Yapısı

- `auth.interface.ts` - Kimlik doğrulama işlemleri
- `user.interface.ts` - Kullanıcı işlemleri
- `workspace.interface.ts` - Workspace işlemleri
- `plan.interface.ts` - Plan ve abonelik işlemleri
- `addons.interface.ts` - Addon işlemleri
- `package.interface.ts` - Paket işlemleri
- `location.interface.ts` - Ofis lokasyonu işlemleri
- `checkout.interface.ts` - Ödeme işlemleri
- `support.interface.ts` - Destek sistemi işlemleri
- `carrier.interface.ts` - Kargo şirketi işlemleri
- `shipping-speed.interface.ts` - Teslimat hızı işlemleri
- `packaging-option.interface.ts` - Paketleme seçenekleri
- `token.interface.ts` - Token işlemleri

## Özellikler

- ✅ Tüm NestJS dekoratörleri kaldırıldı
- ✅ Class'lar interface'e dönüştürüldü
- ✅ TypeScript tip güvenliği korundu
- ✅ Enum'lar korundu
- ✅ Optional field'lar korundu
- ✅ Referans tipleri korundu

## Dikkat Edilecek Noktalar

- Bu interface'ler sadece tip tanımı içerir, runtime validasyon içermez
- Eğer runtime validasyon gerekiyorsa, ayrıca Zod gibi kütüphaneler kullanılmalı
- Interface'ler orijinal DTO'ların bire bir kopyası olduğu için, backend değişiklikleri bu dosyaları da etkileyebilir

## Güncelleme

Backend'de DTO değişiklikleri olduğunda, bu interface'ler manuel olarak güncellenmeli veya otomatik dönüştürme scripti çalıştırılmalıdır. 