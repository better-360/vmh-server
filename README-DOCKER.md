# VMH Server - Docker Deployment Guide

Bu kılavuz VMH Server'ın Docker Compose kullanarak nasıl kurulacağını ve deploy edileceğini anlatmaktadır.

## 📋 Gereksinimler

- Docker (20.10+)
- Docker Compose (2.0+)
- Git
- 2GB+ RAM
- 10GB+ Disk alanı

## 🚀 Hızlı Başlangıç

### 1. Repository'yi klonlayın

```bash
git clone https://github.com/your-username/vmh-server.git
cd vmh-server
```

### 2. Environment dosyasını hazırlayın

```bash
# Örnek dosyayı kopyalayın
cp env.docker.example .env.docker

# Dosyayı düzenleyin
nano .env.docker
```

**Önemli:** Aşağıdaki değerleri mutlaka değiştirin:
- `JWT_SECRET` ve `JWT_REFRESH_SECRET`
- `POSTGRES_PASSWORD`
- `STRIPE_PUBLISHABLE_KEY` ve `STRIPE_SECRET_KEY`
- `MAIL_USER` ve `MAIL_PASSWORD`
- `AWS_ACCESS_KEY_ID` ve `AWS_SECRET_ACCESS_KEY`
- `FRONTEND_URL` ve `BACKEND_URL`

### 3. Uygulamayı başlatın

```bash
# Deploy scriptini çalıştırın
./deploy-docker.sh

# Veya manuel olarak:
docker-compose --env-file=.env.docker up -d
```

### 4. Database migration'ları çalıştırın

```bash
# Container içinde migration çalıştır
docker-compose --env-file=.env.docker exec app npx prisma migrate deploy
```

## 🏗️ Servis Mimarisi

Docker Compose aşağıdaki servisleri içerir:

### 🗄️ PostgreSQL Database (`postgres`)
- **Port:** 5432
- **Volume:** `postgres_data`
- **Database:** `vmh_database`
- **User:** `vmh_user`

### 🔴 Redis Cache (`redis`)
- **Port:** 6379
- **Volume:** `redis_data`
- **Persistence:** AOF enabled

### 🟢 NestJS Application (`app`)
- **Port:** 3000
- **Build:** Multi-stage Dockerfile
- **User:** Non-root (nestjs:1001)

### 🌐 Nginx Reverse Proxy (`nginx`) - Opsiyonel
- **Ports:** 80, 443
- **SSL:** Desteklenir
- **Profile:** `production`

## 📁 Önemli Dosyalar

```
vmh-server/
├── Dockerfile                 # NestJS app için
├── docker-compose.yml         # Tüm servisler
├── .dockerignore             # Build optimize
├── env.docker.example        # Environment template
├── deploy-docker.sh          # Deploy script
├── nginx.conf               # Nginx config
└── README-DOCKER.md         # Bu dosya
```

## 🔧 Yönetim Komutları

### Container yönetimi
```bash
# Durumları görüntüle
docker-compose --env-file=.env.docker ps

# Logları görüntüle
docker-compose --env-file=.env.docker logs -f

# Servisi yeniden başlat
docker-compose --env-file=.env.docker restart app

# Tüm servisleri durdur
docker-compose --env-file=.env.docker stop

# Container'ları kaldır
docker-compose --env-file=.env.docker down
```

### Database yönetimi
```bash
# PostgreSQL shell'e bağlan
docker-compose --env-file=.env.docker exec postgres psql -U vmh_user -d vmh_database

# Backup al
docker-compose --env-file=.env.docker exec postgres pg_dump -U vmh_user vmh_database > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup'tan restore et
docker-compose --env-file=.env.docker exec -T postgres psql -U vmh_user vmh_database < backup_file.sql
```

### Application yönetimi
```bash
# Prisma migration çalıştır
docker-compose --env-file=.env.docker exec app npx prisma migrate deploy

# Prisma studio başlat (development)
docker-compose --env-file=.env.docker exec app npx prisma studio

# Container içine shell
docker-compose --env-file=.env.docker exec app sh
```

## 🔐 Güvenlik Ayarları

### Üretim ortamı için:

1. **Environment değişkenlerini güncelle:**
   - Güçlü şifreler kullan
   - JWT secret'ları değiştir
   - Production API key'leri ekle

