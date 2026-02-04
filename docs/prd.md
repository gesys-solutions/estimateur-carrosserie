# Product Requirements Document (PRD)
## EstimPro — Outil de Gestion pour Estimateurs en Carrosserie

**Version:** 1.0
**Date:** 2026-02-04
**Auteur:** John (Product Manager)
**Statut:** Draft

---

## 1. Résumé Exécutif

### Vision

EstimPro est une solution cloud tout-en-un qui permet aux estimateurs en carrosserie de gérer l'intégralité de leur workflow — de l'accueil client à la livraison finale — en maximisant leur efficacité et leur rentabilité.

### Proposition de Valeur

| Pour | les ateliers de carrosserie (1-10 estimateurs) |
|------|-----------------------------------------------|
| Qui | peinent à gérer efficacement leurs devis, clients et négociations assurances |
| EstimPro est | une application web moderne et intuitive |
| Qui | centralise toutes les tâches de l'estimateur en un seul outil |
| Contrairement à | Mitchell, Audatex, ou des feuilles Excel |
| Notre solution | est abordable, simple, et conçue pour le workflow québécois/canadien |

### Objectifs Business

| Objectif | Métrique | Cible |
|----------|----------|-------|
| Efficacité | Temps moyen de création de devis | -30% |
| Conversion | Taux devis→travaux | +15% |
| Visibilité | Temps pour générer un rapport mensuel | <5 min |
| Conformité | Dossiers avec signatures complètes | 100% |

---

## 2. Contexte et Problème

### Le Problème

Les estimateurs en carrosserie automobile jonglent avec de nombreuses responsabilités simultanées :

1. **Accueil client et vente** — Premier contact, création de dossier
2. **Rédaction de devis** — Précision sous contrainte de temps (objectif: 10 min pour 1000$)
3. **Négociations assurances** — Multiples allers-retours, prix convenus
4. **Suivi des dossiers** — Relances, signatures, autorisations
5. **Gestion des pièces** — Commandes fournisseurs, optimisation coûts
6. **Reporting** — Objectifs mensuels, rentabilité par assureur

**Situation actuelle :**

- Feuilles Excel disparates (pas de collaboration)
- Logiciels de devis mono-fonction coûteux (Mitchell ~500$/mois)
- Notes papier et tableaux blancs (aucune traçabilité)
- Mémoire personnelle (source d'erreurs et d'oublis)

### Pourquoi Maintenant ?

1. **Cloud mature** — Azure permet un déploiement simple et économique
2. **Attentes utilisateurs** — Les estimateurs s'attendent à des outils modernes
3. **Concurrence datée** — Les solutions existantes ont des interfaces des années 2000
4. **Opportunité Québec** — Marché mal desservi par les géants américains

---

## 3. Personas Utilisateurs

### 👤 Marc — Estimateur Junior

| Attribut | Valeur |
|----------|--------|
| **Âge** | 25 ans |
| **Expérience** | 2 ans |
| **Tech-savvy** | Élevé |
| **Objectif principal** | Apprendre les bonnes pratiques, éviter les erreurs |

**Citation typique :** *"Je ne sais jamais si j'ai tout inclus dans mon devis."*

**Besoins clés :**
- Templates de devis avec checklist
- Historique des prix négociés par assureur
- Alertes et rappels automatiques

---

### 👤 Sylvie — Estimatrice Senior

| Attribut | Valeur |
|----------|--------|
| **Âge** | 45 ans |
| **Expérience** | 18 ans |
| **Tech-savvy** | Moyen |
| **Objectif principal** | Maintenir sa productivité, ne pas être ralentie |

**Citation typique :** *"Les nouveaux logiciels me ralentissent. Je connais mes assureurs par cœur."*

**Besoins clés :**
- Interface efficace avec raccourcis clavier
- Pas de "features" qui bloquent le workflow
- Accès rapide à l'historique client

---

### 👤 Pierre — Manager d'Atelier

