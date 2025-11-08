#!/bin/bash
# Docker commands for StudySync Development

echo "🐳 StudySync Docker Management Script"
echo "======================================"

case "$1" in
  "build")
    echo "🔨 Building all Docker images..."
    docker-compose build --no-cache
    ;;
  "up")
    echo "🚀 Starting StudySync application..."
    docker-compose up -d
    echo "✅ Application started!"
    echo "📱 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:5000"
    echo "📊 Grafana: http://localhost:3001 (admin/admin123)"
    echo "📈 Prometheus: http://localhost:9090"
    ;;
  "down")
    echo "🛑 Stopping StudySync application..."
    docker-compose down
    ;;
  "restart")
    echo "🔄 Restarting StudySync application..."
    docker-compose down
    docker-compose up -d
    ;;
  "logs")
    if [ -z "$2" ]; then
      echo "📋 Showing all container logs..."
      docker-compose logs -f
    else
      echo "📋 Showing logs for $2..."
      docker-compose logs -f "$2"
    fi
    ;;
  "status")
    echo "📊 Container Status:"
    docker-compose ps
    echo ""
    echo "🏥 Health Checks:"
    curl -s http://localhost:5000/api/health | jq '.' 2>/dev/null || echo "Backend health check failed"
    ;;
  "clean")
    echo "🧹 Cleaning up Docker resources..."
    docker-compose down -v
    docker system prune -f
    docker volume prune -f
    ;;
  "dev")
    echo "🛠️ Starting development environment..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    ;;
  "prod")
    echo "🏭 Starting production environment..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    ;;
  *)
    echo "Usage: $0 {build|up|down|restart|logs [service]|status|clean|dev|prod}"
    echo ""
    echo "Commands:"
    echo "  build     - Build all Docker images"
    echo "  up        - Start the application"
    echo "  down      - Stop the application"
    echo "  restart   - Restart the application"
    echo "  logs      - Show logs (optionally for specific service)"
    echo "  status    - Show container status and health"
    echo "  clean     - Clean up Docker resources"
    echo "  dev       - Start development environment"
    echo "  prod      - Start production environment"
    echo ""
    echo "Examples:"
    echo "  $0 up                 # Start application"
    echo "  $0 logs backend       # Show backend logs"
    echo "  $0 status            # Check health status"
    exit 1
    ;;
esac