FROM ubuntu:latest
WORKDIR /app
ENV BUN_INSTALL="/root/.bun"
RUN apt-get update && apt-get install -y curl unzip
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="$BUN_INSTALL/bin:$PATH"
COPY . /app
RUN bun install
CMD ["bun", "run", "start"]
