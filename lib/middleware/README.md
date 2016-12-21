### Middleware

This Middleware allows to cache any response from your express web server

### Usage

Just set express.use( Middleware ).


### Usage with LabShare

Is alredy configurated for use it with lsc, just add the following configuration.

### Properties
- **req.catalog**: Add the response to an specific catalog, if the request has a PUT, DELETE, POST type will refresh this catalog.
- **req.allowCache**: Allows to cache a request of type PUT, DELETE, POST. 
- **req.ignoreCache**: Ignores to cache a request.