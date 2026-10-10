# DevDirectory

A modern developer discovery directory built with React and Vite. Browse curated developer profiles, explore skills and selected projects, and jump directly to public GitHub profiles and websites.

## Highlights

- Dark, high-contrast visual system with lime and violet accents
- Animated hero composition, floating glass panel, orbital rings, and micro-interactions
- Responsive developer cards with hover depth and motion
- Search by name, company/community, role, location, or skill
- Individual profile pages with bio, expertise, GitHub, personal website, and selected projects
- Local curated profile data, so the directory works without depending on a demo API
- Accessible focus states and reduced-motion support

## Tech stack

- React
- React Router
- Vite
- CSS animations and responsive CSS

## Run locally

```bash
npm install
npm run dev
```

To create a production build:

```bash
npm run build
npm run preview
```

## About the sample data

This project uses a small curated set of public developer profiles and links for demonstration. Role/company summaries and project descriptions are editorial snapshots, not an official affiliation or endorsement; follow each linked profile or project for the most current information. Replace or extend `src/data/developers.js` to add your own team members.

## Project structure

```text
src/
  components/       Shared navigation, cards, footer, and UI
  data/             Curated developer profile data
  pages/             Home, directory, and profile pages
  services/          Local profile data access
  assets/            Global design system and animations
```
