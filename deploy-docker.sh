#!/bin/bash

# =================================================================
# VMH Server - Docker Deployment Script
# =================================================================
# This script deploys the VMH server using Docker Compose
# Suitable for Plesk or any Docker-capable server

set -e  # Exit on any error

APP_NAME="vmh-server"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.docker"

echo "🐳 Docker deployment başlatılıyor..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker yüklü değil. Lütfen Docker'ı yükleyin."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose yüklü değil. Lütfen Docker Compose'u yükleyin."
    exit 1
fi

# Check if .env.docker exists
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  $ENV_FILE dosyası bulunamadı!"
    echo "📋 env.docker.example dosyasını kopyalayın ve düzenleyin:"
    echo "   cp env.docker.example $ENV_FILE"
    echo "   nano $ENV_FILE"
    echo ""
    echo "🔧 Ardından şu ayarları yapın:"
    echo "   - Database credentials"
    echo "   - JWT secrets"
    echo "   - Email configuration"
    echo "   - Stripe keys"
    echo "   - AWS S3 credentials"
    exit 1
fi

# 1. Git'ten en son kodları çek
echo "📦 En son kodlar çekiliyor..."
git pull origin main

# 2. Docker imajlarını build et
echo "🏗️  Docker imajları oluşturuluyor..."
docker-compose --env-file=$ENV_FILE -f $COMPOSE_FILE build --no-cache

# 3. Eski container'ları durdur ve kaldır
echo "🛑 Eski container'lar durduruluyor..."
docker-compose --env-file=$ENV_FILE -f $COMPOSE_FILE down

# 4. Veritabanı volume'unu kontrol et
echo "💾 Veritabanı volume'u kontrol ediliyor..."
if ! docker volume ls | grep -q "${APP_NAME}_postgres_data"; then
    echo "📊 Yeni PostgreSQL volume oluşturuluyor..."
fi

# 5. Yeni container'ları başlat
echo "🚀 Yeni container'lar başlatılıyor..."
docker-compose --env-file=$ENV_FILE -f $COMPOSE_FILE up -d

# 6. Servis durumlarını kontrol et
echo "🔍 Servis durumları kontrol ediliyor..."
sleep 10

# Health check
echo "🏥 Health check yapılıyor..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if docker-compose --env-file=$ENV_FILE -f $COMPOSE_FILE ps | grep -q "Up"; then
        echo "✅ Servisler başarıyla başlatıldı!"
        break
    else
        echo "⏳ Servisler başlatılıyor... ($attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ Servisler başlatılamadı. Logları kontrol edin:"
    echo "   docker-compose --env-file=$ENV_FILE logs"
    exit 1
fi

# 7. Container durumlarını göster
echo "📊 Container durumları:"
docker-compose --env-file=$ENV_FILE -f $COMPOSE_FILE ps

# 8. Application URL'lerini göster
echo ""
echo "🎉 Deployment tamamlandı!"
echo "🌐 Uygulama URL'leri:"
echo "   - Ana Uygulama: http://localhost:3000"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo ""
echo "📝 Logları görüntülemek için:"
echo "   docker-compose --env-file=$ENV_FILE logs -f"
echo ""
echo "🛠️  Container'ları yönetmek için:"
echo "   docker-compose --env-file=$ENV_FILE ps          # Durumları göster"
echo "   docker-compose --env-file=$ENV_FILE stop        # Durdur"
echo "   docker-compose --env-file=$ENV_FILE restart     # Yeniden başlat"
echo "   docker-compose --env-file=$ENV_FILE down        # Kaldır"
echo ""

# 9. Backup reminder
echo "💾 Yedekleme hatırlatması:"
echo "   Düzenli olarak PostgreSQL backup'ı almayı unutmayın:"
echo "   docker-compose --env-file=$ENV_FILE exec postgres pg_dump -U vmh_user vmh_database > backup_\$(date +%Y%m%d_%H%M%S).sql"
echo ""

# 10. SSL/HTTPS reminder for production
echo "🔒 Üretim ortamı için:"
echo "   - SSL sertifikası ekleyin"
echo "   - Nginx reverse proxy yapılandırın"
echo "   - Firewall ayarlarını yapın"
echo "   - Monitoring ekleyin"
echo ""

echo "✅ Deploy işlemi başarıyla tamamlandı!"