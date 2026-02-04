# Session Brainstorming: Estimateur Carrosserie

**Date:** 2026-02-04
**Facilitatrice:** Mary (BMAD Business Analyst)
**Mode:** Autopilot (représentant Yves)
**Durée:** Session approfondie

---

## Contexte

### Le Problème

Les estimateurs en carrosserie automobile jonglent avec de nombreuses responsabilités simultanées :
- Accueil client et vente
- Rédaction de devis précis sous contrainte de temps
- Négociations avec les assurances
- Suivi des dossiers et relances
- Gestion des pièces et fournisseurs
- Reporting et objectifs de performance

Actuellement, ces tâches sont souvent gérées via :
- Feuilles Excel disparates
- Logiciels de devis mono-fonction coûteux
- Notes papier et tableaux blancs
- Mémoire personnelle (source d'erreurs)

### Contraintes Techniques

- **Dev local** sur VM pour tests
- **Déploiement** Azure Container Apps
- **Multi-utilisateurs** : plusieurs estimateurs par atelier
- **Accessibilité** : web, responsive mobile

### Source : Les 16 Responsabilités d'un Estimateur

1. Accueil client jovial et professionnel
2. Informer sur le processus de réparation, assurances, droits
3. Affirmer que l'atelier est le meilleur choix
4. Tenue vestimentaire professionnelle
5. Système de suivi pour devis non obtenus et travaux achevés
6. Rédiger devis précis (10 min pour 1000$, 30 min pour 3000$)
7. Contrôler les objectifs de vente, inscrire sur tableau ventes/production
8. Perfectionner aptitudes de vente, ventes additionnelles
9. Négocier prix convenu AVANT les réparations
10. Vérifier signatures, autorisations, procurations avant réparations
11. Consigner infos spéciales sur la pochette dossier/ordinateur
12. Commander pièces (optimiser fournisseurs)
13. Examiner factures finales et comptes supplémentaires avant livraison
14. Efficacité devis : 10 min/1000$, 30 min/3000$
15. Objectifs mensuels et annuels
16. Analyse mensuelle rentabilité par assureur

---

## Vision Produit

### Énoncé de Vision

> **EstimPro** est une solution cloud tout-en-un qui permet aux estimateurs en carrosserie de gérer l'intégralité de leur workflow — de l'accueil client à la livraison finale — en maximisant leur efficacité et leur rentabilité.

### Proposition de Valeur Unique

**Pour** les ateliers de carrosserie (1-10 estimateurs)
**Qui** peinent à gérer efficacement leurs devis, clients et négociations assurances
**EstimPro est** une application web moderne et intuitive
**Qui** centralise toutes les tâches de l'estimateur en un seul outil
**Contrairement à** Mitchell, Audatex, ou des feuilles Excel
**Notre solution** est abordable, simple à utiliser, et conçue spécifiquement pour le workflow québécois/canadien

### Objectifs Business

1. **Efficacité** : Réduire le temps de création de devis de 30%
2. **Conversion** : Améliorer le taux de transformation devis→travaux de 15%
3. **Visibilité** : Dashboard temps réel des KPIs pour managers
4. **Conformité** : Traçabilité complète des signatures et autorisations

---

## Personas Utilisateurs

### 👤 Persona 1 : Marc — Estimateur Junior

**Profil:**
- 25 ans, 2 ans d'expérience
- Formation DEP en carrosserie + cours estimation
- Bon avec la technologie, smartphone toujours à portée

**Objectifs:**
- Apprendre les bonnes pratiques de l'estimation
- Éviter les erreurs coûteuses (items oubliés)
- Impressionner son manager avec de bons résultats

**Frustrations:**
- "Je ne sais jamais si j'ai tout inclus dans mon devis"
- "Les assureurs me font toujours baisser mes prix"
- "Je perds du temps à chercher les infos clients"

**Comportements:**
- Préfère les interfaces modernes et épurées
- Utilise son téléphone pour tout
- Demande souvent conseil aux seniors

**Besoins clés:**
- Templates de devis intelligents avec checklist
- Historique des prix négociés par assureur
- Alertes et rappels automatiques

---

### 👤 Persona 2 : Sylvie — Estimatrice Senior

**Profil:**
- 45 ans, 18 ans d'expérience
- Connue et respectée par les agents d'assurance
- Relationnelle, excellente en négociation

**Objectifs:**
- Maintenir sa productivité élevée
- Former les juniors occasionnellement
- Garder de bonnes relations avec les assureurs

**Frustrations:**
- "Les nouveaux logiciels me ralentissent"
- "Je connais mes assureurs par cœur, pas besoin qu'on me dise quoi faire"
- "Trop de clics pour faire une tâche simple"

**Comportements:**
- Préfère le clavier aux menus
- A ses propres méthodes éprouvées
- Résistante aux changements inutiles

**Besoins clés:**
- Interface efficace avec raccourcis clavier
- Ne pas être ralentie par des "features" inutiles
- Accès rapide à l'historique client

---

### 👤 Persona 3 : Pierre — Manager d'Atelier

**Profil:**
- 52 ans, ancien estimateur devenu manager
- Gère 4 estimateurs et 12 techniciens
- Responsable de la rentabilité globale

**Objectifs:**
- Avoir une vision claire de la performance de l'équipe
- Identifier les problèmes avant qu'ils n'explosent
- Optimiser les relations avec les assureurs rentables

**Frustrations:**
- "Je découvre les problèmes trop tard"
- "Chaque estimateur a ses propres Excel, impossible de consolider"
- "Les rapports mensuels me prennent une journée"

**Comportements:**
- Vérifie les chiffres chaque matin
- Préfère les graphiques aux tableaux
- Réunions hebdomadaires avec l'équipe

**Besoins clés:**
- Dashboard temps réel
- Alertes sur les anomalies
- Rapports automatisés par assureur
- Comparaison de performance entre estimateurs

---

## User Journeys Principaux

### Journey 1 : Accueil d'un nouveau client (15-20 min)

```
Client arrive → Marc (junior) l'accueille
    │
    ▼
📱 Ouvre EstimPro sur tablette
    │
    ▼
[Nouveau Client] → Scan permis conduire (OCR)
    │                   → Auto-remplit nom, adresse
    ▼
Ajoute véhicule → Scan immatriculation ou VIN
    │                → Lookup CarFax/base données
    ▼
Associe assurance → Dropdown assureurs connus
    │                  → Numéro de réclamation
    ▼
Notes initiales → Description dommages (voix→texte?)
    │
    ▼
📸 Photos dommages → Liées au dossier
    │
    ▼
Imprime/email → Feuille de dépôt avec signature électronique
    │
    ▼
✅ Client parti, dossier créé en <5 min
```

**Points de friction actuels:**
- Ressaisie manuelle des infos
- Photos éparpillées (téléphone perso, email...)
- Pas de trace de la signature

---

### Journey 2 : Création d'un devis (10-30 min selon complexité)

```
Marc ouvre le dossier client
    │
    ▼
[Créer Devis] → Type de dommage (collision, vandalisme...)
    │
    ▼
Assistant intelligent → Suggère sections selon type
    │                      (ex: pare-chocs AV → aile AV? phare?)
    ▼
Ajout items → Recherche pièces (intégration catalogue?)
    │            → Main d'œuvre (barèmes suggérés)
    │            → Peinture (calcul surface auto?)
    ▼
Revue totaux → Temps estimé vs temps standard
    │            → Marge visible pour manager
    ▼
Validation → Vérification complétude (checklist)
    │
    ▼
Export → PDF professionnel
       → Envoi direct à l'assureur (API? email?)
```

**Points de friction actuels:**
- Items oubliés (découverts pendant réparation)
- Temps de saisie trop long
- Pas de templates réutilisables

---

### Journey 3 : Négociation avec assureur

```
Assureur répond au devis
    │
    ├── [Approuvé] ────────────→ Planifier réparation
    │
    └── [Contre-offre] ──────→ Sylvie reprend le dossier
                                    │
                                    ▼
                            Historique négociations visible
                                    │
                                    ▼
                            Ajuster items → Justifier écarts
                                    │
                                    ▼
                            Soumettre version 2
                                    │
                                    ▼
                            [Prix convenu] → LOCK avant réparation
                                    │
                                    ▼
                            Générer autorisation → Signature client
```

**Points de friction actuels:**
- Historique des échanges perdu (emails)
- Pas de mémoire des négociations passées avec cet assureur
- Oubli de faire signer AVANT les travaux

---

### Journey 4 : Suivi et relance leads

```
Pierre (manager) consulte dashboard
    │
    ▼
Liste "Devis en attente" → Triée par âge/montant
    │
    ▼
Clique sur un lead vieux de 5 jours
    │
    ▼
Historique visible → Dernier contact, notes
    │
    ▼
Assigne relance → À Marc avec date limite
    │
    ▼
Marc reçoit notification
    │
    ▼
Appelle client → Note le résultat
    │
    ├── [Accepté] → Convertir en travaux
    ├── [Refusé] → Raison (prix? délai? ailleurs?)
    └── [Rappeler] → Nouvelle date
```

**Points de friction actuels:**
- Aucun système de suivi unifié
- Leads "tombent entre les craques"
- Pas de stats sur raisons de perte

---

### Journey 5 : Livraison et clôture

```
Réparation terminée
    │
    ▼
Estimateur vérifie → Facture finale vs devis
    │                   → Suppléments à facturer?
    ▼
Appel client → Planifier livraison
    │
    ▼
Avant livraison → Vérif signatures présentes
    │                → Tous documents OK
    ▼
Client arrive → Tour du véhicule
    │              → Signature satisfaction
    ▼
Encaissement → Lié à la facture
    │
    ▼
✅ Dossier fermé → Stats mises à jour
```

---

## Idées Générées

### Technique : What If (Ressources illimitées)

1. **IA estimation automatique** : L'IA analyse les photos et génère un devis préliminaire
2. **Intégration assureurs en temps réel** : API directe avec les systèmes des assureurs (approbation en 5 min)
3. **Reconnaissance vocale** : Dictée du devis pendant l'inspection du véhicule
4. **AR (réalité augmentée)** : Pointer les dommages avec la caméra, l'app identifie les pièces
5. **Marketplace pièces** : Prix en temps réel de tous les fournisseurs, commande en 1 clic
6. **Signature biométrique** : Face ID / Touch ID pour signatures légales
7. **Prédiction prix négocié** : ML basé sur historique avec cet assureur

### Technique : Analogies (Qui fait ça bien ailleurs?)

8. **Comme Uber pour les devis** : Estimation instantanée visible par le client
9. **Comme Shopify pour la gestion** : Dashboard simple mais puissant
10. **Comme Slack pour la collaboration** : Tous les échanges sur un dossier centralisés
11. **Comme QuickBooks** : Comptabilité intégrée, rapports automatiques
12. **Comme Calendly** : Planification des livraisons en self-service client
13. **Comme Salesforce** : CRM léger pour le suivi des leads

### Technique : Contraintes (Budget limité, MVP)

14. **Templates de devis** : 5 templates pour les dommages les plus courants
15. **Checklist obligatoire** : Avant soumission, vérification des items essentiels
16. **Timer visible** : Temps passé sur chaque devis (objectif 10min/1000$)
17. **Notifications push** : Rappels pour les relances et signatures manquantes
18. **Export PDF simple** : Format professionnel sans personnalisation complexe
19. **Mode hors-ligne basique** : Consultation des dossiers même sans internet

### Technique : First Principles (De quoi a-t-on vraiment besoin?)

20. **Base de données clients** : Avec véhicules et historique
21. **Création de devis structurée** : Items, main d'œuvre, pièces, peinture
22. **Workflow de statuts** : Nouveau → Envoyé → Négociation → Approuvé → En réparation → Livré
23. **Calculs automatiques** : Totaux, taxes, marges
24. **Gestion des documents** : Upload, organisation, recherche
25. **Authentification multi-utilisateurs** : Chaque estimateur a son compte
26. **Tableau de bord** : KPIs essentiels en un coup d'œil

### Technique : SCAMPER

**Substitute (Remplacer):**
27. Remplacer Excel par une interface formulaire guidée
28. Remplacer les tableaux papier par un dashboard digital
29. Remplacer les signatures papier par signature électronique

**Combine (Combiner):**
30. Combiner devis + CRM + facturation en un outil
31. Combiner photos + notes + devis dans un dossier unifié
32. Combiner objectifs individuels + équipe dans le dashboard

**Adapt (Adapter):**
33. Adapter les barèmes horaires selon l'atelier (configurables)
34. Adapter l'interface selon le rôle (junior vs senior vs manager)
35. Adapter les rapports selon les besoins de chaque assureur

**Modify (Modifier):**
36. Modifier le workflow pour forcer la signature avant travaux
37. Modifier les alertes selon l'urgence (email vs push vs SMS)
38. Modifier le niveau de détail des devis selon le montant

**Put to other uses:**
39. Utiliser les données pour benchmark inter-ateliers (futur)
40. Utiliser l'historique pour former les nouveaux
41. Utiliser les stats pour négocier avec les assureurs

**Eliminate (Éliminer):**
42. Éliminer la ressaisie (scan, OCR, intégrations)
43. Éliminer les exports manuels (rapports automatiques)
44. Éliminer les oublis (checklists, alertes)

**Reverse (Inverser):**
45. Inverser le workflow : le client démarre son dossier en ligne
46. Inverser la validation : l'assureur pré-approuve avant soumission
47. Inverser le reporting : les rapports poussés, pas tirés

### Idées Additionnelles

48. **Mode tablette** : Interface optimisée pour l'inspection en atelier
49. **Gamification** : Badges et classements pour motiver (optionnel)
50. **Chat interne** : Pour questions rapides entre estimateurs
51. **Bibliothèque de photos** : Photos de référence par type de dommage
52. **Calculateur de rentabilité** : En temps réel sur le devis
53. **Historique des versions** : Tracer toutes les modifications du devis
54. **Notes vocales** : Attachées au dossier, transcrites optionnellement
55. **Scan code-barres pièces** : Pour la réception des commandes
56. **Intégration comptable** : Export vers QuickBooks/Sage
57. **API ouverte** : Pour intégrations futures
58. **Multi-atelier** : Un propriétaire avec plusieurs succursales
59. **Rapport "perdus vs gagnés"** : Analyse des devis non convertis
60. **Suggestion de cross-sell** : "Avez-vous proposé le polissage?"

---

## Synthèse

### Thèmes Émergents

#### 1. 📋 **Gestion de Devis Intelligente**
Cœur du produit. Besoin de rapidité, précision, et traçabilité.
- Idées: #14, #15, #16, #21, #22, #23, #38, #53

#### 2. 👥 **CRM Léger pour Ateliers**
Suivi clients, véhicules, historique — mais simple, pas une usine à gaz.
- Idées: #13, #20, #30, #31

#### 3. 📊 **Dashboard & Reporting**
Vision temps réel pour managers, objectifs visibles pour estimateurs.
- Idées: #9, #26, #32, #43, #59

#### 4. 🤝 **Workflow Assurances**
Négociation, traçabilité, prix convenus — spécificité métier importante.
- Idées: #7, #36, #46

#### 5. 📱 **Mobile/Tablette First**
L'estimateur bouge, inspecte, n'est pas toujours au bureau.
- Idées: #48, #19, #54

#### 6. ⚡ **Efficacité et Automatisation**
Réduire les tâches manuelles, les oublis, les ressaisies.
- Idées: #1, #3, #27, #42, #44

---

### Features Prioritaires

#### P0 — Must Have (MVP v1.0)

| # | Feature | Justification |
|---|---------|---------------|
| 1 | **Gestion clients & véhicules** | Base de tout le système |
| 2 | **Création de devis structurée** | Cœur métier |
| 3 | **Workflow de statuts** | Suivi essentiel |
| 4 | **Multi-utilisateurs avec rôles** | Requis (contrainte projet) |
| 5 | **Dashboard basique** | Ventes du jour, devis en cours |
| 6 | **Export PDF devis** | Envoi aux assureurs |
| 7 | **Suivi des négociations** | Prix convenu avant travaux |
| 8 | **Signatures électroniques** | Conformité légale |

#### P1 — Should Have (v1.1)

| # | Feature | Justification |
|---|---------|---------------|
| 9 | **Templates de devis** | Gain de temps significatif |
| 10 | **Système de relance leads** | Améliore conversion |
| 11 | **Rapports par assureur** | Analyse rentabilité (resp. #16) |
| 12 | **Notifications & alertes** | Réduit les oublis |
| 13 | **Photos liées aux dossiers** | Traçabilité visuelle |
| 14 | **Mode hors-ligne** | Réalité terrain |
| 15 | **Objectifs & KPIs individuels** | Motivation équipe |

#### P2 — Nice to Have (v1.2+)

| # | Feature | Justification |
|---|---------|---------------|
| 16 | Gestion des pièces & fournisseurs | Complexe, peut être externe |
| 17 | Intégration comptable | Export vers outils existants |
| 18 | IA suggestions devis | Innovation mais pas essentiel |
| 19 | Multi-atelier | Pour croissance future |
| 20 | Reconnaissance vocale | "Nice" mais pas prioritaire |
| 21 | Chat interne | Slack existe déjà |

---

### Workflows Clés à Implémenter

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW PRINCIPAL                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [NOUVEAU CLIENT]                                                │
│       │                                                          │
│       ▼                                                          │
│  [CRÉATION DOSSIER] ──→ [AJOUT VÉHICULE] ──→ [PHOTOS]           │
│       │                                                          │
│       ▼                                                          │
│  [CRÉATION DEVIS] ──→ [SOUMISSION ASSUREUR]                     │
│       │                                                          │
│       ▼                                                          │
│  ┌─── [NÉGOCIATION] ◄─────────────────┐                         │
│  │         │                          │                          │
│  │    [REFUSÉ]  [CONTRE-OFFRE]  [ACCEPTÉ]                       │
│  │         │          │              │                          │
│  │         ▼          ▼              ▼                          │
│  │    [PERDU]    [RÉVISION] ────► [PRIX CONVENU]                │
│  │                                    │                          │
│  │                                    ▼                          │
│  │                            [SIGNATURE CLIENT]                 │
│  │                                    │                          │
│  │                                    ▼                          │
│  └──────────────────────────── [EN RÉPARATION]                  │
│                                       │                          │
│                                       ▼                          │
│                              [VÉRIF FINALE]                      │
│                                       │                          │
│                                       ▼                          │
│                                [LIVRAISON]                       │
│                                       │                          │
│                                       ▼                          │
│                                 [CLÔTURÉ]                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Statuts d'un Dossier

| Statut | Description | Actions possibles |
|--------|-------------|-------------------|
| `draft` | Dossier créé, devis en cours | Éditer, Supprimer |
| `submitted` | Devis envoyé à l'assureur | Attendre, Relancer |
| `negotiation` | Contre-offre reçue | Réviser, Accepter, Refuser |
| `approved` | Prix convenu accepté | Obtenir signature |
| `signed` | Autorisations signées | Démarrer travaux |
| `in_repair` | Véhicule en atelier | Suivre, Ajouter supplément |
| `ready` | Réparation terminée | Vérifier, Appeler client |
| `delivered` | Véhicule livré | Clôturer |
| `closed` | Dossier archivé | Consulter |
| `lost` | Devis non converti | Consulter, Analyser |

---

## Différenciateurs vs Solutions Existantes

### Concurrents Identifiés

| Solution | Forces | Faiblesses | Prix |
|----------|--------|------------|------|
| **Mitchell** | Standard industrie, intégrations assureurs | Cher, complexe, US-centric | $$$$ |
| **Audatex** | Bonne base de données pièces | Interface datée, courbe d'apprentissage | $$$ |
| **CCC ONE** | Complet | Enterprise-only, pas pour petits ateliers | $$$$ |
| **Excel maison** | Gratuit, flexible | Pas de collaboration, erreurs, pas de reporting | Gratuit |
| **ProgiCAR** | Québécois, bon support local | Interface ancienne, pas cloud-native | $$ |

### Nos Différenciateurs

1. **Abordable** : Prix adapté aux petits/moyens ateliers (1-10 estimateurs)
2. **Simple** : Interface moderne, apprentissage en 1 journée
3. **Cloud-native** : Accessible partout, pas d'installation, mises à jour auto
4. **Focus workflow** : Pas juste du devis, tout le cycle de vie client
5. **Québec/Canada first** : Terminologie, taxes, pratiques locales
6. **Multi-utilisateurs inclus** : Pas de frais par siège exorbitants
7. **Dashboard moderne** : Visuels temps réel, pas des rapports PDF hebdo

---

## Questions Ouvertes

### Produit

- [ ] **Intégration pièces** : Développer en interne ou intégrer un catalogue existant?
- [ ] **Tarification** : Par atelier? Par estimateur? Freemium?
- [ ] **Marché cible** : Québec d'abord puis expansion, ou Canada dès le départ?
- [ ] **Marque** : "EstimPro"? Autre nom plus distinctif?

### Technique

- [ ] **Base de données pièces** : Quelle source pour les prix et références?
- [ ] **Signature électronique** : Build vs buy (DocuSign, HelloSign)?
- [ ] **OCR** : Pour scan permis/immatriculation, quelle API?
- [ ] **Stockage photos** : Azure Blob vs S3 vs autre?

### Business

- [ ] **Validation marché** : Combien d'ateliers à interviewer avant MVP?
- [ ] **Pilote** : Y a-t-il un atelier partenaire pour tester?
- [ ] **Assurances partenaires** : Possibilité d'intégration API avec un assureur?
- [ ] **Réglementation** : Exigences légales pour la conservation des documents?

### UX

- [ ] **Langue** : Français seulement ou bilingue dès v1?
- [ ] **Accessibilité** : Niveau WCAG visé?
- [ ] **Mobile** : PWA ou app native future?

---

## Conclusions

### Insights Clés

1. **Le devis n'est que la pointe de l'iceberg** — L'estimateur gère tout un workflow client, de l'accueil à la livraison. Un outil qui ne fait que du devis rate 80% de la valeur.

2. **Les seniors et juniors ont des besoins opposés** — Les juniors veulent du guidage, les seniors veulent de la vitesse. L'interface doit s'adapter.

3. **La négociation assurance est critique** — C'est là que se joue la rentabilité. Tracer l'historique et les prix convenus est essentiel.

4. **Le suivi des leads est le ROI le plus rapide** — Relancer les devis non convertis peut augmenter le chiffre d'affaires de 15-20% sans effort commercial.

5. **Mobile n'est pas optionnel** — L'estimateur est debout, devant un véhicule, pas à son bureau.

### Prochaines Étapes

1. ✅ **Brainstorm** — Complet (ce document)
2. ⏳ **PRD** — John (PM) cristallise en Product Requirements Document
3. ⏳ **Architecture** — Winston définit la stack technique
4. ⏳ **Epics & Stories** — Découpage en livrables
5. ⏳ **Sprint Planning** — Ordonnancement pour MVP

### Recommandations pour Yves

- **MVP serré** : Se concentrer sur P0 uniquement pour v1.0, résister à l'envie d'ajouter des features
- **Validation terrain** : Idéalement, trouver 2-3 estimateurs pour tester des maquettes
- **Stack simple** : Next.js + PostgreSQL + Azure couvre tous les besoins
- **Multi-tenant dès le départ** : Prévoir la structure DB pour plusieurs ateliers même si MVP = 1 seul

---

*Session facilitée par Mary (BMAD Business Analyst)*
*Mode: Autopilot pour Yves*
*Date: 2026-02-04*
