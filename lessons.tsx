import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { Filter } from 'lucide-react';
import {
  useListLessons,
  useUpdateLesson,
  getListLessonsQueryKey,
  type Lesson,
  type LessonStatus,
} from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/status-badge';
import { useToast } from '@/hooks/use-toast';

export default function Lessons() {
  const [statusFilter, setStatusFilter] = useState<LessonStatus | 'all'>('all');
  const { data: lessons, isLoading } = useListLessons();
  const updateLesson = useUpdateLesson();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (lesson: Lesson, newStatus: string) => {
    updateLesson.mutate(
      { id: lesson.id, data: { status: newStatus as any } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListLessonsQueryKey() });
          toast({ title: 'ステータスを更新しました' });
        },
        onError: () => {
          toast({ title: '更新に失敗しました', variant: 'destructive' });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredLessons =
    statusFilter === 'all'
      ? lessons || []
      : (lessons || []).filter((lesson) => lesson.status === statusFilter);

  const statusCounts = {
    all: lessons?.length || 0,
    upcoming: lessons?.filter((l) => l.status === 'upcoming').length || 0,
    in_progress: lessons?.filter((l) => l.status === 'in_progress').length || 0,
    completed: lessons?.filter((l) => l.status === 'completed').length || 0,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground font-serif mb-2">
          授業一覧
        </h1>
        <p className="text-muted-foreground text-sm">
          すべての授業をステータス別に確認できます
        </p>
      </motion.div>

      {/* Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                  data-testid="filter-all"
                >
                  すべて ({statusCounts.all})
                </button>
                <button
                  onClick={() => setStatusFilter('upcoming')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === 'upcoming'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                  data-testid="filter-upcoming"
                >
                  未実施 ({statusCounts.upcoming})
                </button>
                <button
                  onClick={() => setStatusFilter('in_progress')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === 'in_progress'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                  data-testid="filter-in-progress"
                >
                  授業中 ({statusCounts.in_progress})
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === 'completed'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                  data-testid="filter-completed"
                >
                  完了 ({statusCounts.completed})
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Lessons List */}
      {!filteredLessons || filteredLessons.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {statusFilter === 'all'
                  ? 'まだ授業が登録されていません'
                  : 'このステータスの授業はありません'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredLessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.03 }}
              data-testid={`card-lesson-${lesson.id}`}
            >
              <Card className="hover:shadow-sm transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground">
                          {lesson.title}
                        </h3>
                        <StatusBadge status={lesson.status} />
                      </div>
                      {lesson.memo && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {lesson.memo}
                        </p>
                      )}
                      {lesson.lessonDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          実施日: {lesson.lessonDate}
                        </p>
                      )}
                    </div>
                    <Select
                      value={lesson.status}
                      onValueChange={(value) => handleStatusChange(lesson, value)}
                    >
                      <SelectTrigger
                        className="w-32"
                        data-testid={`select-status-${lesson.id}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">未実施</SelectItem>
                        <SelectItem value="in_progress">授業中</SelectItem>
                        <SelectItem value="completed">完了</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
