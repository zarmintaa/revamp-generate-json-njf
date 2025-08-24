export const sideBarItem = [
  { type: 'caption', title: 'Tools' },
  {
    type: 'submenu',
    title: 'Generate JSON',
    icon: 'ti-layout-grid',
    children: [
      {
        type: 'link',
        title: 'MASTER',
        to: '/generate-master',
        external: false,
      },
      {
        type: 'link',
        title: 'SCHD',
        to: '/generate-schd',
        external: false,
      },
      {
        type: 'link',
        title: 'TRX-FAST',
        to: '/generate-trx-fast',
        external: false,
      },
    ],
  },
  { type: 'caption', title: 'Data' },
  {
    type: 'submenu',
    title: 'Generate DATA',
    icon: 'ti-layout-grid',
    children: [
      {
        type: 'link',
        title: 'MASTER PPD',
        to: '/create-master-ppd',
        external: false,
      },
      {
        type: 'link',
        title: 'SCHEDULE',
        to: '/create-schedule',
        external: false,
      },

      {
        type: 'link',
        title: 'TRX-FAST',
        to: '/generate-trx-fast',
        external: false,
      },
    ],
  },
  // { type: 'caption', title: 'Home' },
  // { type: 'link', title: 'Dashboard', to: '/dashboard', icon: 'ti-home' },
  // {
  //   type: 'link',
  //   title: 'Dashboard User',
  //   to: '/dashboard-user',
  //   icon: 'ti-home',
  // },
  // {
  //   type: 'link',
  //   title: 'Assigned Tasks',
  //   to: '/assigned-task',
  //   icon: 'ti-files',
  // },
  // {
  //   type: 'link',
  //   title: 'Projects',
  //   to: '/projects',
  //   icon: 'ti-square',
  // },
  // { type: 'caption', title: 'Manage' },
  // {
  //   type: 'submenu',
  //   title: 'Project',
  //   icon: 'ti-layout-grid',
  //   children: [
  //     {
  //       type: 'link',
  //       title: 'List',
  //       to: '/project/list',
  //       external: false,
  //     },
  //     {
  //       type: 'link',
  //       title: 'Status',
  //       to: '/project/status',
  //       external: false,
  //     },
  //     {
  //       type: 'link',
  //       title: 'Type',
  //       to: '/project/type',
  //       external: false,
  //     },
  //     {
  //       type: 'link',
  //       title: 'Phase',
  //       to: '/project/phase',
  //       external: false,
  //     },
  //   ],
  // },
  // { type: 'link', title: 'Member', to: '/member', icon: 'ti-user' },
  // { type: 'link', title: 'Team', to: '/team', icon: 'ti-users' },
  // { type: 'link', title: 'Ticket', to: '/ticket', icon: 'ti-ticket' },

  // { type: 'divider' },
]
