#! /bin/sh

set -e 

# 判断有没有激活uv环境
check_uv_env() {
    # 检查 uv 命令是否可用
    if ! command -v uv &> /dev/null; then
        echo "Error: uv command not found"
        echo "Please install uv using 'pip install uv'"
        exit 1
    fi
    source .venv/bin/activate
    echo "UV environment is properly activated"
}

CURRENT_DIR=$(dirname "$(readlink -f "$0")")
LOG_DIR=${CURRENT_DIR}/logs
if [ -d ${LOG_DIR} ]; then
    echo "logs directory exists"
else
    echo "logs directory not exists, create it"
    echo "LOG_DIR: ${LOG_DIR}"
    mkdir -p ${LOG_DIR}
fi

# 执行环境检查
check_uv_env

if [ -f .env.example ]; then
   cp .env.example .env
fi

# 初始化数据库
python ./init_db.py

nohup uvicorn services.admin_service.main:app --host 0.0.0.0 --port 8001 --timeout-graceful-shutdown 2 --timeout-keep-alive 1 > ${LOG_DIR}/admin_service.log 2>&1 &

sleep 5s

nohup uvicorn services.api_service.main:app --host 0.0.0.0 --port 8002 --timeout-graceful-shutdown 2 --timeout-keep-alive 1 > ${LOG_DIR}/api_service.log 2>&1 &
HOSTNAME=""
cd frontend/ && nohup node server.js> ${LOG_DIR}//frontend.log 2>&1 &

sleep 2s

nginx

tail -F ${LOG_DIR}/*.log