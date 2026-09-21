# Collecter sans inventer

## Choisir une voie disponible

### Navigateur rendu

Lire la page visible, son titre et, si l'outil le permet, les éléments du DOM : balise title, meta description, meta robots et directives propres aux moteurs, canonical, H1 à H6, liens du contenu principal. Vérifier les éléments repliés pertinents sans envoyer de formulaire ni déclencher d'achat. Distinguer la page rendue des en-têtes HTTP, qui ne sont pas nécessairement exposés.

Ne pas affirmer avoir collecté le code source réseau lorsque seul le DOM a été consulté. Des scripts peuvent avoir modifié les métadonnées. Ne pas fabriquer de capture ou de journal réseau.

### Lecture web ou requête HTTP autorisée

Une réponse explicitement exposée par l'outil permet de relever son statut, son URL finale, ses redirections documentées et les en-têtes utiles. Ne pas déduire ces éléments d'une simple page lisible. Éviter de conserver cookies, jetons ou autres en-têtes inutiles.

Une page convertie en texte peut perdre son head, ses scripts, ses composants et une partie des liens. Dans ce cas, marquer titre HTML, meta description, robots, canonical et données structurées comme non vérifiés si l'outil ne les restitue pas explicitement. Un titre affiché dans un résultat de recherche ne prouve pas le contenu de la balise title actuelle.

Les pages publiques peuvent être consultées dans le périmètre demandé. Ne pas transformer un refus en défaut SEO, forcer un mécanisme de protection ou insister sur une URL inaccessible.

### Fichier HTML local

Facultativement, utiliser Python 3.9 ou plus récent, sans bibliothèque à installer :

```text
python3 CHEMIN_DU_SKILL/scripts/inspect_html.py page.html https://exemple.fr/page preuves.json
```

Remplacer le chemin d'exemple par le chemin réel et citer correctement les chemins contenant des espaces. Les trois arguments sont positionnels. Le fichier de sortie doit être nouveau et son dossier doit exister. L'outil refuse d'écraser un fichier.

Sur Windows, employer la commande Python déjà disponible dans l'environnement. Ne pas installer de logiciel pour un contrôle facultatif : utiliser la lecture directe de l'hôte si Python manque.

L'outil ne visite aucune URL et n'exécute aucun script du HTML. Il extrait des observations, pas un verdict SEO. Il indique HTTP, redirections et indexation comme non mesurés. Son hash permet d'identifier le fichier lu, pas de garantir son origine. La date `inspected_at` est la date d'analyse du fichier, jamais sa date de publication ou de capture.

Le champ `main_text` peut être vide sans balise main ; lire alors `text`. Les champs vides reflètent uniquement le fichier fourni. Documenter si ce fichier vient du HTML réseau ou d'un export du DOM rendu. L'outil ne vérifie pas cette provenance. Les contenus pilotés par CSS, éléments repliés et encodages non UTF-8 demandent une vérification humaine ou navigateur.

### Texte collé, PDF ou capture

Adapter l'analyse aux éléments fournis. Une capture permet de commenter les mots visibles, sans certifier les balises HTML, les liens, les statuts ou l'indexation. Un brouillon permet une relecture éditoriale avant publication. Ne pas demander d'URL s'il s'agit explicitement d'un brouillon.

## Fiche d'observation

Pour P1, P2 et P3, consigner :

* URL ou nom du document ; rôle de la page et objectif.
* Date de consultation et date de capture si réellement connue.
* Méthode : navigateur rendu, réponse HTTP, texte web, HTML fourni, brouillon ou capture.
* Valeurs techniques présentes, avec leur provenance.
* Extraits courts nécessaires à l'analyse et localisation dans la page.
* Limites, erreurs de lecture et éventuels écarts entre sources.

Les chiffres et témoignages affichés par le site sont des déclarations du site tant que leurs sources n'ont pas été vérifiées. Citer cette distinction. Si deux vues du site diffèrent, utiliser la vue la plus récente et directement observée, en documentant la différence ; ne pas fusionner silencieusement les valeurs.

## Limites d'interprétation

* Un statut 200 ne prouve pas l'indexation, l'éligibilité au classement ou la présence dans les IA.
* Une canonical est une indication ; ne pas annoncer la canonical retenue par Google sans donnée appropriée.
* Un blocage robots.txt ne signifie pas systématiquement désindexation. L'effet dépend de la directive, du moteur et de sa lecture de la page.
* Distinguer robots générique, googlebot, bingbot et les en-têtes X-Robots-Tag. Un conflit ou une directive particulière exige une lecture contextualisée de la documentation officielle.
* Une absence dans le HTML brut ne prouve pas l'absence dans le rendu. Le statut de rendu doit rester explicite.
* Un lien extrait n'est pas un lien testé. Ne qualifier une destination de cassée qu'après réponse probante.
* L'absence de liens entrants dans trois pages ne prouve pas qu'une page est orpheline.
* Un temps de requête ou une impression visuelle ne constitue pas une mesure des Core Web Vitals.

Limiter le volume de texte conservé aux besoins du diagnostic. N'ajouter ni pisteur, ni appel API RosoAI, ni collecte de l'adresse email de l'utilisateur.
