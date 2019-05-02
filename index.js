const express = require('express');
const bodyParser = require('body-parser');
const Promise = require('bluebird');
const cors = require('cors');
const morgan = require('morgan');
const slugify = require('slugify');
const fs = require('fs');
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const formatPromo = require('./helpers/formatPromo');
const sortPromos = require('./helpers/sortPromos');
const defaultProjects = require('./portfolio-projects-db.json');
const allUsers = require('./portfolio-wilders.json');
const admins = require('./admins.json');
const secret = require('./config').secret;

const allProjects = [...defaultProjects];

const signAsync = Promise.promisify(jwt.sign.bind(jwt));

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

const projectIds = allProjects.map(p => p.id);
let nextProjectId = Math.max(...projectIds) + 1;

const formatProj = p => ({ ...p, wilders: p.wilders || [] });

app.get('/api/projects', (req, res) => res.json(allProjects.map(formatProj)));

app.get('/api/wilders', (req, res) => res.json(allUsers));

app.get('/api/projects/:idOrSlug', (req, res) => {
  const project = allProjects.find(
    p => p.id === Number(req.params.idOrSlug) || p.slug === req.params.idOrSlug
  );
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  return res.json(formatProj(project));
});

app.delete('/api/projects/:id', (req, res) => {
  const id = Number(req.params.id);
  const projectIdx = allProjects.findIndex(p => p.id === id);
  if (projectIdx === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  allProjects.splice(projectIdx, 1);
  fs.writeFile('portfolio-projects-db.json', JSON.stringify(allProjects, null, 2), (err) => {
    if (err) return res.status(500).json({ errors: [err.message] });
    return res.sendStatus(204);
  });
});

const getWilders = async (wilders, promo) => {
  if (!wilders) {
    return [];
  }
  const wildersArr = typeof wilders === 'string'
    ? wilders.split(',')
    : wilders;
  const wilderObjects = await Promise.reduce(
    wildersArr,
    (carry, login) => {
      let existing = allUsers.find(u => u.login === login);
      if (existing) {
        return [...carry, existing];
      }
      return axios.get(`https://api.github.com/users/${login}`)
        .then(res => res.data)
        .then(({ id, login, avatar_url: avatar }) => [
          ...carry, { id, login, promo, avatar }
        ]);
    },
    []
  );
  const newWilders = wilderObjects.filter(w => !allUsers.find(u => u.login === w.login));
  allUsers.push(...newWilders);
  allUsers.sort(sortPromos('promo'));
  fs.writeFile('portfolio-wilders.json', JSON.stringify(allUsers, null, 2), (err) => {
    if (err) {
      console.log('could not write new wilders', err);
    }
  });
  return wilderObjects.map(w => { delete w.isNew; return w; });
};

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      error: '"email" and "password" fields are required'
    });
  }
  const admin = admins.find(item => item.email === email);
  if (!admin) {
    return res.status(401).json({
      error: 'Wrong email or password'
    });
  }
  bcrypt.compare(password, admin.password).then(match => {
    if (!match) {
      return res.status(401).json({
        error: 'Wrong email or password'
      });
    }
    signAsync({ email }, secret)
      .then(token => res.json({ token }))
      .catch(err => res.status(500).json({ error: err.message }))
  });
});

app.get('/api/promos', (req, res) => {
  const promos = allUsers.map(user => user.promo)
    .filter((promo, idx, promos) => promos.indexOf(promo) === idx)
    .map(formatPromo);
  promos.sort(sortPromos('key'));
  return res.json(promos);
});

app.post('/api/projects', async (req, res) => {
  try {
    const errors = [];
    const required = ['title', 'link', 'repo', 'picture', 'promo', 'type'];
    const optional = ['description', 'techno', 'wilders'];
    const all = [...required, ...optional];
    if (!req.body || typeof req.body !== 'object') {
      errors.push('request body is empty or not an object');
    } else {
      all.forEach(k => {
        if (!(k in req.body) && required.includes(k)) {
          errors.push(`key '${k}' is required`);
        }
      });
      Object.keys(req.body).forEach(k => {
        if (!all.includes(k)) {
          errors.push(`key '${k}' should not be provided`);
        }
      });
    }
    if (errors.length) {
      console.error(errors);
      return res.status(400).json({ errors });
    }
    const wilders = await getWilders(req.body.wilders, req.body.promo);
    delete req.body.wilders;

    const slug = slugify(req.body.title, {
      replacement: '-',
      remove: /[*+~.()'"!:@]/g,
      lower: true
    });
    const date = new Date().toISOString();
    const newProject = { ...req.body, id: nextProjectId, slug, date, wilders };
    nextProjectId += 1;
    allProjects.push(newProject);

    fs.writeFile('portfolio-projects-db.json', JSON.stringify(allProjects, null, 2), (err) => {
      if (err) return res.status(500).json({ errors: [err.message] });
      return res.json(newProject);
    });
  } catch(e) {
    console.error(e);
    return res.status(500).json({ errors: [e.message] });
  }
});

app.listen(process.env.PORT || 5095);
