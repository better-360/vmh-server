# VMH Server - Docker Quick Start Guide

Projeyi Docker ile hızlıca çalıştırmak için aşağıdaki adımları takip edin.

## ⚡ 5 Dakikada Başlat

### 1. Repository'yi klonlayın
```bash
git clone https://github.com/your-username/vmh-server.git
cd vmh-server
```

### 2. Environment dosyasını oluşturun
```bash
cp env.docker.example .env.docker
```

### 3. Önemli ayarları yapın (minimum)
`.env.docker` dosyasında şu değerleri değiştirin:
```env
# Güvenlik için mutlaka değiştirin
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
POSTGRES_PASSWORD=your_secure_database_password

# Domain bilgilerinizi girin
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

### 4. Uygulamayı başlatın
```bash
./deploy-docker.sh
```

### 5. Test edin
```bash
# Health check
curl http://localhost:3000/api/health

# API docs
open http://localhost:3000/api/docs
```

## 🎯 Üretim Ortamı için Ek Ayarlar

### Email ayarları (Gmail örneği):
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### Stripe ayarları:
```env
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### AWS S3 ayarları:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXXXXX
AWS_SECRET_ACCESS_KEY=xxxx
AWS_S3_BUCKET_NAME=your-bucket
```

## 🔧 Yaygın Komutlar

```bash
# Durumu kontrol et
docker-compose --env-file=.env.docker ps

# Logları izle
docker-compose --env-file=.env.docker logs -f

# Yeniden başlat
docker-compose --env-file=.env.docker restart

# Durdur
docker-compose --env-file=.env.docker stop

# Tamamen kaldır
docker-compose --env-file=.env.docker down
```

## 🏥 Health Check Endpoints

- **API Health:** `GET /api/health`
- **API Docs:** `GET /api/docs`
- **Database:** Container health check (otomatik)
- **Redis:** Container health check (otomatik)

## 🚨 Sorun Giderme

### Port çakışması:
```bash
# Kullanılan portları kontrol et
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :5432

# .env.docker'da PORT değişkenini değiştir
PORT=3001
```

### Database bağlantı sorunu:
```bash
# PostgreSQL container'ını kontrol et
docker-compose --env-file=.env.docker logs postgres

# Manuel bağlantı testi
docker-compose --env-file=.env.docker exec postgres psql -U vmh_user -d vmh_database
```

### Memory sorunu:
```bash
# Container memory kullanımı
docker stats --no-stream

# Sistem kaynakları
free -h
df -h
```

## 📊 URL'ler

| Servis | Development | Production |
|--------|-------------|------------|
| API | http://localhost:3000/api | https://api.yourdomain.com/api |
| Docs | http://localhost:3000/api/docs | https://api.yourdomain.com/api/docs |
| Health | http://localhost:3000/api/health | https://api.yourdomain.com/api/health |
| PostgreSQL | localhost:5432 | Internal only |
| Redis | localhost:6379 | Internal only |

## 🔒 Güvenlik Checklist

- [ ] JWT secret'ları değiştirildi
- [ ] Database şifresi güçlü
- [ ] API key'ler production değerleri
- [ ] CORS ayarları yapıldı
- [ ] SSL sertifikası eklendi (production)
- [ ] Firewall ayarları yapıldı

## 📱 İletişim

Sorun yaşarsanız:
1. Logları kontrol edin: `docker-compose logs`
2. GitHub Issues açın
3. Discord kanalımıza yazın

**Başarılar! 🎉**