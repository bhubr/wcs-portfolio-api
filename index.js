const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const slugify = require('slugify');
const fs = require('fs');
const defaultProjects = require('./portfolio-projects-db.json');

const allProjects = [...defaultProjects];

const app = express();
app.use(bodyParser.json());
app.use(cors());

const projectIds = allProjects.map(p => p.id);
let nextProjectId = Math.max(...projectIds) + 1;

app.get('/api/projects', (req, res) => res.json(allProjects));

app.get('/api/projects/:idOrSlug', (req, res) => {
  const project = allProjects.find(
    p => p.id === Number(req.params.idOrSlug) || p.slug === req.params.idOrSlug
  );
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  return res.json(project);
});

app.post('/api/projects', (req, res) => {
  const errors = [];
  const required = ['title', 'link', 'repo', 'picture', 'promo', 'type'];
  const optional = ['description'];
  const all = [...required, ...optional];
  if (!req.body || typeof req.body !== 'object') {
    errors.push('request body is empty or not an object');
  } else {
    all.forEach(k => {
      if (!req.body[k] && required.includes(k)) {
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
    return res.status(400).json({ errors });
  }
  const slug = slugify(req.body.title, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true
  });
  const newProject = { ...req.body, id: nextProjectId, slug };
  nextProjectId += 1;
  allProjects.push(newProject);
  fs.writeFile('portfolio-projects-db.json', JSON.stringify(allProjects, null, 2), (err) => {
    if (err) return res.status(500).json({ errors: [err.message] });
    return res.json(newProject);
  });  
});

app.listen(process.env.PORT || 5095);