| Attribut | Valeur |
|----------|--------|
| **Âge** | 52 ans |
| **Rôle** | Gère 4 estimateurs et 12 techniciens |
| **Tech-savvy** | Moyen |
| **Objectif principal** | Vision claire de la performance, anticiper les problèmes |

**Citation typique :** *"Je découvre les problèmes trop tard. Les rapports mensuels me prennent une journée."*

**Besoins clés :**
- Dashboard temps réel
- Alertes sur les anomalies
- Rapports automatisés par assureur
- Comparaison de performance entre estimateurs

---

## 4. User Journeys Critiques

### Journey 1 : Accueil Client (P0)

**Acteur :** Marc (junior)
**Durée cible :** < 5 minutes
**Déclencheur :** Un client arrive à l'atelier

```
Client arrive
    │
    ▼
Ouvrir EstimPro → [Nouveau Client]
    │
    ▼
Saisie rapide → Nom, téléphone, email
    │
    ▼
Ajouter véhicule → Marque, modèle, année, VIN (optionnel)
    │
    ▼
Associer assurance → Sélection dans liste + n° réclamation
    │
    ▼
Notes initiales → Description des dommages
    │
    ▼
Photos (optionnel) → Attachées au dossier
    │
    ▼
✅ Dossier créé, statut: DRAFT
```

**Critères de succès :**
- Création d'un dossier complet en < 5 min
- Aucune ressaisie nécessaire par la suite
- Dossier immédiatement visible par tous les estimateurs

---

### Journey 2 : Création de Devis (P0)

**Acteur :** Marc ou Sylvie
**Durée cible :** 10 min pour 1000$, 30 min pour 3000$
**Déclencheur :** Dossier client créé, inspection du véhicule faite

```
Ouvrir dossier client
    │
    ▼
[Créer Devis] → Sélection type de dommage
    │
    ▼
Ajout items:
    ├── Pièces (recherche + prix)
    ├── Main d'œuvre (heures × taux)
    └── Peinture (surfaces)
    │
    ▼
Revue automatique:
    ├── Total calculé
    ├── Temps estimé
    └── Marge affichée (manager seulement)
    │
    ▼
Validation → Checklist de complétude
    │
    ▼
Export PDF → Envoi à l'assureur
    │
    ▼
✅ Statut: SUBMITTED
```

**Critères de succès :**
- Timer visible pendant la création (objectif 10 min/1000$)
- Aucun item essentiel oublié (checklist)
- PDF professionnel généré en 1 clic

---

### Journey 3 : Négociation Assureur (P0)

**Acteur :** Sylvie (senior, expérimentée en négociation)
**Déclencheur :** Réponse de l'assureur reçue

```
Notification: "Réponse assureur sur dossier #1234"
    │
    ▼
Ouvrir dossier → Voir réponse:
    │
    ├── [APPROUVÉ] → Statut: APPROVED, obtenir signature
    │
    └── [CONTRE-OFFRE] → Montant proposé visible
            │
            ▼
        Historique négociations affiché
            │
            ▼
        Options:
            ├── Accepter contre-offre
            ├── Réviser et resoumettre
            └── Refuser (→ LOST)
            │
            ▼
        Si accepté → Saisie PRIX CONVENU (verrouillé)
            │
            ▼
        ✅ Statut: APPROVED
```

**Critères de succès :**
- Historique complet des échanges sur le dossier
- Prix convenu verrouillé avant travaux (conformité)
- Traçabilité de qui a accepté quoi

---

### Journey 4 : Suivi et Relance Leads (P1)

**Acteur :** Pierre (manager)
**Déclencheur :** Consultation quotidienne du dashboard

```
Ouvrir Dashboard → Section "Devis en attente"
    │
    ▼
Filtrer → Devis > 5 jours sans réponse
    │
    ▼
Cliquer sur un lead → Voir historique
    │
    ▼
Assigner relance → À Marc, avec date limite
    │
    ▼
Marc reçoit notification
    │
    ▼
Marc appelle → Saisit résultat:
    ├── [Accepté] → Convertir en travaux
    ├── [Refusé] → Raison (prix? délai? concurrent?)
    └── [Rappeler] → Nouvelle date
    │
    ▼
✅ Stats mises à jour
```

