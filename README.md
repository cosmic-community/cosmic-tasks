# Cosmic Tasks — Private Kanban Board

![App Preview](https://imgix.cosmicjs.com/9695c2e0-45cf-11f1-a3ff-65bbafb72c6d-generated-1777689331193.jpg?w=1200&h=630&fit=crop&auto=format,compress)

A secure, password-protected Kanban board for managing tasks stored in Cosmic CMS. Drag and drop tasks between columns, filter by assignee, and update task status in real time.

## Features

- 🔒 **Password Protection** — All pages gated behind a session-based password prompt
- 🗂️ **Kanban Board** — Three columns: To Do, In Progress, Done
- 🎯 **Task Cards** — Title, assignee, priority (color-coded), due date, notes, and CMS link
- 👥 **Filter by Assignee** — Filter tasks by Tony or Jeff (or view all)
- 🖱️ **Drag & Drop** — Move tasks between columns, updates Cosmic CMS in real time
- 🎨 **Priority Color Coding** — Urgent=red, High=orange, Medium=yellow, Low=green
- 🔗 **CMS Dashboard Links** — Each card links to `https://app.cosmicjs.com/cosmic-crm-production/objects/:id`

## Clone this Project

Want to create your own version of this project with all the content and structure? Clone this Cosmic bucket and code repository to get started instantly:

[![Clone this Project](https://img.shields.io/badge/Clone%20this%20Project-29abe2?style=for-the-badge&logo=cosmic&logoColor=white)](https://app.cosmicjs.com/projects/new?clone_bucket=69ca9a77f9808e52fa7dd11e&clone_repository=69f55063c27d356ff50039ed)

## Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> "Update the email drafts to have the correct prospect"

### Code Generation Prompt

> "A private password-protected Kanban board for managing tasks. Features: password protection on all pages, Kanban columns (To Do, In Progress, Done), task cards showing title, assignee, priority, due date, and notes, filter by assignee, drag and drop to update task status (updates Cosmic CMS in real time), priority color coding (Urgent=red, High=orange, Medium=yellow, Low=green), clickable CMS dashboard links on each card. Reads and writes tasks from Cosmic CMS object type "tasks". Password stored as environment variable APP_PASSWORD. App name: cosmic-tasks."

The app has been tailored to work with your existing Cosmic content structure and includes all the features requested above.

## Technologies Used

- **[Next.js 16](https://nextjs.org/)** — React framework with App Router
- **[Cosmic CMS](https://www.cosmicjs.com/)** — Headless CMS for task storage
- **[TypeScript](https://www.typescriptlang.org/)** — Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** — Utility-first CSS framework
- **[@dnd-kit](https://dndkit.com/)** — Accessible drag-and-drop library
- **[Bun](https://bun.sh/)** — Fast JavaScript runtime and package manager

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- A [Cosmic](https://www.cosmicjs.com/) account with the provided bucket
- Node.js 18+

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd cosmic-tasks

# Install dependencies
bun install

# Set up environment variables
# Copy and fill in your values (see environment variables section)

# Start development server
bun dev
```

### Environment Variables

```
COSMIC_BUCKET_SLUG=your-bucket-slug
COSMIC_READ_KEY=your-read-key
COSMIC_WRITE_KEY=your-write-key
APP_PASSWORD=your-secret-password
```

## Cosmic SDK Examples

### Fetching Tasks

```typescript
import { cosmic } from '@/lib/cosmic'

const response = await cosmic.objects
  .find({ type: 'tasks' })
  .props(['id', 'title', 'metadata'])
  .depth(1)
```

### Updating Task Status

```typescript
await cosmic.objects.updateOne(taskId, {
  metadata: { task_status: 'In Progress' }
})
```

## Cosmic CMS Integration

The app integrates with these Cosmic object types:
- **tasks** — Main data source with fields: title, contact, company, priority, task_status, due_date, notes, assigned_to

Priority and task_status are `select-dropdown` fields that return `{key, value}` objects — these are handled with `getMetafieldValue()` throughout the app.

## Deployment Options

### Vercel (Recommended)

```bash
bunx vercel --prod
```

Set environment variables in Vercel Dashboard → Settings → Environment Variables.

### Netlify

```bash
bunx netlify deploy --prod
```

<!-- README_END -->
