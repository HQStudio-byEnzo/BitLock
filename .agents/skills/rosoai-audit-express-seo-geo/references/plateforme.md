# Adaptation à la session

Ce skill fonctionne dans une session opencode. Il est chargé à la demande avec l'outil `skill` (nom `rosoai-audit-express-seo-geo`), ou lorsqu'une demande correspond à sa description.

## Outils à employer

- Lecture d'une page publique : l'outil de lecture web de la session, ou une requête HTTP explicite via le terminal pour les statuts et les en-têtes.
- Navigateur disponible : l'utiliser pour le DOM rendu, les éléments repliés et les données structurées.
- Fichiers locaux : `Read`, `Grep` et `Glob` suffisent pour un HTML fourni ou un export du DOM.
- Analyse HTML locale : `scripts/inspect_html.py`, avec Python 3.9 ou plus récent et sans paquet supplémentaire. Sous Windows, `python` ou `py`. L'outil ne collecte rien sur Internet.

## Rangement du travail

Conserver les observations et le rapport dans un nouveau dossier de travail autorisé, en dehors du dossier du skill. Respecter les fichiers déjà présents et ne rien écraser. Ne pas lire les secrets, les fichiers de configuration de comptes ni le reste du disque pour un audit de site public.

## Si un outil manque

Déclarer les contrôles techniques non vérifiables plutôt que de les déduire. Aucune installation de dépendance ni clé API n'est requise pour le volet éditorial. Ne pas présenter un échec d'outil comme un défaut du site.
