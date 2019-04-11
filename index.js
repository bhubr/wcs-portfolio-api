const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const slugify = require('slugify');
const fs = require('fs');
const defaultProjects = require('./portfolio-projects-db.json');

const allProjects = [...defaultProjects];

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

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

app.post('/api/projects', (req, res) => {
  try {
    const errors = [];
    const required = ['title', 'link', 'repo', 'picture', 'promo', 'type'];
    const optional = ['description', 'techno'];
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
    const slug = slugify(req.body.title, {
      replacement: '-',
      remove: /[*+~.()'"!:@]/g,
      lower: true
    });
    const date = new Date().toISOString();
    const newProject = { ...req.body, id: nextProjectId, slug, date };
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

app.listen(process.env.PORT || 5095);