**Critères de succès :**
- Liste des leads à risque visible en 1 clic
- Raisons de perte tracées pour analyse
- Amélioration mesurable du taux de conversion

---

### Journey 5 : Livraison et Clôture (P0)

**Acteur :** Estimateur assigné au dossier
**Déclencheur :** Réparation terminée

```
Notification: "Véhicule #1234 prêt"
    │
    ▼
Ouvrir dossier → Vérification:
    ├── Facture finale vs devis initial
    ├── Suppléments à facturer?
    └── Toutes signatures présentes?
    │
    ▼
Appeler client → Planifier livraison
    │
    ▼
Livraison:
    ├── Tour du véhicule avec client
    └── Signature de satisfaction
    │
    ▼
Encaissement (optionnel, hors scope v1)
    │
    ▼
[Clôturer dossier]
    │
    ▼
✅ Statut: CLOSED, stats mises à jour
```

**Critères de succès :**
- Blocage si signatures manquantes
- Comparaison devis/facture visible
- Dossier archivé et consultable

---

## 5. Features Détaillées

### P0 — Must Have (MVP v1.0)

#### F1. Gestion Clients & Véhicules

| Attribut | Spécification |
|----------|---------------|
| **Description** | CRUD clients avec véhicules associés |
| **User Stories** | Créer client, ajouter véhicule, modifier, rechercher |
| **Données client** | Nom, prénom, téléphone, email, adresse (optionnel) |
| **Données véhicule** | Marque, modèle, année, couleur, VIN (optionnel), immatriculation |
| **Relation** | 1 client → N véhicules |
| **Recherche** | Par nom, téléphone, immatriculation, VIN |

**Acceptance Criteria:**
- [ ] Création d'un client en < 30 secondes
- [ ] Un véhicule est toujours lié à un client
- [ ] Recherche instantanée (< 500ms)
- [ ] Historique des dossiers visible sur la fiche client

---

#### F2. Création de Devis Structurée

| Attribut | Spécification |
|----------|---------------|
| **Description** | Création de devis avec items détaillés |
| **Sections** | Pièces, Main d'œuvre, Peinture, Divers |
| **Calculs** | Sous-totaux, taxes (TPS/TVQ), total |
| **Timer** | Temps passé affiché, objectif 10 min/1000$ |

**Structure d'un item de devis:**
```
{
  "type": "piece" | "labour" | "paint" | "other",
  "description": "string",
  "quantity": number,
  "unit_price": number,
  "total": number (calculé)
}
```

**Acceptance Criteria:**
- [ ] Ajout d'items rapide (< 5 sec par item)
- [ ] Calculs automatiques corrects (taxes QC)
- [ ] Timer visible et persistant
- [ ] Sauvegarde automatique (pas de perte de données)

---

#### F3. Workflow de Statuts

| Statut | Description | Transitions possibles |
|--------|-------------|----------------------|
| `draft` | Dossier créé, devis en cours | → submitted, lost |
| `submitted` | Devis envoyé à l'assureur | → negotiation, approved, lost |
| `negotiation` | Contre-offre en cours | → approved, submitted (révision), lost |
| `approved` | Prix convenu accepté | → signed |
| `signed` | Autorisations obtenues | → in_repair |
| `in_repair` | Véhicule en atelier | → ready |
| `ready` | Réparation terminée | → delivered |
| `delivered` | Véhicule livré | → closed |
| `closed` | Dossier archivé | (final) |
| `lost` | Devis non converti | (final) |

**Règles métier:**
- Impossible de passer à `in_repair` sans `signed`
- Le statut `approved` verrouille le prix convenu
- Le passage à `lost` demande une raison (dropdown + texte libre)

**Acceptance Criteria:**
- [ ] Transitions clairement indiquées dans l'UI
- [ ] Historique des changements de statut avec timestamp et auteur
- [ ] Blocage des transitions invalides

---

