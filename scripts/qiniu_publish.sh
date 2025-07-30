#!/bin/sh

set -e

Version=$1
ImageName=$2
APP="xpack-mcp-market"

ARCH=amd64

Tar="${APP}.${Version}.${ARCH}.tar.gz"

echo "docker save -o ${Tar} ${ImageName}:${Version}"
docker save -o ${Tar} ${ImageName}:${Version}

echo "login qiniu..."
qshell account ${AccessKey} ${SecretKey} ${QINIU_NAME}

echo "qshell rput ${QINIU_BUCKET} \"xpack/images/${Tar}\" ${Tar}"
qshell rput --part-size 2097152 --thread-count 4 ${QINIU_BUCKET} "xpack/images/${Tar}" ${Tar}

rm -f ${Tar}
docker rmi -f ${ImageName}:${Version}