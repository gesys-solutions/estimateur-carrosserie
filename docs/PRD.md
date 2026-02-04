# Product Requirements Document (PRD)
## EstimPro — Plateforme de Gestion pour Estimateurs en Carrosserie

**Version:** 1.0  
**Date:** 2026-02-04  
**Auteur:** John (Product Manager — BMAD)  
**Statut:** Draft  

---

## Table des matières

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [Product Vision & Goals](#4-product-vision--goals)
5. [User Stories](#5-user-stories)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Success Metrics](#8-success-metrics)
9. [Out of Scope (v1.0)](#9-out-of-scope-v10)
10. [Dependencies & Assumptions](#10-dependencies--assumptions)
11. [Risks](#11-risks)

---

## 1. Executive Summary

**EstimPro** est une application web SaaS conçue pour les ateliers de carrosserie automobile (1-10 estimateurs). Elle centralise l'intégralité du workflow de l'estimateur — de l'accueil client à la livraison finale — en maximisant l'efficacité et la rentabilité.

### Proposition de valeur

| Pour | les ateliers de carrosserie québécois/canadiens |
|------|------------------------------------------------|
| **Qui** | peinent à gérer efficacement devis, clients et négociations assurances |
| **EstimPro est** | une application web moderne et intuitive |
| **Qui** | centralise toutes les tâches de l'estimateur en un seul outil |
| **Contrairement à** | Mitchell, Audatex, ou des feuilles Excel |
| **Notre solution** | est abordable, simple, et conçue pour le workflow local |

### Stack technique

- **Frontend:** Next.js (React) avec Tailwind CSS
- **Backend:** Next.js API Routes
- **Base de données:** PostgreSQL
- **Conteneurisation:** Docker
- **Déploiement:** Azure Container Apps
- **Architecture:** Multi-tenant (plusieurs ateliers)
- **Langue UI:** Français

---

## 2. Problem Statement

### Contexte

Les estimateurs en carrosserie automobile jonglent quotidiennement avec 16+ responsabilités distinctes :
- Accueil client et vente
- Rédaction de devis précis sous contrainte de temps (10 min pour 1000$)
- Négociations avec les compagnies d'assurance
- Suivi des dossiers et relances clients
- Gestion des pièces et fournisseurs
- Reporting et atteinte d'objectifs de performance

### Problèmes actuels

| Problème | Impact |
|----------|--------|
| **Outils fragmentés** | Feuilles Excel disparates, logiciels mono-fonction coûteux, notes papier |
| **Perte d'information** | Historique des négociations perdu (emails), notes sur papier égarées |
| **Manque de visibilité** | Managers découvrent les problèmes trop tard, pas de KPIs temps réel |
| **Leads perdus** | Devis non convertis "tombent entre les craques" faute de suivi structuré |
| **Non-conformité** | Signatures manquantes avant travaux, traçabilité insuffisante |
| **Inefficacité** | Ressaisie manuelle, temps de création devis trop long |

### Coût de l'inaction

- Taux de conversion devis→travaux sous-optimal (perte de revenus)
- Marges réduites par manque d'historique de négociation
- Temps administratif excessif (moins de temps pour vendre)
- Risques légaux (signatures manquantes, documents introuvables)

---

## 3. Target Users

### Persona 1 : Marc — Estimateur Junior

| Attribut | Détail |
|----------|--------|
| **Profil** | 25 ans, 2 ans d'expérience, DEP carrosserie + cours estimation |
| **Tech** | À l'aise avec la technologie, smartphone toujours à portée |
| **Objectifs** | Apprendre les bonnes pratiques, éviter les erreurs coûteuses, impressionner son manager |
| **Frustrations** | "Je ne sais jamais si j'ai tout inclus", "Les assureurs me font baisser mes prix", "Je perds du temps à chercher les infos" |
| **Besoins clés** | Templates intelligents avec checklist, historique prix par assureur, alertes et rappels |

### Persona 2 : Sylvie — Estimatrice Senior

| Attribut | Détail |
|----------|--------|
| **Profil** | 45 ans, 18 ans d'expérience, connue et respectée des agents d'assurance |
| **Tech** | Préfère le clavier aux menus, résistante aux changements inutiles |
| **Objectifs** | Maintenir sa productivité élevée, garder ses méthodes éprouvées |
| **Frustrations** | "Les nouveaux logiciels me ralentissent", "Trop de clics pour faire une tâche simple" |
| **Besoins clés** | Interface efficace avec raccourcis clavier, accès rapide à l'historique client, pas de "features" superflues |

### Persona 3 : Pierre — Manager d'Atelier

| Attribut | Détail |
|----------|--------|
| **Profil** | 52 ans, ancien estimateur, gère 4 estimateurs et 12 techniciens |
| **Tech** | Préfère les graphiques aux tableaux, vérifie les chiffres chaque matin |
| **Objectifs** | Vision claire de la performance équipe, identifier les problèmes avant qu'ils n'explosent, optimiser les relations assureurs |
| **Frustrations** | "Je découvre les problèmes trop tard", "Chaque estimateur a ses propres Excel", "Les rapports mensuels me prennent une journée" |
| **Besoins clés** | Dashboard temps réel, alertes sur anomalies, rapports automatisés par assureur, comparaison entre estimateurs |

---

## 4. Product Vision & Goals

### Vision

> EstimPro est une solution cloud tout-en-un qui permet aux estimateurs en carrosserie de gérer l'intégralité de leur workflow — de l'accueil client à la livraison finale — en maximisant leur efficacité et leur rentabilité.

### Objectifs Business (v1.0)

| Objectif | Cible | Mesure |
|----------|-------|--------|
| **Efficacité** | Réduire le temps de création de devis de 30% | Temps moyen par devis (timer intégré) |
| **Conversion** | Améliorer le taux de transformation devis→travaux de 15% | Ratio devis acceptés / devis créés |
| **Visibilité** | Dashboard temps réel des KPIs pour managers | 100% des KPIs clés disponibles en <5 sec |
| **Conformité** | Traçabilité complète des signatures et autorisations | 0% de dossiers sans signature |

### Différenciateurs vs concurrence

| Nous | Mitchell / Audatex / CCC |
|------|--------------------------|
| Abordable (petits ateliers) | Cher, enterprise-only |
| Interface moderne, apprentissage 1 jour | Interfaces datées, courbe d'apprentissage |
| Cloud-native, pas d'installation | Installations lourdes |
| Workflow complet (accueil→livraison) | Focus devis uniquement |
| Québec/Canada first | US-centric |
| Multi-utilisateurs inclus | Frais par siège |

---

## 5. User Stories

### Epic 1 : Gestion des Clients

| ID | User Story | Priorité |
|----|------------|----------|
| US-101 | As an **estimateur**, I want to **créer une fiche client rapidement** so that **je peux commencer le dossier sans délai** | P0 |
| US-102 | As an **estimateur**, I want to **associer plusieurs véhicules à un client** so that **je retrouve son historique complet** | P0 |
| US-103 | As an **estimateur**, I want to **rechercher un client par nom, téléphone ou immatriculation** so that **je le retrouve instantanément** | P0 |
| US-104 | As an **estimateur**, I want to **voir l'historique des devis d'un client** so that **je connais son profil avant de le rencontrer** | P1 |

### Epic 2 : Création de Devis

| ID | User Story | Priorité |
|----|------------|----------|
| US-201 | As an **estimateur**, I want to **créer un devis structuré avec items, main d'œuvre et pièces** so that **le document est complet et professionnel** | P0 |
| US-202 | As an **estimateur**, I want to **voir le total et les taxes calculés automatiquement** so that **je n'ai pas d'erreurs de calcul** | P0 |
| US-203 | As an **estimateur**, I want to **exporter le devis en PDF** so that **je peux l'envoyer à l'assureur** | P0 |
| US-204 | As an **estimateur junior**, I want to **utiliser une checklist pour valider mon devis** so that **je n'oublie rien d'important** | P1 |
| US-205 | As an **estimateur senior**, I want to **utiliser un template pour les dommages courants** so that **je gagne du temps** | P1 |
| US-206 | As an **estimateur**, I want to **voir un timer de temps passé sur le devis** so that **je respecte les objectifs de productivité (10 min/1000$)** | P1 |

### Epic 3 : Workflow de Statuts

| ID | User Story | Priorité |
|----|------------|----------|
| US-301 | As an **estimateur**, I want to **voir le statut de chaque dossier** (draft, envoyé, négociation, approuvé, etc.) so that **je sais où j'en suis** | P0 |
| US-302 | As an **estimateur**, I want to **changer le statut d'un dossier** so that **le suivi est à jour** | P0 |
| US-303 | As a **manager**, I want to **filtrer les dossiers par statut** so that **je vois rapidement ce qui est en attente** | P0 |
| US-304 | As an **estimateur**, I want to **verrouiller le prix convenu** so that **il ne peut plus être modifié après accord** | P0 |

### Epic 4 : Négociations Assurances

| ID | User Story | Priorité |
|----|------------|----------|
| US-401 | As an **estimateur**, I want to **associer une compagnie d'assurance et un numéro de réclamation au dossier** so that **le suivi est complet** | P0 |
| US-402 | As an **estimateur**, I want to **enregistrer le prix convenu après négociation** so that **j'ai une trace officielle** | P0 |
| US-403 | As an **estimateur**, I want to **voir l'historique des négociations sur un dossier** so that **je sais ce qui a été discuté** | P0 |
| US-404 | As a **manager**, I want to **analyser la rentabilité par compagnie d'assurance** so that **j'optimise mes relations** | P1 |

### Epic 5 : Signatures & Autorisations

| ID | User Story | Priorité |
|----|------------|----------|
| US-501 | As an **estimateur**, I want to **obtenir la signature électronique du client** so that **j'ai l'autorisation avant les travaux** | P0 |
| US-502 | As an **estimateur**, I want to **vérifier que toutes les signatures sont présentes avant livraison** so that **je suis en conformité** | P0 |
| US-503 | As a **manager**, I want to **être alerté si un dossier passe "en réparation" sans signature** so that **je corrige avant qu'il soit trop tard** | P1 |

### Epic 6 : Dashboard & Reporting

| ID | User Story | Priorité |
|----|------------|----------|
| US-601 | As a **manager**, I want to **voir un dashboard des ventes du jour** so that **je suis le tableau de bord production** | P0 |
| US-602 | As a **manager**, I want to **voir le nombre de devis en cours par estimateur** so that **je répartis la charge** | P0 |
| US-603 | As an **estimateur**, I want to **voir mes KPIs personnels** (devis créés, taux de conversion) so that **je connais ma performance** | P1 |
| US-604 | As a **manager**, I want to **générer un rapport mensuel par assureur** so that **j'analyse la rentabilité** | P1 |

### Epic 7 : Multi-utilisateurs & Rôles

| ID | User Story | Priorité |
|----|------------|----------|
| US-701 | As an **admin**, I want to **créer des comptes utilisateurs avec rôles** (admin, manager, estimateur) so that **chacun a les bons accès** | P0 |
| US-702 | As an **utilisateur**, I want to **me connecter avec mon compte** so that **j'accède à mes dossiers** | P0 |
| US-703 | As an **admin**, I want to **désactiver un compte** so that **je gère les départs** | P0 |
| US-704 | As an **estimateur**, I want to **voir uniquement mes dossiers ou ceux de mon équipe** so that **l'interface reste claire** | P1 |

---

## 6. Functional Requirements

### P0 — Must Have (MVP v1.0)

| Req ID | Catégorie | Requirement | Critères d'acceptation |
|--------|-----------|-------------|------------------------|
| FR-001 | Clients | Créer, modifier, supprimer une fiche client | Champs: nom, prénom, téléphone, email, adresse |
| FR-002 | Clients | Associer véhicules à un client | Champs: marque, modèle, année, immatriculation, VIN |
| FR-003 | Clients | Recherche clients | Par nom, téléphone, ou immatriculation véhicule |
| FR-004 | Devis | Créer un devis structuré | Sections: main d'œuvre, pièces, peinture, divers |
| FR-005 | Devis | Ajouter/modifier/supprimer des items | Libellé, quantité, prix unitaire, sous-total auto |
| FR-006 | Devis | Calcul automatique totaux et taxes | TPS/TVQ pour Québec, configurable |
| FR-007 | Devis | Export PDF | Format professionnel avec logo atelier |
| FR-008 | Workflow | Statuts de dossier | draft, submitted, negotiation, approved, signed, in_repair, ready, delivered, closed, lost |
| FR-009 | Workflow | Changement de statut | Avec timestamp et utilisateur |
| FR-010 | Workflow | Verrouillage prix convenu | Après statut "approved", le montant est non-modifiable |
| FR-011 | Assurance | Association dossier-assurance | Compagnie, numéro réclamation, contact |
| FR-012 | Assurance | Saisie prix convenu | Montant et date de l'accord |
| FR-013 | Assurance | Historique négociations | Notes texte avec date et auteur |
| FR-014 | Signature | Signature électronique client | Canvas signature ou upload document signé |
| FR-015 | Signature | Vérification signatures avant réparation | Alerte si signature manquante au passage "in_repair" |
| FR-016 | Dashboard | Ventes du jour | Montant total des devis "approved" aujourd'hui |
| FR-017 | Dashboard | Devis en cours par statut | Compteurs visuels |
| FR-018 | Auth | Login/logout | Email + mot de passe |
| FR-019 | Auth | Rôles utilisateurs | admin, manager, estimateur |
| FR-020 | Auth | Gestion des comptes | CRUD par admin |
| FR-021 | Multi-tenant | Isolation des données par atelier | Un utilisateur ne voit que les données de son atelier |

### P1 — Should Have (v1.1)

| Req ID | Catégorie | Requirement |
|--------|-----------|-------------|
| FR-101 | Devis | Templates de devis par type de dommage |
| FR-102 | Devis | Checklist de validation avant soumission |
| FR-103 | Devis | Timer de temps passé |
| FR-104 | Leads | Liste des devis non convertis (>X jours) |
| FR-105 | Leads | Système de relance avec date et notes |
| FR-106 | Leads | Raison de perte (dropdown + notes) |
| FR-107 | Reporting | Rapport rentabilité par assureur |
| FR-108 | Reporting | Export CSV des données |
| FR-109 | Notifications | Alertes push/email pour relances |
| FR-110 | Photos | Upload et association photos au dossier |
| FR-111 | KPIs | Objectifs individuels et suivi |
| FR-112 | Offline | Consultation dossiers en mode hors-ligne (PWA) |

### P2 — Nice to Have (v1.2+)

| Req ID | Catégorie | Requirement |
|--------|-----------|-------------|
| FR-201 | Pièces | Gestion fournisseurs et prix |
| FR-202 | Pièces | Commandes avec suivi |
| FR-203 | Intégrations | Export comptable (QuickBooks/Sage) |
| FR-204 | IA | Suggestions automatiques d'items |
| FR-205 | Multi-atelier | Un compte propriétaire avec plusieurs succursales |
| FR-206 | Voice | Reconnaissance vocale pour notes |
| FR-207 | Chat | Messagerie interne entre estimateurs |

---

## 7. Non-Functional Requirements

### Performance

| Req ID | Requirement | Cible |
|--------|-------------|-------|
| NFR-001 | Temps de chargement page | < 2 secondes (P95) |
| NFR-002 | Temps de recherche client | < 500ms |
| NFR-003 | Génération PDF | < 3 secondes |
| NFR-004 | Support concurrent users | 50 utilisateurs simultanés minimum |
| NFR-005 | Disponibilité | 99.5% uptime (hors maintenance planifiée) |

### Sécurité

| Req ID | Requirement | Détail |
|--------|-------------|--------|
| NFR-010 | Authentification | Mots de passe hashés (bcrypt), sessions JWT |
| NFR-011 | Autorisation | RBAC (Role-Based Access Control) |
| NFR-012 | Données en transit | HTTPS obligatoire (TLS 1.3) |
| NFR-013 | Données au repos | Chiffrement Azure |
| NFR-014 | Isolation multi-tenant | Tenant ID dans toutes les requêtes |
| NFR-015 | Audit log | Trace des actions critiques (login, signature, changement statut) |
| NFR-016 | Backup | Backup quotidien automatique, rétention 30 jours |

### Scalabilité

| Req ID | Requirement | Détail |
|--------|-------------|--------|
| NFR-020 | Architecture | Stateless containers pour scaling horizontal |
| NFR-021 | Base de données | PostgreSQL avec connection pooling |
| NFR-022 | Assets statiques | CDN (Azure Blob + CDN) |
| NFR-023 | Croissance | Support 100 ateliers, 500 utilisateurs sans re-architecture |

### Compatibilité

| Req ID | Requirement | Détail |
|--------|-------------|--------|
| NFR-030 | Navigateurs | Chrome, Firefox, Safari, Edge (2 dernières versions) |
| NFR-031 | Mobile | Responsive design, optimisé tablette |
| NFR-032 | Résolution | 1024px minimum, optimal 1440px+ |
| NFR-033 | Langue | Français (Canada) pour v1.0 |

### Maintenabilité

| Req ID | Requirement | Détail |
|--------|-------------|--------|
| NFR-040 | Code quality | ESLint + Prettier, couverture tests >70% |
| NFR-041 | Documentation | README, ADRs pour décisions architecture |
| NFR-042 | Déploiement | CI/CD automatisé (GitHub Actions) |
| NFR-043 | Monitoring | Application Insights, alertes sur erreurs 5xx |

---

## 8. Success Metrics

### KPIs Produit (mesurés à 3 mois post-lancement)

| Métrique | Baseline | Cible v1.0 | Comment mesurer |
|----------|----------|------------|-----------------|
| Temps moyen création devis | 15 min (estimé) | 10 min (-33%) | Timer intégré |
| Taux conversion devis→travaux | 60% (estimé) | 70% (+17%) | Ratio approved/created |
| Leads perdus par oubli | Inconnu | 0% | Devis >14j sans action = alerte |
| Dossiers sans signature | Estimé 10% | 0% | Vérification automatique |
| Temps génération rapport mensuel | 1 journée | 5 minutes | Rapport automatisé |

### KPIs Adoption

| Métrique | Cible 3 mois | Cible 6 mois |
|----------|--------------|--------------|
| Ateliers actifs | 3 | 10 |
| Utilisateurs actifs hebdo | 80% des comptes | 85% |
| Devis créés dans l'app | 90% de l'activité | 95% |
| NPS (Net Promoter Score) | >30 | >50 |

### KPIs Techniques

| Métrique | Cible |
|----------|-------|
| Uptime | 99.5% |
| Temps de réponse P95 | <2s |
| Erreurs 5xx | <0.1% |
| Temps de déploiement | <10 min |

---

## 9. Out of Scope (v1.0)

Les éléments suivants sont **explicitement exclus** du MVP :

| Feature | Raison | Version prévue |
|---------|--------|----------------|
| Gestion des pièces et fournisseurs | Complexité, intégration catalogue externe | v1.2 |
| Intégration comptable (QuickBooks/Sage) | Dépendance externe | v1.1 |
| IA suggestions devis | Innovation non essentielle au MVP | v1.2+ |
| Multi-atelier (succursales) | Cas d'usage avancé | v1.2 |
| Reconnaissance vocale | Nice-to-have | v1.2+ |
| Chat interne | Slack/Teams existent | TBD |
| Mode hors-ligne complet | PWA complexe, accès dossiers suffit | v1.1 |
| Application mobile native | PWA couvre le besoin | TBD |
| Intégration API assureurs | Aucun partenariat établi | v2.0 |
| Support multi-langue | Français d'abord | v1.1 (anglais) |
| Gamification (badges) | Optionnel, pas prioritaire | TBD |
| Scan OCR permis/immatriculation | API tierce à évaluer | v1.1 |

---

## 10. Dependencies & Assumptions

### Dépendances

| Dépendance | Type | Risque si indisponible |
|------------|------|------------------------|
| **Azure Container Apps** | Infrastructure | Élevé — changer de plateforme |
| **PostgreSQL (Azure)** | Base de données | Élevé — migration complexe |
| **Vercel ou auto-hébergé** | Frontend (si séparé) | Moyen — alternatives disponibles |
| **SendGrid / Resend** | Emails transactionnels | Faible — alternatives faciles |
| **Service signature électronique** | Fonctionnel | Moyen — peut développer en interne |

### Assumptions

| Assumption | Impact si faux |
|------------|----------------|
| Les estimateurs ont accès à un ordinateur ou tablette | Redesign mobile-first requis |
| Connexion internet stable en atelier | Besoin de mode offline renforcé |
| Les utilisateurs sont à l'aise avec le web | Besoin de formation/UX simplifiée |
| 1-10 estimateurs par atelier | Repenser pricing et permissions |
| Le marché initial est le Québec | Adapter terminologie et taxes pour autres provinces |
| Les assureurs acceptent les PDF par email | Pas d'intégration API requise |
| Un pilote (atelier partenaire) sera disponible | Tests utilisateurs limités |

---

## 11. Risks

### Risques Produit

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| **Adoption faible** — les estimateurs préfèrent Excel | Moyenne | Élevé | UX ultra-simple, onboarding guidé, valeur visible jour 1 |
| **Feature creep** — MVP trop gros, jamais livré | Moyenne | Élevé | P0 strict, résister aux ajouts, livrer vite |
| **Mauvaise compréhension métier** — features inutiles | Faible | Moyen | Validation avec estimateurs réels (personas) |
| **Concurrence** — Mitchell/Audatex baissent leurs prix | Faible | Moyen | Différenciation sur simplicité et local |

### Risques Techniques

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| **Performance** — app lente avec beaucoup de données | Moyenne | Moyen | Pagination, lazy loading, tests charge |
| **Multi-tenant** — fuite de données entre ateliers | Faible | Critique | Tests sécurité, audit code, tenant_id obligatoire |
| **Scaling** — infrastructure insuffisante | Faible | Moyen | Azure auto-scaling, monitoring |
| **Signature électronique** — validité légale | Moyenne | Moyen | Recherche juridique, documenter les limites |

### Risques Business

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| **Pas de pilote** — impossible de valider avant lancement | Moyenne | Élevé | Identifier atelier partenaire dès maintenant |
| **Pricing inadapté** — trop cher ou trop bon marché | Moyenne | Moyen | Étude de marché, pricing flexible |
| **Réglementation** — exigences légales inconnues | Faible | Moyen | Consultation juridique pour conservation documents |

---

## Appendix

### A. Workflow de statuts

```
[DRAFT] ──→ [SUBMITTED] ──→ [NEGOTIATION] ◄──┐
                                 │           │
                           [REFUSÉ]    [CONTRE-OFFRE]
                                 │           │
                                 ▼           │
                             [LOST]    ──────┘
                                 
[NEGOTIATION] ──→ [APPROVED] ──→ [SIGNED] ──→ [IN_REPAIR]
                                                    │
                                                    ▼
                                               [READY] ──→ [DELIVERED] ──→ [CLOSED]
```

### B. Statuts détaillés

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

### C. Sources

- Brainstorming session (2026-02-04) — Mary (Business Analyst)
- Document "16 Responsabilités d'un Estimateur"
- Contraintes Yves: Next.js, PostgreSQL, Docker, Azure Container Apps

---

*Document créé par John (PM) — BMAD Method*  
*Projet: EstimPro (estimateur-carrosserie)*  
*Date: 2026-02-04*
