#! /bin/bash

set -e
# 考虑该脚本的文件地址，将该脚本的上级目录作为工作目录
SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
PROJECT_ROOT=$(dirname "${SCRIPT_DIR}")
cd "${PROJECT_ROOT}" || exit 1
FRONTEND_DIR="${PROJECT_ROOT}/frontend"
FRONTEND_OUT_DIR=${FRONTEND_DIR}/out

source scripts/common.sh

set_log_file "frontend_build.log"

check_node_env() {
    # 检查是否安装了 node 并验证版本
    if ! command -v node &> /dev/null; then
        echo_error "Node.js is not installed. Please install Node.js version >= 22.x"
        exit 1
    fi
    
    # 检查 node 版本
    node_version=$(node -v | cut -d "v" -f 2)
    if ! echo "$node_version" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
        echo_error "Invalid Node.js version format: $node_version"
        exit 1
    fi
    major_version=$(echo "$node_version" | cut -d. -f1)
    if [ "$major_version" -lt 22 ]; then
        echo_error "Node.js version must be >= 22.x (current: $node_version)"
        exit 1
    fi
    echo_info "Node.js version $node_version is installed."

    # 检查是否安装了 npm
    if ! command -v npm &> /dev/null; then
        echo_error "Npm is not installed. Please install Npm."
        exit 1
    fi
    echo_info "Npm is installed."

    # 检查是否安装了 pnpm 并验证版本
    if ! command -v pnpm &> /dev/null; then
        echo_error "Pnpm is not installed. Please install Pnpm version >= 9.x"
        exit 1
    fi
    
    # 检查 pnpm 版本
    pnpm_version=$(pnpm -v)
    if ! echo "$pnpm_version" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
        echo_error "Invalid pnpm version format: $pnpm_version"
        exit 1
    fi
    major_version=$(echo "$pnpm_version" | cut -d. -f1)
    if [ "$major_version" -lt 9 ]; then
        echo_error "Pnpm version must be >= 9.x (current: $pnpm_version)"
        exit 1
    fi
    echo_info "Pnpm version $pnpm_version is installed."
}

clean_build_cache() {
    if [ "$1" = "" ] || [ "$1" = "/" ]; then
        return
    fi
    if [ -d "$1" ]; then
        echo_debug "Cleaning directory: $1"
        rm -rf "$1"
    fi
}

frontend_build() {
    echo_info "Begin frontend build..."
    cd "${FRONTEND_DIR}" || exit 1
    echo_debug "Running command: pnpm install --frozen-lockfile"
    pnpm install --frozen-lockfile || exit 1
    
    echo_debug "Running command: pnpm build"
    pnpm build || exit 1
    
    echo_info "Frontend build success."
}

check_node_env

clean_build_cache "${FRONTEND_DIR}/.next"
clean_build_cache "${FRONTEND_DIR}/node_modules"

if [ ! -d "${FRONTEND_OUT_DIR}" ]; then
    echo_info "Frontend out directory does not exist. Creating..."
    mkdir -p "${FRONTEND_OUT_DIR}"
else 
    # 删除输出目录内所有文件
    echo_debug "Cleaning output directory: ${FRONTEND_OUT_DIR}"
    rm -rf "${FRONTEND_OUT_DIR}"
    mkdir -p "${FRONTEND_OUT_DIR}"
fi

frontend_build

echo_debug "Copying build artifacts to output directory"

# 首先确保目标目录存在
mkdir -p "${FRONTEND_OUT_DIR}/.next"

# 复制 standalone 目录内容
echo_debug "Copying .next/standalone directory to output directory"
if [ -d "${FRONTEND_DIR}/.next/standalone" ]; then
    cp -R "${FRONTEND_DIR}/.next/standalone/." "${FRONTEND_OUT_DIR}/"
fi

# 复制 static 目录
echo_debug "Copying .next/static to output directory"
if [ -d "${FRONTEND_DIR}/.next/static" ]; then
    cp -R "${FRONTEND_DIR}/.next/static" "${FRONTEND_OUT_DIR}/.next/"
fi

# 复制 public 目录
echo_debug "Copying public to output directory"
if [ -d "${FRONTEND_DIR}/public" ]; then
    cp -R "${FRONTEND_DIR}/public" "${FRONTEND_OUT_DIR}/"
fi
ls -al "${FRONTEND_OUT_DIR}"
echo_info "Frontend build success."