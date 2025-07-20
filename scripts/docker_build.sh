#!/bin/bash

set -e

cd "$(dirname "$0")/../"
LOCAL_PATH=$(pwd)
User=$1

source ./scripts/common.sh
APP="xpack-mcp-market"

VERSION=$(gen_version)

if [[ "${User}" == "" ]];then
  User="xpackai"
fi

imageName=${User}/${APP}:${VERSION}
docker rmi -f ${imageName}

echo "docker build ${OPTIONS} -t ${imageName} --build-arg VERSION=${VERSION} --build-arg APP=${APP}  -f ./scripts/Dockerfile ./"
docker build ${OPTIONS} -t ${imageName} --build-arg VERSION=${VERSION} --build-arg APP=${APP}  -f ./scripts/Dockerfile ./