const Docker = require("dockerode");

const docker = new Docker();

async function getDockerInfo() {
  return await docker.info();
}

async function getContainers(all = true) {
  return await docker.listContainers({ all });
}

async function getImages() {
  return await docker.listImages();
}

async function getVolumes() {
  return await docker.listVolumes();
}

async function getNetworks() {
  return await docker.listNetworks();
}

module.exports = {
  docker,
  getDockerInfo,
  getContainers,
  getImages,
  getVolumes,
  getNetworks,
};