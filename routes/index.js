'use strict';
const Router = require('koa-router');
const koaBody = require('koa-body');
const got = require('got');
const ServerRenderer = require('../services/ServerRenderer');

const renderer = new ServerRenderer({
  streaming: false,
  // flushInterval: 1000 * 30, //flush every 30s
});

const config = require('../config/env');
const utils = require('../config/utils');
const { logger } = require('../services/logger');

const appPrefix = utils.normalizeTailSlash(config.getAppPrefix());

const router = new Router({
  prefix: appPrefix,
});

router.use(async function(ctx, next) {
  // console.log(`start of index router: ${ctx.path}`);
  ctx.set('Cache-Control', 'no-cache');
  ctx.state = {
    initialData: {},
  };
  await next();
  // console.log(`end of index router: ${ctx.path}`);
});

/**
 * File upload demo
 */
router.post('/user', koaBody({ multipart: true }), async function(ctx) {
  const body = ctx.request.body;
  // console.log(body);
  ctx.body = { result: body };
});

/**
 * Async request data for initial state demo
 */
router.get('/github', async function(ctx) {
  if (renderer.isCacheMatched(ctx.path)) {
    renderer.renderFromCache(ctx.path, ctx);
    return;
  }

  if (!renderer.isSSREnabled()) {
    ctx.body = renderer.genHtml('', {}, ctx);
    return;
  }

  //you can use isomorphic-fetch to share the fetch logic
  logger.info('requesting github data...');
  const res = await got(
    'https://api.github.com/repos/jasonboy/wechat-jssdk/branches',
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
      },
      json: true,
    }
  );
  const data = { github: res.body };
  renderer.render(ctx, data);
});

/**
 * Other default handler
 */
router.get('*', async function(ctx) {
  renderer.render(ctx);
});

module.exports = router;
