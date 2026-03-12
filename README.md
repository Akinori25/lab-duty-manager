# Lab Duty Manager

A web application designed to manage the "Research Presentation" and "Paper Briefing" rotations for a research laboratory.

## Features
- **Deterministic Scheduling**: Fairly assigns presentations based on past data to ensure minimal repeats.
- **Redo Prioritization**: A duty marked as `REDO` automatically boosts that member to priority for upcoming assignments.
- **Duplication Avoidance**: It is impossible for a single member to be assigned both duties on the same date.
- **MVP Ready**: Built with Next.js (App Router), Prisma, and SQLite using premium Vanilla CSS layouts.

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Database**
   This app uses SQLite by default. To push the schema and generate the client:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```

4. **Seed the Application**:
   Navigate to the Dashboard `http://localhost:3000` and click **Seed Sample Members** to initially populate the database.

## Built With
- Next.js (React)
- Prisma (ORM)
- SQLite (Database)
- Vanilla CSS (Styling)
