FROM node:lts AS dev

# install NeoVim
RUN curl -LO https://github.com/neovim/neovim/releases/download/stable/nvim.appimage && \
  chmod u+x nvim.appimage && \
  ./nvim.appimage --appimage-extract && \
  ln -s /squashfs-root/AppRun /usr/bin/nvim

# update apt repository
RUN apt-get update

# install fish
RUN apt-get install -y fish

# set default shell to fish for NeoVim
ENV SHELL=fish

# install ripgrep for Telescope.nvim
RUN apt-get install -y ripgrep

# install LazyVim (NeoVim Distro)
RUN git clone https://github.com/LazyVim/starter ~/.config/nvim

# install tmux (a simple hack to forwarding system clipboard from inside container to localhost)
# NOTE: you need to run tmux in localhost first, then mount localhost's `/tmp/tmux-1000/default` into container
RUN apt-get install -y tmux

# to make NeoVim use tmux as clipboard provider
ENV TMUX=/tmp/tmux-1000/default

# install less(terminal pager) to make scrolling possible inside container
RUN apt-get install -y less
