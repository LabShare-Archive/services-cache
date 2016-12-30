# Services-Cache 
[![Build Status](https://travis-ci.com/LabShare/services-cache.svg?token=zsifsALL6Np5avzzjVp1&branch=master)](https://travis-ci.com/LabShare/services-cache)

Services-cache is a Redis cache library that helps in the storage of values and objects with LabShare.
## Requirements

- [Node.js](https://nodejs.org/) v4+ to run.
- Redis, If redis is not installed you can use this [docker file]().
## Installation
Go to the package root folder and execute the command:
```sh
npm install 
```
*You might need to use sudo (UNIX).

## Information

- [Cache](https://github.com/LabShare/services-cache/blob/master/docs/cache.md).

- [Base class for inheritance](https://github.com/LabShare/services-cache/blob/master/docs/baseClass.md).

- [Middleware](https://github.com/LabShare/services-cache/blob/master/docs/middleware.md).

- [Middleware with Shell](https://github.com/LabShare/services-cache/blob/master/docs/middlewareShell.md).

- [Run the Docker File](https://github.com/LabShare/services-cache/blob/master/docs/docker.md).

## Note

The cache's duration is in seconds, also maxTime is used if no duration is given. 

License
----

MIT
