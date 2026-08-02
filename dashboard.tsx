import { motion } from 'framer-motion';
import { BookOpen, ListChecks, Clock, CheckCircle2, Circle } from 'lucide-react';
import { useGetProgressSummary, useListUnits } from '@workspace/api-client-react';
import { ProgressRing } from '@/components/progress-ring';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Link } from 'wouter';

export default function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useGetProgressSummary();
  const { data: units, isLoading: unitsLoading } = useListUnits();

  if (summaryLoading || unitsLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground font-serif mb-2">
          進度ダッシュボード
        </h1>
        <p className="text-muted-foreground text-sm">
          授業全体の進捗状況を確認できます
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <StatCard
          label="総単元数"
          value={summary.totalUnits}
          icon={BookOpen}
          delay={0.1}
        />
        <StatCard
          label="総授業数"
          value={summary.totalLessons}
          icon={ListChecks}
          delay={0.2}
        />
        <StatCard
          label="完了済"
          value={summary.completedLessons}
          icon={CheckCircle2}
          delay={0.3}
        />
        <StatCard
          label="授業中"
          value={summary.inProgressLessons}
          icon={Clock}
          delay={0.4}
        />
      </div>

      {/* Main Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">全体の進捗</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-12">
              <div className="relative">
                <ProgressRing
                  percent={summary.completionPercent}
                  size={140}
                  strokeWidth={10}
                />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">完了</span>
                    <span className="font-medium">
                      {summary.completedLessons} / {summary.totalLessons}
                    </span>
                  </div>
                  <Progress
                    value={(summary.completedLessons / summary.totalLessons) * 100}
                    className="h-2"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">未実施</p>
                    <p className="text-xl font-bold text-foreground">
                      {summary.upcomingLessons}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">授業中</p>
                    <p className="text-xl font-bold text-foreground">
                      {summary.inProgressLessons}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">完了</p>
                    <p className="text-xl font-bold text-foreground">
                      {summary.completedLessons}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Current Unit & Lesson */}
      {(summary.currentUnit || summary.currentLesson) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {summary.currentUnit && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-serif">
                  現在の単元
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/units/${summary.currentUnit.id}`}
                  className="block hover:bg-accent/50 transition-colors rounded-md p-3 -m-3"
                  data-testid="link-current-unit"
                >
                  <h3 className="font-semibold text-foreground">
                    {summary.currentUnit.title}
                  </h3>
                  {summary.currentUnit.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {summary.currentUnit.description}
                    </p>
                  )}
                </Link>
              </CardContent>
            </Card>
          )}
          {summary.currentLesson && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-serif">
                  現在の授業
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground">
                      {summary.currentLesson.title}
                    </h3>
                    <StatusBadge status={summary.currentLesson.status} />
                  </div>
                  {summary.currentLesson.memo && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {summary.currentLesson.memo}
                    </p>
                  )}
                  {summary.currentLesson.lessonDate && (
                    <p className="text-xs text-muted-foreground mt-2">
                      実施日: {summary.currentLesson.lessonDate}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Units Overview */}
      {units && units.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">単元別進捗</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {units.slice(0, 5).map((unit, index) => (
                  <motion.div
                    key={unit.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                  >
                    <Link
                      href={`/units/${unit.id}`}
                      className="block hover:bg-accent/50 transition-colors rounded-md p-3 -mx-3"
                      data-testid={`link-unit-${unit.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">
                          {unit.title}
                        </h4>
                        <span className="text-sm text-muted-foreground">
                          {unit.completedCount} / {unit.totalCount}
                        </span>
                      </div>
                      <Progress
                        value={
                          unit.totalCount > 0
                            ? (unit.completedCount / unit.totalCount) * 100
                            : 0
                        }
                        className="h-2"
                      />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
