# Raw Gen - Developer Profile Generator

Raw Gen is a modern web application that helps developers showcase their coding profiles and achievements from various competitive programming platforms in one unified dashboard.

## Features

- **Multi-Platform Integration**: Seamlessly connect and display your profiles from:

  - LeetCode
  - CodeChef
  - GeeksForGeeks
  - Codeforces

- **Profile Management**:

  - Customizable profile with first name, last name, and username
  - CGPA tracking
  - Profile image upload
  - Marksheet verification system
  - Social links integration (GitHub, LinkedIn, Twitter, Personal Website)

- **Platform Data**:

  - Automatic data fetching and caching from connected platforms
  - Real-time profile statistics
  - Drag-and-drop reordering of platforms
  - Background updates to keep data fresh

- **Recruiter Features**:
  - Dedicated recruiter dashboard
  - Search and filter developers
  - Bookmark interesting profiles
  - Verify student credentials

## Tech Stack

- **Frontend**:

  - Next.js 13+ with App Router
  - React 18
  - TypeScript
  - Tailwind CSS

- **Backend**:
  - Convex for backend and real-time data
  - Clerk for authentication
  - Cloud storage for images

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/raw-gen.git
   cd raw-gen
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following:

   ```
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app` - Next.js app router pages and layouts
- `/components` - Reusable React components
- `/convex` - Backend mutations and queries
- `/lib` - Utility functions, hooks, and types
- `/public` - Static assets

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors who have helped shape Raw Gen
- Built with [Next.js](https://nextjs.org/), [Convex](https://www.convex.dev/), and [Clerk](https://clerk.dev/)
