# 📦 Backend Modül Yapısı (Single Responsibility Prensibine Göre)

Bu belgede sistemin backend mimarisi modül bazlı olarak tanımlanmıştır. Her modül kendi sorumluluğunda izole edilmiştir ve başka bir modülün sorumluluğunu almaz.


###
DB:Prisma+PostgreSQL
Kullanıcı istek atarken JWT tokenla birlikte aktif workpsace id yi de headara göndermeli.
---

## 🔐 AuthModule
Kullanıcının kimliğini doğrulama ve oturum işlemleri.

- Oturum açma / kapama
- Token üretimi / yenileme
- Şifre sıfırlama
- İlk kayıt (register)
- Şifre değiştirme
- E-posta / telefon doğrulama

---

## 👤 UserModule
Kullanıcı bilgileri ve yönetimi.

- Kullanıcı profili görüntüleme / güncelleme
- Kullanıcı arama (admin için)
- Erişim izinleri (kendi verileri)

---

## 🗂 CatalogModule
Plan ve özellik (feature) tanımlarının yönetimi.

- Plan (Plan) oluşturma ve güncelleme
- Özellik (Feature) tanımlama
- Plan ↔ Feature eşleşmelerinin yönetimi (PlanFeature)

> **Not:** Bu modül kullanıcı aboneliği ya da ödeme işlemleri yapmaz.

---

## 💳 BillingModuleStripe
Stripe ile ödeme altyapısını yöneten modül.

- Fatura kesme (Invoice)
- Borç yönetimi (UserBalance)
- Otomatik ödeme çekimi (5$ bazlı)
- Hatırlatma takibi (BalanceReminder)

> **Not:** Stripe webhookları burada işlenir.

---

## 🧾 SubscriptionModule
Kullanıcının hangi plana abone olduğunu yöneten modül.

- Plan aboneliği başlatma
- Abonelik iptali
- Plan geçişi (upgrade / downgrade)

> **Not:** Stripe ödemesi bu modülde değil, sadece abonelik ilişkisi yönetilir.

---

## 🧭 WorkspaceModule
Çoklu kullanıcı ve erişim yönetimi için "Workspace" sistemi.

- Workspace oluşturma
- Kullanıcı daveti gönderme / iptal etme
- Workspace'e kullanıcı ekleme
- Rol belirleme: OWNER, ADMIN, MEMBER
- Aktif Workspace seçimi

---

## 🧾 ReportModule
Raporlama ve analiz amaçlı veri üretimi.

- Kullanıcı bazlı loglar
- Plan kullanım analizi
- Gelir / borç / abonelik raporları

---

## 📬 NotificationModule
Bildirim sistemlerinin yönetimi.

- E-posta, SMS, push notification gönderimi
- Kullanıcı bildirim ayarları
- Cron’la tekrarlayan hatırlatmalar

---

## 🔎 AuditLogModule
Tüm sistemde yapılan işlemlerin izlenebilir logları.

- Kim ne yaptı, ne zaman, hangi IP’den
- meta alanı ile işlem detayları
- Raporlamaya uygun log yapısı

---

## 📦 PackageModule
Kargo paketlerinin temel yönetimi.

- Paket oluşturma
- STE numarası eşleştirme
- Paket bilgilerini güncelleme
- Fotoğraf ekleme
- Durum güncelleme: `PENDING`, `IN_PROCESS`, `COMPLETED` vs.

---

## 🧩 PackageActionModule
Her pakete özel işlem akışlarını yöneten modül.

- Forward işlemleri (kargo yönlendirme)
- Shred (imha)
- Scan (tara ve paylaş)
- Hold / Junk gibi diğer kullanıcı aksiyonları
- Aksiyonun işlenme süreci ve sonucu (async işlem takibi)

---

## 🧩 ShippingModule
- Kargo yönetimi


## 👤 SupportModule
Ticket yönetimi
- Kullanıcı ticketlarını görüntüleme / güncelleme

---

## 🧰 SharedModule
Genel yardımcı servisler ve ortak kullanımlar.

- Dosya yükleme / silme (S3, Cloudinary, vs.)
- Ortak helper servisler
- Decorator’lar, guard’lar, pipe’lar


