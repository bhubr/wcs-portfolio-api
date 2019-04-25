# API Portfolio Wild

## Récupérer la liste des projets :

    https://portfolio-api.wild31.com/api/projects

## Récupérer un projet

Par son id:

    https://portfolio-api.wild31.com/api/projects/51

Par son "slug":

    https://portfolio-api.wild31.com/api/projects/dead-candy

## Créer un wilder

Requête en POST vers https://portfolio-api.wild31.com/api/projects

Champs requis:

* title
* repo
* link
* picture
* promo
* type

Champs optionnels:

* description
* wilders
  * en string, ex: "defunkt,mojombo"
  * en tableau, ex: ["defunkt", "mojombo"]
* techno

## Récupérer la liste des wilders

    https://portfolio-api.wild31.com/api/wilders

Format des données renvoyées :

```json
[
  {
    "id": 123456,
    "login": "SomeLogin",
    "promo": "0219-js",
    "avatar": "https://github.com/path/to/avatar.jpg"
  }
]
```

## Récupérer la liste des promos

    https://portfolio-api.wild31.com/api/promos

```json
[
  {
    "key": "0918-js",
    "value": "Septembre 2018"
  },
  {
    "key": "0219-js",
    "value": "Février 2019"
  }
]
```

## S'authentifier

Requête en POST vers https://portfolio-api.wild31.com/api/login

Champs requis:

* email
* password
