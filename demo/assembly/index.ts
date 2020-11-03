import { Fastly } from "@fastly/as-compute";

let req = Fastly.getClientRequest();

let beresp = Fastly.fetch(req, {
  backend: 'example_backend',
  cacheOverride: null
}).wait();

Fastly.respondWith(beresp);