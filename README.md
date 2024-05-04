

## Description <!-- omit from toc -->

A PoC for [nest#12567](https://github.com/nestjs/nest/pull/12567) and [nest#13536](https://github.com/nestjs/nest/pull/13536)

- Example use case: https://stackoverflow.com/questions/77225518/using-subdomains-in-nestjs-with-fastify-adapter
- GH Issue: https://github.com/nestjs/nest/issues/12496
- Fastify docs ref: https://fastify.dev/docs/latest/Reference/Routes/#constraints

- [PoC](#poc)
  - [Testing the implementation](#testing-the-implementation)
    - [When not using any configurations](#when-not-using-any-configurations)
    - [Using NestJS API versioning](#using-nestjs-api-versioning)
    - [Using Fastify version constraints ](#using-fastify-version-constraints-)
    - [Using Fastify host constraints](#using-fastify-host-constraints)
    - [Using NestJS API versioning and Fastify host constraints](#using-nestjs-api-versioning-and-fastify-host-constraints)
- [License](#license)

## PoC

Install dependencies

```bash
pnpm i

# install local copy of updated package e.g.
pnpm i /Users/fcmam5/lab/oss/nest/packages/platform-fastify
```

Run server with:

- `s:d`To start the application with the `enableVersioning()` (uses URI by [default](https://docs.nestjs.com/techniques/versioning#versioning)) (runs: [`src/main.with-default-versioning.ts`](./src/main.with-default-versioning.ts))
- `s:v`To start the application with enabled versioning (uses HEADER for this example), runs: [`src/main.with-enabled-versioning.ts`](./src/main.with-enabled-versioning.ts)
- `s:nv`To start the application with no versioning, runs [`src/main.with-noversioning.ts`](./src/main.with-noversioning.ts)

<details>
  <summary>we see that the constraints are set correctly.</summary>

```
[Nest] 73676  - 10/14/2023, 4:20:17 PM     LOG [NestFactory] Starting Nest application...
[Nest] 73676  - 10/14/2023, 4:20:17 PM     LOG [InstanceLoader] AppModule dependencies initialized +16ms
[Nest] 73676  - 10/14/2023, 4:20:17 PM     LOG [RoutesResolver] AppController {/}: +3ms
{ hasConstraints: false }
{ routeConstraints: undefined }
[Nest] 73676  - 10/14/2023, 4:20:17 PM     LOG [RouterExplorer] Mapped {/greet, GET} (version: v1) route +7ms
{ hasConstraints: true }
{ routeConstraints: { version: 'v2' } }
[Nest] 73676  - 10/14/2023, 4:20:17 PM     LOG [RouterExplorer] Mapped {/greet, GET} route +2ms
{ hasConstraints: true }
{ routeConstraints: { host: 'de.example.com' } }
[Nest] 73676  - 10/14/2023, 4:20:17 PM     LOG [RouterExplorer] Mapped {/greet, GET} (version: v3) route +1ms
{ hasConstraints: true }
{ routeConstraints: { host: 'ar.example.com' } }
[Nest] 73676  - 10/14/2023, 4:20:17 PM     LOG [RouterExplorer] Mapped {/greet, GET} route +2ms
[Nest] 73676  - 10/14/2023, 4:20:17 PM     LOG [NestApplication] Nest application successfully started +2ms
```

The objects are logging the two objects [from this block](https://github.com/nestjs/nest/blob/df96d7499298b62f6783c7787e922d7229c31122/packages/platform-fastify/adapters/fastify-adapter.ts#L662C9-L673), with:

```ts
    console.log({ hasConstraints });
    console.log({ routeConstraints });
```

</details>


### Testing the implementation

Check [`app.controller.ts`](./src/app.controller.ts):

```ts 
import { Controller, Get, Req, Version } from '@nestjs/common';
import { RouteConfig, RouteConstraints } from '@nestjs/platform-fastify';

@Controller()
export class AppController {
  // Using NestJS API versioning: https://docs.nestjs.com/techniques/versioning
  @Get('/greet')
  @Version('v1')
  @RouteConfig({ output: 'Hello world!' })
  greetV1(@Req() req) {
    return { msg: req.routeOptions.config.output, version: 'v1' };
  }

  // Using Fastify version constraints: https://fastify.dev/docs/latest/Reference/Routes/#version-constraints
  @Get('/greet')
  @RouteConstraints({
    version: 'v2',
  })
  greetV2(@Req() req) {
    return { msg: 'HELLO WORLD!', version: 'v2' };
  }

  // Using NestJS API versioning and Fastify host constraints: https://fastify.dev/docs/latest/Reference/Routes/#host-constraints
  @Get('/greet')
  @Version('v3')
  @RouteConstraints({
    host: 'de.example.com',
  })
  greetDEHosts() {
    return { msg: 'Hello welt!', version: 'v3' };
  }

  // Using Fastify host constraints: https://fastify.dev/docs/latest/Reference/Routes/#host-constraints
  @Get('/greet')
  @RouteConstraints({
    host: 'ar.example.com',
  })
  greetArHosts() {
    return { msg: 'آهلا بالعالم' };
  }

  // Not using any config
  @Get('/greet-everyone')
  greetEveryone() {
    return { msg: 'Hello world!' };
  }
}

```

It maps multiple handlers for `GET /greet` each one of them doesn't have any constraints.

For this example, I'm using [header versioning](https://docs.nestjs.com/techniques/versioning#header-versioning-type) with: 

```ts
  app.enableVersioning({
    type: VersioningType.HEADER,
    header: 'Accept-Version',
  })
```

And below are the tests using [HTTPie client](https://httpie.io/):

---

#### When not using any configurations 

Request:

```bash
▶ http http://127.0.0.1:3000/greet-everyone  
HTTP/1.1 200 OK
Connection: keep-alive
Date: Sat, 14 Oct 2023 14:43:36 GMT
Keep-Alive: timeout=72
content-length: 22
content-type: application/json; charset=utf-8

{
    "msg": "Hello world!"
}
```

This hits:

```ts
  @Get('/greet-everyone')
  greetEveryone() {
    return { msg: 'Hello world!' };
  }
```


---

#### Using [NestJS API versioning](https://docs.nestjs.com/techniques/versioning)

Request:

```bash
▶ http http://127.0.0.1:3000/greet "Accept-Version:v1"                       
HTTP/1.1 200 OK
Connection: keep-alive
Date: Sat, 14 Oct 2023 14:50:19 GMT
Keep-Alive: timeout=72
content-length: 37
content-type: application/json; charset=utf-8

{
    "msg": "Hello world!",
    "version": "v1"
}
```

This hits:

```ts
  @Get('/greet')
  @Version('v1')
  @RouteConfig({ output: 'Hello world!' })
  greetV1(@Req() req) {
    return { msg: req.routeOptions.config.output, version: 'v1' };
  }
```

> Don't mind `@RouteConfig({ output: 'Hello world!' })` It's just there to test that this change isn't breaking `@RouteConfig` 😁



---

#### Using [Fastify version constraints ](https://fastify.dev/docs/latest/Reference/Routes/#version-constraints)


Request

```bash
▶ http http://127.0.0.1:3000/greet "Accept-Version:v2"
HTTP/1.1 200 OK
Connection: keep-alive
Date: Sat, 14 Oct 2023 14:54:23 GMT
Keep-Alive: timeout=72
content-length: 37
content-type: application/json; charset=utf-8

{
    "msg": "HELLO WORLD!",
    "version": "v2"
}
```

This hits:

```ts
  @Get('/greet')
  @RouteConstraints({
    version: 'v2',
  })
  greetV2(@Req() req) {
    return { msg: 'HELLO WORLD!', version: 'v2' };
  }
```

---

#### Using [Fastify host constraints](https://fastify.dev/docs/latest/Reference/Routes/#host-constraints)

Request:

```bash
▶ http http://127.0.0.1:3000/greet "Host: ar.example.com"                    
HTTP/1.1 200 OK
Connection: keep-alive
Date: Sat, 14 Oct 2023 14:58:23 GMT
Keep-Alive: timeout=72
content-length: 33
content-type: application/json; charset=utf-8

{
    "msg": "آهلا بالعالم"
}
```

This hits:

```ts
  @Get('/greet')
  @RouteConstraints({
    host: 'ar.example.com',
  })
  greetArHosts() {
    return { msg: 'آهلا بالعالم' };
  }
```


---

####  Using [NestJS API versioning](https://docs.nestjs.com/techniques/versioning) and [Fastify host constraints](https://fastify.dev/docs/latest/Reference/Routes/#host-constraints)
  

Request:

```bash
▶ http http://127.0.0.1:3000/greet "Accept-Version:v3" "Host: de.example.com"
HTTP/1.1 200 OK
Connection: keep-alive
Date: Sat, 14 Oct 2023 14:56:33 GMT
Keep-Alive: timeout=72
content-length: 36
content-type: application/json; charset=utf-8

{
    "msg": "Hello welt!",
    "version": "v3"
}

```

This hits:

```ts
  @Get('/greet')
  @Version('v3')
  @RouteConstraints({
    host: 'de.example.com',
  })
  greetDEHosts() {
    return { msg: 'Hello welt!', version: 'v3' };
  }

```



## License

Nest is [MIT licensed](LICENSE).
