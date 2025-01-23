"use client";

import { Trophy, Target, Brain, Code2, Star, Users, GitCommit, Award, ExternalLink, X, Globe, Building, Briefcase, MapPin, Link2, MessageSquare } from 'lucide-react';
import type { LeetCodeData } from "@/lib/types";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
} from 'chart.js';
import { Bar, Doughnut, Radar, Line } from 'react-chartjs-2';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import ReactCalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
);

interface LeetCodeProps {
  data: LeetCodeData | null;
  onClose?: () => void;
}

interface BadgeCardProps {
  badge: {
    name: string;
    shortName: string;
    icon: string;
    gifIcon?: string;
    creationDate: string;
  };
}

interface QuickStatCardProps {
  title: string;
  value: number;
  total?: number;
  suffix?: string;
  subtext?: string;
  icon: React.ElementType;
  color: "emerald" | "blue" | "amber" | "violet";
  diff?: number;
}

interface ProgressCircleProps {
  title: string;
  value: number;
  total: number;
  color: string;
}

interface ContributionItemProps {
  label: string;
  value: number;
  diff: number;
  icon: React.ElementType;
}

interface BadgeProps {
  variant?: "default" | "secondary" | "outline";
  icon?: React.ElementType;
  children: React.ReactNode;
}

interface HeatmapValue {
  date: Date;
  count: number;
}

