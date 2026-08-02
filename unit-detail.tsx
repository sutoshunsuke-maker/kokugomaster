import { motion } from 'framer-motion';
import { useParams, Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Trash2 } from 'lucide-react';
import {
  useGetUnit,
  useDeleteLesson,
  useUpdateLesson,
  getGetUnitQueryKey,
  getListLessonsQueryKey,
  type Lesson,
} from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/status-badge';
import { LessonFormDialog } from '@/components/lesson-form-dialog';
import { useToast } from '@/hooks/use-toast';

export default function UnitDetail() {
  const params = useParams();
  const unitId = params.id ? Number(params.id) : 0;
  const { data: unit, isLoading } = useGetUnit(unitId, {
    query: { enabled: !!unitId, queryKey: getGetUnitQueryKey(unitId) },
  });
  const deleteLesson = useDeleteLesson();
  const updateLesson = useUpdateLesson();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    deleteLesson.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetUnitQueryKey(unitId) });
          queryClient.invalidateQueries({ queryKey: getListLessonsQueryKey() });
          toast({ title: '授業を削除しました' });
        },
        onError: () => {
          toast({ title: '削除に失敗しました', variant: 'destructive' });
        },
      }
    );
  };

  const handleStatusChange = (lesson: Lesson, newStatus: string) => {
    updateLesson.mutate(
      { id: lesson.id, data: { status: newStatus as any } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetUnitQueryKey(unitId) });
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
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">単元が見つかりません</p>
            <Link href="/units">
              <Button className="mt-4" data-testid="button-back-to-units">
                単元一覧に戻る
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/units" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4" data-testid="link-back-to-units">
          <ChevronLeft className="w-4 h-4 mr-1" />
          単元一覧に戻る
        </Link>
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-serif mb-2">
              {unit.title}
            </h1>
            {unit.description && (
              <p className="text-muted-foreground">{unit.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              進捗: {unit.completedCount} / {unit.totalCount} 授業完了
            </p>
          </div>
          <LessonFormDialog unitId={unitId} />
        </div>
      </motion.div>

      {!unit.lessons || unit.lessons.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                まだ授業が登録されていません
              </p>
              <LessonFormDialog unitId={unitId} />
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {unit.lessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              data-testid={`card-lesson-${lesson.id}`}
            >
              <Card className="hover:shadow-sm transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {lesson.title}
                      </h3>
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
                    <div className="flex items-center gap-3">
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
                      <LessonFormDialog
                        unitId={unitId}
                        lesson={lesson}
                        variant="edit"
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-delete-lesson-${lesson.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              授業を削除しますか？
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              この操作は取り消せません。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-testid="button-cancel-delete">
                              キャンセル
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(lesson.id)}
                              data-testid="button-confirm-delete"
                            >
                              削除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
