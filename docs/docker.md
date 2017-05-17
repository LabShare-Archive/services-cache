### Installation

For run and configure the docker file it requires [Docker](https://www.docker.com/products/overview) to run.

Open a terminal window and navigate to the run folder located in services-cache.

For create and image from the docker file, type:

```sh
docker build -t services-cache .
```

For run the docker image, type:

```sh
docker run --name services-cache -p 6379:6379  services-cache 
```
For run the docker image in the background type, type:

```sh
docker run --name services-cache -d -p 6379:6379  services-cache
```
Note: Redis' default port is 6379.
