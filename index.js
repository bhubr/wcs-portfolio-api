const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const allProjects = require('./portfolio-projects.json');

const app = express();
app.use(bodyParser.json());
app.use(cors());

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

app.listen(process.env.PORT || 5095);