export function LeetCodeDashboard({ data, onClose }: LeetCodeProps) {
  if (!data) return null;
  
  console.log('LeetCode Data:', {
    profile: {
      username: data.username,
      ranking: data.ranking,
      stats: {
        solved: data.totalSolved,
        acceptance: data.acceptanceRate,
        streak: data.calendar.streak
      }
    },
    submissions: {
      easy: data.easySolved,
      medium: data.mediumSolved,
      hard: data.hardSolved,
      total: data.totalSubmissions
    },
    contributions: {
      solutions: data.solutions,
      discussions: data.discussions,
      reputation: data.reputation,
      views: data.views
    },
    badges: data.badges.length,
    languages: data.languageStats,
    topics: data.topicStats
  });

  const solvedData = {
    labels: ['Easy', 'Medium', 'Hard'] as const,
    datasets: [
      {
        label: 'Solved',
        data: [data.easySolved, data.mediumSolved, data.hardSolved],
        backgroundColor: ['#00b8a3', '#ffc01e', '#ff375f'] as const,
      },
      {
        label: 'Total',
        data: [data.totalEasy, data.totalMedium, data.totalHard],
        backgroundColor: ['#00b8a380', '#ffc01e80', '#ff375f80'] as const,
      }
    ]
  };

  const languageData = {
    labels: data.languageStats.map(lang => lang.name),
    datasets: [{
      data: data.languageStats.map(lang => lang.solved),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
        '#9966FF', '#FF9F40', '#00A8C6', '#8FBE00'
      ],
    }]
  };

  const topicData = {
    labels: [...data.topicStats.advanced.map(t => t.name)],
    datasets: [{
      label: 'Problems Solved',
      data: [...data.topicStats.advanced.map(t => t.solved)],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };

  // Parse submission calendar
  const submissionCalendar = JSON.parse(data.calendar.submissionCalendar);
  const heatmapData: HeatmapValue[] = Object.entries(submissionCalendar).map(([timestamp, count]) => ({
  date: new Date(parseInt(timestamp) * 1000),
  count: count as number
}));

  return (
    <div className="min-h-screen bg-white">
      <ScrollArea className="h-[90vh] w-full lg:w-[95%]">
        <div className="flex flex-col gap-6 p-4 md:p-8">
          {/* Profile Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative flex-shrink-0">
                <img
                  src={data.avatar}
                  alt={data.username}
                  className="w-20 h-20 rounded-full border-4 border-primary-100 object-cover"
                />
                <div className="absolute -bottom-2 -right-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                  {data.starRating}★
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold">{data.realName || data.username}</h2>
                <div className="flex flex-wrap gap-2">
                  {data.jobTitle && (
                    <Badge variant="outline" icon={Briefcase}>
                      {data.jobTitle}
                    </Badge>
                  )}
                  {data.company && (
                    <Badge variant="outline" icon={Building}>
                      {data.company}
                    </Badge>
                  )}
                  {data.countryName && (
                    <Badge variant="outline" icon={MapPin}>
                      {data.countryName}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">
                    Rank: #{data.ranking}
                  </Badge>
                  {data.school && (
                    <Badge variant="secondary">
                      {data.school}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* About Section */}
          {data.about && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">About</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{data.about}</p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickStatCard
              title="Problems Solved"
              value={data.totalSolved}
              total={data.totalQuestions}
              icon={Brain}
              color="emerald"
            />
            <QuickStatCard
              title="Acceptance Rate"
              value={parseFloat(data.acceptanceRate)}
              suffix="%"
              subtext={`${data.totalSubmissions} submissions`}
              icon={Target}
              color="blue"
            />
            <QuickStatCard
              title="Current Streak"
              value={data.calendar.streak}
              subtext={`${data.calendar.totalActiveDays} total days`}
              icon={Trophy}
              color="amber"
            />
            <QuickStatCard
              title="Solutions"
              value={data.solutions.count}
              diff={data.solutions.diff}
              icon={Code2}
              color="violet"
            />
          </div>

          {/* Progress Circles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ProgressCircle
              title="Total Progress"
              value={data.totalSolved}
              total={data.totalQuestions}
              color="#10B981"
            />
            <ProgressCircle
              title="Easy"
              value={data.easySolved}
              total={data.totalEasy}
              color="#00b8a3"
            />
            <ProgressCircle
              title="Medium"
              value={data.mediumSolved}
              total={data.totalMedium}
              color="#ffc01e"
            />
            <ProgressCircle
              title="Hard"
              value={data.hardSolved}
              total={data.totalHard}
              color="#ff375f"
            />
          </div>

          {/* Activity and Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Submission Calendar with Tooltip */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Submission Activity</h3>
              <div className="overflow-x-auto">
                <div className="min-w-[750px]">
                  <ReactCalendarHeatmap
                    startDate={new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)}
                    endDate={new Date()}
                    values={heatmapData}
                    classForValue={(value) => {
                      if (!value || !value.count) return 'color-empty';
                      if (value.count <= 2) return 'color-scale-1';
                      if (value.count <= 4) return 'color-scale-2';
                      if (value.count <= 6) return 'color-scale-3';
                      return 'color-scale-4';
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Contribution Stats */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Contributions</h3>
              <div className="flex flex-col gap-4">
                <ContributionItem
                  label="Solutions"
                  value={data.solutions.count}
                  diff={data.solutions.diff}
                  icon={Code2}
                />
                <ContributionItem
                  label="Discussions"
                  value={data.discussions.count}
                  diff={data.discussions.diff}
                  icon={MessageSquare}
                />
                <ContributionItem
                  label="Reputation"
                  value={data.reputation}
                  diff={data.contributionPoints.diff}
                  icon={Star}
                />
                <ContributionItem
                  label="Views"
                  value={data.views.count}
                  diff={data.views.diff}
                  icon={Users}
                />
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Language Distribution</h3>
              <div className="aspect-square">
                <Doughnut data={languageData} options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: { boxWidth: 12 }
                    }
                  }
                }} />
              </div>
            </div>

            {/* Replace Topic Coverage Chart with Grid */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Topic Coverage</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.topicStats.advanced.map((topic, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{topic.name}</span>
                      <span className="text-sm text-gray-600">{topic.solved} solved</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(topic.solved / Math.max(...data.topicStats.advanced.map(t => t.solved))) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Badges Grid */}
          {data.badges.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Badges & Achievements</h3>
                <button 
                  onClick={() => {/* Add sync functionality */}}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <GitCommit className="w-4 h-4" />
                  Sync Badges
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {data.badges.map((badge, index) => (
                  <BadgeCard key={index} badge={badge} />
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {(data.social.github || data.social.linkedin || data.social.twitter || data.websites?.length > 0) && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <div className="flex flex-wrap gap-4">
                {data.social.github && (
                  <SocialLink href={data.social.github} platform="github" />
                )}
                {data.social.linkedin && (
                  <SocialLink href={data.social.linkedin} platform="linkedin" />
                )}
                {data.social.twitter && (
                  <SocialLink href={data.social.twitter} platform="twitter" />
                )}
                {data.websites?.map((website, index) => (
                  <SocialLink key={index} href={website} platform="website" />
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// Helper Components (in separate files ideally)
function BadgeCard({ badge }: BadgeCardProps) {
  return (
    <div className="relative group">
      <div className="aspect-square relative">
        {badge.gifIcon ? (
          <img 
            src={badge.gifIcon}
            alt={badge.name}
            className="w-full h-full rounded-lg"
          />
        ) : (
          <img 
            src={badge.icon}
            alt={badge.name}
            className="w-full h-full rounded-lg"
          />
        )}
      </div>
      <div className="mt-2 text-center">
        <div className="text-sm font-medium truncate">
          {badge.shortName}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(badge.creationDate).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

function QuickStatCard({ title, value, total, suffix = "", subtext, icon: Icon, color, diff }: QuickStatCardProps) {
  return (
    <div className={cn(
      "bg-white p-6 rounded-xl shadow-sm border-l-4",
      color === "emerald" && "border-emerald-500",
      color === "blue" && "border-blue-500",
      color === "amber" && "border-amber-500",
      color === "violet" && "border-violet-500"
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold">
            {value}{suffix}
            {total && <span className="text-gray-400 text-lg"> / {total}</span>}
          </p>
          {subtext && <p className="text-sm text-gray-500 mt-1">{subtext}</p>}
          {diff && <p className="text-sm text-green-500 mt-1">+{diff} this month</p>}
        </div>
        <Icon className={cn(
          "w-8 h-8",
          color === "emerald" && "text-emerald-500",
          color === "blue" && "text-blue-500",
          color === "amber" && "text-amber-500",
          color === "violet" && "text-violet-500"
        )} />
      </div>
    </div>
  );
}

function ProgressCircle({ title, value, total, color }: ProgressCircleProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="w-32 h-32 mx-auto">
        <CircularProgressbar
          value={(value / total) * 100}
          text={`${((value / total) * 100).toFixed(1)}%`}
          styles={buildStyles({
            pathColor: color,
            textColor: color,
            trailColor: '#E5E7EB'
          })}
        />
      </div>
      <div className="text-center mt-4">
        <div className="text-sm text-gray-600">Solved</div>
        <div className="text-xl font-bold text-gray-900">
          {value} / {total}
        </div>
      </div>
    </div>
  );
}

function ContributionItem({ label, value, diff, icon: Icon }: ContributionItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold">{value}</span>
        {diff > 0 && (
          <span className="text-green-600 text-sm">+{diff}</span>
        )}
      </div>
    </div>
  );
}

function SocialLink({ href, platform }: { href: string; platform: string }) {
  const getIcon = () => {
    switch (platform) {
      case 'github': return <i className="fab fa-github" />;
      case 'linkedin': return <i className="fab fa-linkedin" />;
      case 'twitter': return <i className="fab fa-twitter" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      {getIcon()}
      <span className="text-sm">{platform === 'website' ? 'Website' : platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
    </a>
  );
}

function Badge({ variant = "default", icon: Icon, children }: BadgeProps) {
  const styles = {
    default: "bg-primary-100 text-primary-700",
    secondary: "bg-blue-100 text-blue-700",
    outline: "border border-gray-200 text-gray-700"
  };

  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[variant]}`}>
      {Icon && <Icon className="mr-1 h-3 w-3" />}
      {children}
    </div>
  );
} 