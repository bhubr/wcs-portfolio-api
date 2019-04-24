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

## S'authentifier

Requête en POST vers https://portfolio-api.wild31.com/api/login

Champs requis:

* email
* password
