#! /bin/bash

cd "$(dirname "$0")/../"
LOCAL_PATH=$(pwd)

source ./scripts/common.sh

User=$1
App="xpack-mcp-market"
if [[ "${User}" == "" ]];then
  User="xpackai"
fi

Version=$(gen_version)
ImageName="${User}/${App}"

echo "docker push \"${ImageName}:${Version}\""
docker push "${ImageName}:${Version}"
docker tag "${ImageName}:${Version}" "${ImageName}:latest"
echo "docker push \"${ImageName}:latest\""
docker push "${ImageName}:latest"

if [[ $2 == "upload_qiniu" ]];then
  echo "Upload QINIU Cloud..."
  ./scripts/qiniu_publish.sh ${Version} ${ImageName}
fi