2. **SSL Sertifikası ekle:**
   ```bash
   mkdir ssl
   # SSL dosyalarını ssl/ klasörüne koy
   # cert.pem ve key.pem dosyaları gerekli
   ```

3. **Nginx reverse proxy aktif et:**
   ```bash
   docker-compose --env-file=.env.docker --profile production up -d
   ```

4. **Firewall ayarları:**
   ```bash
   # Sadece gerekli portları aç
   ufw allow 80
   ufw allow 443
   ufw deny 3000  # Direct app access'i engelle
   ufw deny 5432  # Direct DB access'i engelle
   ```

## 🌐 Plesk Server Deployment

### Plesk üzerinde kurulum:

1. **Domain ekle:**
   - Plesk Panel'de yeni domain oluştur
   - Document root'u ayarla

2. **Docker desteğini aktif et:**
   - Plesk Extensions'dan Docker extension'ı yükle

3. **Repository'yi klonla:**
   ```bash
   cd /var/www/vhosts/yourdomain.com/
   git clone https://github.com/your-username/vmh-server.git
   cd vmh-server
   ```

4. **Environment ayarları:**
   ```bash
   cp env.docker.example .env.docker
   nano .env.docker
   # Domain bilgilerini güncelle
   ```

5. **Deploy et:**
   ```bash
   chmod +x deploy-docker.sh
   ./deploy-docker.sh
   ```

6. **Nginx proxy ayarla:**
   - Plesk'te Apache/Nginx ayarlarından proxy configuration ekle
   - Port 3000'e yönlendir

## 📊 Monitoring ve Logging

### Log görüntüleme:
```bash
# Tüm servislerin logları
docker-compose --env-file=.env.docker logs -f

# Sadece app logları
docker-compose --env-file=.env.docker logs -f app

# Son 100 satır
docker-compose --env-file=.env.docker logs --tail=100 app
```

### Sistem kaynak kullanımı:
```bash
# Container istatistikleri
docker stats

# Disk kullanımı
docker system df

# Volume'ların boyutu
docker volume ls -q | xargs docker volume inspect | grep Mountpoint
```

## 🔧 Sorun Giderme

### Yaygın sorunlar:

1. **Port çakışması:**
   ```bash
   # Kullanılan portları kontrol et
   netstat -tlnp | grep :3000
   
   # docker-compose.yml'de portları değiştir
   ```

2. **Database bağlantı sorunu:**
   ```bash
   # PostgreSQL container'ının durumunu kontrol et
   docker-compose --env-file=.env.docker ps postgres
   
   # Database loglarını incele
   docker-compose --env-file=.env.docker logs postgres
   ```

3. **Build hatası:**
   ```bash
   # Cache'i temizle ve yeniden build et
   docker-compose --env-file=.env.docker build --no-cache
   ```

4. **Memory sorunu:**
   ```bash
   # Container'ların memory kullanımını kontrol et
   docker stats --no-stream
   
   # Gerekirse memory limit ekle
   # docker-compose.yml'de deploy.resources.limits.memory
   ```

### Log seviyeleri:
```bash
# Debug mode için
echo "LOG_LEVEL=debug" >> .env.docker

# Production'da info level kullan
echo "LOG_LEVEL=info" >> .env.docker
```

## 📈 Performance Optimizasyonu

### Production için öneriler:

1. **Multi-stage build kullan** (zaten aktif)
2. **Node.js cluster mode** ekle
3. **Redis cache** strategy'si optimize et
4. **Database connection pooling** ayarla
5. **Nginx gzip compression** kullan (nginx.conf'da aktif)

### Ölçeklendirme:
```bash
# App instance'larını artır
docker-compose --env-file=.env.docker up -d --scale app=3

# Load balancer ekle (nginx.conf'u güncelle)
```

## 🆘 Destek

Sorunlar için:
1. GitHub Issues açın
2. Logları paylaşın
3. Environment bilgilerini gizleyin
4. Docker ve sistem bilgilerini ekleyin

## 📝 Changelog

- **v1.0.0:** İlk Docker Compose kurulumu
- **v1.1.0:** Nginx reverse proxy eklendi
- **v1.2.0:** Multi-stage build optimizasyonu
- **v1.3.0:** Plesk deployment desteği