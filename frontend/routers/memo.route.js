const router = require('express').Router();
const jwtMiddleware = require('../../utils/jwtMiddleware');

// Constants
const PATH = 'content/memo/';
const RENDER_OPTION_DEFAULTS = {
  active_topbar_tab: 'MOA/MOU',
  sidebar: 'memo_sidebar',
}


// *** ROUTES *** //


// Redirect
router.get('/', (req, res) => res.redirect(`/m/dashboard`));


// Dashboard
router.get('/dashboard', jwtMiddleware, (req, res) => {
  const { roles, first_name, last_name } = req.auth;

  roles.includes('Extensionist') || roles.includes('Chief')
    ? res.render(PATH + 'dashboard', {
      document_title: 'Dashboard',
      active_sidebar_tab: 'Dashboard',
      name: `${ first_name } ${ last_name }`,
      role: 'Extensionist',
      ...RENDER_OPTION_DEFAULTS
    })
    : console.log('404')
});


module.exports = router;