#### F4. Multi-utilisateurs avec Rôles

| Rôle | Permissions |
|------|-------------|
| `estimator` | CRUD dossiers, devis, clients (les siens ou tous selon config) |
| `senior` | Idem + validation des devis juniors (optionnel) |
| `manager` | Tout + dashboard, rapports, gestion utilisateurs |
| `admin` | Tout + configuration atelier |

**Authentification:**
- Azure AD B2C ou auth simple (email/password)
- Session persistante (remember me)
- Déconnexion automatique après 8h d'inactivité

**Acceptance Criteria:**
- [ ] Login sécurisé (HTTPS, passwords hashés)
- [ ] Chaque action tracée avec l'utilisateur
- [ ] Un manager voit tous les dossiers, un estimateur voit les siens (configurable)

---

#### F5. Dashboard Basique

| Élément | Description |
|---------|-------------|
| **Ventes du jour** | Nombre de devis créés, montant total |
| **Devis en cours** | Nombre par statut |
| **À traiter** | Dossiers nécessitant une action (signatures, relances) |
| **Mes objectifs** | Progression vs objectif mensuel (si défini) |

**Vue Manager (additionnelle):**
- Performance par estimateur
- Comparaison mois en cours vs mois précédent
- Alertes (dossiers bloqués, signatures manquantes)

**Acceptance Criteria:**
- [ ] Chargement < 2 secondes
- [ ] Données temps réel (refresh < 5 min)
- [ ] Adapté mobile (responsive)

---

#### F6. Export PDF Devis

| Attribut | Spécification |
|----------|---------------|
| **Format** | PDF/A pour archivage |
| **Contenu** | En-tête atelier, client, véhicule, items, totaux, conditions |
| **Branding** | Logo et couleurs de l'atelier (configurables) |
| **Actions** | Télécharger, envoyer par email |

**Acceptance Criteria:**
- [ ] Génération < 3 secondes
- [ ] PDF lisible et professionnel
- [ ] Numéro de devis unique et persistant

---

#### F7. Suivi des Négociations

| Attribut | Spécification |
|----------|---------------|
| **Historique** | Liste chronologique des échanges sur le dossier |
| **Version devis** | Chaque révision crée une nouvelle version |
| **Prix convenu** | Champ verrouillé une fois accepté |
| **Notes** | Texte libre pour contexte |

**Acceptance Criteria:**
- [ ] Historique complet visible en 1 clic
- [ ] Comparaison entre versions de devis
- [ ] Prix convenu non modifiable après acceptation

---

#### F8. Signatures Électroniques

| Attribut | Spécification |
|----------|---------------|
| **Types** | Autorisation de réparation, Satisfaction client |
| **Méthode** | Signature sur écran tactile (canvas) |
| **Stockage** | Image PNG + timestamp + hash |
| **Validité** | Conforme aux exigences légales QC |

**Acceptance Criteria:**
- [ ] Signature sur tablette/mobile fluide
- [ ] Horodatage et intégrité vérifiables
- [ ] Blocage du workflow si signature requise manquante

---

### P1 — Should Have (v1.1)

#### F9. Templates de Devis

Modèles pré-configurés pour les cas courants:
- Pare-chocs avant (standard)
- Aile + porte (collision latérale)
- Dommages de grêle
- Vandalisme (vitres)

**Valeur:** Gain de temps de 50% sur les devis répétitifs.

---

#### F10. Système de Relance Leads

- Liste des devis non convertis avec âge
- Assignation de relance à un estimateur
- Rappels automatiques par email/notification
- Suivi des raisons de perte

---

#### F11. Rapports par Assureur

- Volume de dossiers par assureur
- Montant moyen des devis
- Taux d'acceptation vs refus
- Délai moyen de réponse
- Rentabilité estimée

---

#### F12. Notifications & Alertes

- Push/email pour nouveaux dossiers assignés
- Rappel signatures manquantes
- Alerte devis en attente > X jours
- Notification changement de statut

---

#### F13. Photos Liées aux Dossiers

