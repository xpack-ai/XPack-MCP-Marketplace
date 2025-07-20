#! /bin/bash

# 日志文件路径（可选）
LOG_FILE=""

# 通用日志输出函数
log_message() {
    local level=$1
    local color=$2
    local message=$3
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local formatted_message="${timestamp} [${level}] ${message}"
    
    # 输出到终端（带颜色）
    echo -e "${color}${formatted_message}\033[0m"
    
    # 如果设置了日志文件，则同时写入文件（不带颜色）
    if [ -n "${LOG_FILE}" ]; then
        echo "${formatted_message}" >> "${LOG_FILE}"
    fi
}

# 设置日志文件路径
set_log_file() {
    LOG_FILE="$1"
}

# 错误日志
echo_error() {
    log_message "ERRO" "\033[31m" "$1"
}

# 信息日志
echo_info() {
    log_message "INFO" "\033[32m" "$1"
}

# 警告日志
echo_warn() {
    log_message "WARN" "\033[33m" "$1"
}

# 调试日志
echo_debug() {
    log_message "DBUG" "\033[36m" "$1"
}

# 跟踪日志
echo_trace() {
    log_message "TRAC" "\033[35m" "$1"
}

# ===========================================================================
# File: common.sh
# Description: common functions
# Usage: . ./common.sh
# ===========================================================================

gen_version() {
  # 判断是否传参
  if [ -n "$1" ]; then
    echo "$1"
    return
  fi
  # 是否安装了 git

  tag=$(git describe --abbrev=0 --tags)

  if [ $? -ne 0 ]; then
    tag=$(git rev-parse --short HEAD)
  fi

  echo "${tag}"
}
