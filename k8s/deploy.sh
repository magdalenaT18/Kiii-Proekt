#!/bin/bash

# deploy.sh - Скрипта за deployment на апликацијата

echo "🚀 Почеток на Kubernetes deployment..."

# Проверка дали kubectl е инсталиран
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl не е инсталиран. Ве молиме инсталирајте го прво."
    exit 1
fi

# Проверка на Kubernetes конекција
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Не можам да се поврзам со Kubernetes кластер. Проверете ја конфигурацијата."
    exit 1
fi

echo "✅ Kubernetes кластер е достапен"

# Функција за создавање на secrets
create_secrets() {
    echo "🔐 Создавање на secrets..."
    
    # Прашај го корисникот за credentials
    read -p "Внесете база податоци username (default: myuser): " db_user
    db_user=${db_user:-myuser}
    
    read -s -p "Внесете база податоци password: " db_password
    echo
    
    read -p "Внесете база податоци име (default: mydb): " db_name
    db_name=${db_name:-mydb}
    
    # Кодирај во base64
    db_user_b64=$(echo -n "$db_user" | base64)
    db_password_b64=$(echo -n "$db_password" | base64)
    db_name_b64=$(echo -n "$db_name" | base64)
    
    # Создади secrets манифест
    cat > k8s-secrets.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: my-app
type: Opaque
data:
  DB_USER: $db_user_b64
  DB_PASSWORD: $db_password_b64
  DB_NAME: $db_name_b64
EOF
    
    echo "✅ Secrets фајл е создаден"
}

# Функција за ажурирање на image имињата
update_images() {
    echo "🐳 Ажурирање на Docker image имиња..."
    
    read -p "Внесете го вашето DockerHub username: " dockerhub_user
    
    if [ -z "$dockerhub_user" ]; then
        echo "⚠️  Користам default image имиња. Заменете ги во манифестите."
        return
    fi
    
    # Замени ги image имињата во манифестите
    sed -i "s/your-dockerhub-username/$dockerhub_user/g" k8s-manifests.yaml
    
    echo "✅ Image имињата се ажурирани"
}

# Главна deployment функција
deploy() {
    echo "📦 Применување на Kubernetes манифести..."
    
    # Примени ги манифестите по редослед
    kubectl apply -f k8s-manifests.yaml
    kubectl apply -f k8s-secrets.yaml
    
    echo "⏳ Чекам подовите да се подигнат..."
    
    # Чекај deployment да заврши
    kubectl wait --for=condition=available --timeout=300s deployment/postgres-deployment -n my-app
    kubectl wait --for=condition=available --timeout=300s deployment/backend-deployment -n my-app
    kubectl wait --for=condition=available --timeout=300s deployment/frontend-deployment -n my-app
    
    echo "✅ Deployment завршен успешно!"
}

# Функција за проверка на статус
check_status() {
    echo "📊 Статус на deployment:"
    echo
    kubectl get all -n my-app
    echo
    echo "📋 Подови:"
    kubectl get pods -n my-app -o wide
    echo
    echo "🌐 Сервиси:"
    kubectl get services -n my-app
}

# Функција за logs
show_logs() {
    echo "📝 Logs од подовите:"
    echo
    echo "=== Backend logs ==="
    kubectl logs -l app=backend -n my-app --tail=50
    echo
    echo "=== Frontend logs ==="
    kubectl logs -l app=frontend -n my-app --tail=50
}

# Функција за cleanup
cleanup() {
    echo "🧹 Бришење на deployment..."
    kubectl delete namespace my-app
    echo "✅ Cleanup завршен"
}

# Главно мени
case "$1" in
    "deploy")
        create_secrets
        update_images
        deploy
        check_status
        ;;
    "status")
        check_status
        ;;
    "logs")
        show_logs
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo "Употреба: $0 {deploy|status|logs|cleanup}"
        echo
        echo "Команди:"
        echo "  deploy  - Deploy на целата апликација"
        echo "  status  - Прикажи статус на deployment"
        echo "  logs    - Прикажи logs од подовите"
        echo "  cleanup - Избриши го deployment"
        exit 1
        ;;
esac