- Upload depuis mobile/tablette
- Organisation par dossier
- Galerie consultable
- Annotation basique (flèches, cercles)

---

#### F14. Mode Hors-ligne Basique

- Consultation des dossiers récents
- Création de devis (sync au retour online)
- Service Worker + IndexedDB

---

#### F15. Objectifs & KPIs Individuels

- Définition d'objectifs mensuels par estimateur
- Suivi progression temps réel
- Comparaison avec période précédente
- Gamification optionnelle (badges)

---

### P2 — Nice to Have (v1.2+)

- **F16.** Gestion des pièces & fournisseurs
- **F17.** Intégration comptable (QuickBooks, Sage)
- **F18.** IA suggestions devis (analyse photos)
- **F19.** Multi-atelier (franchises)
- **F20.** Reconnaissance vocale (dictée)
- **F21.** Chat interne entre estimateurs

---

## 6. Exigences Non-Fonctionnelles

### Performance

| Métrique | Cible |
|----------|-------|
| Temps de chargement page | < 2s |
| Temps de réponse API | < 500ms (p95) |
| Génération PDF | < 3s |
| Recherche | < 500ms |

### Scalabilité

| Métrique | Cible MVP | Cible v1.1 |
|----------|-----------|------------|
| Utilisateurs simultanés | 20 | 100 |
| Dossiers par atelier | 10,000 | 50,000 |
| Ateliers | 5 | 50 |

### Sécurité

- HTTPS obligatoire
- Authentification forte (Azure AD B2C ou équivalent)
- Données chiffrées au repos (Azure SQL TDE)
- Logs d'audit pour toutes les modifications
- Backups quotidiens, rétention 30 jours
- Conformité LPRPDE (données personnelles)

### Disponibilité

| Métrique | Cible |
|----------|-------|
| Uptime | 99.5% |
| RPO (perte de données max) | 1 heure |
| RTO (temps de reprise max) | 4 heures |

### Accessibilité

- WCAG 2.1 niveau AA
- Navigation clavier complète
- Lecteur d'écran compatible
- Contraste suffisant

### Langues

- **v1.0:** Français uniquement
- **v1.1:** Bilingue français/anglais

---

## 7. Contraintes Techniques

### Stack Technique (imposée par Yves)

| Couche | Technologie |
|--------|-------------|
| **Frontend** | Next.js 14+ (App Router), React, TypeScript |
| **Backend** | Python (FastAPI) ou API Routes Next.js |
| **Base de données** | PostgreSQL (Azure Database for PostgreSQL) |
| **Auth** | Azure AD B2C ou NextAuth.js |
| **Hébergement** | Azure Container Apps |
| **Storage** | Azure Blob Storage (photos, PDFs) |
| **CI/CD** | GitHub Actions |

### Environnements

| Environnement | Usage |
|---------------|-------|
| **Local** | Dev sur VM (Docker Compose) |
| **Staging** | Tests et démos (Azure Container Apps) |
| **Production** | Client final (Azure Container Apps) |

### Multi-tenant

Architecture multi-tenant dès le MVP:
- Isolation par `tenant_id` dans toutes les tables
- Pas de base de données séparée par client (coût)
- URL unique par tenant: `{tenant}.estimpro.app` ou `app.estimpro.app/{tenant}`

---

## 8. Hors Scope (v1.0)

Les éléments suivants sont explicitement exclus du MVP:

| Élément | Raison |
|---------|--------|
| Intégration catalogue pièces | Complexité, sources de données à identifier |
| Facturation/encaissement | Outils comptables existants |
| API assureurs | Pas d'API publiques disponibles |
| App mobile native | PWA suffisante pour MVP |
| Import données existantes | Manuel pour premiers clients |
| Téléphonie intégrée | Click-to-call suffisant |

---

## 9. Risques et Mitigations

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Adoption utilisateurs lente | Haut | Moyen | UX très simple, formation incluse |
| Performances sur mobile | Moyen | Moyen | Tests early, optimisation images |
| Signature électronique non conforme | Haut | Faible | Validation juridique avant launch |
| Concurrence baisse les prix | Moyen | Faible | Différenciation par simplicité |
| Données sensibles | Haut | Faible | Chiffrement, audits, backups |

