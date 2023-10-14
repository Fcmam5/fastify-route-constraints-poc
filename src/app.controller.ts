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
