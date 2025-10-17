# Author: Eolink-liujian
# Date: 2025-07-19
# Description: Dockerfile for XPack
FROM  python:3.12.11-alpine3.22

RUN apk add nodejs=~22 npm uv nginx
ENV TZ=Asia/Shanghai
RUN ln -sf /usr/share/zoneinfo/${TZ} /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone

ARG APP XPack-MCP-Market
ARG VERSION latest

RUN mkdir -p /$APP

WORKDIR /$APP
COPY requirements.txt /$APP/requirements.txt

RUN uv venv && source .venv/bin/activate && uv pip install -r requirements.txt
RUN echo $VERSION > .version

COPY scripts/resource/default.conf /etc/nginx/http.d/default.conf
COPY frontend/out/ /$APP/frontend
COPY scripts/resource/ /$APP
COPY pyproject.toml /$APP/pyproject.toml
COPY services/ /$APP/services

CMD [ "./start.sh" ]