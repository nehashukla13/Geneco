# Geneco: AI-Powered Waste Management Platform with Gemini AI

## Overview
Geneco is an AI-driven waste management platform designed to streamline waste reporting, optimize collection routes, and promote sustainable practices through gamification. Leveraging Google's Gemini API, it automates waste classification, enables on-demand garbage pickup, and rewards users for eco-friendly actions. The platform serves individuals, waste collection authorities, and industrial entities, fostering a collaborative approach to waste management.

---

## Key Features

### 1. User Authentication & Role-Based Access
- Secure login system with role-based access control for users, authorities, and waste collectors.

### 2. AI-Powered Waste Reporting (Gemini API Integration)
#### Automated Waste Classification:
- Users upload images; Gemini AI categorizes waste into:
  - **Recyclable** – Suggests DIY reuse ideas.
  - **Hazardous** – Flags for proper disposal.
  - **Organic** – Provides composting tips.
  - **Non-Recyclable** – Guides users to the nearest facility.
  - **Industrial Waste** – Ensures proper disposal compliance.
- All classifications are stored for analytics and reporting.

### 3. Carbon Footprint Calculator
- Calculates users' carbon footprint after waste submission.
- Provides personalized suggestions to reduce carbon impact.
- Tracks carbon footprint over time for progress monitoring.

### 4. Gamification & Community Engagement
#### Eco-Community Page:
- Organize and participate in eco-friendly events.
- Share event details and allow others to join.
- Post waste management complaints with proof (images/videos).
- Upvoting system prioritizes urgent complaints.

#### Points & Rewards System:
- Earn points for responsible waste disposal.
- Leaderboard to encourage active participation.
- Reward system based on:
  - Waste report submissions.
  - Verified waste management implementations.
  - Eco-event organization and participation.
  - Upvoted complaint resolutions.

### 5. Waste Collection Management
- **Optimized Route Planning**: Efficient scheduling for waste collection authorities.
- **Automated Notifications**: Alerts for new waste reports and pickup requests.
- **Dynamic Scheduling**: Assigns garbage trucks based on real-time data.

### 6. Notification System (Email/SMS Alerts)
- Real-time updates for users on collection status.
- Instant alerts for authorities regarding:
  - New waste reports.
  - On-demand pickup requests.

### 7. Analytics & Insights
#### Interactive Dashboards:
- Visual insights into waste generation patterns, collection efficiency, and environmental impact.
- Data visualization tools for authorities and users.

#### Leaderboard System:
- Ranks users based on eco-friendly actions and earned points.
- Dynamically updates based on participation in waste management activities.

---

## Technologies Used
- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **AI Integration**: Google Gemini API
---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nehashukla13/Geneco.git
   cd Geneco
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```env
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     VITE_SUPABASE_URL=your_supabase_url
     VITE_GEMINI_API_KEY=your_gemini_api_key
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

---

## Usage

1. **Sign Up**: Create an account and log in.
2. **Report Waste**: Upload images of waste for AI classification.
3. **Track Carbon Footprint**: Monitor your environmental impact.
4. **Participate in Events**: Join or organize eco-friendly events.
5. **Earn Rewards**: Gain points for responsible waste management.

---

## Contributing

We welcome contributions! Follow these steps:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

For questions or feedback, please contact [Neha Shukla](https://github.com/nehashukla13).
