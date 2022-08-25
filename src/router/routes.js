const routes = [
  {
    path: '/',
    redirect: '/p/',
  },

  {
    path: '/p/',
    component: () => import('layouts/MainLayout'),
    children: [
      {
        path: '',
        component: () => import('pages/Providers')
      },
      {
        path: '/p/:providerId',
        component: () => import('pages/Provider')
      },
      {
        path: '/p/:providerId/mt',
        component: () => import('pages/MissionTplsOrTpl')
      },
      {
        path: '/p/:providerId/mt/:missionTplId',
        component: () => import('pages/MissionTplsOrTpl')
      },
      {
        path: '/p/:providerId/mt/:missionTplId/p/:paramName',
        component: () => import('pages/Parameter')
      },
      {
        path: '/p/:providerId/m',
        component: () => import('pages/Missions')
      },
      {
        path: '/p/:providerId/mt/:missionTplId/m/:missionId',
        component: () => import('pages/Mission')
      },
      {
        path: '/p/:providerId/ac',
        component: () => import('pages/AssetClasses')
      },
      {
        path: '/p/:providerId/ac/:className',
        component: () => import('pages/AssetClass')
      },
      {
        path: '/p/:providerId/a',
        component: () => import('pages/Assets')
      },
      {
        path: '/p/:providerId/a/:assetId',
        component: () => import('pages/Asset')
      },
      {
        path: '/p/:providerId/u',
        component: () => import('pages/Units')
      },
      {
        path: '/p/:providerId/u/:unitName',
        component: () => import('pages/Unit')
      },
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