---

## 10. Métriques de Succès

### Métriques Produit

| Métrique | Cible 3 mois | Cible 6 mois |
|----------|--------------|--------------|
| Ateliers actifs | 3 | 10 |
| Utilisateurs actifs | 10 | 40 |
| Devis créés/mois | 200 | 1,000 |
| Taux de conversion devis→travaux | +10% vs baseline | +15% vs baseline |

### Métriques Techniques

| Métrique | Cible |
|----------|-------|
| Uptime | > 99.5% |
| Bugs critiques en prod | 0 |
| Temps moyen de fix bug P1 | < 24h |
| Score Lighthouse | > 90 |

### Métriques UX

| Métrique | Cible |
|----------|-------|
| NPS (Net Promoter Score) | > 40 |
| Temps de création de devis | < 10 min pour 1000$ |
| Taux de complétion onboarding | > 80% |

---

## 11. Timeline Préliminaire

| Phase | Durée | Livrables |
|-------|-------|-----------|
| **Solutioning** | 1 semaine | Architecture technique, data model |
| **Sprint 0** | 1 semaine | Setup projet, CI/CD, environnements |
| **Sprint 1-3** | 3 semaines | F1-F4 (clients, devis, workflow, auth) |
| **Sprint 4-5** | 2 semaines | F5-F8 (dashboard, PDF, négociation, signatures) |
| **Sprint 6** | 1 semaine | Tests, polish, documentation |
| **Beta** | 2 semaines | Tests avec 1-2 ateliers pilotes |
| **Launch v1.0** | - | Production |

**Total estimé:** 10-12 semaines pour MVP

---

## 12. Questions Ouvertes

### À Valider avec Stakeholder

- [ ] **Tarification:** Par atelier? Par utilisateur? Freemium?
- [ ] **Nom produit:** "EstimPro" validé ou rechercher alternatives?
- [ ] **Atelier pilote:** Y a-t-il un atelier partenaire pour tester?
- [ ] **Budget hébergement:** Estimation Azure ~200-400$/mois acceptable?

### À Définir en Solutioning

- [ ] **Schema DB:** Structure détaillée des tables
- [ ] **API spec:** Endpoints et payloads
- [ ] **UI/UX:** Maquettes Figma ou wireframes
- [ ] **Signature électronique:** Build vs buy (DocuSign API)?

---

## Annexes

### A. Workflow Complet (Diagramme)

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

### B. Référence des 16 Responsabilités

Source: Document métier "Les 16 responsabilités d'un estimateur"

1. Accueil client jovial et professionnel ✓ (Journey 1)
2. Informer sur le processus de réparation ✓ (F1, documentation)
3. Affirmer que l'atelier est le meilleur choix ✓ (hors scope, soft skill)
4. Tenue vestimentaire professionnelle ✓ (hors scope)
5. Système de suivi pour devis non obtenus ✓ (F10, Journey 4)
6. Rédiger devis précis (10 min/1000$) ✓ (F2, Journey 2)
7. Contrôler objectifs, tableau ventes/production ✓ (F5, F15)
8. Perfectionner aptitudes de vente ✓ (hors scope, formation)
9. Négocier prix convenu AVANT réparations ✓ (F7, Journey 3)
10. Vérifier signatures/autorisations ✓ (F8, F3)
11. Consigner infos spéciales sur dossier ✓ (F1, notes)
12. Commander pièces (optimiser fournisseurs) ⏳ (P2 - F16)
13. Examiner factures finales avant livraison ✓ (Journey 5)
14. Efficacité devis: 10 min/1000$ ✓ (Timer dans F2)
15. Objectifs mensuels et annuels ✓ (F15)
16. Analyse mensuelle rentabilité par assureur ✓ (F11)

---

*Document généré par John (Product Manager)*
*BMAD Method — Product Requirements Document*
*Date: 2026-02-04*
