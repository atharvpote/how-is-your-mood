FROM node:18-bookworm

RUN apt update && apt install neovim bash-completion -y

RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.bashrc" SHELL="$(which bash)" bash -

WORKDIR /root/workspace
